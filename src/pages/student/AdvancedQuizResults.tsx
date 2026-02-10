import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  Users
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
              </div>
            );
          })}
        </CardContent>
      </Card>

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
