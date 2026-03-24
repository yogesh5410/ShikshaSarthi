import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Atom, 
  FlaskConical, 
  Dna, 
  ArrowRight, 
  ArrowLeft,
  Microscope,
  BarChart,
  ClipboardList,
  Sparkles,
  Zap,
  LayoutDashboard
} from "lucide-react";

const ExperimentSimulation: React.FC = () => {
    const navigate = useNavigate();

    const subjects = [
        {
            id: 'physics',
            subject: 'Physics',
            hiSubject: 'भौतिक विज्ञान',
            description: 'Mechanics, Optics, Electricity',
            icon: Atom,
            color: "text-blue-600",
            bg: "bg-blue-50",
            cardGradient: "bg-gradient-to-br from-white to-blue-50/30 hover:to-blue-50/50",
            border: "border-blue-200",
            hoverBorder: "group-hover:border-blue-500",
            path: '/student/experiments/physics',
        },
        {
            id: 'chemistry',
            subject: 'Chemistry',
            hiSubject: 'रसायन विज्ञान',
            description: 'Reactions, Organic, Inorganic',
            icon: FlaskConical,
            color: "text-violet-600",
            bg: "bg-violet-50",
            cardGradient: "bg-gradient-to-br from-white to-violet-50/30 hover:to-violet-50/50",
            border: "border-violet-200",
            hoverBorder: "group-hover:border-violet-500",
            path: '/student/experiments/chemistry',
        },
        {
            id: 'biology',
            subject: 'Biology',
            hiSubject: 'जीव विज्ञान',
            description: 'Cell Biology, Genetics, Ecology',
            icon: Dna,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            cardGradient: "bg-gradient-to-br from-white to-emerald-50/30 hover:to-emerald-50/50",
            border: "border-emerald-200",
            hoverBorder: "group-hover:border-emerald-500",
            path: '/student/experiments/biology',
        }
    ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/30 font-sans text-slate-900">
      <Header />
      
      <main className="flex-1 container mx-auto px-6 md:px-8 py-8 max-w-7xl relative">
        {/* Floating Back Button */}
        <Button 
            variant="outline" 
            size="icon"
            onClick={() => navigate('/student/dashboard')} 
            className="absolute top-4 right-6 md:right-8 rounded-full shadow-sm bg-white/50 backdrop-blur-sm border-slate-200 hover:bg-white hover:text-indigo-600 transition-all z-10"
            title="Back to Dashboard"
        >
            <ArrowLeft className="h-5 w-5" />
        </Button>

        {/* Header Section */}
        <div className="mb-10 mt-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 pb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-indigo-600 rounded-lg shadow-sm">
                            <Microscope className="h-6 w-6 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                            Virtual Lab Simulations
                        </h1>
                    </div>
                    <p className="text-slate-500 max-w-2xl text-lg">
                        Interactive experiments to visualize and understand scientific concepts.
                    </p>
                </div>
            </div>
        </div>

        {/* Dashboard Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Analytics Widget */}
            <div 
                onClick={() => navigate('/student/experiments/analytics')}
                className="group relative overflow-hidden bg-gradient-to-br from-white to-indigo-50/40 rounded-2xl border border-slate-200 p-6 md:p-8 cursor-pointer transition-all hover:border-indigo-300 hover:shadow-md"
            >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <BarChart className="w-32 h-32 text-indigo-600 -mr-6 -mt-6" />
                </div>
                
                <div className="relative z-10 flex items-start justify-between">
                    <div>
                        <div className="p-3 bg-indigo-50 rounded-xl w-fit mb-4 group-hover:bg-indigo-100 transition-colors">
                            <BarChart className="h-6 w-6 text-indigo-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-1">My Performance</h3>
                        <p className="text-slate-500 text-sm mb-6 max-w-xs">View detailed analytics and track your progress across different subjects</p>
                        <span className="inline-flex items-center text-sm font-semibold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-full group-hover:bg-indigo-100 group-hover:translate-x-1 transition-all">
                            View Analytics <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                        </span>
                    </div>
                </div>
            </div>

            {/* Quiz Widget */}
            <Dialog>
                <DialogTrigger asChild>
                    <div className="group relative overflow-hidden bg-gradient-to-br from-white to-emerald-50/40 rounded-2xl border border-slate-200 p-6 md:p-8 cursor-pointer transition-all hover:border-emerald-300 hover:shadow-md">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <ClipboardList className="w-32 h-32 text-emerald-600 -mr-6 -mt-6" />
                        </div>
                        
                        <div className="relative z-10 flex items-start justify-between">
                            <div>
                                <div className="p-3 bg-emerald-50 rounded-xl w-fit mb-4 group-hover:bg-emerald-100 transition-colors">
                                    <ClipboardList className="h-6 w-6 text-emerald-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-1">Take Lab Quiz</h3>
                                <p className="text-slate-500 text-sm mb-6 max-w-xs">Test your detailed knowledge with subject-specific interactive quizzes</p>
                                <span className="inline-flex items-center text-sm font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full group-hover:bg-emerald-100 group-hover:translate-x-1 transition-all">
                                    Start Quiz <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                                </span>
                            </div>
                        </div>
                    </div>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-white border-slate-100 shadow-xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                             Select Quiz Subject
                        </DialogTitle>
                        <DialogDescription>
                            Choose a subject to begin your assessment.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 gap-3 py-4">
                        {subjects.map((subject) => (
                            <Button 
                                key={subject.id}
                                variant="outline" 
                                className="h-16 justify-between px-4 hover:bg-slate-50 border-slate-200 group"
                                onClick={() => navigate(`/student/experiments/${subject.id}/quiz`)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-md ${subject.bg}`}>
                                        <subject.icon className={`h-5 w-5 ${subject.color}`} />
                                    </div>
                                    <span className="font-semibold text-slate-700">{subject.subject}</span>
                                </div>
                                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
                            </Button>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </div>

        {/* Subjects Grid */}
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5 text-slate-500" />
            Explore Subjects
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {subjects.map((item) => (
                <div 
                    key={item.id}
                    onClick={() => navigate(item.path)}
                    className={`group ${item.cardGradient} rounded-xl border ${item.border} ${item.hoverBorder} shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden flex flex-col`}
                >
                    <div className="p-6 flex-1">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-xl ${item.bg} ${item.color} mb-4`}>
                                <item.icon className="h-8 w-8" />
                            </div>
                            <div className="px-2.5 py-1 rounded-full bg-slate-100 text-xs font-semibold text-slate-600 border border-slate-200">
                                Class 11-12
                            </div>
                        </div>
                        
                        <h3 className="text-2xl font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">
                            {item.subject}
                        </h3>
                        <p className="text-sm font-medium text-slate-500 mb-4">{item.hiSubject}</p>
                        
                        <div className="pt-4 border-t border-slate-100">
                            <p className="text-sm text-slate-600 leading-relaxed mb-4">
                                {item.description}
                            </p>
                        </div>
                    </div>
                    <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center group-hover:bg-slate-50 transition-colors">
                        <span className="text-sm font-semibold text-slate-600 group-hover:text-indigo-600 transition-colors">Explore Experiments</span>
                        <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                </div>
            ))}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ExperimentSimulation;
