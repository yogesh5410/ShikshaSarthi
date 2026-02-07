import axios from "axios";
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  Video,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Clock,
  Trophy,
  BarChart3,
  ArrowLeft,
  Lightbulb,
} from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const API_URL = import.meta.env.VITE_API_URL;

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  hint?: {
    text?: string;
    image?: string;
  };
}

interface VideoQuestionData {
  _id: string;
  videoUrl: string;
  videoTitle: string;
  videoDescription?: string;
  videoDuration?: string;
  questions: Question[];
}

const VideoQuizPlayer: React.FC = () => {
  const { subject, topic } = useParams<{ subject: string; topic: string }>();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [videoData, setVideoData] = useState<VideoQuestionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [videoEnded, setVideoEnded] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{ [index: number]: string }>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);

  // Video controls
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isYouTube, setIsYouTube] = useState(false);

  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        const studentCookie = localStorage.getItem("student");
        const parsed = studentCookie ? JSON.parse(studentCookie) : null;
        const className = parsed?.student?.class || parsed?.class || null;

        // Decode URL parameters
        const decodedSubject = subject ? decodeURIComponent(subject) : '';
        const decodedTopic = topic ? decodeURIComponent(topic) : '';

        console.log("Fetching video data for:", { className, subject: decodedSubject, topic: decodedTopic });

        const res = await axios.get(
          `${API_URL}/video-questions/${className}/${decodedSubject}/${decodedTopic}`
        );

        console.log("Video data response:", res.data);

        if (res.data && res.data.length > 0) {
          const data = res.data[0];
          setVideoData(data);
          
          // Check if it's a YouTube video
          if (data.videoUrl.includes('youtube.com') || data.videoUrl.includes('youtu.be')) {
            setIsYouTube(true);
          }
          
          setStartTime(Date.now());
        }
      } catch (err) {
        console.error("Error fetching video questions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideoData();
  }, [subject, topic]);

  // Video control handlers
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const handleVideoEnd = () => {
    setVideoEnded(true);
    setIsPlaying(false);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Quiz handlers
  const handleAnswer = (option: string) => {
    if (selectedAnswer !== null) return;

    const currentQ = videoData?.questions[currentQuestion];
    if (!currentQ) return;

    setSelectedAnswer(option);
    setAnswers((prev) => ({ ...prev, [currentQuestion]: option }));
    setShowFeedback(true);
  };

  const handleNext = () => {
    if (videoData && currentQuestion < videoData.questions.length - 1) {
      const nextIndex = currentQuestion + 1;
      setCurrentQuestion(nextIndex);
      setSelectedAnswer(answers[nextIndex] || null);
      setShowFeedback(false);
      setShowHint(false);
    } else {
      setEndTime(Date.now());
      setQuizCompleted(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      const prevIndex = currentQuestion - 1;
      setCurrentQuestion(prevIndex);
      setSelectedAnswer(answers[prevIndex] || null);
      setShowFeedback(false);
      setShowHint(false);
    }
  };

  const calculateResults = () => {
    if (!videoData) return { correct: 0, incorrect: 0, unattempted: 0 };

    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;

    videoData.questions.forEach((q, index) => {
      const answer = answers[index];
      if (!answer) {
        unattempted++;
      } else if (answer === q.correctAnswer) {
        correct++;
      } else {
        incorrect++;
      }
    });

    return { correct, incorrect, unattempted };
  };

  const results = calculateResults();
  const totalQuestions = videoData?.questions.length || 0;
  const accuracy = totalQuestions > 0 ? (results.correct / totalQuestions) * 100 : 0;
  const timeTaken = startTime && endTime ? Math.floor((endTime - startTime) / 1000) : 0;

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-lg">Loading video...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!videoData) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Video Not Found</h2>
            <p className="text-gray-600 mb-4">The video for this topic is not available.</p>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const currentQ = videoData.questions[currentQuestion];
  const isCorrect = selectedAnswer === currentQ?.correctAnswer;

  // Results View
  if (quizCompleted) {
    const chartData = [
      { name: "सही", value: results.correct, color: "#10b981" },
      { name: "गलत", value: results.incorrect, color: "#ef4444" },
      { name: "छोड़े गए", value: results.unattempted, color: "#6b7280" },
    ];

    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <Header />
        <main className="flex-1 py-8">
          <div className="edu-container max-w-4xl">
            <Card className="border-2 border-purple-200">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <div className="flex items-center gap-3">
                  <Trophy className="h-8 w-8" />
                  <div>
                    <CardTitle className="text-2xl">Quiz Completed! 🎉</CardTitle>
                    <p className="text-purple-100">Here are your results</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Chart */}
                  <div className="flex items-center justify-center">
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry) => `${entry.name}: ${entry.value}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Stats */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <span className="font-medium">सही उत्तर</span>
                      <span className="text-2xl font-bold text-green-600">{results.correct}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                      <span className="font-medium">गलत उत्तर</span>
                      <span className="text-2xl font-bold text-red-600">{results.incorrect}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <span className="font-medium">कुल प्रश्न</span>
                      <span className="text-2xl font-bold">{totalQuestions}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                      <span className="font-medium">सटीकता</span>
                      <span className="text-2xl font-bold text-purple-600">{accuracy.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                      <span className="font-medium flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        समय लिया
                      </span>
                      <span className="text-xl font-bold text-blue-600">
                        {Math.floor(timeTaken / 60)}:{(timeTaken % 60).toString().padStart(2, "0")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex gap-4 justify-center">
                  <Button onClick={() => navigate(`/student/video-questions/${subject}`)} variant="outline">
                    Back to Topics
                  </Button>
                  <Button onClick={() => window.location.reload()} className="bg-gradient-to-r from-purple-600 to-pink-600">
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <Header />
      <main className="flex-1 py-8">
        <div className="edu-container max-w-6xl">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {!videoEnded ? (
            // Video Player
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-6 w-6" />
                  {videoData.videoTitle}
                </CardTitle>
                {videoData.videoDescription && (
                  <p className="text-purple-100 text-sm">{videoData.videoDescription}</p>
                )}
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative bg-black">
                  {isYouTube ? (
                    // YouTube iframe player
                    <div className="relative w-full aspect-video">
                      <iframe
                        className="w-full h-full"
                        src={videoData.videoUrl}
                        title={videoData.videoTitle}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    // Direct video player
                    <>
                      <video
                        ref={videoRef}
                        className="w-full aspect-video"
                        src={videoData.videoUrl}
                        onEnded={handleVideoEnd}
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleLoadedMetadata}
                      />

                      {/* Custom Controls */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                        <input
                          type="range"
                          min="0"
                          max={duration}
                          value={currentTime}
                          onChange={handleSeek}
                          className="w-full mb-2"
                        />
                        <div className="flex items-center justify-between text-white">
                          <div className="flex items-center gap-4">
                            <button onClick={togglePlay} className="hover:scale-110 transition">
                              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                            </button>
                            <button onClick={toggleMute} className="hover:scale-110 transition">
                              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                            </button>
                            <span className="text-sm">
                              {formatTime(currentTime)} / {formatTime(duration)}
                            </span>
                          </div>
                          <button onClick={toggleFullscreen} className="hover:scale-110 transition">
                            <Maximize className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="p-6 text-center">
                  <p className="text-gray-600 mb-4">
                    {isYouTube 
                      ? "वीडियो देखने के बाद नीचे बटन क्लिक करें" 
                      : "वीडियो समाप्त होने के बाद प्रश्न दिखाई देंगे"}
                  </p>
                  <Button onClick={() => setVideoEnded(true)} variant="outline">
                    Skip to Questions
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            // Questions
            <Card>
              <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <div className="flex items-center justify-between">
                  <CardTitle>
                    प्रश्न {currentQuestion + 1} / {totalQuestions}
                  </CardTitle>
                  <Progress value={((currentQuestion + 1) / totalQuestions) * 100} className="w-32" />
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-6">{currentQ.question}</h3>

                <div className="space-y-3 mb-6">
                  {currentQ.options.map((option, idx) => {
                    const isSelected = selectedAnswer === option;
                    const isCorrectOption = option === currentQ.correctAnswer;
                    let bgColor = "bg-gray-50 hover:bg-gray-100";

                    if (showFeedback && isSelected) {
                      bgColor = isCorrect ? "bg-green-100 border-green-500" : "bg-red-100 border-red-500";
                    } else if (showFeedback && isCorrectOption) {
                      bgColor = "bg-green-100 border-green-500";
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleAnswer(option)}
                        disabled={showFeedback}
                        className={`w-full p-4 text-left rounded-lg border-2 transition ${bgColor} ${
                          isSelected ? "border-purple-500" : "border-gray-200"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{option}</span>
                          {showFeedback && isCorrectOption && <CheckCircle className="h-5 w-5 text-green-600" />}
                          {showFeedback && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-red-600" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {showFeedback && (
                  <div className={`p-4 rounded-lg mb-4 ${isCorrect ? "bg-green-50" : "bg-red-50"}`}>
                    <p className={`font-medium ${isCorrect ? "text-green-800" : "text-red-800"}`}>
                      {isCorrect ? "✅ सही उत्तर!" : "❌ गलत उत्तर"}
                    </p>
                  </div>
                )}

                {currentQ.hint && (
                  <div className="mb-4">
                    <Button variant="outline" size="sm" onClick={() => setShowHint(!showHint)}>
                      <Lightbulb className="h-4 w-4 mr-2" />
                      {showHint ? "Hide Hint" : "Show Hint"}
                    </Button>
                    {showHint && currentQ.hint.text && (
                      <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-sm text-yellow-800">{currentQ.hint.text}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-between">
                  <Button onClick={handlePrevious} disabled={currentQuestion === 0} variant="outline">
                    Previous
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={!showFeedback}
                    className="bg-gradient-to-r from-purple-600 to-pink-600"
                  >
                    {currentQuestion === totalQuestions - 1 ? "Finish" : "Next"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default VideoQuizPlayer;
