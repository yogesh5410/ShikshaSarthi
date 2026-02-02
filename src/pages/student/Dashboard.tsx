import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
const API_URL = import.meta.env.VITE_API_URL;
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BookOpen, ListChecks, Users, Lock } from "lucide-react";
import SubjectIcon from "@/components/SubjectIcon";

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [student, setStudent] = useState<null | {
    _id: string;
    studentId: string;
    class:string;
    name: string;
    quizAttempted: {
      quizId: string;
      score: {
        correct: number;
        incorrect: number;
        unattempted: number;
      };
      attemptedAt: string;
    }[];
  }>(null);

  const [quizId, setQuizId] = useState("");

  useEffect(() => {
    const localData = localStorage.getItem("student");

    if (localData) {
      try {
        const parsedData = JSON.parse(localData);
        const studentClass = parsedData.student?.class;
        const studentId = parsedData.student?.studentId;

        if (studentId) {
          axios
            .get(`${API_URL}/students/${studentId}`)
            .then((res) => {
              setStudent(res.data);
            })
            .catch((error) => {
              console.error("Failed to fetch student data:", error);
            });
        }
      } catch (e) {
        console.error("Failed to parse student local storage data", e);
      }
    }
  }, []);
  

  const handleStartQuiz = () => {
    const trimmedQuizId = quizId.trim();

    if (!trimmedQuizId) {
      alert("Please enter a Quiz ID");
      return;
    }

    const alreadyAttempted = student?.quizAttempted.some(
      (attempt) => attempt.quizId === trimmedQuizId
    );

    if (alreadyAttempted) {
      alert(`You have already attempted Quiz ID: ${trimmedQuizId}`);
      return;
    }

    navigate(`/attemptquiz/${trimmedQuizId}`);
  };
  

  const subjectProgress = [
    {
      subject: "mathematics",
      name: "Mathematics",
      completed: 12,
      total: 20,
      percentage: 60,
    },
    {
      subject: "science",
      name: "Science",
      completed: 8,
      total: 15,
      percentage: 53,
    },
    {
      subject: "social",
      name: "Social Science",
      completed: 5,
      total: 15,
      percentage: 33,
    },
    {
      subject: "mat",
      name: "Mental Ability",
      completed: 7,
      total: 10,
      percentage: 70,
    },
  ];

  // Create real recent activity from quizAttempted
  const recentActivity =
  student?.quizAttempted.map((attempt) => ({
    quizId: attempt.quizId, // ✅ add this line
    type: "quiz",
    title: `Quiz ${attempt.quizId}`,
    score: `${attempt.score.correct} Correct / ${attempt.score.incorrect} Incorrect`,
    date: attempt.attemptedAt,
  })) || [];


  if (!student) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading student data...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-8 bg-gray-50">
        <div className="edu-container">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {student.name}!
            </h1>
            <p className="text-gray-600">Student ID: {student.studentId}</p>
            <p className="text-gray-600">Student Class: {student.class}</p>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="border-2 border-edu-blue/20 hover:border-edu-blue/40 transition-colors">
              <CardHeader>
                <BookOpen className="h-10 w-10 text-edu-blue mb-2" />
                <CardTitle>Practice Questions</CardTitle>
                <CardDescription>
                  Attempt subject-specific practice questions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Select a subject and practice MCQ questions to improve your
                  skills for the NMMS exam.
                </p>
              </CardContent>
              <CardFooter>
                <Link to="/student/practice" className="w-full">
                  <Button className="w-full">Start Practice</Button>
                </Link>
              </CardFooter>
            </Card>

            <Card className="border-2 border-edu-green/20 hover:border-edu-green/40 transition-colors">
              <CardHeader>
                <ListChecks className="h-10 w-10 text-edu-green mb-2" />
                <CardTitle>Attempt Quiz</CardTitle>
                <CardDescription>
                  Enter a Quiz ID to take a teacher-created quiz
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Enter a Quiz ID provided by your teacher to attempt a specific
                  quiz.
                </p>
              </CardContent>
              <CardFooter className="flex flex-col space-y-2">
                <input
                  type="text"
                  placeholder="Enter Quiz ID"
                  value={quizId}
                  onChange={(e) => setQuizId(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md text-sm border-edu-green focus:outline-none focus:ring-2 focus:ring-edu-green/40"
                />
                <Button
                  variant="outline"
                  className="w-full border-edu-green text-edu-green hover:bg-edu-green/10"
                  onClick={handleStartQuiz}
                >
                  Start Quiz
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-2 border-edu-purple/20 hover:border-edu-purple/40 transition-colors">
              <CardHeader>
                <Users className="h-10 w-10 text-edu-purple mb-2" />
                <CardTitle>Group Quiz</CardTitle>
                <CardDescription>
                  Study with two friends in group mode
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Enter your ID and your friends' IDs to attempt a quiz together
                  as a group.
                </p>
              </CardContent>
              <CardFooter>
                <Link to="/student/group-quiz" className="w-full">
                  <Button
                    variant="outline"
                    className="w-full border-edu-purple text-edu-purple hover:bg-edu-purple/10"
                  >
                    Start Group Quiz
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>

          {/* Progress Section */}
          {/* <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Your Progress</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {subjectProgress.map((subject, index) => (
                <Card key={index}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center space-x-2">
                      <SubjectIcon subject={subject.subject} />
                      <CardTitle className="text-lg">{subject.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>
                          {subject.completed}/{subject.total} completed
                        </span>
                        <span className="font-medium">
                          {subject.percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="h-2.5 rounded-full bg-edu-blue"
                          style={{ width: `${subject.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div> */}

          {/* Real Recent Activity */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <Link to={`/singlequiz/${activity.quizId}`}>
                    <Card key={index}>
                      <CardHeader className="py-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <ListChecks className="h-5 w-5 text-edu-green" />
                            <CardTitle className="text-base font-medium">
                              {activity.title}
                            </CardTitle>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm font-medium mr-4">
                              {activity.score}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(activity.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-6 flex flex-col items-center justify-center">
                  <Lock className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-xl font-medium text-gray-500">
                    No activity yet
                  </p>
                  <p className="text-gray-500 mb-4">
                    Start practicing to build your activity history
                  </p>
                  <Link to="/student/practice">
                    <Button>Start Practice</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default StudentDashboard;
