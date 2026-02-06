import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Video,
  ArrowLeft,
  Play,
  CheckCircle2,
  RefreshCw,
  Clock,
  FileQuestion
} from "lucide-react";

const VideoQuestions: React.FC = () => {
  const navigate = useNavigate();

  // Placeholder data - Replace with actual video questions from backend
  const videoQuestions = [
    {
      id: 1,
      title: "Science Experiment Analysis",
      description: "Watch a science experiment and answer questions about the process",
      duration: "5:30",
      difficulty: "Medium",
      questions: 6,
      thumbnail: "🧪"
    },
    {
      id: 2,
      title: "Historical Documentary",
      description: "Watch a short documentary clip and test your understanding",
      duration: "8:00",
      difficulty: "Hard",
      questions: 10,
      thumbnail: "📜"
    },
    {
      id: 3,
      title: "Math Problem Solving",
      description: "Follow along with a math tutorial and solve problems",
      duration: "6:15",
      difficulty: "Medium",
      questions: 5,
      thumbnail: "🔢"
    },
    {
      id: 4,
      title: "Environmental Awareness",
      description: "Watch a video about environmental issues and answer questions",
      duration: "4:45",
      difficulty: "Easy",
      questions: 4,
      thumbnail: "🌍"
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-700";
      case "Medium":
        return "bg-yellow-100 text-yellow-700";
      case "Hard":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <Header />

      <main className="flex-1 py-8">
        <div className="edu-container">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              className="mb-4"
              onClick={() => navigate('/student/multimedia-assessment')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Multimedia Assessment
            </Button>

            <div className="flex items-center space-x-4 mb-4">
              <div className="h-16 w-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center text-white">
                <Video className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Video Questions 🎬
                </h1>
                <p className="text-gray-600">
                  Watch and learn with video-based assessments
                </p>
              </div>
            </div>
          </div>

          {/* Instructions Card */}
          <Card className="mb-8 bg-purple-50 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-6 w-6 text-purple-600" />
                How to Attempt Video Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Watch the entire video carefully before answering questions</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>You can pause, rewind, or replay the video as needed</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Pay attention to visual cues, subtitles, and demonstrations</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Take notes if needed during the video playback</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Video Questions List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {videoQuestions.map((question) => (
              <Card
                key={question.id}
                className="border-2 border-purple-200 hover:border-purple-400 transition-all hover:shadow-lg"
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-lg">{question.title}</CardTitle>
                    <Badge className={getDifficultyColor(question.difficulty)}>
                      {question.difficulty}
                    </Badge>
                  </div>
                  <CardDescription>{question.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Video Thumbnail Placeholder */}
                  <div className="relative bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg aspect-video flex items-center justify-center overflow-hidden">
                    <div className="text-6xl">{question.thumbnail}</div>
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <div className="bg-white/90 rounded-full p-4 hover:bg-white transition-colors cursor-pointer">
                        <Play className="h-8 w-8 text-purple-600" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {question.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileQuestion className="h-4 w-4" />
                        {question.questions} Questions
                      </span>
                    </div>
                  </div>

                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    <Play className="h-4 w-4 mr-2" />
                    Start Assessment
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Coming Soon */}
          <Card className="mt-8 border-dashed border-2 border-gray-300">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center py-6">
                <RefreshCw className="h-12 w-12 text-gray-400 mb-3" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  More Video Content Coming Soon!
                </h3>
                <p className="text-gray-500 text-sm max-w-md">
                  We're adding animated lessons, expert lectures, and 
                  interactive video tutorials across all subjects.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default VideoQuestions;
