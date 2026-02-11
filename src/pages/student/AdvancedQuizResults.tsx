import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { 
  CheckCircle, 
  XCircle, 
  MinusCircle, 
  Clock, 
  Award,
  BookOpen,
  Volume2,
  Video,
  Puzzle,
  TrendingUp,
  Users,
  Play,
  Pause,
  FastForward,
  Eye,
  Brain,
  Target,
  BarChart3,
  Activity,
  Grid3X3
} from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

interface QuizResult {
  quizId: string;
  studentId: string;
  score: {
    correct: number;
    incorrect: number;
    unattempted: number;
    percentage: number | string; // Can be either number or string
  };
  answers?: any[]; // Add answers array
  sectionWise: {
    mcq: { correct: number; incorrect: number; unattempted: number; total: number };
    audio: { correct: number; incorrect: number; unattempted: number; total: number };
    video: { correct: number; incorrect: number; unattempted: number; total: number };
    puzzle: { correct: number; incorrect: number; unattempted: number; total: number };
  };
  allStudentsStats?: {
    totalAttempts: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
    yourRank: number;
  };
}

const AdvancedQuizResults: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [results, setResults] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);

  const resultData = location.state?.results;

  useEffect(() => {
    if (resultData) {
      processResults();
      fetchComparativeStats();
    } else {
      navigate('/student/take-advanced-quiz');
    }
  }, [resultData]);

  const processResults = () => {
    console.log('Processing results:', resultData);
    
    // Ensure percentage is a number
    const percentage = typeof resultData.score.percentage === 'string' 
      ? parseFloat(resultData.score.percentage) 
      : resultData.score.percentage;

    // Process section-wise results
    const sectionWise = {
      mcq: { correct: 0, incorrect: 0, unattempted: 0, total: 0 },
      audio: { correct: 0, incorrect: 0, unattempted: 0, total: 0 },
      video: { correct: 0, incorrect: 0, unattempted: 0, total: 0 },
      puzzle: { correct: 0, incorrect: 0, unattempted: 0, total: 0 }
    };

    // Check if answers exist
    if (resultData.answers && Array.isArray(resultData.answers)) {
      resultData.answers.forEach((answer: any) => {
        const type = answer.questionType as 'mcq' | 'audio' | 'video' | 'puzzle';
        if (sectionWise[type]) {
          sectionWise[type].total++;
          if (answer.selectedAnswer === null || answer.selectedAnswer === undefined) {
            sectionWise[type].unattempted++;
          } else if (answer.isCorrect) {
            sectionWise[type].correct++;
          } else {
            sectionWise[type].incorrect++;
          }
        }
      });
    }

    setResults({
      quizId: resultData.quizId,
      studentId: resultData.studentId,
      score: {
        correct: resultData.score.correct,
        incorrect: resultData.score.incorrect,
        unattempted: resultData.score.unattempted,
        percentage: percentage
      },
      answers: resultData.answers,
      sectionWise
    });
    
    setLoading(false);
  };

  const fetchComparativeStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/quizzes/analytics/${resultData.quizId}`);
      const analytics = response.data;

      console.log('Analytics data:', analytics);

      // Check if studentReports exists and is an array
      if (!analytics.studentReports || !Array.isArray(analytics.studentReports) || analytics.studentReports.length === 0) {
        console.log('No student reports available for comparative stats');
        return;
      }

      // Calculate stats
      const scores = analytics.studentReports.map((r: any) => {
        const total = r.correct + r.incorrect + r.unattempted;
        return total > 0 ? (r.correct / total) * 100 : 0;
      });
      
      const percentage = typeof resultData.score.percentage === 'string' 
        ? parseFloat(resultData.score.percentage) 
        : resultData.score.percentage;
      
      const yourScore = percentage;
      const sortedScores = [...scores].sort((a, b) => b - a);
      const yourRank = sortedScores.findIndex(score => Math.abs(score - yourScore) < 0.01) + 1;

      const avgScore = scores.reduce((a: number, b: number) => a + b, 0) / scores.length;

      setResults(prev => prev ? {
        ...prev,
        allStudentsStats: {
          totalAttempts: analytics.studentReports.length,
          averageScore: avgScore,
          highestScore: Math.max(...scores),
          lowestScore: Math.min(...scores),
          yourRank: yourRank > 0 ? yourRank : scores.length
        }
      } : null);
    } catch (error: any) {
      console.error('Error fetching comparative stats:', error);
      console.error('Error details:', error.response?.data || error.message);
    }
  };

  // Helper function to safely get percentage as number
  const getPercentage = (): number => {
    if (!results) return 0;
    return typeof results.score.percentage === 'number' 
      ? results.score.percentage 
      : parseFloat(results.score.percentage);
  };

  // Calculate video-specific analytics
  const calculateVideoAnalytics = () => {
    if (!results?.answers) return null;
    
    const videoQuestions = results.answers.filter(a => a.questionType === 'video');
    if (videoQuestions.length === 0) return null;

    let totalWatchPercentage = 0;
    let totalPauseCount = 0;
    let totalSeekCount = 0;
    let totalTimeSpent = 0;
    let questionsWatched = 0;
    let correctAnswers = 0;

    const videoDetails = videoQuestions.map(q => {
      const analytics = q.videoAnalytics;
      if (analytics) {
        totalWatchPercentage += analytics.watchPercentage;
        totalPauseCount += analytics.pauseCount;
        totalSeekCount += analytics.seekCount;
        if (analytics.watchPercentage > 0) questionsWatched++;
      }
      totalTimeSpent += q.timeSpent;
      if (q.isCorrect) correctAnswers++;

      return {
        questionId: q.questionId,
        timeSpent: q.timeSpent,
        isCorrect: q.isCorrect,
        watchPercentage: analytics?.watchPercentage || 0,
        pauseCount: analytics?.pauseCount || 0,
        seekCount: analytics?.seekCount || 0
      };
    });

    const avgWatchPercentage = videoQuestions.length > 0 ? totalWatchPercentage / videoQuestions.length : 0;
    const avgTimeSpent = videoQuestions.length > 0 ? totalTimeSpent / videoQuestions.length : 0;
    const accuracy = (correctAnswers / videoQuestions.length) * 100;

    // Determine learning behavior category
    let behaviorCategory = '';
    let behaviorDescription = '';
    let behaviorIcon = '';
    let behaviorColor = '';
    
    // Calculate behavior based on watch percentage, time, and accuracy
    const veryQuickAnswers = videoQuestions.filter(q => q.timeSpent < 5).length;
    const skippedVideos = videoQuestions.filter(q => !q.videoAnalytics || q.videoAnalytics.watchPercentage < 20).length;
    
    if (avgWatchPercentage >= 70 && avgTimeSpent >= 20 && veryQuickAnswers <= 1) {
      behaviorCategory = 'Engaged Learner';
      behaviorDescription = 'Student is watching videos attentively and taking time to understand the content before answering questions.';
      behaviorIcon = '🎓';
      behaviorColor = 'green';
    } else if (avgWatchPercentage >= 50 && avgTimeSpent >= 10) {
      behaviorCategory = 'Moderate Engagement';
      behaviorDescription = 'Student is partially watching videos but could benefit from more careful attention to the content.';
      behaviorIcon = '📚';
      behaviorColor = 'blue';
    } else if (skippedVideos >= videoQuestions.length / 2 || veryQuickAnswers >= videoQuestions.length / 2) {
      behaviorCategory = 'Needs Attention';
      behaviorDescription = 'Student is skipping videos or answering too quickly without proper engagement. Individual support recommended.';
      behaviorIcon = '⚠️';
      behaviorColor = 'red';
    } else {
      behaviorCategory = 'Developing Habits';
      behaviorDescription = 'Student is still developing effective video learning habits. Guidance on proper study techniques would be beneficial.';
      behaviorIcon = '🌱';
      behaviorColor = 'yellow';
    }

    // Generate specific recommendations
    const recommendations = [];
    if (avgWatchPercentage < 60) {
      recommendations.push({
        type: 'critical',
        title: 'Watch Complete Videos',
        message: 'Student is not watching videos fully. Encourage watching at least 70% of each video for better understanding.'
      });
    }
    if (veryQuickAnswers > 2) {
      recommendations.push({
        type: 'warning',
        title: 'Take More Time',
        message: 'Multiple questions answered in less than 5 seconds. Student should spend more time thinking through answers.'
      });
    }
    if (accuracy < 50 && avgWatchPercentage >= 60) {
      recommendations.push({
        type: 'info',
        title: 'Comprehension Support',
        message: 'Student is watching videos but struggling with questions. Additional explanations or practice may help.'
      });
    }
    if (accuracy >= 70 && avgWatchPercentage >= 70) {
      recommendations.push({
        type: 'success',
        title: 'Excellent Performance',
        message: 'Student demonstrates strong video learning habits and good comprehension. Keep up the good work!'
      });
    }
    if (skippedVideos > 0) {
      recommendations.push({
        type: 'warning',
        title: 'Video Engagement Required',
        message: `${skippedVideos} out of ${videoQuestions.length} videos were skipped or barely watched. All videos should be viewed for complete learning.`
      });
    }

    return {
      totalVideoQuestions: videoQuestions.length,
      questionsWatched,
      avgWatchPercentage,
      avgTimeSpent,
      accuracy,
      correctAnswers,
      behaviorCategory,
      behaviorDescription,
      behaviorIcon,
      behaviorColor,
      recommendations,
      videoDetails
    };
  };

  const videoAnalytics = calculateVideoAnalytics();

  if (loading || !results) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing results...</p>
        </div>
      </div>
    );
  }

  const getSectionIcon = (type: string) => {
    switch (type) {
      case 'mcq': return <BookOpen className="h-5 w-5" />;
      case 'audio': return <Volume2 className="h-5 w-5" />;
      case 'video': return <Video className="h-5 w-5" />;
      case 'puzzle': return <Puzzle className="h-5 w-5" />;
      default: return null;
    }
  };

  const getSectionColor = (type: string) => {
    switch (type) {
      case 'mcq': return 'from-blue-500 to-cyan-500';
      case 'audio': return 'from-green-500 to-emerald-500';
      case 'video': return 'from-purple-500 to-pink-500';
      case 'puzzle': return 'from-orange-500 to-red-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Card className="mb-6">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardTitle className="text-3xl flex items-center gap-3">
            <Award className="h-8 w-8" />
            Quiz Results
          </CardTitle>
          <p className="text-blue-100">Quiz ID: {results.quizId}</p>
        </CardHeader>
      </Card>

      {/* Overall Score Card */}
      <Card className="mb-6 border-2 border-blue-200">
        <CardHeader>
          <CardTitle>Overall Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-blue-600 mb-2">
                {getPercentage().toFixed(1)}%
              </div>
              <p className="text-gray-600">Score</p>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <span className="text-3xl font-bold text-green-600">{results.score.correct}</span>
              </div>
              <p className="text-gray-600">Correct</p>
            </div>

            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <XCircle className="h-6 w-6 text-red-600" />
                <span className="text-3xl font-bold text-red-600">{results.score.incorrect}</span>
              </div>
              <p className="text-gray-600">Incorrect</p>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <MinusCircle className="h-6 w-6 text-gray-600" />
                <span className="text-3xl font-bold text-gray-600">{results.score.unattempted}</span>
              </div>
              <p className="text-gray-600">Unattempted</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section-wise Results */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6" />
            Section-wise Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(results.sectionWise).map(([type, stats]) => {
            if (stats.total === 0) return null;
            
            const percentage = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
            
            return (
              <div key={type} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${getSectionColor(type)} text-white`}>
                      {getSectionIcon(type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg capitalize">{type} Questions</h3>
                      <p className="text-sm text-gray-600">{stats.total} questions</p>
                    </div>
                  </div>
                  <Badge className="text-lg px-4 py-2">
                    {percentage.toFixed(0)}%
                  </Badge>
                </div>

                <Progress value={percentage} className="mb-3" />

                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-semibold">{stats.correct}</span>
                    <span className="text-gray-600">Correct</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="font-semibold">{stats.incorrect}</span>
                    <span className="text-gray-600">Incorrect</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MinusCircle className="h-4 w-4 text-gray-600" />
                    <span className="font-semibold">{stats.unattempted}</span>
                    <span className="text-gray-600">Skipped</span>
                  </div>
                </div>

                {/* Puzzle Analysis Accordion */}
                {type === 'puzzle' && results.answers && stats.total > 0 && (
                  <Accordion type="single" collapsible className="mt-4">
                    <AccordionItem value="puzzle-analysis" className="border border-orange-200 rounded-lg px-3 bg-orange-50/30">
                      <AccordionTrigger className="hover:no-underline py-3">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-5 w-5 text-orange-600" />
                          <span className="text-sm font-semibold text-gray-900">Puzzle Analysis & Scores</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-3">
                        {(() => {
                          const puzzleAnswers = results.answers?.filter(a => a.questionType === 'puzzle') || [];
                          const memoryMatchAnswers = puzzleAnswers.filter(a => a.puzzleData?.puzzleType === 'memory_match');
                          const matchPiecesAnswers = puzzleAnswers.filter(a => a.puzzleData?.puzzleType === 'match_pieces');

                          const calculatePuzzleStats = (answers: any[], puzzleName: string) => {
                            if (answers.length === 0) return null;
                            const avgScore = Math.round(answers.reduce((sum, a) => sum + (a.puzzleData?.score || 0), 0) / answers.length);
                            const bestScore = Math.max(...answers.map(a => a.puzzleData?.score || 0));
                            const completed = answers.filter(a => a.puzzleData?.endReason === 'COMPLETED').length;
                            return { avgScore, bestScore, completed, total: answers.length, puzzleName };
                          };

                          const memoryMatchStats = calculatePuzzleStats(memoryMatchAnswers, 'मेमोरी मैच');
                          const matchPiecesStats = calculatePuzzleStats(matchPiecesAnswers, 'मैच पीसेज़');

                          const getScoreColor = (score: number) => {
                            if (score >= 85) return 'text-green-600';
                            if (score >= 70) return 'text-blue-600';
                            if (score >= 55) return 'text-yellow-600';
                            if (score >= 40) return 'text-orange-600';
                            return 'text-red-600';
                          };

                          const getPerformanceText = (score: number) => {
                            if (score >= 85) return 'उत्कृष्ट';
                            if (score >= 70) return 'अच्छा';
                            if (score >= 55) return 'औसत';
                            return 'सुधार की आवश्यकता';
                          };

                          const totalPuzzleScore = puzzleAnswers.reduce((sum, a) => sum + (a.puzzleData?.score || 0), 0);
                          const avgPuzzleScore = puzzleAnswers.length > 0 ? Math.round(totalPuzzleScore / puzzleAnswers.length) : 0;

                          return (
                            <div className="space-y-4 mt-2">
                              {/* Individual Puzzle Cards */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {memoryMatchStats && (
                                  <div className="border-2 border-indigo-100 bg-indigo-50/50 rounded-lg p-3">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Brain className="h-4 w-4 text-indigo-600" />
                                      <h4 className="text-sm font-semibold">{memoryMatchStats.puzzleName}</h4>
                                    </div>
                                    <div className="space-y-1.5">
                                      <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-600">औसत स्कोर:</span>
                                        <span className={`text-lg font-bold ${getScoreColor(memoryMatchStats.avgScore)}`}>
                                          {memoryMatchStats.avgScore}
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-600">सर्वोत्तम:</span>
                                        <span className="text-sm font-semibold text-green-600">{memoryMatchStats.bestScore}</span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-600">पूर्ण:</span>
                                        <span className="text-xs font-medium">{memoryMatchStats.completed}/{memoryMatchStats.total}</span>
                                      </div>
                                      <p className="text-xs text-gray-700 pt-1 border-t border-indigo-200">
                                        {getPerformanceText(memoryMatchStats.avgScore)} प्रदर्शन
                                      </p>
                                    </div>
                                  </div>
                                )}

                                {matchPiecesStats && (
                                  <div className="border-2 border-cyan-100 bg-cyan-50/50 rounded-lg p-3">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Grid3X3 className="h-4 w-4 text-cyan-600" />
                                      <h4 className="text-sm font-semibold">{matchPiecesStats.puzzleName}</h4>
                                    </div>
                                    <div className="space-y-1.5">
                                      <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-600">औसत स्कोर:</span>
                                        <span className={`text-lg font-bold ${getScoreColor(matchPiecesStats.avgScore)}`}>
                                          {matchPiecesStats.avgScore}
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-600">सर्वोत्तम:</span>
                                        <span className="text-sm font-semibold text-green-600">{matchPiecesStats.bestScore}</span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-600">पूर्ण:</span>
                                        <span className="text-xs font-medium">{matchPiecesStats.completed}/{matchPiecesStats.total}</span>
                                      </div>
                                      <p className="text-xs text-gray-700 pt-1 border-t border-cyan-200">
                                        {getPerformanceText(matchPiecesStats.avgScore)} प्रदर्शन
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Combined Analysis */}
                              <div className="border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <Activity className="h-4 w-4 text-purple-600" />
                                  <h4 className="text-sm font-semibold">संयुक्त पहेली विश्लेषण</h4>
                                </div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-medium text-gray-700">कुल औसत स्कोर:</span>
                                  <span className={`text-xl font-bold ${getScoreColor(avgPuzzleScore)}`}>
                                    {avgPuzzleScore}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-700 leading-relaxed">
                                  आपका समग्र पहेली प्रदर्शन {getPerformanceText(avgPuzzleScore)} है। {puzzleAnswers.filter(a => a.puzzleData?.endReason === 'COMPLETED').length}/{puzzleAnswers.length} पहेलियाँ पूरी कीं। निरंतर अभ्यास से और सुधार हो सकता है।
                                </p>
                              </div>
                            </div>
                          );
                        })()}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Video Learning Analytics Section */}
      {videoAnalytics && videoAnalytics.totalVideoQuestions > 0 && (
        <Card className="mb-6 border-2 border-purple-200">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <Video className="h-6 w-6" />
              Video Learning Report
            </CardTitle>
            <p className="text-sm text-purple-700">
              Analysis of video engagement and learning behavior
            </p>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            
            {/* Learning Behavior Category */}
            <div className={`p-6 rounded-lg border-2 ${
              videoAnalytics.behaviorColor === 'green' ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300' :
              videoAnalytics.behaviorColor === 'blue' ? 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-300' :
              videoAnalytics.behaviorColor === 'yellow' ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300' :
              'bg-gradient-to-r from-red-50 to-orange-50 border-red-300'
            }`}>
              <div className="flex items-start gap-4">
                <div className="text-5xl">{videoAnalytics.behaviorIcon}</div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">
                    Learning Behavior: {videoAnalytics.behaviorCategory}
                  </h3>
                  <p className={`text-base ${
                    videoAnalytics.behaviorColor === 'green' ? 'text-green-800' :
                    videoAnalytics.behaviorColor === 'blue' ? 'text-blue-800' :
                    videoAnalytics.behaviorColor === 'yellow' ? 'text-yellow-800' :
                    'text-red-800'
                  }`}>
                    {videoAnalytics.behaviorDescription}
                  </p>
                </div>
              </div>
            </div>

            {/* Performance Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Video Performance */}
              <div className="p-5 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-3">
                  <Video className="h-5 w-5 text-purple-600" />
                  <span className="font-semibold text-gray-800">Video Performance</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Accuracy:</span>
                    <span className="text-lg font-bold text-purple-600">
                      {videoAnalytics.accuracy.toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Correct:</span>
                    <span className="text-sm font-semibold">
                      {videoAnalytics.correctAnswers}/{videoAnalytics.totalVideoQuestions}
                    </span>
                  </div>
                </div>
              </div>

              {/* Engagement Level */}
              <div className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <Eye className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-gray-800">Video Engagement</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Avg Watched:</span>
                    <span className="text-lg font-bold text-blue-600">
                      {videoAnalytics.avgWatchPercentage.toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={videoAnalytics.avgWatchPercentage} className="h-2" />
                  <p className="text-xs text-gray-600">
                    {videoAnalytics.avgWatchPercentage >= 70 ? '✅ Good engagement' :
                     videoAnalytics.avgWatchPercentage >= 50 ? '⚠️ Moderate engagement' :
                     '❌ Low engagement'}
                  </p>
                </div>
              </div>

              {/* Time Management */}
              <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-gray-800">Time Management</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Avg per Q:</span>
                    <span className="text-lg font-bold text-green-600">
                      {videoAnalytics.avgTimeSpent.toFixed(0)}s
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    {videoAnalytics.avgTimeSpent >= 20 && videoAnalytics.avgTimeSpent <= 90 
                      ? '✅ Good pacing' :
                     videoAnalytics.avgTimeSpent < 20 
                      ? '⚠️ Too quick' :
                      '⚠️ Too slow'}
                  </p>
                </div>
              </div>
            </div>

            {/* Recommendations for Student/Teacher */}
            {videoAnalytics.recommendations.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  Action Items & Recommendations
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {videoAnalytics.recommendations.map((rec, index) => (
                    <div 
                      key={index}
                      className={`p-4 rounded-lg border-l-4 ${
                        rec.type === 'success' ? 'bg-green-50 border-green-500' :
                        rec.type === 'critical' ? 'bg-red-50 border-red-500' :
                        rec.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                        'bg-blue-50 border-blue-500'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">
                          {rec.type === 'success' ? '✅' :
                           rec.type === 'critical' ? '🚨' :
                           rec.type === 'warning' ? '⚠️' :
                           '💡'}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">{rec.title}</h4>
                          <p className="text-sm text-gray-700">{rec.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Individual Video Question Performance */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-600" />
                Question-wise Video Engagement
              </h3>
              <div className="space-y-2">
                {videoAnalytics.videoDetails.map((detail, index) => (
                  <div 
                    key={detail.questionId} 
                    className={`p-3 rounded-lg border ${
                      detail.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge className={detail.isCorrect ? 'bg-green-600' : 'bg-red-600'}>
                          Q{index + 1}
                        </Badge>
                        <span className="text-sm font-medium">
                          {detail.isCorrect ? '✅ Correct' : '❌ Incorrect'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-600">
                          Watched: <span className="font-semibold text-blue-600">{detail.watchPercentage.toFixed(0)}%</span>
                        </span>
                        <span className="text-gray-600">
                          Time: <span className="font-semibold text-purple-600">{detail.timeSpent}s</span>
                        </span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <Progress value={detail.watchPercentage} className="h-1" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Teacher's Note Section */}
            <div className="p-5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border-2 border-amber-300">
              <h4 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                <Users className="h-5 w-5" />
                For Teacher
              </h4>
              <p className="text-sm text-amber-800">
                {videoAnalytics.behaviorColor === 'green' 
                  ? '✅ This student demonstrates excellent video learning habits. They are engaged, thoughtful, and achieving good results. Minimal intervention needed.'
                  : videoAnalytics.behaviorColor === 'blue'
                  ? '📘 This student shows moderate engagement. Consider encouraging them to watch videos more completely and take more time with questions.'
                  : videoAnalytics.behaviorColor === 'yellow'
                  ? '🔔 This student is developing their learning approach. They would benefit from guidance on effective video learning strategies and study habits.'
                  : '🚨 This student needs immediate attention. They are not engaging with video content properly. Individual support, parent communication, and study habit coaching recommended.'}
              </p>
            </div>

          </CardContent>
        </Card>
      )}

      {/* Comparative Analysis */}
      {results.allStudentsStats && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-6 w-6" />
              Comparative Analysis
            </CardTitle>
            <p className="text-sm text-gray-600">How you performed compared to other students</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  #{results.allStudentsStats.yourRank}
                </div>
                <p className="text-sm text-gray-600">Your Rank</p>
              </div>

              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {results.allStudentsStats.totalAttempts}
                </div>
                <p className="text-sm text-gray-600">Total Students</p>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {results.allStudentsStats.averageScore.toFixed(1)}%
                </div>
                <p className="text-sm text-gray-600">Class Average</p>
              </div>

              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600 mb-1">
                  {results.allStudentsStats.highestScore.toFixed(1)}%
                </div>
                <p className="text-sm text-gray-600">Highest Score</p>
              </div>

              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600 mb-1">
                  {results.allStudentsStats.lowestScore.toFixed(1)}%
                </div>
                <p className="text-sm text-gray-600">Lowest Score</p>
              </div>
            </div>

            {/* Performance Message */}
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <p className="text-center font-semibold">
                {getPercentage() >= results.allStudentsStats.averageScore
                  ? `🎉 Great job! You scored above the class average!`
                  : `Keep practicing! You can improve your score.`}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button 
          onClick={() => navigate('/student/dashboard')} 
          className="flex-1"
          size="lg"
        >
          Back to Dashboard
        </Button>
        <Button 
          onClick={() => navigate('/student/take-advanced-quiz')} 
          variant="outline"
          className="flex-1"
          size="lg"
        >
          Take Another Quiz
        </Button>
      </div>
    </div>
  );
};

export default AdvancedQuizResults;
