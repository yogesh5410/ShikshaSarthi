import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  Clock,
  Eye,
  Brain,
  Target,
  TrendingUp,
  AlertTriangle,
  Award,
  Lightbulb,
  Zap,
  BarChart3,
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
} from "recharts";

interface AnalyticsResultsProps {
  results: { correct: number; incorrect: number; unattempted: number };
  totalQuestions: number;
  accuracy: number;
  timeTaken: number;
  videoAnalytics: {
    totalWatchTime: number;
    videoDuration: number;
    watchPercentage: number;
    skippedVideo: boolean;
    pauseCount: number;
    seekCount: number;
  };
  questionAnalytics: {
    [key: number]: {
      timeSpent: number;
      attempts: number;
      hintUsed: boolean;
      navigationPattern: string[];
      isCorrect: boolean;
    };
  };
  learningBehavior: {
    focusScore: number;
    consistencyScore: number;
    thoughtfulnessScore: number;
    randomClickingIndicator: number;
    hintsUtilization: number;
    overallLearningScore: number;
  };
}

const AnalyticsResults: React.FC<AnalyticsResultsProps> = ({
  results,
  totalQuestions,
  accuracy,
  timeTaken,
  videoAnalytics,
  questionAnalytics,
  learningBehavior,
}) => {
  // Prepare chart data
  const pieChartData = [
    { name: "सही", value: results.correct, color: "#10b981" },
    { name: "गलत", value: results.incorrect, color: "#ef4444" },
    { name: "छोड़े गए", value: results.unattempted, color: "#6b7280" },
  ];

  // Time distribution data
  const timeData = Object.values(questionAnalytics).map((q, idx) => ({
    name: `Q${idx + 1}`,
    time: q.timeSpent,
    correct: q.isCorrect ? q.timeSpent : 0,
    incorrect: !q.isCorrect && q.timeSpent > 0 ? q.timeSpent : 0,
  }));

  // Learning radar chart data
  const radarData = [
    { metric: "Focus", value: learningBehavior.focusScore, fullMark: 100 },
    { metric: "Consistency", value: learningBehavior.consistencyScore, fullMark: 100 },
    { metric: "Thoughtfulness", value: learningBehavior.thoughtfulnessScore, fullMark: 100 },
    { metric: "Hint Usage", value: learningBehavior.hintsUtilization, fullMark: 100 },
    { metric: "Accuracy", value: accuracy, fullMark: 100 },
  ];

  // Determine learning effectiveness
  const getPerformanceLevel = (score: number) => {
    if (score >= 80) return { level: "उत्कृष्ट", color: "text-green-600", bg: "bg-green-50" };
    if (score >= 60) return { level: "अच्छा", color: "text-blue-600", bg: "bg-blue-50" };
    if (score >= 40) return { level: "सुधार की आवश्यकता", color: "text-yellow-600", bg: "bg-yellow-50" };
    return { level: "अधिक प्रयास चाहिए", color: "text-red-600", bg: "bg-red-50" };
  };

  const performance = getPerformanceLevel(learningBehavior.overallLearningScore);

  // Calculate insights
  const avgTimePerQuestion = Object.values(questionAnalytics).reduce((sum, q) => sum + q.timeSpent, 0) / totalQuestions;
  const questionsWithMultipleAttempts = Object.values(questionAnalytics).filter(q => q.attempts > 1).length;
  const questionsWithHints = Object.values(questionAnalytics).filter(q => q.hintUsed).length;

  return (
    <div className="space-y-6">
      {/* Overall Performance Header */}
      <Card className="border-2 border-purple-200">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="h-10 w-10" />
              <div>
                <CardTitle className="text-3xl">Quiz Completed! 🎉</CardTitle>
                <p className="text-purple-100 mt-1">विस्तृत विश्लेषण रिपोर्ट</p>
              </div>
            </div>
            <div className={`px-6 py-3 rounded-lg ${performance.bg} border-2 border-white`}>
              <p className="text-sm text-gray-600 mb-1">समग्र प्रदर्शन</p>
              <p className={`text-2xl font-bold ${performance.color}`}>
                {learningBehavior.overallLearningScore}%
              </p>
              <p className={`text-sm font-semibold ${performance.color}`}>{performance.level}</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Learning Behavior Analysis */}
      <Card className="border-2 border-blue-200">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-600" />
            सीखने का व्यवहार विश्लेषण
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Radar Chart */}
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar
                    name="Your Performance"
                    dataKey="value"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.6}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Learning Metrics */}
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Eye className="h-4 w-4 text-purple-600" />
                    वीडियो ध्यान (Focus Score)
                  </span>
                  <span className="text-sm font-bold">{learningBehavior.focusScore}%</span>
                </div>
                <Progress value={learningBehavior.focusScore} className="h-2" />
                <p className="text-xs text-gray-600 mt-1">
                  {learningBehavior.focusScore >= 70 
                    ? "बहुत अच्छा! वीडियो ध्यान से देखा" 
                    : "वीडियो को पूरा देखने का प्रयास करें"}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Target className="h-4 w-4 text-green-600" />
                    निरंतरता (Consistency)
                  </span>
                  <span className="text-sm font-bold">{learningBehavior.consistencyScore}%</span>
                </div>
                <Progress value={learningBehavior.consistencyScore} className="h-2" />
                <p className="text-xs text-gray-600 mt-1">
                  {learningBehavior.consistencyScore >= 70
                    ? "सभी प्रश्नों पर समान समय दिया"
                    : "कुछ प्रश्नों पर अधिक समय व्यतीत करें"}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Brain className="h-4 w-4 text-blue-600" />
                    विचारशीलता (Thoughtfulness)
                  </span>
                  <span className="text-sm font-bold">{learningBehavior.thoughtfulnessScore}%</span>
                </div>
                <Progress value={learningBehavior.thoughtfulnessScore} className="h-2" />
                <p className="text-xs text-gray-600 mt-1">
                  {learningBehavior.thoughtfulnessScore >= 70
                    ? "प्रश्नों पर अच्छे से विचार किया"
                    : "उत्तर देने से पहले अधिक सोचें"}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    Random Clicking जोखिम
                  </span>
                  <span className="text-sm font-bold">{learningBehavior.randomClickingIndicator}%</span>
                </div>
                <Progress value={learningBehavior.randomClickingIndicator} className="h-2 bg-gray-200" />
                <p className="text-xs text-gray-600 mt-1">
                  {learningBehavior.randomClickingIndicator < 30
                    ? "अच्छा! सोच-समझकर उत्तर दिए"
                    : "जल्दबाजी में उत्तर न दें"}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-600" />
                    संकेत उपयोग
                  </span>
                  <span className="text-sm font-bold">{learningBehavior.hintsUtilization}%</span>
                </div>
                <Progress value={learningBehavior.hintsUtilization} className="h-2" />
                <p className="text-xs text-gray-600 mt-1">
                  {questionsWithHints} प्रश्नों में संकेत लिया
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quiz Performance */}
        <Card className="border-2 border-green-200">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
            <CardTitle className="flex items-center gap-2">
              <Award className="h-6 w-6 text-green-600" />
              Quiz Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center mb-6">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={70}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="font-medium text-sm">सही उत्तर</span>
                <span className="text-xl font-bold text-green-600">{results.correct}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <span className="font-medium text-sm">गलत उत्तर</span>
                <span className="text-xl font-bold text-red-600">{results.incorrect}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="font-medium text-sm">सटीकता (Accuracy)</span>
                <span className="text-xl font-bold text-purple-600">{accuracy.toFixed(1)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Video & Time Analytics */}
        <Card className="border-2 border-orange-200">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-6 w-6 text-orange-600" />
              समय और वीडियो विश्लेषण
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">कुल समय लिया</span>
                <span className="text-xl font-bold text-blue-600">
                  {Math.floor(timeTaken / 60)}:{(timeTaken % 60).toString().padStart(2, "0")}
                </span>
              </div>
              <p className="text-xs text-gray-600">
                प्रति प्रश्न औसत: {Math.round(avgTimePerQuestion)} सेकंड
              </p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">वीडियो देखा गया</span>
                <span className="text-xl font-bold text-purple-600">
                  {videoAnalytics.watchPercentage.toFixed(1)}%
                </span>
              </div>
              <Progress value={videoAnalytics.watchPercentage} className="h-2 mb-2" />
              <p className="text-xs text-gray-600">
                {Math.floor(videoAnalytics.totalWatchTime / 60)} मिनट {videoAnalytics.totalWatchTime % 60} सेकंड
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-amber-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-amber-600">{videoAnalytics.pauseCount}</p>
                <p className="text-xs text-gray-600">Pause Count</p>
              </div>
              <div className="p-3 bg-pink-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-pink-600">{videoAnalytics.seekCount}</p>
                <p className="text-xs text-gray-600">Seek/Rewind</p>
              </div>
            </div>

            {videoAnalytics.skippedVideo && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700 font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  वीडियो को स्किप किया गया
                </p>
                <p className="text-xs text-red-600 mt-1">
                  बेहतर समझ के लिए वीडियो पूरा देखें
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Time Distribution Chart */}
      <Card className="border-2 border-indigo-200">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-indigo-600" />
            प्रश्नवार समय वितरण
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={timeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis label={{ value: 'समय (सेकंड)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="correct" fill="#10b981" name="सही (सेकंड)" stackId="a" />
              <Bar dataKey="incorrect" fill="#ef4444" name="गलत (सेकंड)" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-sm text-gray-600 mt-4 text-center">
            यह चार्ट दिखाता है कि आपने प्रत्येक प्रश्न पर कितना समय बिताया
          </p>
        </CardContent>
      </Card>

      {/* Insights & Recommendations */}
      <Card className="border-2 border-teal-200">
        <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-teal-600" />
            महत्वपूर्ण जानकारी और सुझाव
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Positive Insights */}
            <div className="space-y-3">
              <h4 className="font-semibold text-green-700 flex items-center gap-2">
                <Zap className="h-5 w-5" />
                आपकी मजबूती
              </h4>
              {accuracy >= 70 && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">✓ उत्कृष्ट सटीकता - {accuracy.toFixed(0)}%</p>
                </div>
              )}
              {learningBehavior.focusScore >= 70 && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">✓ वीडियो को ध्यान से देखा</p>
                </div>
              )}
              {learningBehavior.consistencyScore >= 70 && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">✓ सभी प्रश्नों पर समान ध्यान दिया</p>
                </div>
              )}
              {learningBehavior.randomClickingIndicator < 30 && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">✓ सोच-समझकर उत्तर दिए</p>
                </div>
              )}
            </div>

            {/* Areas for Improvement */}
            <div className="space-y-3">
              <h4 className="font-semibold text-amber-700 flex items-center gap-2">
                <Target className="h-5 w-5" />
                सुधार के क्षेत्र
              </h4>
              {accuracy < 60 && (
                <div className="p-3 bg-amber-50 rounded-lg">
                  <p className="text-sm text-amber-800">⚠ वीडियो को दोबारा देखें और अभ्यास करें</p>
                </div>
              )}
              {learningBehavior.focusScore < 60 && (
                <div className="p-3 bg-amber-50 rounded-lg">
                  <p className="text-sm text-amber-800">⚠ पूरा वीडियो ध्यान से देखने का प्रयास करें</p>
                </div>
              )}
              {learningBehavior.randomClickingIndicator > 50 && (
                <div className="p-3 bg-amber-50 rounded-lg">
                  <p className="text-sm text-amber-800">⚠ जल्दबाजी में उत्तर न दें, सोचकर उत्तर दें</p>
                </div>
              )}
              {avgTimePerQuestion < 5 && (
                <div className="p-3 bg-amber-50 rounded-lg">
                  <p className="text-sm text-amber-800">⚠ प्रश्नों पर अधिक समय व्यतीत करें</p>
                </div>
              )}
              {questionsWithMultipleAttempts > totalQuestions / 2 && (
                <div className="p-3 bg-amber-50 rounded-lg">
                  <p className="text-sm text-amber-800">⚠ पहली बार में सही उत्तर देने का प्रयास करें</p>
                </div>
              )}
            </div>
          </div>

          {/* Overall Recommendation */}
          <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
            <h4 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
              <Award className="h-5 w-5" />
              समग्र सिफारिश
            </h4>
            <p className="text-sm text-gray-700 leading-relaxed">
              {learningBehavior.overallLearningScore >= 80 
                ? "बहुत अच्छा! आप वीडियो से प्रभावी रूप से सीख रहे हैं। इसी तरह जारी रखें और अधिक topics explore करें।"
                : learningBehavior.overallLearningScore >= 60
                ? "अच्छा प्रदर्शन! वीडियो को पूरा देखने और प्रश्नों पर अधिक समय देने से आप और बेहतर कर सकते हैं।"
                : learningBehavior.overallLearningScore >= 40
                ? "सुधार की आवश्यकता है। वीडियो को ध्यान से देखें, notes बनाएं, और जल्दबाजी में उत्तर न दें।"
                : "अधिक प्रयास की आवश्यकता है। वीडियो को कई बार देखें, हर प्रश्न को ध्यान से पढ़ें, और hints का उपयोग करें।"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg text-center">
          <p className="text-3xl font-bold text-blue-600">{totalQuestions}</p>
          <p className="text-sm text-gray-700">कुल प्रश्न</p>
        </div>
        <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg text-center">
          <p className="text-3xl font-bold text-green-600">{results.correct}</p>
          <p className="text-sm text-gray-700">सही उत्तर</p>
        </div>
        <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg text-center">
          <p className="text-3xl font-bold text-purple-600">{Math.round(avgTimePerQuestion)}s</p>
          <p className="text-sm text-gray-700">औसत समय/प्रश्न</p>
        </div>
        <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg text-center">
          <p className="text-3xl font-bold text-amber-600">{questionsWithHints}</p>
          <p className="text-sm text-gray-700">संकेत उपयोग</p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsResults;
