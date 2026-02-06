import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Headphones,
  Video,
  Puzzle,
  Sparkles,
  ArrowLeft,
  Lock,
  PlayCircle,
  Volume2,
  Brain,
  Zap,
  Star,
  Trophy
} from "lucide-react";

const MultimediaAssessment: React.FC = () => {
  const navigate = useNavigate();

  const assessmentTypes = [
    {
      id: "audio",
      title: "Audio Questions",
      description: "Test your listening comprehension skills",
      icon: Headphones,
      color: "blue",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      iconColor: "text-blue-600",
      hoverBorder: "hover:border-blue-400",
      details: "Listen to audio clips and answer questions based on what you hear. Perfect for improving listening skills.",
      count: "25 Questions",
      difficulty: "Medium",
      route: "/student/multimedia/audio-questions"
    },
    {
      id: "video",
      title: "Video Questions",
      description: "Watch and learn with video-based assessments",
      icon: Video,
      color: "purple",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      iconColor: "text-purple-600",
      hoverBorder: "hover:border-purple-400",
      details: "Watch educational videos and answer comprehension questions. Visual learning made effective.",
      count: "18 Questions",
      difficulty: "Medium",
      route: "/student/multimedia/video-questions"
    },
    {
      id: "puzzles",
      title: "Puzzles",
      description: "Challenge your problem-solving abilities",
      icon: Puzzle,
      color: "green",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      iconColor: "text-green-600",
      hoverBorder: "hover:border-green-400",
      details: "Solve interactive puzzles including pattern recognition, logic puzzles, and brain teasers.",
      count: "30 Puzzles",
      difficulty: "Hard",
      route: "/student/multimedia/puzzles"
    },
    {
      id: "miscellaneous",
      title: "Miscellaneous",
      description: "Explore other interactive assessment types",
      icon: Sparkles,
      color: "orange",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      iconColor: "text-orange-600",
      hoverBorder: "hover:border-orange-400",
      details: "Various other interactive formats including image-based questions, drag-and-drop, and more.",
      count: "40 Questions",
      difficulty: "Mixed",
      route: "/student/multimedia/miscellaneous"
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
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50">
      <Header />

      <main className="flex-1 py-8">
        <div className="edu-container">
          {/* Header Section */}
          <div className="mb-8">
            <Button
              variant="ghost"
              className="mb-4"
              onClick={() => navigate('/student/dashboard')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>

            <div className="flex items-center space-x-4 mb-4">
              <div className="h-16 w-16 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center text-white">
                <Sparkles className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Multimedia Assessment 🎯
                </h1>
                <p className="text-gray-600">
                  Interactive and engaging ways to test your knowledge
                </p>
              </div>
            </div>
          </div>

          {/* Assessment Types Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {assessmentTypes.map((assessment) => {
              const IconComponent = assessment.icon;
              return (
                <Card
                  key={assessment.id}
                  className={`border-2 ${assessment.borderColor} ${assessment.hoverBorder} transition-all hover:shadow-lg ${assessment.bgColor}`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <IconComponent className={`h-12 w-12 ${assessment.iconColor}`} />
                      <Badge className={getDifficultyColor(assessment.difficulty)}>
                        {assessment.difficulty}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{assessment.title}</CardTitle>
                    <CardDescription className="text-base">
                      {assessment.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-gray-700">
                      {assessment.details}
                    </p>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Star className="h-4 w-4 mr-1" />
                        {assessment.count}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Zap className="h-4 w-4 mr-1" />
                        Interactive
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link to={assessment.route} className="w-full">
                      <Button
                        className={`w-full ${assessment.iconColor} hover:opacity-90`}
                        variant="outline"
                      >
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Start Assessment
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
          
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MultimediaAssessment;
