import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Headphones,
  Calendar,
  Clock,
  BarChart3,
  TrendingUp,
  Award,
  Zap,
  CheckCircle,
  XCircle,
  Volume2,
  RotateCcw,
  Target,
  ArrowLeft,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

interface QuestionAnalytics {
  questionId: string;
  questionText: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  audioPlayCount: number;
  audioListenTime: number;
  audioListenPercentage: number;
  attemptTime: number;
  isTukka: boolean;
  status: 'attempted' | 'skipped' | 'not-attempted';
}

interface AudioAnalytics {
  totalListenTime: number;
  averageListenPercentage: number;
  totalReplayCount: number;
  questionsWithReplays: number;
  averageAttentionScore: number;
}

interface AudioQuizAttempt {
  _id: string;
  studentId: string;
  class: string;
  subject: string;
  topic: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  skippedQuestions: number;
  timeTaken: number;
  audioAnalytics: AudioAnalytics;
  questionAnalytics: QuestionAnalytics[];
  attemptedAt: string;
}

const AudioQuizHistory: React.FC = () => {
  const [attempts, setAttempts] = useState<AudioQuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAttempt, setSelectedAttempt] = useState<AudioQuizAttempt | null>(null);

  useEffect(() => {
    const fetchAudioQuizHistory = async () => {
      try {
        console.log("🔍 Fetching all audio quiz attempts from database");
        
        // Fetch all audio quiz attempts directly from MongoDB
        const apiUrl = `${API_URL}/audio-questions/attempts`;
        console.log("🔍 Fetching from API:", apiUrl);

        const response = await axios.get(apiUrl);
        
        console.log("✅ API Response:", response.data);
        console.log("✅ Number of attempts found:", response.data.length);

        // Set all attempts - the UI will show all data from the database
        setAttempts(Array.isArray(response.data) ? response.data : []);
        setLoading(false);
        
      } catch (err) {
        console.error("❌ Error fetching audio quiz history:", err);
        
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 404) {
            // No attempts found in database
            setAttempts([]);
            setLoading(false);
            return;
          } else if (err.response?.status >= 500) {
            setError("Database server error. Please try again later.");
          } else {
            setError(err.response?.data?.message || "Failed to load audio quiz history from database");
          }
        } else {
          setError("Network error. Please check your connection and try again.");
        }
        
        setLoading(false);
      }
    };

    fetchAudioQuizHistory();
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (percentage: number): string => {
    if (percentage >= 75) return "text-green-600";
    if (percentage >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = (percentage: number): string => {
    if (percentage >= 75) return "bg-green-100";
    if (percentage >= 50) return "bg-yellow-100";
    return "bg-red-100";
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-edu-blue mx-auto mb-4"></div>
            <p className="text-gray-600">Loading audio quiz history...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 py-8">
          <div className="edu-container">
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <div className="text-red-500 mb-4 text-4xl">⚠️</div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">Error</h3>
                  <p className="text-muted-foreground mb-6">{error}</p>
                  <Button onClick={() => window.location.reload()}>Try Again</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (selectedAttempt) {
    const percentage = Math.round((selectedAttempt.score / selectedAttempt.totalQuestions) * 100);
    const tukkaQuestions = selectedAttempt.questionAnalytics.filter(q => q.isTukka);
    const attentionScore = selectedAttempt.audioAnalytics.averageAttentionScore;

    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 py-8 bg-gray-50">
          <div className="edu-container">
            {/* Back Button */}
            <div className="mb-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedAttempt(null)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to History
              </Button>
            </div>

            {/* Header Card */}
            <Card className="mb-6 border-l-4 border-l-edu-purple">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <Headphones className="h-6 w-6 text-edu-purple" />
                      {selectedAttempt.subject.charAt(0).toUpperCase() + selectedAttempt.subject.slice(1)} - {selectedAttempt.topic}
                    </CardTitle>
                    <CardDescription className="mt-2 flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(selectedAttempt.attemptedAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatTime(selectedAttempt.timeTaken)}
                      </span>
                    </CardDescription>
                  </div>
                  <div className={`text-center px-6 py-3 rounded-lg ${getScoreBgColor(percentage)}`}>
                    <div className={`text-3xl font-bold ${getScoreColor(percentage)}`}>
                      {percentage}%
                    </div>
                    <div className="text-sm text-gray-600">Score</div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Score Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Correct</p>
                      <p className="text-2xl font-bold text-green-600">
                        {selectedAttempt.correctAnswers}
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Wrong</p>
                      <p className="text-2xl font-bold text-red-600">
                        {selectedAttempt.wrongAnswers}
                      </p>
                    </div>
                    <XCircle className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Skipped</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {selectedAttempt.skippedQuestions}
                      </p>
                    </div>
                    <Target className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Tukka</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {tukkaQuestions.length}
                      </p>
                    </div>
                    <Zap className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Audio Analytics */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="h-5 w-5 text-edu-blue" />
                  Audio Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Listen Time</p>
                    <p className="text-2xl font-bold text-edu-blue">
                      {formatTime(selectedAttempt.audioAnalytics.totalListenTime)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Avg Listen %</p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold text-edu-green">
                        {Math.round(selectedAttempt.audioAnalytics.averageListenPercentage)}%
                      </p>
                      <Progress value={selectedAttempt.audioAnalytics.averageListenPercentage} className="h-2 flex-1" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Replays</p>
                    <p className="text-2xl font-bold text-purple-600 flex items-center gap-2">
                      <RotateCcw className="h-5 w-5" />
                      {selectedAttempt.audioAnalytics.totalReplayCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Attention Score</p>
                    <div className="flex items-center gap-2">
                      <p className={`text-2xl font-bold ${
                        attentionScore >= 75 ? 'text-green-600' :
                        attentionScore >= 50 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {Math.round(attentionScore)}%
                      </p>
                      <Award className={`h-5 w-5 ${
                        attentionScore >= 75 ? 'text-green-600' :
                        attentionScore >= 50 ? 'text-yellow-600' : 'text-red-600'
                      }`} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Question-wise Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-edu-purple" />
                  Question-wise Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedAttempt.questionAnalytics.map((qa, index) => (
                    <div
                      key={qa.questionId}
                      className={`p-4 rounded-lg border-2 ${
                        qa.status === 'skipped' ? 'border-yellow-200 bg-yellow-50' :
                        qa.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-bold text-lg">Q{index + 1}</span>
                            {qa.status === 'skipped' ? (
                              <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-300">
                                Skipped
                              </Badge>
                            ) : qa.isCorrect ? (
                              <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                                Correct
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
                                Wrong
                              </Badge>
                            )}
                            {qa.isTukka && (
                              <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
                                ⚡ Tukka ({Math.round(qa.attemptTime)}s)
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{qa.questionText}</p>
                          {qa.status !== 'skipped' && (
                            <div className="text-sm space-y-1">
                              <p>
                                <span className="font-medium">Your Answer:</span>{' '}
                                <span className={qa.isCorrect ? 'text-green-600' : 'text-red-600'}>
                                  {qa.selectedAnswer}
                                </span>
                              </p>
                              {!qa.isCorrect && (
                                <p>
                                  <span className="font-medium">Correct Answer:</span>{' '}
                                  <span className="text-green-600">{qa.correctAnswer}</span>
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Audio Stats for this question */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t">
                        <div>
                          <p className="text-xs text-muted-foreground">Listen Time</p>
                          <p className="text-sm font-medium">{formatTime(qa.audioListenTime)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Listened</p>
                          <p className="text-sm font-medium">{Math.round(qa.audioListenPercentage)}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Replays</p>
                          <p className="text-sm font-medium flex items-center gap-1">
                            <RotateCcw className="h-3 w-3" />
                            {qa.audioPlayCount}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Attempt Time</p>
                          <p className="text-sm font-medium">{Math.round(qa.attemptTime)}s</p>
                        </div>
                      </div>
                    </div>
                  ))}
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
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 py-8 bg-gray-50">
        <div className="edu-container">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <Headphones className="h-8 w-8 text-edu-purple" />
                  Audio Quiz History
                </h1>
                <p className="text-muted-foreground mt-2">
                  View all your audio quiz attempts and detailed analytics
                </p>
              </div>
              <Link to="/student/dashboard">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>

          {attempts.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Headphones className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    No Audio Quiz Attempts Yet
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Start practicing audio questions to see your history here
                  </p>
                  <Link to="/student/multimedia/audio-questions">
                    <Button>
                      <Headphones className="h-4 w-4 mr-2" />
                      Start Audio Quiz
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Attempts</p>
                        <p className="text-2xl font-bold text-edu-blue">{attempts.length}</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-edu-blue" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Avg Score</p>
                        <p className="text-2xl font-bold text-green-600">
                          {Math.round(
                            attempts.reduce((sum, a) => sum + (a.score / a.totalQuestions) * 100, 0) /
                            attempts.length
                          )}%
                        </p>
                      </div>
                      <Award className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Questions</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {attempts.reduce((sum, a) => sum + a.totalQuestions, 0)}
                        </p>
                      </div>
                      <BarChart3 className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Listen Time</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {formatTime(
                            attempts.reduce((sum, a) => sum + a.audioAnalytics.totalListenTime, 0)
                          )}
                        </p>
                      </div>
                      <Clock className="h-8 w-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Attempts List */}
              <div className="space-y-4">
                {attempts.map((attempt) => {
                  const percentage = Math.round((attempt.score / attempt.totalQuestions) * 100);
                  const tukkaCount = attempt.questionAnalytics.filter(q => q.isTukka).length;

                  return (
                    <Card
                      key={attempt._id}
                      className="hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-edu-purple"
                      onClick={() => setSelectedAttempt(attempt)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Headphones className="h-5 w-5 text-edu-purple" />
                              <h3 className="text-lg font-bold">
                                {attempt.subject.charAt(0).toUpperCase() + attempt.subject.slice(1)} - {attempt.topic}
                              </h3>
                              <Badge variant="outline">Class {attempt.class}</Badge>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {formatDate(attempt.attemptedAt)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {formatTime(attempt.timeTaken)}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                              <div>
                                <p className="text-xs text-muted-foreground">Score</p>
                                <p className={`text-lg font-bold ${getScoreColor(percentage)}`}>
                                  {percentage}%
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Correct</p>
                                <p className="text-lg font-bold text-green-600">
                                  {attempt.correctAnswers}/{attempt.totalQuestions}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Avg Listen</p>
                                <p className="text-lg font-bold text-edu-blue">
                                  {Math.round(attempt.audioAnalytics.averageListenPercentage)}%
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Replays</p>
                                <p className="text-lg font-bold text-purple-600">
                                  {attempt.audioAnalytics.totalReplayCount}
                                </p>
                              </div>
                              {tukkaCount > 0 && (
                                <div>
                                  <p className="text-xs text-muted-foreground">Tukka</p>
                                  <p className="text-lg font-bold text-orange-600 flex items-center gap-1">
                                    <Zap className="h-4 w-4" />
                                    {tukkaCount}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="ml-4">
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AudioQuizHistory;
