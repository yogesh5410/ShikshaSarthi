import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, Volume2, Video, BookOpen, Puzzle, ChevronLeft, ChevronRight, Flag } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

interface QuestionData {
  _id: string;
  type: 'mcq' | 'audio' | 'video' | 'puzzle';
  data: any;
}

interface Answer {
  questionId: string;
  questionType: string;
  selectedAnswer: string | string[];
  timeSpent: number;
}

const AdvancedQuizPlayer: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { quizInfo, studentId } = location.state || {};
  
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizEnded, setQuizEnded] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [countdownToStart, setCountdownToStart] = useState(0);
  
  const timerRef = useRef<number | null>(null);
  const countdownRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const questionStartTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!quizInfo) {
      navigate('/student/take-advanced-quiz');
      return;
    }

    loadQuestions();
    setTimeRemaining(quizInfo.timeLimit * 60); // Convert minutes to seconds
    
    // Calculate countdown to quiz start
    const now = new Date();
    const startTime = new Date(quizInfo.startTime);
    const secondsUntilStart = Math.floor((startTime.getTime() - now.getTime()) / 1000);
    
    if (secondsUntilStart > 0) {
      setCountdownToStart(secondsUntilStart);
    }
  }, [quizInfo]);

  // Countdown timer before quiz starts
  useEffect(() => {
    if (countdownToStart > 0 && showInstructions) {
      countdownRef.current = setInterval(() => {
        setCountdownToStart((prev) => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (countdownRef.current) clearInterval(countdownRef.current);
      };
    }
  }, [countdownToStart, showInstructions]);

  useEffect(() => {
    if (quizStarted && !quizEnded && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [quizStarted, quizEnded]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      console.log('Loading questions for quiz:', quizInfo);
      console.log('Questions array:', quizInfo.questions);
      console.log('Question types:', quizInfo.questionTypes);
      
      const questionPromises = quizInfo.questions.map(async (questionId: string, index: number) => {
        // Determine question type based on index and quiz configuration
        let type: 'mcq' | 'audio' | 'video' | 'puzzle' = 'mcq';
        let endpoint = '';
        
        if (index < quizInfo.questionTypes.mcq) {
          type = 'mcq';
          endpoint = `${API_URL}/questions/${questionId}`;
        } else if (index < quizInfo.questionTypes.mcq + quizInfo.questionTypes.audio) {
          type = 'audio';
          endpoint = `${API_URL}/audio-questions/question/${questionId}`;
        } else if (index < quizInfo.questionTypes.mcq + quizInfo.questionTypes.audio + quizInfo.questionTypes.video) {
          type = 'video';
          endpoint = `${API_URL}/video-questions/single/${questionId}`;
        } else {
          type = 'puzzle';
          endpoint = `${API_URL}/puzzles/${questionId}`;
        }

        console.log(`Loading question ${index} (${type}):`, questionId, 'from:', endpoint);

        try {
          const response = await axios.get(endpoint);
          console.log(`Loaded ${type} question:`, response.data);
          
          return {
            _id: questionId,
            type,
            data: response.data
          };
        } catch (err: any) {
          console.error(`Failed to load question ${questionId}:`, err.response?.data || err.message);
          // Return placeholder for failed question
          return {
            _id: questionId,
            type,
            data: {
              question: 'Failed to load question',
              options: ['Option A', 'Option B', 'Option C', 'Option D'],
              correctAnswer: 'Option A'
            }
          };
        }
      });

      const loadedQuestions = await Promise.all(questionPromises);
      console.log('All questions loaded:', loadedQuestions);
      setQuestions(loadedQuestions);
      // Don't auto-start quiz, wait for user to click start after reading instructions
      questionStartTimeRef.current = Date.now();
    } catch (error) {
      console.error('Error loading questions:', error);
      toast({
        title: "Error",
        description: "Failed to load quiz questions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = () => {
    setShowInstructions(false);
    setQuizStarted(true);
    startTimeRef.current = Date.now();
    questionStartTimeRef.current = Date.now();
  };

  const handleTimeUp = () => {
    setQuizEnded(true);
    if (timerRef.current) clearInterval(timerRef.current);
    handleSubmitQuiz(true);
  };

  const handleAnswerSelect = (answer: string) => {
    const currentQuestion = questions[currentIndex];
    const timeSpent = Math.floor((Date.now() - questionStartTimeRef.current) / 1000);
    
    const newAnswer: Answer = {
      questionId: currentQuestion._id,
      questionType: currentQuestion.type,
      selectedAnswer: answer,
      timeSpent
    };

    setAnswers((prev) => {
      const filtered = prev.filter(a => a.questionId !== currentQuestion._id);
      return [...filtered, newAnswer];
    });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      questionStartTimeRef.current = Date.now();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      questionStartTimeRef.current = Date.now();
    }
  };

  const handleSubmitQuiz = async (timeUp: boolean = false) => {
    try {
      setQuizEnded(true);
      
      // Calculate results
      let correctCount = 0;
      let incorrectCount = 0;
      let unattemptedCount = questions.length - answers.length;

      const evaluatedAnswers = questions.map((q, index) => {
        const answer = answers.find(a => a.questionId === q._id);
        
        if (!answer) {
          return {
            questionId: q._id,
            questionType: q.type,
            selectedAnswer: null,
            correctAnswer: getCorrectAnswer(q),
            isCorrect: false,
            timeSpent: 0
          };
        }

        const correctAnswer = getCorrectAnswer(q);
        const isCorrect = answer.selectedAnswer === correctAnswer;
        
        if (isCorrect) correctCount++;
        else incorrectCount++;

        return {
          questionId: q._id,
          questionType: q.type,
          selectedAnswer: answer.selectedAnswer,
          correctAnswer,
          isCorrect,
          timeSpent: answer.timeSpent
        };
      });

      const totalTimeTaken = quizInfo.timeLimit * 60 - timeRemaining;

      // Submit to backend
      await axios.post(`${API_URL}/quizzes/submit-advanced`, {
        quizId: quizInfo.quizId,
        studentId,
        answers: evaluatedAnswers,
        score: {
          correct: correctCount,
          incorrect: incorrectCount,
          unattempted: unattemptedCount
        },
        timeTaken: totalTimeTaken,
        completedAt: new Date(),
        timeUp
      });

      toast({
        title: "Quiz Submitted",
        description: `Score: ${correctCount}/${questions.length}`
      });

      setShowResults(true);
      
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast({
        title: "Error",
        description: "Failed to submit quiz",
        variant: "destructive"
      });
    }
  };

  const getCorrectAnswer = (question: QuestionData): string => {
    switch (question.type) {
      case 'mcq':
      case 'audio':
        return question.data.correctAnswer;
      case 'video':
        // Video questions have multiple questions, get the first one's correct answer
        return question.data.questions?.[0]?.correctAnswer || '';
      case 'puzzle':
        return ''; // Puzzles don't have a traditional correct answer
      default:
        return '';
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getQuestionIcon = (type: string) => {
    switch (type) {
      case 'mcq': return <BookOpen className="h-5 w-5" />;
      case 'audio': return <Volume2 className="h-5 w-5" />;
      case 'video': return <Video className="h-5 w-5" />;
      case 'puzzle': return <Puzzle className="h-5 w-5" />;
      default: return null;
    }
  };

  const renderQuestion = () => {
    if (loading || questions.length === 0) {
      return <div className="text-center py-8">Loading questions...</div>;
    }

    const currentQuestion = questions[currentIndex];
    const currentAnswer = answers.find(a => a.questionId === currentQuestion._id);

    switch (currentQuestion.type) {
      case 'mcq':
        return renderMCQ(currentQuestion.data, currentAnswer?.selectedAnswer as string);
      case 'audio':
        return renderAudioQuestion(currentQuestion.data, currentAnswer?.selectedAnswer as string);
      case 'video':
        return renderVideoQuestion(currentQuestion.data, currentAnswer?.selectedAnswer as string);
      case 'puzzle':
        return renderPuzzleQuestion(currentQuestion.data);
      default:
        return <div>Unknown question type</div>;
    }
  };

  const renderMCQ = (data: any, selectedAnswer?: string) => {
    // Safety check for data structure
    if (!data) {
      return <div className="p-4 text-red-600">Error: MCQ data not loaded</div>;
    }

    return (
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">{data.question || 'Question not available'}</h3>
          {data.questionImage && (
            <img src={data.questionImage} alt="Question" className="max-w-full h-auto rounded mt-2" />
          )}
        </div>
        <div className="space-y-2">
          {data.options && data.options.length > 0 ? (
            data.options.map((option: string, index: number) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  selectedAnswer === option
                    ? 'border-blue-500 bg-blue-100'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{String.fromCharCode(65 + index)}.</span>
                  <span>{option}</span>
                </div>
              </button>
            ))
          ) : (
            <div className="p-4 text-gray-600">No options available</div>
          )}
        </div>
      </div>
    );
  };

  const renderAudioQuestion = (data: any, selectedAnswer?: string) => {
    // Safety check for data structure
    if (!data) {
      return <div className="p-4 text-red-600">Error: Audio question data not loaded</div>;
    }

    return (
      <div className="space-y-4">
        <div className="p-4 bg-green-50 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Volume2 className="h-6 w-6 text-green-600" />
            <h3 className="text-lg font-semibold">Audio Question</h3>
          </div>
          {data.audio && (
            <audio controls className="w-full mb-3">
              <source src={data.audio} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          )}
          <h3 className="text-lg font-semibold mb-2">{data.question || 'Question not available'}</h3>
          {data.questionImage && (
            <img src={data.questionImage} alt="Question" className="max-w-full h-auto rounded mt-2" />
          )}
        </div>
        <div className="space-y-2">
          {data.options && data.options.length > 0 ? (
            data.options.map((option: string, index: number) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  selectedAnswer === option
                    ? 'border-green-500 bg-green-100'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{String.fromCharCode(65 + index)}.</span>
                  <span>{option}</span>
                </div>
              </button>
            ))
          ) : (
            <div className="p-4 text-gray-600">No options available</div>
          )}
        </div>
      </div>
    );
  };

  const renderVideoQuestion = (data: any, selectedAnswer?: string) => {
    // Safety check for data structure
    if (!data) {
      return <div className="p-4 text-red-600">Error: Video question data not loaded</div>;
    }

    // For video questions, show the video and the first question
    const firstQuestion = data.questions?.[0];
    
    return (
      <div className="space-y-4">
        <div className="p-4 bg-purple-50 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Video className="h-6 w-6 text-purple-600" />
            <h3 className="text-lg font-semibold">{data.videoTitle || 'Video Question'}</h3>
          </div>
          {data.videoDescription && (
            <p className="text-sm text-gray-600 mb-3">{data.videoDescription}</p>
          )}
          {data.videoUrl && (
            <video controls className="w-full rounded-lg mb-3">
              <source src={data.videoUrl} type="video/mp4" />
              Your browser does not support the video element.
            </video>
          )}
        </div>
        
        {firstQuestion ? (
          <>
            <div className="p-4 bg-white rounded-lg border">
              <h3 className="text-lg font-semibold mb-2">{firstQuestion.question}</h3>
            </div>
            <div className="space-y-2">
              {firstQuestion.options && firstQuestion.options.length > 0 ? (
                firstQuestion.options.map((option: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(option)}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                      selectedAnswer === option
                        ? 'border-purple-500 bg-purple-100'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">{String.fromCharCode(65 + index)}.</span>
                      <span>{option}</span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-4 text-gray-600">No options available</div>
              )}
            </div>
          </>
        ) : (
          <div className="p-4 text-gray-600">No questions available for this video</div>
        )}
      </div>
    );
  };

  const renderPuzzleQuestion = (data: any) => {
    return (
      <div className="p-4 bg-orange-50 rounded-lg text-center">
        <Puzzle className="h-12 w-12 mx-auto mb-4 text-orange-600" />
        <h3 className="text-lg font-semibold mb-2">Puzzle Game</h3>
        <p className="text-gray-600">Puzzle questions are interactive and scored separately.</p>
        <Button className="mt-4" onClick={() => handleAnswerSelect('completed')}>
          Mark as Completed
        </Button>
      </div>
    );
  };

  // Instructions screen
  if (showInstructions) {
    const now = new Date();
    const startTime = new Date(quizInfo.startTime);
    const canStartNow = countdownToStart === 0;

    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Quiz Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Quiz Info */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border-2 border-blue-200">
              <h3 className="text-2xl font-bold mb-4">{quizInfo.quizId}</h3>
              
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

              {/* Question Types Breakdown */}
              <div className="space-y-2">
                <h4 className="font-semibold text-lg mb-2">Question Types:</h4>
                <div className="grid grid-cols-2 gap-2">
                  {quizInfo.questionTypes.mcq > 0 && (
                    <div className="flex items-center gap-2 bg-blue-100 p-2 rounded">
                      <BookOpen className="h-5 w-5" />
                      <span>MCQ: {quizInfo.questionTypes.mcq}</span>
                    </div>
                  )}
                  {quizInfo.questionTypes.audio > 0 && (
                    <div className="flex items-center gap-2 bg-green-100 p-2 rounded">
                      <Volume2 className="h-5 w-5" />
                      <span>Audio: {quizInfo.questionTypes.audio}</span>
                    </div>
                  )}
                  {quizInfo.questionTypes.video > 0 && (
                    <div className="flex items-center gap-2 bg-purple-100 p-2 rounded">
                      <Video className="h-5 w-5" />
                      <span>Video: {quizInfo.questionTypes.video}</span>
                    </div>
                  )}
                  {quizInfo.questionTypes.puzzle > 0 && (
                    <div className="flex items-center gap-2 bg-orange-100 p-2 rounded">
                      <Puzzle className="h-5 w-5" />
                      <span>Puzzle: {quizInfo.questionTypes.puzzle}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Countdown Timer */}
            {countdownToStart > 0 && (
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6 text-center">
                <Clock className="h-12 w-12 mx-auto mb-3 text-yellow-600" />
                <h3 className="text-xl font-bold mb-2">Quiz Starts In</h3>
                <div className="text-5xl font-bold text-yellow-600 mb-2">
                  {Math.floor(countdownToStart / 60)}:{(countdownToStart % 60).toString().padStart(2, '0')}
                </div>
                <p className="text-sm text-gray-600">
                  Scheduled Start: {startTime.toLocaleString()}
                </p>
              </div>
            )}

            {/* Instructions */}
            <div className="space-y-3">
              <h4 className="text-lg font-semibold">Important Instructions:</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Once you start the quiz, the timer will begin immediately and cannot be paused.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>You can navigate between questions using Previous and Next buttons.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>For audio and video questions, make sure your device volume is turned on.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>You can change your answers before submitting the quiz.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>The quiz will automatically submit when time runs out.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Ensure you have a stable internet connection throughout the quiz.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Do not refresh or close the browser during the quiz.</span>
                </li>
              </ul>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading quiz questions...</p>
              </div>
            )}

            {/* Start Button */}
            <div className="flex gap-4">
              <Button 
                onClick={handleStartQuiz} 
                disabled={!canStartNow || loading}
                className="flex-1 bg-green-600 hover:bg-green-700" 
                size="lg"
              >
                {loading ? 'Loading...' : canStartNow ? 'I\'m Ready - Start Quiz' : 'Please Wait...'}
              </Button>
              <Button 
                onClick={() => navigate('/student/take-advanced-quiz')} 
                variant="outline" 
                size="lg"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showResults) {
    const correctCount = answers.filter((a, index) => {
      const q = questions.find(qu => qu._id === a.questionId);
      if (!q) return false;
      return a.selectedAnswer === getCorrectAnswer(q);
    }).length;

    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Quiz Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-6xl font-bold text-blue-600 mb-2">
                {correctCount}/{questions.length}
              </div>
              <p className="text-xl text-gray-600">
                Score: {Math.round((correctCount / questions.length) * 100)}%
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{correctCount}</div>
                <div className="text-sm text-gray-600">Correct</div>
              </div>
              <div className="p-4 bg-red-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-600">
                  {answers.length - correctCount}
                </div>
                <div className="text-sm text-gray-600">Incorrect</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {questions.length - answers.length}
                </div>
                <div className="text-sm text-gray-600">Unattempted</div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button onClick={() => navigate('/student/dashboard')} className="flex-1">
                Back to Dashboard
              </Button>
              <Button 
                onClick={() => navigate('/student/take-advanced-quiz')} 
                variant="outline" 
                className="flex-1"
              >
                Take Another Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              {getQuestionIcon(questions[currentIndex]?.type)}
              <span>Question {currentIndex + 1} of {questions.length}</span>
            </CardTitle>
            <div className="flex items-center gap-4">
              <Badge variant={timeRemaining < 60 ? 'destructive' : 'default'} className="text-lg px-4 py-2">
                <Clock className="h-4 w-4 mr-2" />
                {formatTime(timeRemaining)}
              </Badge>
            </div>
          </div>
          <Progress value={(currentIndex + 1) / questions.length * 100} className="mt-4" />
        </CardHeader>

        <CardContent className="space-y-6">
          {renderQuestion()}

          <div className="flex justify-between items-center pt-4 border-t">
            <Button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              variant="outline"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="text-sm text-gray-600">
              Answered: {answers.length}/{questions.length}
            </div>

            {currentIndex === questions.length - 1 ? (
              <Button onClick={() => handleSubmitQuiz(false)} className="bg-green-600 hover:bg-green-700">
                <Flag className="h-4 w-4 mr-2" />
                Submit Quiz
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedQuizPlayer;
