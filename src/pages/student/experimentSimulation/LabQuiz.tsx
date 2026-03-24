import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import experiments from './experimentList.json';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, CheckCircle, XCircle, BarChart2, HelpCircle, AlertCircle, Timer, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface Question {
  _id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

const LabQuiz: React.FC = () => {
    const { subject } = useParams<{ subject: string }>();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const { toast } = useToast();
    
    const [selectedExperiment, setSelectedExperiment] = useState<string | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(false);
    const [answers, setAnswers] = useState<{[key: number]: string}>({});
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState(0);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [startTime, setStartTime] = useState<number>(0);
    
    // New States for Advanced Quiz Features
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [showExitDialog, setShowExitDialog] = useState(false);
    
    // Format time helper
    const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // Timer Logic - Handled below with submitQuiz



    // Warn if not logged in
    useEffect(() => {
        if (!isAuthenticated && selectedExperiment) {
             toast({
                title: "Not Logged In",
                description: "You are attempting this quiz as a guest. Your results will not be saved to your student profile.",
                variant: "destructive",
             });
        }
    }, [isAuthenticated, selectedExperiment]);

    const subjectExperiments = experiments.filter(
      (exp) => exp.subject.toLowerCase() === subject?.toLowerCase()
    );

    useEffect(() => {
        if (selectedExperiment) {
            fetchQuestions(selectedExperiment);
             setAnswers({});
             setShowResults(false);
             setScore(0);
             setStartTime(Date.now());
             // Reset Timer for new quiz
             setTimeLeft(600); // 10 minutes
        } else {
            setQuestions([]);
        }
    }, [selectedExperiment]);

    const fetchQuestions = async (expName: string) => {
        setLoading(true);
        try {
            console.log(`Fetching questions for: ${expName}`);
            const response = await axios.get(`${API_URL}/api/experiments/questions/${encodeURIComponent(expName)}`);
            setQuestions(response.data);
        } catch (error) {
            console.error("Error fetching questions:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerChange = (questionIndex: number, answer: string) => {
      setAnswers({
        ...answers,
        [questionIndex]: answer
      });
    };

    const calculateScore = () => {
      let currentScore = 0;
      questions.forEach((q, index) => {
        if (answers[index] === q.correctAnswer) {
          currentScore++;
        }
      });
      return currentScore;
    };

    const submitQuiz = async () => {
      setSubmitLoading(true);
      setShowConfirmDialog(false); // Close dialog if open
      const calculatedScore = calculateScore();
      setScore(calculatedScore);

      const endTime = Date.now();
      const timeTakenInSeconds = Math.floor((endTime - startTime) / 1000);

      const expDetails = experiments.find(e => e.experiment_name === selectedExperiment);

      const attemptData = {
          studentId: user?.id || "guest",
          studentName: user?.name || "Guest User",
          experimentName: selectedExperiment,
          subject: subject || "Unknown",
          // Use 'class' from experiment details or fallback (careful with reserved keyword)
          class: expDetails?.class || "11",
          score: calculatedScore,
          totalQuestions: questions.length,
          correctAnswers: calculatedScore,
          wrongAnswers: questions.length - calculatedScore,
          timeTaken: timeTakenInSeconds,
          questionAnalytics: questions.map((q, index) => ({
              questionId: q._id,
              questionText: q.question,
              selectedAnswer: answers[index] || "",
              correctAnswer: q.correctAnswer,
              isCorrect: answers[index] === q.correctAnswer,
              timeTaken: 0 // We could track per-question time if needed
          }))
      };

      try {
          const response = await axios.post(`${API_URL}/api/experiments/attempt`, attemptData);
          toast({
            title: "Quiz Result Saved",
            description: "Your performance has been recorded.",
            variant: "default",
          });
      } catch (error) {
          console.error("Error submitting attempt:", error);
           toast({
            title: "Error Saving Result",
            description: "Could not save your quiz result. Please try again later.",
            variant: "destructive",
          });
      }
      setShowResults(true);
      setSubmitLoading(false);
    };

    const handleTimerExpired = () => {
        toast({
            title: "Time's Up!",
            description: "Your quiz has been automatically submitted.",
            variant: "destructive",
        });
        submitQuiz();
    };

    // Correcting the timer useEffect to call handleTimerExpired
    useEffect(() => {
      let interval: NodeJS.Timeout;
      if (selectedExperiment && !showResults && timeLeft > 0) {
        interval = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              handleTimerExpired();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
      return () => clearInterval(interval);
    }, [selectedExperiment, showResults, timeLeft]);

    const handleUserSubmit = () => {
        setShowConfirmDialog(true);
    };

    const handleExitQuiz = () => {
        setShowExitDialog(true);
    };

    const confirmExit = () => {
        setShowExitDialog(false);
        setSelectedExperiment(null);
    };

    if (showResults) {
      const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
      
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl relative">
            <Button 
                variant="outline" 
                size="icon"
                onClick={() => {setShowResults(false); setSelectedExperiment(null);}} 
                className="absolute top-4 right-4 rounded-full shadow-sm bg-white/50 backdrop-blur-sm border-slate-200 hover:bg-white hover:text-indigo-600 transition-all z-10"
                title="Back to Experiments"
            >
                <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <Card className="border-t-4 border-t-indigo-500 shadow-lg mt-8">
                <CardHeader className="text-center pb-2">
                    <CardTitle className="text-3xl font-bold text-slate-800">Quiz Results</CardTitle>
                    <CardDescription>{selectedExperiment}</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="flex flex-col items-center justify-center mb-8">
                        <div className="text-5xl font-extrabold text-indigo-600 mb-2">{percentage}%</div>
                        <p className="text-slate-500 font-medium">You scored {score} out of {questions.length}</p>
                        <Progress value={percentage} className="w-full max-w-md mt-4 h-3" />
                    </div>

                    <div className="space-y-6">
                        {questions.map((q, index) => {
                            const isCorrect = answers[index] === q.correctAnswer;
                            return (
                                <div key={index} className={`p-4 rounded-xl border ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1">
                                            {isCorrect ? <CheckCircle className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-slate-800 mb-2">{index + 1}. {q.question}</p>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-3">
                                                <div className={`p-2 rounded-lg ${isCorrect ? 'bg-green-100 text-green-800 font-medium' : 'bg-red-100 text-red-800 line-through'}`}>
                                                    Your Answer: {answers[index] || "Skipped"}
                                                </div>
                                                {!isCorrect && (
                                                    <div className="p-2 rounded-lg bg-green-100 text-green-800 font-medium">
                                                        Correct Answer: {q.correctAnswer}
                                                    </div>
                                                )}
                                            </div>

                                            {q.explanation && (
                                                <div className="mt-3 text-sm text-slate-600 bg-white/50 p-3 rounded-lg">
                                                    <strong>Explanation:</strong> {q.explanation}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
                <CardFooter className="flex justify-center gap-4 bg-slate-50 p-6">
                    <Button onClick={() => {setShowResults(false); setAnswers({}); setScore(0);}} variant="outline">
                        Retry Quiz
                    </Button>
                    <Button onClick={() => {setSelectedExperiment(null); setShowResults(false);}} className="bg-indigo-600 hover:bg-indigo-700">
                        Try Another Experiment
                    </Button>
                    <Button onClick={() => navigate('/student/experiments/analytics')} variant="secondary">
                         Analytics
                    </Button>
                </CardFooter>
            </Card>
          </main>
          <Footer />
        </div>
      )
    }

    if (selectedExperiment) {
      if (loading) {
          return (
              <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
                  <Header />
                  <main className="flex-grow flex items-center justify-center">
                      <div className="animate-pulse text-indigo-600 font-semibold">Loading questions...</div>
                  </main>
                  <Footer />
              </div>
          );
      }

      if (questions.length === 0) {
          return (
              <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
                  <Header />
                  <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl relative">
                       <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => setSelectedExperiment(null)} 
                            className="absolute top-4 right-4 rounded-full shadow-sm bg-white/50 backdrop-blur-sm border-slate-200 hover:bg-white hover:text-indigo-600 transition-all z-10"
                            title="Back"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                      <Alert className="mt-8">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>No Questions Found</AlertTitle>
                        <AlertDescription>
                          There are currently no quiz questions available for this experiment.
                        </AlertDescription>
                      </Alert>
                  </main>
                  <Footer />
              </div>
          );
      }

      return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
          <Header />
          <main className="flex-grow container mx-auto px-4 py-6 max-w-7xl relative">
            
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Side: Questions */}
                <div className="flex-1">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6 flex justify-between items-center lg:hidden">
                        <div className="flex items-center gap-2">
                             <div className="bg-indigo-100 p-1.5 rounded-lg text-indigo-700">
                                <Clock className="h-4 w-4" />
                            </div>
                            <span className={`font-mono font-bold text-lg ${timeLeft < 60 ? 'text-red-600 animate-pulse' : 'text-slate-700'}`}>
                                {formatTime(timeLeft)}
                            </span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={handleExitQuiz} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                            Quit
                        </Button>
                    </div>

                    <Card className="shadow-lg border-0 bg-white overflow-hidden min-h-[600px] flex flex-col">
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 w-full" />
                        <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-xl font-bold text-slate-800">{selectedExperiment}</CardTitle>
                                <span className="text-sm font-medium text-slate-500">
                                    Question {Object.keys(answers).length + (Object.keys(answers).length < questions.length ? 1 : 0)} of {questions.length}
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 md:p-8 flex-1">
                            {questions.map((q, index) => (
                            <div key={q._id} className="mb-12 last:mb-0 scroll-mt-24" id={`question-${index}`}>
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0">
                                        <span className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm border transition-colors
                                            ${answers[index] 
                                                ? 'bg-indigo-600 text-white border-indigo-600' 
                                                : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                            {index + 1}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-medium text-slate-900 mb-5 leading-relaxed">
                                            {q.question}
                                        </h3>
                                        <div className="space-y-3">
                                        {q.options.map((option, optIndex) => (
                                            <label 
                                                key={optIndex} 
                                                className={`group flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:bg-slate-50 
                                                    ${answers[index] === option 
                                                        ? 'border-indigo-600 bg-indigo-50/50 shadow-sm' 
                                                        : 'border-slate-100 hover:border-slate-300'}`}
                                            >
                                            <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center transition-colors
                                                ${answers[index] === option ? 'border-indigo-600' : 'border-slate-300 group-hover:border-slate-400'}`}>
                                                {answers[index] === option && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />}
                                            </div>
                                            <span className={`text-base ${answers[index] === option ? 'text-indigo-900 font-medium' : 'text-slate-600'}`}>
                                                {option}
                                            </span>
                                            <input 
                                                type="radio" 
                                                name={`question-${index}`} 
                                                value={option} 
                                                checked={answers[index] === option}
                                                onChange={() => handleAnswerChange(index, option)}
                                                className="sr-only"
                                            />
                                            </label>
                                        ))}
                                        </div>
                                    </div>
                                </div>
                                {index < questions.length - 1 && <div className="h-px bg-slate-100 mt-12 mx-auto w-full" />}
                            </div>
                            ))}
                        </CardContent>
                        <CardFooter className="bg-slate-50 p-6 flex justify-end items-center border-t border-slate-100 sticky bottom-0 z-20 backdrop-blur-lg bg-slate-50/90 lg:hidden">
                            <Button 
                                onClick={handleUserSubmit} 
                                className="bg-green-600 hover:bg-green-700 text-white px-8 h-12 text-base font-semibold rounded-xl shadow-md transition-all w-full"
                                disabled={submitLoading}
                            >
                                {submitLoading ? "Submitting..." : "Submit Quiz"}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                {/* Right Side: Sidebar (Hidden on mobile, visible on lg) */}
                <div className="hidden lg:block w-80 flex-shrink-0 space-y-6">
                    {/* Timer Card */}
                    <Card className="shadow-sm border-slate-200 sticky top-24">
                        <CardHeader className="pb-3 border-b border-slate-50">
                            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                <Clock className="h-4 w-4" /> Time Remaining
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 pb-2 text-center">
                             <div className={`text-4xl font-mono font-bold ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-slate-700'}`}>
                                {formatTime(timeLeft)}
                            </div>
                        </CardContent>
                        
                        <div className="px-6 py-4">
                            <div className="grid grid-cols-5 gap-2 mb-6">
                                {questions.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => document.getElementById(`question-${idx}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                                        className={`h-8 w-8 rounded-md text-sm font-bold flex items-center justify-center transition-all
                                            ${answers[idx] 
                                                ? 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700' 
                                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                                        title={`Question ${idx + 1}`}
                                    >
                                        {idx + 1}
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between text-sm text-slate-500">
                                    <span>Answered</span>
                                    <span className="font-bold text-indigo-600">{Object.keys(answers).length}/{questions.length}</span>
                                </div>
                                <Progress value={(Object.keys(answers).length / questions.length) * 100} className="h-2" />
                            </div>
                        </div>

                        <CardFooter className="flex flex-col gap-3 pt-2 pb-6 px-6">
                             <Button 
                                onClick={handleUserSubmit} 
                                className="w-full bg-green-600 hover:bg-green-700 text-white h-11 text-base font-semibold shadow-md"
                                disabled={submitLoading}
                            >
                                {submitLoading ? "Submit Quiz" : "Submit Quiz"}
                            </Button>
                            <Button 
                                variant="outline" 
                                onClick={handleExitQuiz} 
                                className="w-full text-slate-500 hover:text-red-600 hover:bg-red-50 border-slate-200"
                            >
                                Exit Quiz
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
          </main>

          {/* Confirmation Dialog for Submit */}
          <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
            <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                <AlertDialogTitle className="text-xl">Submit Practice Test?</AlertDialogTitle>
                <AlertDialogDescription className="text-slate-600">
                    Are you sure you want to submit your test? You have answered <span className="font-bold text-indigo-600">{Object.keys(answers).length}</span> out of <span className="font-bold">{questions.length}</span> questions.
                </AlertDialogDescription>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center justify-between mt-4">
                        <span className="text-sm text-slate-500">Time Remaining:</span>
                        <span className="font-mono font-bold text-slate-800">{formatTime(timeLeft)}</span>
                </div>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setShowConfirmDialog(false)}>Continue Test</AlertDialogCancel>
                <AlertDialogAction 
                    onClick={submitQuiz}
                    className="bg-indigo-600 hover:bg-indigo-700"
                >
                    Yes, Submit
                </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
         </AlertDialog>

          {/* Confirmation Dialog for Exit */}
          <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
            <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                <AlertDialogTitle className="text-xl text-red-600 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Exit Quiz?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-slate-600">
                    Are you sure you want to exit? Your progress will be lost and this attempt will not be recorded.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setShowExitDialog(false)}>Keep Playing</AlertDialogCancel>
                <AlertDialogAction 
                    onClick={confirmExit}
                    className="bg-red-600 hover:bg-red-700 text-white"
                >
                    Yes, Exit
                </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
         </AlertDialog>

          <Footer />
        </div>
      )
    }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl relative">
        <Button 
            variant="outline" 
            size="icon"
            onClick={() => navigate('/student/experiments')} 
            className="absolute top-4 right-4 rounded-full shadow-sm bg-white/50 backdrop-blur-sm border-slate-200 hover:bg-white hover:text-indigo-600 transition-all z-10"
            title="Back"
        >
            <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="mb-10 text-center mt-8">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 capitalize mb-3">
                {subject} Lab Quizzes
            </h1>
            <p className="text-slate-500 max-w-2xl mx-auto">
                Test your knowledge of experiments and simulations. Select an experiment below to start the quiz.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjectExperiments.map((exp, index) => (
            <Card 
                key={index} 
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer border-slate-200 overflow-hidden"
                onClick={() => setSelectedExperiment(exp.experiment_name)}
            >
                <div className={`h-2 w-full bg-gradient-to-r from-blue-500 to-indigo-600 group-hover:h-3 transition-all duration-300`} />
                <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                        <Badge variant="outline" className="text-xs text-slate-500 border-slate-200">
                            {exp.section}
                        </Badge>
                        <HelpCircle className="h-5 w-5 text-indigo-100 group-hover:text-indigo-500 transition-colors" />
                    </div>
                    <CardTitle className="text-lg font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">
                        {exp.experiment_name}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-slate-500 line-clamp-2">
                        {exp.objective}
                    </p>
                </CardContent>
                <CardFooter className="bg-slate-50 group-hover:bg-indigo-50/50 transition-colors pt-4 pb-4">
                    <Button variant="ghost" className="w-full text-indigo-600 hover:text-indigo-700 hover:bg-transparent p-0 flex items-center justify-between font-medium">
                        Start Quiz <ArrowLeft className="h-4 w-4 rotate-180" />
                    </Button>
                </CardFooter>
            </Card>
            ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LabQuiz;
