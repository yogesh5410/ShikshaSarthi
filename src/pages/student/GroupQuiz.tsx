
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ArrowLeft, Users } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const GroupQuiz: React.FC = () => {
  const [studentIds, setStudentIds] = useState({
    student1: '',
    student2: '',
    student3: '',
  });
  const [subject, setSubject] = useState('');
  const { toast } = useToast();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setStudentIds(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!studentIds.student1 || !studentIds.student2 || !studentIds.student3) {
      toast({
        title: "Error",
        description: "Please enter all three student IDs",
        variant: "destructive",
      });
      return;
    }
    
    if (!subject) {
      toast({
        title: "Error",
        description: "Please select a subject",
        variant: "destructive",
      });
      return;
    }
    
    // In a real app, we would validate the student IDs and start a group quiz
    toast({
      title: "Feature Coming Soon",
      description: "Group quiz mode is under development. Please check back later!",
    });
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
            <h1 className="text-3xl font-bold text-gray-900">Group Quiz</h1>
          </div>
          
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Users className="h-6 w-6 text-edu-purple" />
                <CardTitle>Start a Group Quiz</CardTitle>
              </div>
              <CardDescription>
                Enter the student IDs of yourself and two friends to attempt a quiz together.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="student1">Your Student ID</Label>
                    <Input 
                      id="student1" 
                      name="student1"
                      placeholder="Your ID" 
                      value={studentIds.student1}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="student2">Friend 1 Student ID</Label>
                    <Input 
                      id="student2" 
                      name="student2"
                      placeholder="First friend's ID" 
                      value={studentIds.student2}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="student3">Friend 2 Student ID</Label>
                    <Input 
                      id="student3" 
                      name="student3"
                      placeholder="Second friend's ID" 
                      value={studentIds.student3}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subject">Select Subject</Label>
                  <Select value={subject} onValueChange={setSubject} required>
                    <SelectTrigger id="subject">
                      <SelectValue placeholder="Choose a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mathematics">Mathematics</SelectItem>
                      <SelectItem value="science">Science</SelectItem>
                      <SelectItem value="social">Social Science</SelectItem>
                      <SelectItem value="mat">Mental Ability Test</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> All three students must be present together to attempt this quiz. 
                    Each student will answer questions individually, but results will be shared among the group.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Link to="/student">
                  <Button variant="outline">Cancel</Button>
                </Link>
                <Button type="submit">Start Group Quiz</Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default GroupQuiz;
