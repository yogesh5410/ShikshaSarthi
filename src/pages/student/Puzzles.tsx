import React, { useEffect, useState } from "react";
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
  Puzzle,
  ArrowLeft,
  Play,
  CheckCircle2,
  Clock,
  Brain,
  Eye,
  Grid3X3,
  History,
  Trophy,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const Puzzles: React.FC = () => {
  const navigate = useNavigate();
  const [pastResults, setPastResults] = useState<any[]>([]);
  const [studentId, setStudentId] = useState<string>("");
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    const studentData = localStorage.getItem("student");
    if (studentData) {
      try {
        const parsed = JSON.parse(studentData);
        if (parsed.student && parsed.student.studentId) {
          setStudentId(parsed.student.studentId);
        }
      } catch (e) {
        console.error("Error parsing student data:", e);
      }
    }
  }, []);

  useEffect(() => {
    if (!studentId) return;
    const fetchHistory = async () => {
      setLoadingHistory(true);
      try {
        const res = await axios.get(`${API_URL}/puzzles/history/${studentId}`);
        setPastResults(res.data);
      } catch (err) {
        console.error("Error fetching puzzle history:", err);
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchHistory();
  }, [studentId]);

  const puzzleGames = [
    {
      id: "memory_match",
      title: "मेमोरी मैच चैलेंज",
      description: "कार्ड्स की स्थिति याद करें और समय से पहले सभी जोड़ियाँ ढूँढें। याददाश्त और ध्यान का परीक्षण।",
      duration: "3 मिनट",
      route: "/student/puzzles/memory-match",
      icon: Brain,
      gradient: "from-indigo-500 to-purple-600",
      bgLight: "bg-indigo-50",
      borderColor: "border-indigo-200 hover:border-indigo-400",
      buttonColor: "bg-indigo-600 hover:bg-indigo-700",
      features: ["15 सेकंड प्रीव्यू", "जोड़ियाँ मिलाएं", "2 मोड उपलब्ध"],
    },
    {
      id: "match_pieces",
      title: "मैच पीसेज़",
      description: "चित्र के टुकड़ों को जोड़कर मूल चित्र बनाएं। दृश्य पहचान और स्थानिक तर्क का परीक्षण।",
      duration: "3 मिनट",
      route: "/student/puzzles/match-pieces",
      icon: Grid3X3,
      gradient: "from-cyan-500 to-teal-600",
      bgLight: "bg-cyan-50",
      borderColor: "border-cyan-200 hover:border-cyan-400",
      buttonColor: "bg-cyan-600 hover:bg-cyan-700",
      features: ["3 चित्र", "9 टुकड़े प्रति चित्र", "खींचें और रखें"],
    },
  ];

  const getResultLabel = (endReason: string) => {
    switch (endReason) {
      case "COMPLETED": return "पूर्ण";
      case "EXITED": return "बाहर निकले";
      case "TIME_UP": return "समय समाप्त";
      default: return endReason;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <Header />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              className="mb-4"
              onClick={() => navigate('/student/multimedia-assessment')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              मल्टीमीडिया मूल्यांकन पर वापस जाएं
            </Button>

            <div className="flex items-center space-x-4 mb-2">
              <div className="h-14 w-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                <Puzzle className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  पहेली गेम्स
                </h1>
                <p className="text-gray-600">
                  अपनी संज्ञानात्मक क्षमताओं का परीक्षण करें
                </p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <Card className="mb-8 border border-indigo-100 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-indigo-600" />
                निर्देश
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
                <div className="flex items-start gap-2">
                  <Eye className="h-4 w-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                  <span>निर्देश ध्यान से पढ़ें और खेल शुरू करें</span>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                  <span>प्रत्येक गेम में 3 मिनट का समय दिया जाता है</span>
                </div>
                <div className="flex items-start gap-2">
                  <Trophy className="h-4 w-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                  <span>आपका स्कोर और विश्लेषण खेल के बाद दिखेगा</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Game Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {puzzleGames.map((game) => {
              const Icon = game.icon;
              return (
                <Card
                  key={game.id}
                  className={`border-2 ${game.borderColor} transition-all hover:shadow-xl group`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className={`h-12 w-12 bg-gradient-to-br ${game.gradient} rounded-xl flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <Badge variant="outline" className="text-xs font-medium text-gray-600 border-gray-300">
                        <Clock className="h-3 w-3 mr-1" />
                        {game.duration}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl mt-3">{game.title}</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      {game.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {game.features.map((f, i) => (
                        <span key={i} className={`${game.bgLight} text-xs font-medium text-gray-700 rounded-full px-3 py-1`}>
                          {f}
                        </span>
                      ))}
                    </div>
                    <Button
                      className={`w-full ${game.buttonColor} text-white font-semibold`}
                      onClick={() => navigate(game.route)}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      खेल शुरू करें
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Past Results */}
          {studentId && pastResults.length > 0 && (
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <History className="h-5 w-5 text-indigo-600" />
                  पिछले परिणाम
                </CardTitle>
                <CardDescription>आपके सभी पहेली गेम के परिणाम</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {pastResults.slice(0, 15).map((r: any, i: number) => (
                    <div key={r._id || i} className="flex items-center justify-between bg-gray-50 rounded-lg p-3 text-sm hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm ${
                          r.score >= 70 ? 'bg-green-500' : r.score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}>
                          {r.score}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            {r.puzzleType === 'memory_match' ? 'मेमोरी मैच' : 'मैच पीसेज़'}
                            {r.mode && <span className="text-gray-500 ml-1">({r.mode === 'individual' ? 'व्यक्तिगत' : 'समूह'})</span>}
                          </p>
                          <p className="text-xs text-gray-500">
                            {r.memoryLevel || r.recognitionLevel || ''} — {getResultLabel(r.endReason)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {new Date(r.attemptedAt).toLocaleDateString('hi-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                        <p className="text-xs text-gray-400">{r.timeTaken} सेकंड</p>
                      </div>
                    </div>
                  ))}
                </div>
                {loadingHistory && <p className="text-center text-sm text-gray-400 mt-2">लोड हो रहा है...</p>}
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Puzzles;
