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
  Puzzle,
  ArrowLeft,
  Play,
  CheckCircle2,
  RefreshCw,
  Clock,
  Brain,
  Lightbulb
} from "lucide-react";

const Puzzles: React.FC = () => {
  const navigate = useNavigate();

  // Placeholder data - Replace with actual puzzles from backend
  const puzzles = [
    {
      id: 1,
      title: "Pattern Recognition",
      description: "Identify patterns in sequences of numbers, shapes, and colors",
      duration: "10 min",
      difficulty: "Medium",
      questions: 8,
      type: "Pattern",
      icon: "🔢"
    },
    {
      id: 2,
      title: "Logic Grid Puzzles",
      description: "Use logical deduction to solve grid-based puzzles",
      duration: "15 min",
      difficulty: "Hard",
      questions: 5,
      type: "Logic",
      icon: "🧩"
    },
    {
      id: 3,
      title: "Word Puzzles",
      description: "Crosswords, anagrams, and word search challenges",
      duration: "12 min",
      difficulty: "Easy",
      questions: 10,
      type: "Word",
      icon: "📝"
    },
    {
      id: 4,
      title: "Math Riddles",
      description: "Solve mathematical brain teasers and riddles",
      duration: "8 min",
      difficulty: "Medium",
      questions: 6,
      type: "Math",
      icon: "➗"
    },
    {
      id: 5,
      title: "Visual Puzzles",
      description: "Find differences, complete images, and spatial reasoning",
      duration: "10 min",
      difficulty: "Easy",
      questions: 7,
      type: "Visual",
      icon: "👁️"
    },
    {
      id: 6,
      title: "Code Breaking",
      description: "Decrypt codes and solve cryptographic puzzles",
      duration: "20 min",
      difficulty: "Hard",
      questions: 4,
      type: "Logic",
      icon: "🔐"
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Pattern":
        return "bg-blue-100 text-blue-700";
      case "Logic":
        return "bg-purple-100 text-purple-700";
      case "Word":
        return "bg-green-100 text-green-700";
      case "Math":
        return "bg-orange-100 text-orange-700";
      case "Visual":
        return "bg-pink-100 text-pink-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
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
              <div className="h-16 w-16 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center text-white">
                <Puzzle className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Puzzles 🧩
                </h1>
                <p className="text-gray-600">
                  Challenge your problem-solving abilities
                </p>
              </div>
            </div>
          </div>

          {/* Instructions Card */}
          <Card className="mb-8 bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-6 w-6 text-green-600" />
                How to Solve Puzzles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Read the puzzle instructions carefully before starting</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Think logically and use the process of elimination</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Take your time - puzzles are about quality, not speed</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Use hints if you get stuck, but try to solve it yourself first</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Puzzles List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {puzzles.map((puzzle) => (
              <Card
                key={puzzle.id}
                className="border-2 border-green-200 hover:border-green-400 transition-all hover:shadow-lg"
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-4xl mb-2">{puzzle.icon}</div>
                    <div className="flex flex-col gap-2">
                      <Badge className={getDifficultyColor(puzzle.difficulty)}>
                        {puzzle.difficulty}
                      </Badge>
                      <Badge className={getTypeColor(puzzle.type)}>
                        {puzzle.type}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-lg">{puzzle.title}</CardTitle>
                  <CardDescription>{puzzle.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {puzzle.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Puzzle className="h-4 w-4" />
                      {puzzle.questions} Puzzles
                    </span>
                  </div>

                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    <Play className="h-4 w-4 mr-2" />
                    Start Puzzles
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tips Card */}
          <Card className="mt-8 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-6 w-6 text-yellow-600" />
                Puzzle Solving Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <Brain className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900 mb-1">Think Differently</h4>
                  <p className="text-sm text-gray-600">
                    Look at problems from multiple angles
                  </p>
                </div>
                <div className="text-center">
                  <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900 mb-1">Practice Regularly</h4>
                  <p className="text-sm text-gray-600">
                    Daily practice improves problem-solving skills
                  </p>
                </div>
                <div className="text-center">
                  <Lightbulb className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900 mb-1">Learn from Mistakes</h4>
                  <p className="text-sm text-gray-600">
                    Review solutions to understand the logic
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Coming Soon */}
          <Card className="mt-8 border-dashed border-2 border-gray-300">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center py-6">
                <RefreshCw className="h-12 w-12 text-gray-400 mb-3" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  More Puzzle Types Coming Soon!
                </h3>
                <p className="text-gray-500 text-sm max-w-md">
                  We're adding Sudoku, crosswords, maze challenges, 
                  and many more brain-teasing puzzles.
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

export default Puzzles;
