import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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
  Brain,
  ArrowLeft,
  Play,
  CheckCircle2,
  Clock,
  TrendingUp,
  Target,
  Award,
  BookOpen,
  Zap
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

interface Module {
  _id: string;
  totalQuestions: number;
  easyQuestions: number;
  mediumQuestions: number;
  hardQuestions: number;
}

const MAT: React.FC = () => {
  const navigate = useNavigate();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      const response = await axios.get(`${API_URL}/mat/modules`);
      setModules(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching MAT modules:', error);
      setLoading(false);
    }
  };

  // Module data with descriptions and icons (in Hindi)
  const moduleInfo: Record<string, { description: string; color: string; emoji: string }> = {
    'श्रृंखला पूर्णता': {
      description: 'अक्षर और संख्या अनुक्रम पूर्ण करें',
      color: 'blue',
      emoji: '🔢'
    },
    'कूटभाषा': {
      description: 'पैटर्न समझें और कोड आधारित समस्याएँ हल करें',
      color: 'purple',
      emoji: '🔐'
    },
    'रक्त संबंध': {
      description: 'पारिवारिक संबंध पहेलियों को हल करें',
      color: 'pink',
      emoji: '👨‍👩‍👧‍👦'
    },
    'दिशा ज्ञान': {
      description: 'दिशा आधारित प्रश्नों को हल करें',
      color: 'green',
      emoji: '🧭'
    },
    'क्रम और व्यवस्था': {
      description: 'वस्तुओं को तार्किक रूप से व्यवस्थित करें',
      color: 'orange',
      emoji: '📊'
    },
    'गणितीय संक्रियाएँ': {
      description: 'गणितीय तर्क का उपयोग करके समस्याएँ हल करें',
      color: 'red',
      emoji: '➗'
    },
    'वेन आरेख': {
      description: 'सेट संबंधों को दृश्य रूप से समझें',
      color: 'indigo',
      emoji: '⭕'
    },
    'पहेलियाँ और बैठने की व्यवस्था': {
      description: 'जटिल बैठने और व्यवस्था पहेलियों को हल करें',
      color: 'yellow',
      emoji: '🪑'
    },
    'संख्या और अक्षर पैटर्न': {
      description: 'संख्याओं और अक्षरों में पैटर्न पहचानें',
      color: 'teal',
      emoji: '🔤'
    },
    'सादृश्य': {
      description: 'जोड़ों के बीच संबंध खोजें',
      color: 'cyan',
      emoji: '🔗'
    },
    'विषम ज्ञात कीजिए': {
      description: 'समूह में भिन्न वस्तु पहचानें',
      color: 'lime',
      emoji: '🎯'
    },
    'कैलेंडर और समय': {
      description: 'तिथि और समय आधारित समस्याएँ हल करें',
      color: 'amber',
      emoji: '📅'
    },
    'आंकड़ा निर्वचन': {
      description: 'चार्ट से डेटा का विश्लेषण और व्याख्या करें',
      color: 'emerald',
      emoji: '📈'
    },
    'तार्किक विचार': {
      description: 'समस्याओं को हल करने के लिए तार्किक सोच लागू करें',
      color: 'violet',
      emoji: '🧠'
    }
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; border: string; hover: string; text: string }> = {
      blue: { bg: 'bg-blue-50', border: 'border-blue-200', hover: 'hover:border-blue-400', text: 'text-blue-600' },
      purple: { bg: 'bg-purple-50', border: 'border-purple-200', hover: 'hover:border-purple-400', text: 'text-purple-600' },
      pink: { bg: 'bg-pink-50', border: 'border-pink-200', hover: 'hover:border-pink-400', text: 'text-pink-600' },
      green: { bg: 'bg-green-50', border: 'border-green-200', hover: 'hover:border-green-400', text: 'text-green-600' },
      orange: { bg: 'bg-orange-50', border: 'border-orange-200', hover: 'hover:border-orange-400', text: 'text-orange-600' },
      red: { bg: 'bg-red-50', border: 'border-red-200', hover: 'hover:border-red-400', text: 'text-red-600' },
      indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', hover: 'hover:border-indigo-400', text: 'text-indigo-600' },
      yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', hover: 'hover:border-yellow-400', text: 'text-yellow-600' },
      teal: { bg: 'bg-teal-50', border: 'border-teal-200', hover: 'hover:border-teal-400', text: 'text-teal-600' },
      cyan: { bg: 'bg-cyan-50', border: 'border-cyan-200', hover: 'hover:border-cyan-400', text: 'text-cyan-600' },
      lime: { bg: 'bg-lime-50', border: 'border-lime-200', hover: 'hover:border-lime-400', text: 'text-lime-600' },
      amber: { bg: 'bg-amber-50', border: 'border-amber-200', hover: 'hover:border-amber-400', text: 'text-amber-600' },
      emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', hover: 'hover:border-emerald-400', text: 'text-emerald-600' },
      violet: { bg: 'bg-violet-50', border: 'border-violet-200', hover: 'hover:border-violet-400', text: 'text-violet-600' }
    };
    return colors[color] || colors.blue;
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">MAT मॉड्यूल लोड हो रहे हैं...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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
              मल्टीमीडिया आकलन पर वापस जाएं
            </Button>

            <div className="flex items-center space-x-4 mb-4">
              <div className="h-16 w-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white">
                <Brain className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  मानसिक योग्यता परीक्षा (MAT) 🧠
                </h1>
                <p className="text-gray-600">
                  इंटरैक्टिव अभ्यास के माध्यम से NMMSE मानसिक योग्यता में महारत हासिल करें
                </p>
              </div>
            </div>
          </div>

          {/* Info Banner */}
          <Card className="mb-8 bg-gradient-to-r from-blue-100 to-purple-100 border-blue-200">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-start space-x-3">
                  <Target className="h-8 w-8 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      विषयवार अभ्यास
                    </h3>
                    <p className="text-sm text-gray-700">
                      सभी NMMSE MAT विषयों को कवर करने वाले 14 मॉड्यूल
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Zap className="h-8 w-8 text-purple-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      इंटरैक्टिव सीखना
                    </h3>
                    <p className="text-sm text-gray-700">
                      तत्काल प्रतिक्रिया के साथ करके सीखें
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <TrendingUp className="h-8 w-8 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      प्रगति ट्रैक करें
                    </h3>
                    <p className="text-sm text-gray-700">
                      सभी मॉड्यूल में अपने सुधार की निगरानी करें
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module) => {
              const info = moduleInfo[module._id] || { description: '', color: 'blue', emoji: '📚' };
              const colors = getColorClasses(info.color);
              
              return (
                <Card
                  key={module._id}
                  className={`border-2 ${colors.border} ${colors.hover} ${colors.bg} transition-all hover:shadow-lg cursor-pointer`}
                  onClick={() => navigate(`/student/mat/${encodeURIComponent(module._id)}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="text-4xl mb-2">{info.emoji}</div>
                      <Badge className="bg-gray-100 text-gray-700">
                        {module.totalQuestions} Q's
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{module._id}</CardTitle>
                    <CardDescription>{info.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Difficulty Distribution */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          आसान
                        </span>
                        <span className="font-semibold">{module.easyQuestions}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                          मध्यम
                        </span>
                        <span className="font-semibold">{module.mediumQuestions}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          कठिन
                        </span>
                        <span className="font-semibold">{module.hardQuestions}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Button 
                        className={`w-full ${colors.text}`} 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/student/mat/${encodeURIComponent(module._id)}`);
                        }}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        अभ्यास शुरू करें
                      </Button>
                      <Button 
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/student/mat-test/${encodeURIComponent(module._id)}`);
                        }}
                      >
                        <Target className="h-4 w-4 mr-2" />
                        टॉपिक टेस्ट शुरू करें
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Tips Section */}
          <Card className="mt-8 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-6 w-6 text-yellow-600" />
                MAT सफलता के लिए टिप्स
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col items-center text-center p-4 bg-white rounded-lg">
                  <CheckCircle2 className="h-8 w-8 text-green-600 mb-3" />
                  <h4 className="font-semibold text-gray-900 mb-2">रोज अभ्यास करें</h4>
                  <p className="text-sm text-gray-600">
                    प्रतिदिन प्रत्येक मॉड्यूल के लिए 30 मिनट समर्पित करें
                  </p>
                </div>
                <div className="flex flex-col items-center text-center p-4 bg-white rounded-lg">
                  <Clock className="h-8 w-8 text-blue-600 mb-3" />
                  <h4 className="font-semibold text-gray-900 mb-2">समय प्रबंधन</h4>
                  <p className="text-sm text-gray-600">
                    समय सीमा के भीतर प्रश्नों को हल करने का अभ्यास करें
                  </p>
                </div>
                <div className="flex flex-col items-center text-center p-4 bg-white rounded-lg">
                  <BookOpen className="h-8 w-8 text-purple-600 mb-3" />
                  <h4 className="font-semibold text-gray-900 mb-2">गलतियों से सीखें</h4>
                  <p className="text-sm text-gray-600">
                    अवधारणाओं को समझने के लिए स्पष्टीकरण की समीक्षा करें
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MAT;
