import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Clock, Video, Volume2, BookOpen, Puzzle } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

interface QuizInfo {
  quizId: string;
  teacherId: string;
  timeLimit: number;
  totalQuestions: number;
  questionTypes: {
    mcq: number;
    audio: number;
    video: number;
    puzzle: number;
  };
  startTime: string;
  endTime: string;
  questions: string[];
}

const TakeAdvancedQuiz: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [quizId, setQuizId] = useState('');
  const [quizInfo, setQuizInfo] = useState<QuizInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [studentId, setStudentId] = useState('');

  useEffect(() => {
    // Get student info
    const studentData = localStorage.getItem('student');
    if (studentData) {
      try {
        const parsed = JSON.parse(studentData);
        setStudentId(parsed.student?.studentId || '');
      } catch (e) {
        console.error('Error parsing student data', e);
      }
    }
  }, []);

  const handleLoadQuiz = async () => {
    if (!quizId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a quiz ID",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/quizzes/by-id/${quizId}`);
      const quiz = response.data;
      
      // Check if quiz is active
      const now = new Date();
      const startTime = new Date(quiz.startTime);
      const endTime = new Date(quiz.endTime);
      
      if (now < startTime) {
        toast({
          title: "Quiz Not Started",
          description: `This quiz will start on ${startTime.toLocaleString()}`,
          variant: "destructive"
        });
        setLoading(false);
        return;
      }
      
      if (now > endTime) {
        toast({
          title: "Quiz Ended",
          description: `This quiz ended on ${endTime.toLocaleString()}`,
          variant: "destructive"
        });
        setLoading(false);
        return;
      }
      
      setQuizInfo(quiz);
      toast({
        title: "Quiz Loaded",
        description: `Ready to start: ${quiz.totalQuestions} questions, ${quiz.timeLimit} minutes`
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Quiz not found",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = () => {
    if (!quizInfo) return;
    
    // Navigate to the quiz player with quiz data
    navigate('/student/advanced-quiz-player', {
      state: {
        quizInfo,
        studentId
      }
    });
  };

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'mcq': return <BookOpen className="h-5 w-5" />;
      case 'audio': return <Volume2 className="h-5 w-5" />;
      case 'video': return <Video className="h-5 w-5" />;
      case 'puzzle': return <Puzzle className="h-5 w-5" />;
      default: return null;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Take Advanced Quiz</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!quizInfo ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="quizId">Enter Quiz ID</Label>
                <div className="flex gap-2">
                  <Input
                    id="quizId"
                    placeholder="Enter quiz ID provided by your teacher"
                    value={quizId}
                    onChange={(e) => setQuizId(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleLoadQuiz()}
                  />
                  <Button onClick={handleLoadQuiz} disabled={loading}>
                    {loading ? 'Loading...' : 'Load Quiz'}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border-2 border-blue-200">
                <h3 className="text-2xl font-bold mb-4">Quiz: {quizInfo.quizId}</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold">Time Limit:</span>
                    <span>{quizInfo.timeLimit} minutes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-green-600" />
                    <span className="font-semibold">Total Questions:</span>
                    <span>{quizInfo.totalQuestions}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-lg mb-2">Question Types:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {quizInfo.questionTypes.mcq > 0 && (
                      <div className="flex items-center gap-2 bg-blue-100 p-2 rounded">
                        {getQuestionTypeIcon('mcq')}
                        <span>MCQ: {quizInfo.questionTypes.mcq}</span>
                      </div>
                    )}
                    {quizInfo.questionTypes.audio > 0 && (
                      <div className="flex items-center gap-2 bg-green-100 p-2 rounded">
                        {getQuestionTypeIcon('audio')}
                        <span>Audio: {quizInfo.questionTypes.audio}</span>
                      </div>
                    )}
                    {quizInfo.questionTypes.video > 0 && (
                      <div className="flex items-center gap-2 bg-purple-100 p-2 rounded">
                        {getQuestionTypeIcon('video')}
                        <span>Video: {quizInfo.questionTypes.video}</span>
                      </div>
                    )}
                    {quizInfo.questionTypes.puzzle > 0 && (
                      <div className="flex items-center gap-2 bg-orange-100 p-2 rounded">
                        {getQuestionTypeIcon('puzzle')}
                        <span>Puzzle: {quizInfo.questionTypes.puzzle}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm">
                    <strong>Note:</strong> Once you start the quiz, the timer will begin immediately. 
                    Make sure you have a stable internet connection.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Button onClick={handleStartQuiz} className="flex-1" size="lg">
                  Start Quiz
                </Button>
                <Button onClick={() => setQuizInfo(null)} variant="outline" size="lg">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TakeAdvancedQuiz;
