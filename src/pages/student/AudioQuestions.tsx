import React, { useState } from "react";
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
  Headphones,
  ArrowLeft,
  Play,
  Pause,
  Volume2,
  VolumeX,
  RefreshCw,
  CheckCircle2,
  XCircle
} from "lucide-react";

const AudioQuestions: React.FC = () => {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Placeholder data - Replace with actual audio questions from backend
  const audioQuestions = [
    {
      id: 1,
      title: "Listening Comprehension - Story",
      description: "Listen to a short story and answer questions",
      duration: "3:45",
      difficulty: "Medium",
      questions: 5
    },
    {
      id: 2,
      title: "Audio Instructions",
      description: "Follow audio instructions to complete the task",
      duration: "2:30",
      difficulty: "Easy",
      questions: 4
    },
    {
      id: 3,
      title: "Dialogue Understanding",
      description: "Listen to a conversation and answer questions",
      duration: "4:20",
      difficulty: "Hard",
      questions: 6
    },
    {
      id: 4,
      title: "News Report Analysis",
      description: "Listen to a news report and identify key points",
      duration: "5:00",
      difficulty: "Hard",
      questions: 8
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
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
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
              <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white">
                <Headphones className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Audio Questions 🎧
                </h1>
                <p className="text-gray-600">
                  Test your listening comprehension skills
                </p>
              </div>
            </div>
          </div>

          {/* Instructions Card */}
          <Card className="mb-8 bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="h-6 w-6 text-blue-600" />
                How to Attempt Audio Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Make sure your device volume is turned on before starting</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Listen carefully to the audio clip - you can replay it if needed</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Answer the questions based on what you heard in the audio</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Take notes if necessary while listening</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Audio Questions List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {audioQuestions.map((question) => (
              <Card
                key={question.id}
                className="border-2 border-blue-200 hover:border-blue-400 transition-all hover:shadow-lg"
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
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Volume2 className="h-4 w-4" />
                        {question.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" />
                        {question.questions} Questions
                      </span>
                    </div>
                  </div>

                  {/* Audio Player Placeholder */}
                  <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center space-x-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? (
                        <Pause className="h-6 w-6 text-blue-600" />
                      ) : (
                        <Play className="h-6 w-6 text-blue-600" />
                      )}
                    </Button>
                    <div className="flex-1 h-2 bg-gray-300 rounded-full">
                      <div className="h-full w-0 bg-blue-600 rounded-full"></div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsMuted(!isMuted)}
                    >
                      {isMuted ? (
                        <VolumeX className="h-5 w-5 text-gray-600" />
                      ) : (
                        <Volume2 className="h-5 w-5 text-gray-600" />
                      )}
                    </Button>
                  </div>

                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
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
                  More Audio Questions Coming Soon!
                </h3>
                <p className="text-gray-500 text-sm max-w-md">
                  We're adding more diverse audio content including podcasts, 
                  interviews, and educational lectures.
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

export default AudioQuestions;
