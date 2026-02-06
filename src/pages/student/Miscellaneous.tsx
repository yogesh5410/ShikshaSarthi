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
  Sparkles,
  ArrowLeft,
  Play,
  CheckCircle2,
  RefreshCw,
  Clock,
  Image,
  MousePointer2,
  Sliders,
  Grid3x3,
  Map,
  Gamepad2
} from "lucide-react";

const Miscellaneous: React.FC = () => {
  const navigate = useNavigate();

  // Placeholder data - Replace with actual miscellaneous assessments from backend
  const assessments = [
    {
      id: 1,
      title: "Image-Based Questions",
      description: "Analyze images and answer questions about what you see",
      duration: "15 min",
      difficulty: "Medium",
      questions: 12,
      icon: Image,
      color: "blue"
    },
    {
      id: 2,
      title: "Drag & Drop Activities",
      description: "Match items, sort elements, and organize information",
      duration: "10 min",
      difficulty: "Easy",
      questions: 8,
      icon: MousePointer2,
      color: "green"
    },
    {
      id: 3,
      title: "Interactive Sliders",
      description: "Use sliders to estimate values and make predictions",
      duration: "8 min",
      difficulty: "Easy",
      questions: 6,
      icon: Sliders,
      color: "purple"
    },
    {
      id: 4,
      title: "Fill in the Blanks",
      description: "Complete sentences and paragraphs with correct words",
      duration: "12 min",
      difficulty: "Medium",
      questions: 15,
      icon: Grid3x3,
      color: "orange"
    },
    {
      id: 5,
      title: "Map-Based Questions",
      description: "Geography and location-based interactive questions",
      duration: "10 min",
      difficulty: "Hard",
      questions: 7,
      icon: Map,
      color: "red"
    },
    {
      id: 6,
      title: "Interactive Simulations",
      description: "Perform virtual experiments and activities",
      duration: "20 min",
      difficulty: "Hard",
      questions: 5,
      icon: Gamepad2,
      color: "pink"
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

  const getColorClass = (color: string) => {
    const colorMap: Record<string, { bg: string; border: string; hover: string; button: string }> = {
      blue: { bg: "bg-blue-50", border: "border-blue-200", hover: "hover:border-blue-400", button: "bg-blue-600 hover:bg-blue-700" },
      green: { bg: "bg-green-50", border: "border-green-200", hover: "hover:border-green-400", button: "bg-green-600 hover:bg-green-700" },
      purple: { bg: "bg-purple-50", border: "border-purple-200", hover: "hover:border-purple-400", button: "bg-purple-600 hover:bg-purple-700" },
      orange: { bg: "bg-orange-50", border: "border-orange-200", hover: "hover:border-orange-400", button: "bg-orange-600 hover:bg-orange-700" },
      red: { bg: "bg-red-50", border: "border-red-200", hover: "hover:border-red-400", button: "bg-red-600 hover:bg-red-700" },
      pink: { bg: "bg-pink-50", border: "border-pink-200", hover: "hover:border-pink-400", button: "bg-pink-600 hover:bg-pink-700" }
    };
    return colorMap[color] || colorMap.blue;
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50">
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
              <div className="h-16 w-16 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center text-white">
                <Sparkles className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Miscellaneous Assessments ✨
                </h1>
                <p className="text-gray-600">
                  Explore various interactive assessment types
                </p>
              </div>
            </div>
          </div>

          {/* Instructions Card */}
          <Card className="mb-8 bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-orange-600" />
                Interactive Assessment Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Each assessment type offers a unique way to test your knowledge</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Use your mouse or touch screen to interact with elements</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Follow on-screen instructions for each activity type</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Get instant feedback on your responses</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Assessments List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assessments.map((assessment) => {
              const IconComponent = assessment.icon;
              const colors = getColorClass(assessment.color);
              
              return (
                <Card
                  key={assessment.id}
                  className={`border-2 ${colors.border} ${colors.hover} ${colors.bg} transition-all hover:shadow-lg`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <IconComponent className={`h-12 w-12 text-${assessment.color}-600`} />
                      <Badge className={getDifficultyColor(assessment.difficulty)}>
                        {assessment.difficulty}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{assessment.title}</CardTitle>
                    <CardDescription>{assessment.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {assessment.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" />
                        {assessment.questions} Questions
                      </span>
                    </div>

                    <Button className={`w-full ${colors.button}`}>
                      <Play className="h-4 w-4 mr-2" />
                      Start Assessment
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Benefits Card */}
          <Card className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-blue-600" />
                Why Interactive Assessments?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-white rounded-lg border border-gray-200">
                  <MousePointer2 className="h-8 w-8 text-blue-600 mb-3" />
                  <h4 className="font-semibold text-gray-900 mb-1">Hands-On Learning</h4>
                  <p className="text-sm text-gray-600">
                    Actively engage with content for better understanding
                  </p>
                </div>
                <div className="p-4 bg-white rounded-lg border border-gray-200">
                  <CheckCircle2 className="h-8 w-8 text-green-600 mb-3" />
                  <h4 className="font-semibold text-gray-900 mb-1">Instant Feedback</h4>
                  <p className="text-sm text-gray-600">
                    Get immediate results and learn from mistakes
                  </p>
                </div>
                <div className="p-4 bg-white rounded-lg border border-gray-200">
                  <Gamepad2 className="h-8 w-8 text-purple-600 mb-3" />
                  <h4 className="font-semibold text-gray-900 mb-1">Fun & Engaging</h4>
                  <p className="text-sm text-gray-600">
                    Interactive elements make learning enjoyable
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
                  More Interactive Features Coming Soon!
                </h3>
                <p className="text-gray-500 text-sm max-w-md">
                  We're developing 3D models, virtual labs, collaborative activities, 
                  and augmented reality experiences.
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

export default Miscellaneous;
