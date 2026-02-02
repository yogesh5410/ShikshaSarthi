import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ArrowLeft, Search } from 'lucide-react';
import { useQuiz } from '@/contexts/QuizContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const QuizById: React.FC = () => {
  const [quizId, setQuizId] = useState('');
  const { getQuizById } = useQuiz();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!quizId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a Quiz ID",
        variant: "destructive",
      });
      return;
    }
    
    const quiz = getQuizById(quizId);
    
    if (!quiz) {
      toast({
        title: "Error",
        description: "Quiz not found. Please check the Quiz ID and try again.",
        variant: "destructive",
      });
      return;
    }
    navigate(`/student/quiz/${quizId}`);
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 py-8 bg-gray-50">
        <div className="edu-container max-w-2xl">
          <div className="flex items-center mb-8">
            <Link to="/student" className="mr-4">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Enter Quiz ID</h1>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Attempt a Quiz</CardTitle>
              <CardDescription>
                Enter the Quiz ID provided by your teacher to start a quiz.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="quiz-id">Quiz ID</Label>
                  <div className="flex space-x-2">
                    <Input 
                      id="quiz-id" 
                      placeholder="e.g., quiz1" 
                      value={quizId}
                      onChange={(e) => setQuizId(e.target.value)}
                      required
                    />
                    <Button type="submit">
                      <Search className="h-4 w-4 mr-2" />
                      Find
                    </Button>
                  </div>
                </div>
                
                <div className="rounded-md bg-gray-50 p-4">
                  <h3 className="font-medium text-sm mb-2">Available quiz IDs for demo:</h3>
                  <div className="space-y-1">
                    <div className="text-sm bg-gray-100 p-2 rounded">quiz1 - Basic Mathematics Quiz</div>
                    <div className="text-sm bg-gray-100 p-2 rounded">quiz2 - Science Quiz</div>
                  </div>
                </div>
              </CardContent>
            </form>
            <CardFooter className="border-t pt-6">
              <div className="space-y-2 w-full">
                <h3 className="font-medium">Recently Attempted:</h3>
                <div className="text-center py-4 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-500">No recent quizzes</p>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default QuizById;
