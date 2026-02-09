import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  Clock,
  Volume2,
  Brain,
  Target,
  TrendingUp,
  AlertTriangle,
  Award,
  Lightbulb,
  Zap,
  BarChart3,
  Headphones,
  Ear,
  Activity,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
} from "recharts";

interface AudioAnalyticsResultsProps {
  results: { correct: number; incorrect: number; unattempted: number };
  totalQuestions: number;
  accuracy: number;
  timeTaken: number;
  audioAnalytics: {
    totalListenTime: number;
    audioPlaybacks: number;
    avgListenPercentage: number;
  };
  questionAnalytics: {
    [key: number]: {
      timeSpent: number;
      attempts: number;
      hintUsed: boolean;
      answerChangeCount: number;
      navigationPattern: string[];
      isCorrect: boolean;
      audioPlayCount: number;
      audioListenPercentage: number;
      attemptTime?: number; // Time taken to answer (ms)
      isTukka?: boolean; // Quick answer detection
      status?: 'attempted' | 'skipped' | 'not-attempted'; // Attempt status
    };
  };
}

const AudioAnalyticsResults: React.FC<AudioAnalyticsResultsProps> = ({
  results,
  totalQuestions,
  accuracy,
  timeTaken,
  audioAnalytics,
  questionAnalytics,
}) => {
  
  // ===== AUDIO-SPECIFIC ADVANCED ALGORITHMS =====
  
  // 1. Audio Comprehension Score (0-100)
  // Measures how well student uses audio to understand questions
  const calculateAudioComprehensionScore = () => {
    if (totalQuestions === 0) return 0;
    
    const analytics = Object.values(questionAnalytics);
    let comprehensionScore = 0;
    
    analytics.forEach((qa) => {
      // Optimal listening: 80-100% of audio + correct answer = high comprehension
      if (qa.audioListenPercentage >= 80 && qa.isCorrect) {
        comprehensionScore += 100;
      }
      // Partial listening but correct = moderate comprehension
      else if (qa.audioListenPercentage >= 50 && qa.isCorrect) {
        comprehensionScore += 70;
      }
      // Full listening but incorrect = trying but needs help
      else if (qa.audioListenPercentage >= 80 && !qa.isCorrect) {
        comprehensionScore += 50;
      }
      // Low listening + incorrect = poor comprehension
      else if (qa.audioListenPercentage < 50 && !qa.isCorrect) {
        comprehensionScore += 20;
      }
      // Low listening but correct = guessing/prior knowledge
      else if (qa.audioListenPercentage < 50 && qa.isCorrect) {
        comprehensionScore += 60;
      }
    });
    
    return Math.round(comprehensionScore / totalQuestions);
  };

  // 2. Listening Engagement Score (0-100)
  // Measures active listening behavior
  const calculateListeningEngagementScore = () => {
    if (totalQuestions === 0) return 0;
    
    const analytics = Object.values(questionAnalytics);
    
    // Multiple replays indicate active listening
    const avgReplays = analytics.reduce((sum, qa) => sum + (qa.audioPlayCount || 0), 0) / totalQuestions;
    
    // Optimal replay count: 1-3 times (0 or too many indicates issues)
    let replayScore = 0;
    if (avgReplays >= 1 && avgReplays <= 3) {
      replayScore = 100;
    } else if (avgReplays > 3 && avgReplays <= 5) {
      replayScore = 80; // Struggling but engaged
    } else if (avgReplays > 5) {
      replayScore = 60; // Confusion
    } else {
      replayScore = 40; // No replays (too confident or not engaged)
    }
    
    // Listen percentage score
    const avgListenPct = audioAnalytics.avgListenPercentage || 0;
    let listenScore = 0;
    if (avgListenPct >= 90) {
      listenScore = 100;
    } else if (avgListenPct >= 70) {
      listenScore = 85;
    } else if (avgListenPct >= 50) {
      listenScore = 60;
    } else {
      listenScore = 30;
    }
    
    return Math.round((replayScore * 0.4) + (listenScore * 0.6));
  };

  // 3. Audio-Based Focus Score (0-100)
  // Measures sustained attention through audio
  const calculateAudioFocusScore = () => {
    if (totalQuestions === 0) return 0;
    
    const analytics = Object.values(questionAnalytics);
    
    // Check consistency of listening across questions
    const listenPercentages = analytics.map(qa => qa.audioListenPercentage || 0);
    const avgListen = listenPercentages.reduce((a, b) => a + b, 0) / totalQuestions;
    
    // Calculate variance - low variance = consistent focus
    const variance = listenPercentages.reduce((sum, pct) => 
      sum + Math.pow(pct - avgListen, 2), 0) / totalQuestions;
    const stdDev = Math.sqrt(variance);
    
    // Lower standard deviation = better focus
    const consistencyScore = Math.max(0, 100 - stdDev);
    
    // High average listening = good focus
    const avgScore = avgListen;
    
    return Math.round((consistencyScore * 0.5) + (avgScore * 0.5));
  };

  // 4. Auditory Processing Efficiency (0-100)
  // Measures how efficiently student processes audio information
  const calculateAuditoryProcessingEfficiency = () => {
    if (totalQuestions === 0) return 0;
    
    const analytics = Object.values(questionAnalytics);
    
    const efficiencyScores: number[] = [];
    
    analytics.forEach((qa) => {
      // Efficiency = Correctness / (Audio replays + Time spent ratio)
      const timeRatio = (qa.timeSpent || 0) / 60; // Normalize to minutes
      const audioReplays = Math.max(1, qa.audioPlayCount || 1);
      
      if (qa.isCorrect) {
        // Less time + fewer replays = high efficiency
        const efficiency = 100 / (audioReplays * 0.5 + timeRatio * 0.3 + 0.1); // +0.1 to avoid division by zero
        efficiencyScores.push(Math.min(100, efficiency));
      } else {
        // Incorrect answers get lower efficiency scores
        const efficiency = 50 / (audioReplays * 0.5 + timeRatio * 0.3 + 0.1);
        efficiencyScores.push(Math.min(50, efficiency));
      }
    });
    
    const total = efficiencyScores.reduce((a, b) => a + b, 0);
    return Math.round(total / totalQuestions);
  };

  // 5. Strategic Audio Usage Score (0-100)
  // Measures intelligent use of audio features
  const calculateStrategicAudioUsage = () => {
    if (totalQuestions === 0) return 0;
    
    const analytics = Object.values(questionAnalytics);
    
    let strategicPoints = 0;
    
    analytics.forEach((qa) => {
      // Strategic behavior patterns:
      
      // 1. Replay on difficult questions (indicated by answer changes)
      if ((qa.answerChangeCount || 0) > 0 && (qa.audioPlayCount || 0) > 1) {
        strategicPoints += 20; // Good strategy
      }
      
      // 2. Listen fully on first attempt
      if ((qa.audioListenPercentage || 0) >= 90 && (qa.audioPlayCount || 0) === 1) {
        strategicPoints += 25; // Excellent concentration
      }
      
      // 3. Use hints with audio (combined learning)
      if (qa.hintUsed && (qa.audioPlayCount || 0) >= 1) {
        strategicPoints += 15; // Multi-modal learning
      }
      
      // 4. Efficient correction (replay after wrong attempt)
      if ((qa.answerChangeCount || 0) > 0 && (qa.audioPlayCount || 0) > 1 && qa.isCorrect) {
        strategicPoints += 30; // Learning from mistakes
      }
      
      // 5. Quick understanding (high listen%, low replays, correct)
      if ((qa.audioListenPercentage || 0) >= 80 && (qa.audioPlayCount || 0) <= 2 && qa.isCorrect) {
        strategicPoints += 25; // Fast learner
      }
    });
    
    return Math.min(100, Math.round(strategicPoints / totalQuestions));
  };

  // 6. Audio Learning Potential (0-100)
  // Predicts future performance based on current behavior
  const calculateAudioLearningPotential = () => {
    const comprehension = calculateAudioComprehensionScore();
    const engagement = calculateListeningEngagementScore();
    const focus = calculateAudioFocusScore();
    const efficiency = calculateAuditoryProcessingEfficiency();
    const strategic = calculateStrategicAudioUsage();
    
    // Weighted combination for potential
    const potential = 
      (comprehension * 0.25) +
      (engagement * 0.20) +
      (focus * 0.20) +
      (efficiency * 0.20) +
      (strategic * 0.15);
    
    return Math.round(potential);
  };

  // Calculate all scores
  const audioComprehension = calculateAudioComprehensionScore();
  const listeningEngagement = calculateListeningEngagementScore();
  const audioFocus = calculateAudioFocusScore();
  const processingEfficiency = calculateAuditoryProcessingEfficiency();
  const strategicUsage = calculateStrategicAudioUsage();
  const learningPotential = calculateAudioLearningPotential();

  // Chart data
  const pieChartData = [
    { name: "सही", value: results.correct, color: "#10b981" },
    { name: "गलत", value: results.incorrect, color: "#ef4444" },
    { name: "छोड़े गए", value: results.unattempted, color: "#6b7280" },
  ];

  const audioRadarData = [
    { metric: "समझ", value: audioComprehension, fullMark: 100 },
    { metric: "जुड़ाव", value: listeningEngagement, fullMark: 100 },
    { metric: "एकाग्रता", value: audioFocus, fullMark: 100 },
    { metric: "दक्षता", value: processingEfficiency, fullMark: 100 },
    { metric: "रणनीति", value: strategicUsage, fullMark: 100 },
  ];

  // Question-wise audio usage trend
  const questionTrendData = Object.entries(questionAnalytics).map(([idx, qa]) => ({
    question: `Q${parseInt(idx) + 1}`,
    listening: qa.audioListenPercentage || 0,
    replays: qa.audioPlayCount || 0, // Actual replay count (not scaled)
    correct: qa.isCorrect ? 100 : 0,
  }));

  // Performance level
  const getPerformanceLevel = (score: number) => {
    if (score >= 80) return { level: "उत्कृष्ट", color: "text-green-600", bg: "bg-green-50" };
    if (score >= 60) return { level: "अच्छा", color: "text-blue-600", bg: "bg-blue-50" };
    if (score >= 40) return { level: "सुधार योग्य", color: "text-yellow-600", bg: "bg-yellow-50" };
    return { level: "अधिक प्रयास चाहिए", color: "text-red-600", bg: "bg-red-50" };
  };

  const performance = getPerformanceLevel(learningPotential);

  return (
    <div className="space-y-6">
      {/* Overall Performance Header */}
      <Card className="border-2 border-blue-200">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="h-10 w-10" />
              <div>
                <CardTitle className="text-3xl">ऑडियो क्विज पूर्ण! 🎧</CardTitle>
                <p className="text-blue-100 mt-1">ऑडियो-आधारित विस्तृत विश्लेषण</p>
              </div>
            </div>
            <div className={`px-6 py-3 rounded-lg ${performance.bg} border-2 border-white`}>
              <p className="text-sm text-gray-600 mb-1">सीखने की क्षमता</p>
              <p className={`text-2xl font-bold ${performance.color}`}>
                {learningPotential}%
              </p>
              <p className={`text-sm font-semibold ${performance.color}`}>{performance.level}</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Trophy className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{accuracy}%</p>
            <p className="text-sm text-gray-600">सटीकता</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">
              {Math.floor(timeTaken / 60)}:{(timeTaken % 60).toString().padStart(2, '0')}
            </p>
            <p className="text-sm text-gray-600">समय</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Volume2 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">{audioAnalytics.audioPlaybacks}</p>
            <p className="text-sm text-gray-600">कुल प्ले</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Headphones className="h-8 w-8 text-cyan-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-cyan-600">
              {Math.round(audioAnalytics.avgListenPercentage)}%
            </p>
            <p className="text-sm text-gray-600">औसत सुनना</p>
          </CardContent>
        </Card>
      </div>

      {/* Audio Learning Analysis */}
      <Card className="border-2 border-purple-200">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
          <CardTitle className="flex items-center gap-2">
            <Ear className="h-6 w-6 text-purple-600" />
            ऑडियो सीखने का विश्लेषण
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Radar Chart */}
            <div>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={audioRadarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar
                    name="आपका प्रदर्शन"
                    dataKey="value"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.6}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audio-Specific Metrics */}
      <Card className="border-2 border-blue-200">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-blue-600" />
            ऑडियो प्रदर्शन मेट्रिक्स
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Audio Comprehension */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Brain className="h-4 w-4 text-purple-600" />
                  ऑडियो समझ स्कोर
                </span>
                <span className="text-sm font-bold">{audioComprehension}%</span>
              </div>
              <Progress value={audioComprehension} className="h-2" />
              <p className="text-xs text-gray-600 mt-1">
                {audioComprehension >= 80 
                  ? "उत्कृष्ट! आप ऑडियो को बहुत अच्छे से समझ रहे हैं।"
                  : audioComprehension >= 60
                  ? "अच्छा! ऑडियो को और ध्यान से सुनने का प्रयास करें।"
                  : "ऑडियो को पूरा सुनें और नोट्स बनाएं।"}
              </p>
            </div>

            {/* Listening Engagement */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Headphones className="h-4 w-4 text-blue-600" />
                  सुनने में जुड़ाव
                </span>
                <span className="text-sm font-bold">{listeningEngagement}%</span>
              </div>
              <Progress value={listeningEngagement} className="h-2" />
              <p className="text-xs text-gray-600 mt-1">
                {listeningEngagement >= 80
                  ? "बहुत अच्छा! आप सक्रिय रूप से सुन रहे हैं।"
                  : "ऑडियो को बार-बार सुनने से समझ बेहतर होती है।"}
              </p>
            </div>

            {/* Audio Focus */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Target className="h-4 w-4 text-green-600" />
                  ऑडियो एकाग्रता
                </span>
                <span className="text-sm font-bold">{audioFocus}%</span>
              </div>
              <Progress value={audioFocus} className="h-2" />
              <p className="text-xs text-gray-600 mt-1">
                {audioFocus >= 70
                  ? "आप लगातार ध्यान दे रहे हैं।"
                  : "हर प्रश्न पर समान ध्यान दें।"}
              </p>
            </div>

            {/* Processing Efficiency */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-600" />
                  प्रोसेसिंग दक्षता
                </span>
                <span className="text-sm font-bold">{processingEfficiency}%</span>
              </div>
              <Progress value={processingEfficiency} className="h-2" />
              <p className="text-xs text-gray-600 mt-1">
                {processingEfficiency >= 70
                  ? "आप जल्दी समझ रहे हैं!"
                  : "समय लें और सोच-समझकर उत्तर दें।"}
              </p>
            </div>

            {/* Strategic Usage */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-cyan-600" />
                  रणनीतिक उपयोग
                </span>
                <span className="text-sm font-bold">{strategicUsage}%</span>
              </div>
              <Progress value={strategicUsage} className="h-2" />
              <p className="text-xs text-gray-600 mt-1">
                {strategicUsage >= 70
                  ? "आप स्मार्ट तरीके से सीख रहे हैं!"
                  : "मुश्किल प्रश्नों पर ऑडियो दोबारा सुनें।"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question-wise Trend */}
      <Card className="border-2 border-cyan-200">
        <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-cyan-600" />
            प्रश्न-वार ऑडियो उपयोग ट्रेंड
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={questionTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="question" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="listening" 
                stroke="#3b82f6" 
                name="सुनने %" 
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="replays" 
                stroke="#8b5cf6" 
                name="रीप्ले" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-600 mt-2 text-center">
            नीली रेखा: ऑडियो सुनने का प्रतिशत | बैंगनी रेखा: रीप्ले की संख्या
          </p>
        </CardContent>
      </Card>

      {/* Detailed Insights */}
      <Card className="border-2 border-yellow-200">
        <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-yellow-600" />
            सुधार के सुझाव
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {audioComprehension < 60 && (
              <div className="flex items-start gap-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <AlertTriangle className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-purple-800 text-sm">ऑडियो समझ में सुधार करें</p>
                  <p className="text-xs text-gray-700 mt-1">
                    ऑडियो को कम से कम 80% तक सुनें। नोट्स बनाएं और फिर उत्तर दें।
                  </p>
                </div>
              </div>
            )}

            {listeningEngagement < 60 && (
              <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <Headphones className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-blue-800 text-sm">अधिक सक्रिय रूप से सुनें</p>
                  <p className="text-xs text-gray-700 mt-1">
                    जरूरत पड़ने पर ऑडियो को 2-3 बार सुनें। हर शब्द पर ध्यान दें।
                  </p>
                </div>
              </div>
            )}

            {processingEfficiency < 60 && (
              <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <Zap className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-yellow-800 text-sm">दक्षता बढ़ाएं</p>
                  <p className="text-xs text-gray-700 mt-1">
                    पहली बार में ही पूरा ऑडियो ध्यान से सुनें। बार-बार रीप्ले करने से बचें।
                  </p>
                </div>
              </div>
            )}

            {strategicUsage < 60 && (
              <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                <TrendingUp className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-green-800 text-sm">रणनीति में सुधार</p>
                  <p className="text-xs text-gray-700 mt-1">
                    मुश्किल प्रश्नों पर अधिक समय दें। Hint का उपयोग करें और ऑडियो दोबारा सुनें।
                  </p>
                </div>
              </div>
            )}

            {accuracy < 60 && (
              <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
                <Award className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-red-800 text-sm">अधिक अभ्यास करें</p>
                  <p className="text-xs text-gray-700 mt-1">
                    इस विषय पर और प्रश्न हल करें। ऑडियो को ध्यान से सुनना याद रखें।
                  </p>
                </div>
              </div>
            )}

            {learningPotential >= 80 && (
              <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                <Trophy className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-green-800 text-sm">उत्कृष्ट प्रदर्शन! 🎉</p>
                  <p className="text-xs text-gray-700 mt-1">
                    आप ऑडियो-आधारित सीखने में बहुत अच्छे हैं। इसी तरह जारी रखें!
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Question-wise Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-gray-700" />
            प्रश्न-वार विवरण
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {Object.entries(questionAnalytics).map(([idx, qa]) => {
              const attemptSeconds = qa.attemptTime ? Math.floor(qa.attemptTime / 1000) : 0;
              const statusColor = qa.status === 'attempted' ? 'text-blue-600' : 
                                 qa.status === 'skipped' ? 'text-yellow-600' : 'text-gray-400';
              const statusText = qa.status === 'attempted' ? 'प्रयास किया' : 
                                qa.status === 'skipped' ? 'छोड़ दिया' : 'नहीं किया';
              
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border-2 ${
                    qa.isCorrect
                      ? "border-green-200 bg-green-50"
                      : "border-red-200 bg-red-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">
                        प्रश्न {parseInt(idx) + 1}
                      </span>
                      {qa.isTukka && (
                        <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full font-medium">
                          ⚡ तुक्का ({attemptSeconds}s)
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs ${statusColor} font-medium`}>
                        {statusText}
                      </span>
                      {qa.isCorrect ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-gray-600" />
                      <span>{Math.floor((qa.timeSpent || 0) / 60)}:{((qa.timeSpent || 0) % 60).toString().padStart(2, '0')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Activity className="h-3 w-3 text-cyan-600" />
                      <span>{attemptSeconds}s उत्तर</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Volume2 className="h-3 w-3 text-blue-600" />
                      <span>{qa.audioPlayCount || 0} प्ले</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Headphones className="h-3 w-3 text-purple-600" />
                      <span>{Math.round(qa.audioListenPercentage || 0)}% सुना</span>
                    </div>
                    {qa.hintUsed && (
                      <div className="flex items-center gap-1 text-yellow-600">
                        <Lightbulb className="h-3 w-3" />
                        <span>Hint उपयोग</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AudioAnalyticsResults;
