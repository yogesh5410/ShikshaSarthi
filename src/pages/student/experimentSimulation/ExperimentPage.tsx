import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import experiments from './experimentList.json';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Info, BookOpen, FlaskConical, Microscope, ArrowUp, ArrowDown, List, Target, Calculator, AlertTriangle, CheckCircle, Lightbulb } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Experiment {
  class: string;
  subject: string;
  section: string;
  experiment_name: string;
  objective: string;
  apparatus: string[];
  theory: string;
  formula: string[];
  procedure: string[];
  calculations: string[];
  precautions: string[];
  sources_of_error: string[];
  learning_outcome: string;
  simulation_link: string;
}

const ExperimentPage: React.FC = () => {
  const { experimentName } = useParams<{ experimentName: string }>();
  const navigate = useNavigate();
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  
  const experiment = experiments.find(
    (exp) => exp.experiment_name === decodeURIComponent(experimentName || '')
  ) as Experiment | undefined;

  // Handle scroll visibility
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowScrollButtons(true);
      } else {
        setShowScrollButtons(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const getSubjectStyles = (subject: string | undefined) => {
    switch (subject?.toLowerCase()) {
      case 'physics':
        return {
          gradient: "from-blue-600 to-blue-800",
          iconColor: "text-blue-600",
          bgLight: "bg-blue-50",
          border: "border-blue-100",
          accentColor: "bg-blue-600 hover:bg-blue-700"
        };
      case 'chemistry':
        return {
          gradient: "from-purple-600 to-purple-800",
          iconColor: "text-purple-600",
          bgLight: "bg-purple-50",
          border: "border-purple-100",
          accentColor: "bg-purple-600 hover:bg-purple-700"
        };
      case 'biology':
        return {
          gradient: "from-green-600 to-green-800",
          iconColor: "text-green-600",
          bgLight: "bg-green-50",
          border: "border-green-100",
          accentColor: "bg-green-600 hover:bg-green-700"
        };
      default:
        return {
          gradient: "from-indigo-600 to-indigo-800",
          iconColor: "text-indigo-600",
          bgLight: "bg-indigo-50",
          border: "border-indigo-100",
          accentColor: "bg-indigo-600 hover:bg-indigo-700"
        };
    }
  };

  const styles = getSubjectStyles(experiment?.subject);

  if (!experiment) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
        <Header />
        <div className="flex-grow flex flex-col items-center justify-center p-4">
          <div className="text-center text-red-500 font-semibold text-xl mb-4">
            प्रयोग नहीं मिला! (Experiment not found!)
          </div>
          <Button onClick={() => navigate('/student/experiments')} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> वापस जाएं (Back)
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 font-sans relative">
      <Header />
      
      {/* Scroll Controls */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-2 transition-opacity duration-300">
        <Button
          onClick={scrollToTop}
          className={`${styles.accentColor} text-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300`}
          size="icon"
          title="Scroll to Top"
        >
          <ArrowUp className="h-6 w-6" />
        </Button>
        <Button
          onClick={scrollToBottom}
          className={`${styles.accentColor} text-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300`}
          size="icon"
          title="Scroll to Bottom"
        >
          <ArrowDown className="h-6 w-6" />
        </Button>
      </div>

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full max-w-7xl animate-in fade-in duration-500 relative">
        <Button 
            variant="outline" 
            size="icon"
            onClick={() => navigate(`/student/experiments/${experiment.subject.toLowerCase()}`)} 
            className="absolute top-4 right-6 lg:right-8 rounded-full shadow-sm bg-white/50 backdrop-blur-sm border-slate-200 hover:bg-white hover:text-indigo-600 transition-all z-10"
            title="Back to Experiment List"
        >
            <ArrowLeft className="h-5 w-5" />
        </Button>

        {/* Title Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8 transform transition-all hover:scale-[1.01] duration-300 mt-4">
            <div className={`bg-gradient-to-r ${styles.gradient} p-6 sm:p-10 text-white relative overflow-hidden`}>
                <div className="relative z-10">
                    <div className="flex flex-wrap gap-2 mb-4">
                        <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium border border-white/30 flex items-center gap-1">
                            <BookOpen className="h-3 w-3" /> Class {experiment.class}
                        </span>
                        <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium border border-white/30 flex items-center gap-1">
                            <FlaskConical className="h-3 w-3" /> {experiment.subject}
                        </span>
                        <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium border border-white/30">
                            {experiment.section}
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-2 flex items-center gap-3 leading-tight">
                        {experiment.experiment_name}
                    </h1>
                </div>
                 {/* Decorative background icon */}
                <Microscope className="absolute -right-6 -bottom-6 h-48 w-48 text-white opacity-10 rotate-12" />
            </div>
        </div>

        {/* Objective & Theory Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card className="border-l-4 border-l-blue-500 shadow-md bg-white">
                <CardHeader className="bg-blue-50/50 border-b border-blue-100">
                     <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Target className="h-5 w-5 text-blue-600" />
                        Objective (उद्देश्य)
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <p className="text-lg text-gray-700 leading-relaxed">
                        {experiment.objective}
                    </p>
                </CardContent>
            </Card>

            <Card className="border-l-4 border-l-indigo-500 shadow-md bg-white">
                <CardHeader className="bg-indigo-50/50 border-b border-indigo-100">
                     <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-indigo-600" />
                        Theory (सिद्धांत)
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <p className="text-gray-700 leading-relaxed">
                        {experiment.theory}
                    </p>
                </CardContent>
            </Card>
        </div>

        {/* Apparatus Section */}
        <Card className="mb-8 border-l-4 border-l-amber-500 shadow-md bg-white">
            <CardHeader className="bg-amber-50/50 border-b border-amber-100">
                <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <FlaskConical className="h-5 w-5 text-amber-600" />
                    Apparatus (उपकरण)
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                    {experiment.apparatus.map((item, index) => (
                        <li key={index}>{item}</li>
                    ))}
                </ul>
            </CardContent>
        </Card>

        {/* Formula Section */}
        <Card className="mb-8 border-l-4 border-l-purple-500 shadow-md bg-white">
            <CardHeader className="bg-purple-50/50 border-b border-purple-100">
                <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-purple-600" />
                    Formula (सूत्र)
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <ul className="list-disc pl-5 space-y-2 text-gray-700 font-mono bg-gray-50 p-4 rounded-md">
                    {experiment.formula.map((item, index) => (
                        <li key={index}>{item}</li>
                    ))}
                </ul>
            </CardContent>
        </Card>

        {/* Procedure Section */}
        <Card className="mb-8 border-l-4 border-l-teal-500 shadow-md bg-white">
            <CardHeader className="bg-teal-50/50 border-b border-teal-100">
                <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <List className="h-5 w-5 text-teal-600" />
                    Procedure (प्रक्रिया)
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <ol className="list-decimal pl-5 space-y-3 text-gray-700">
                    {experiment.procedure.map((step, index) => (
                        <li key={index} className="pl-2">{step}</li>
                    ))}
                </ol>
            </CardContent>
        </Card>

        {/* Simulation Container */}
        <Card className="overflow-hidden border-2 border-gray-200 shadow-xl bg-white mb-12">
            <div className="bg-gray-900 border-b border-gray-800 p-3 flex justify-between items-center text-gray-300 text-sm">
                <span className="flex items-center gap-2"><Play className="h-4 w-4 text-green-500" /> Interactive Simulation</span>
                <span>Virtual Lab v1.0</span>
            </div>
            
            <div className="w-full h-[60vh] sm:h-[70vh] lg:h-[85vh] bg-gray-100 relative group">
                <iframe 
                    src={experiment.simulation_link}
                    title={experiment.experiment_name}
                    className="w-full h-full border-0 absolute inset-0"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                ></iframe>
            </div>
        </Card>

        {/* Calculations & Precautions & Sources of Error */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
             <Card className="border-l-4 border-l-cyan-500 shadow-md bg-white">
                <CardHeader className="bg-cyan-50/50 border-b border-cyan-100">
                    <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Calculator className="h-5 w-5 text-cyan-600" />
                        Calculations (गणना)
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <ul className="list-disc pl-5 space-y-2 text-gray-700">
                        {experiment.calculations.map((item, index) => (
                            <li key={index}>{item}</li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

             <Card className="border-l-4 border-l-orange-500 shadow-md bg-white">
                <CardHeader className="bg-orange-50/50 border-b border-orange-100">
                    <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                        Precautions (सावधानियां)
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                     <ul className="list-disc pl-5 space-y-2 text-gray-700">
                        {experiment.precautions.map((item, index) => (
                            <li key={index}>{item}</li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

             <Card className="border-l-4 border-l-red-500 shadow-md bg-white">
                <CardHeader className="bg-red-50/50 border-b border-red-100">
                    <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        Sources of Error (त्रुटि के स्रोत)
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                     <ul className="list-disc pl-5 space-y-2 text-gray-700">
                        {experiment.sources_of_error.map((item, index) => (
                            <li key={index}>{item}</li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

             <Card className="border-l-4 border-l-green-500 shadow-md bg-white">
                <CardHeader className="bg-green-50/50 border-b border-green-100">
                    <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        Learning Outcome (सीखने का परिणाम)
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <p className="text-gray-700 leading-relaxed font-medium">
                        {experiment.learning_outcome}
                    </p>
                </CardContent>
            </Card>
        </div>

      </main>
      <Footer />
    </div>
  );
};

export default ExperimentPage;
