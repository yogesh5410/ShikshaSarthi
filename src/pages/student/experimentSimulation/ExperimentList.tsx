import React, { useState } from 'react';
import experiments from './experimentList.json';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Beaker, Play, FlaskConical, Atom, Dna, BarChart2 } from "lucide-react";

interface Experiment {
  class: string;
  subject: string;
  section: string;
  experiment_name: string;
  objective: string;
  simulation_link: string;
}

const ExperimentList: React.FC = () => {
  const { subject } = useParams<{ subject: string }>();
  // Use "11" as default open class if available, or just null
  const [openClass, setOpenClass] = useState<string | null>("11"); 
  const navigate = useNavigate();

  // Helper to generate distinct colors for different sections
  const getSectionMetadata = (section: string) => {
    // A palette of clean, professional colors for badges/accents
    const colors = [
        { 
            bg: "bg-blue-100", 
            text: "text-blue-700", 
            border: "border-blue-200",
            lightGradient: "bg-gradient-to-br from-white to-blue-50/50",
            hoverBorder: "hover:border-blue-300",
            hoverText: "group-hover:text-blue-700",
            buttonHoverBg: "group-hover:bg-blue-50",
            buttonHoverText: "group-hover:text-blue-700",
            buttonHoverBorder: "group-hover:border-blue-200"
        },
        { 
            bg: "bg-violet-100", 
            text: "text-violet-700", 
            border: "border-violet-200",
            lightGradient: "bg-gradient-to-br from-white to-violet-50/50",
            hoverBorder: "hover:border-violet-300",
            hoverText: "group-hover:text-violet-700",
            buttonHoverBg: "group-hover:bg-violet-50",
            buttonHoverText: "group-hover:text-violet-700",
            buttonHoverBorder: "group-hover:border-violet-200"
        },
        { 
            bg: "bg-amber-100", 
            text: "text-amber-700", 
            border: "border-amber-200",
            lightGradient: "bg-gradient-to-br from-white to-amber-50/50",
            hoverBorder: "hover:border-amber-300",
            hoverText: "group-hover:text-amber-700",
            buttonHoverBg: "group-hover:bg-amber-50",
            buttonHoverText: "group-hover:text-amber-700",
            buttonHoverBorder: "group-hover:border-amber-200"
        },
        { 
            bg: "bg-emerald-100", 
            text: "text-emerald-700", 
            border: "border-emerald-200",
            lightGradient: "bg-gradient-to-br from-white to-emerald-50/50",
            hoverBorder: "hover:border-emerald-300",
            hoverText: "group-hover:text-emerald-700",
            buttonHoverBg: "group-hover:bg-emerald-50",
            buttonHoverText: "group-hover:text-emerald-700",
            buttonHoverBorder: "group-hover:border-emerald-200"
        },
        { 
            bg: "bg-rose-100", 
            text: "text-rose-700", 
            border: "border-rose-200",
            lightGradient: "bg-gradient-to-br from-white to-rose-50/50",
            hoverBorder: "hover:border-rose-300",
            hoverText: "group-hover:text-rose-700",
            buttonHoverBg: "group-hover:bg-rose-50",
            buttonHoverText: "group-hover:text-rose-700",
            buttonHoverBorder: "group-hover:border-rose-200"
        },
        { 
            bg: "bg-cyan-100", 
            text: "text-cyan-700", 
            border: "border-cyan-200",
            lightGradient: "bg-gradient-to-br from-white to-cyan-50/50",
            hoverBorder: "hover:border-cyan-300",
            hoverText: "group-hover:text-cyan-700",
            buttonHoverBg: "group-hover:bg-cyan-50",
            buttonHoverText: "group-hover:text-cyan-700",
            buttonHoverBorder: "group-hover:border-cyan-200"
        },
    ];
    
    // Simple hash to consistently pick a color based on section name
    let hash = 0;
    for (let i = 0; i < section.length; i++) {
      hash = section.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const getSubjectStyles = (subject: string | undefined) => {
    switch (subject?.toLowerCase()) {
      case 'physics':
        return {
          icon: Atom,
          gradient: "from-blue-600 to-blue-700",
          buttonGradient: "bg-blue-600 hover:bg-blue-700",
          badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
          iconColor: "text-blue-600",
          activeClass: "bg-blue-50 text-blue-900 border-l-4 border-l-blue-600",
          containerBorder: "border-blue-100"
        };
      case 'chemistry':
        return {
          icon: FlaskConical,
          gradient: "from-violet-600 to-violet-700",
          buttonGradient: "bg-violet-600 hover:bg-violet-700",
          badgeColor: "bg-violet-50 text-violet-700 border-violet-200",
          iconColor: "text-violet-600",
          activeClass: "bg-violet-50 text-violet-900 border-l-4 border-l-violet-600",
          containerBorder: "border-violet-100"
        };
      case 'biology':
        return {
          icon: Dna,
          gradient: "from-emerald-600 to-emerald-700",
          buttonGradient: "bg-emerald-600 hover:bg-emerald-700",
          badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
          iconColor: "text-emerald-600",
          activeClass: "bg-emerald-50 text-emerald-900 border-l-4 border-l-emerald-600",
          containerBorder: "border-emerald-100"
        };
      default:
        return {
          icon: Beaker,
          gradient: "from-slate-600 to-slate-700",
          buttonGradient: "bg-slate-600 hover:bg-slate-700",
          badgeColor: "bg-slate-50 text-slate-700 border-slate-200",
          iconColor: "text-slate-600",
          activeClass: "bg-slate-50 text-slate-900 border-l-4 border-l-slate-600",
          containerBorder: "border-slate-100"
        };
    }
  };

  const styles = getSubjectStyles(subject);
  const SubjectIcon = styles.icon;

  const subjectExperiments = experiments.filter(
    (exp) => exp.subject.toLowerCase() === subject?.toLowerCase()
  );

  // Group experiments by class
  const experimentsByClass: { [key: string]: Experiment[] } = subjectExperiments.reduce(
    (acc, exp) => {
      if (!acc[exp.class]) {
        acc[exp.class] = [];
      }
      acc[exp.class].push(exp);
      return acc;
    },
    {} as { [key: string]: Experiment[] }
  );

  // Sort classes numerically if possible, or string sort
  const sortedClasses = Object.keys(experimentsByClass).sort();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      <Header />
      
      <main className="flex-1 py-10 relative">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl relative">
            
            {/* Header Section */}
            <div className="mb-12 bg-white rounded-2xl p-8 shadow-sm border border-slate-100 relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-2 h-full bg-gradient-to-b ${styles.gradient}`} />
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                    <div className="flex items-center gap-6">
                        <div className={`h-20 w-20 bg-gradient-to-br ${styles.gradient} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                            <SubjectIcon className="h-10 w-10" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className={`${styles.badgeColor} border-2 px-3 py-0.5 text-xs font-bold uppercase tracking-wider`}>
                                    {subject} Lab
                                </Badge>
                                <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-slate-200">
                                    {subjectExperiments.length} Experiments
                                </Badge>
                            </div>
                            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                                {subject} Experiments
                            </h1>
                            <p className="text-slate-500 mt-2 text-lg max-w-2xl font-medium">
                                Practical learning through interactive virtual simulations.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <Link to={`/student/experiments/analytics`}>
                             <Button variant="outline" size="lg" className="w-full md:w-auto border-2 border-slate-200 hover:bg-slate-50 text-slate-700 font-bold h-12 px-6">
                                <BarChart2 className="mr-2 h-4 w-4" />
                                Analytics
                             </Button>
                        </Link>
                        <Button 
                          size="lg" 
                          className={`w-full md:w-auto ${styles.buttonGradient} text-white font-bold shadow-md hover:shadow-lg h-12 px-8 transition-all`}
                          onClick={() => navigate(`/student/experiments/${subject?.toLowerCase()}/quiz`)}
                        >
                              <Beaker className="mr-2 h-5 w-5" />
                              Take Quiz
                        </Button>
                    </div>
                </div>
            </div>

            {/* Back Button */}
            <div className="mb-8">
                 <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate('/student/experiments')} 
                    className="text-slate-500 hover:text-slate-900 pl-0 hover:bg-transparent"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to All Subjects
                </Button>
            </div>

            {Object.keys(experimentsByClass).length === 0 ? (
                <div className="text-center py-24 bg-white rounded-3xl shadow-sm border border-dashed border-slate-200">
                    <div className="bg-slate-50 p-6 rounded-full inline-block mb-6">
                        <Beaker className="h-12 w-12 text-slate-300" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900">No experiments available yet</h3>
                    <p className="text-slate-500 mt-2 text-lg max-w-md mx-auto">We are working on adding new experiments for {subject}. Please check back later.</p>
                </div>
            ) : (
                <div className="space-y-16">
                    {sortedClasses.map((classNum) => (
                        <div key={classNum} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="flex items-center gap-4 mb-8">
                                <div className={`flex items-center justify-center h-12 w-12 rounded-xl bg-white shadow-sm border border-slate-200 text-xl font-bold text-slate-700`}>
                                   {classNum}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-800">Class {classNum}</h2>
                                    <p className="text-sm text-slate-500 font-medium">Standard {classNum} Curriculum</p>
                                </div>
                                <div className="h-px bg-slate-200 flex-1 ml-4" />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
                                {experimentsByClass[classNum].map((exp, index) => {
                                    const sectionStyle = getSectionMetadata(exp.section);
                                    
                                    return (
                                        <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-slate-200 bg-white overflow-hidden flex flex-col h-full hover:-translate-y-1">
                                            <div className={`h-1.5 w-full bg-gradient-to-r ${styles.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
                                            
                                            <CardHeader className="pb-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <Badge className={`${sectionStyle.bg} ${sectionStyle.text} border-0 px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase`}>
                                                        {exp.section}
                                                    </Badge>
                                                    {exp.experiment_name.toLowerCase().includes('measurement') && 
                                                        <div className="bg-slate-100 p-1.5 rounded-md text-slate-400">
                                                            <Atom className="h-4 w-4" />
                                                        </div>
                                                    }
                                                </div>
                                                <CardTitle className="text-lg font-bold text-slate-800 leading-snug group-hover:text-indigo-700 transition-colors line-clamp-2">
                                                    {exp.experiment_name}
                                                </CardTitle>
                                            </CardHeader>
                                            
                                            <CardContent className="flex-1 pb-6">
                                                <CardDescription className="text-slate-500 text-sm leading-relaxed line-clamp-3">
                                                    {exp.objective}
                                                </CardDescription>
                                            </CardContent>
                                            
                                            <CardFooter className="pt-0 pb-6">
                                                <Link to={`/student/experiment/${encodeURIComponent(exp.experiment_name)}`} className="w-full">
                                                    <Button className="w-full bg-slate-50 hover:bg-slate-900 text-slate-900 hover:text-white border border-slate-200 hover:border-slate-900 transition-all font-semibold h-11 shadow-sm group-hover:shadow-md">
                                                        Start Experiment
                                                    </Button>
                                                </Link>
                                            </CardFooter>
                                        </Card>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ExperimentList;
