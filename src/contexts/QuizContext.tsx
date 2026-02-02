
import React, { createContext, useContext, useState } from 'react';
import { toast } from "@/components/ui/use-toast";

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  subject: string;
}

export interface Quiz {
  id: string;
  title: string;
  subject: string;
  questions: Question[];
  createdBy: string;
  instituteId: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  answers: number[];
  score: number;
  date: Date;
}

interface QuizContextType {
  quizzes: Quiz[];
  quizAttempts: QuizAttempt[];
  practiceQuestions: Record<string, Question[]>;
  createQuiz: (quiz: Omit<Quiz, 'id'>) => string;
  getQuizById: (id: string) => Quiz | undefined;
  attemptQuiz: (quizId: string, studentId: string, answers: number[]) => QuizAttempt;
  getStudentAttempts: (studentId: string) => QuizAttempt[];
  getTeacherQuizzes: (teacherId: string) => Quiz[];
  getQuizAttempts: (quizId: string) => QuizAttempt[];
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};

// Mock data
const mockPracticeQuestions: Record<string, Question[]> = {
  'mathematics': [
    {
      id: 'math1',
      text: 'What is 5 + 7?',
      options: ['10', '11', '12', '13'],
      correctAnswer: 2,
      subject: 'mathematics'
    },
    {
      id: 'math2',
      text: 'If a = 3 and b = 4, what is a² + b²?',
      options: ['7', '25', '49', '16'],
      correctAnswer: 1,
      subject: 'mathematics'
    },
    {
      id: 'math3',
      text: 'Solve for x: 2x + 5 = 15',
      options: ['5', '7.5', '10', '20'],
      correctAnswer: 0,
      subject: 'mathematics'
    },
  ],
  'science': [
    {
      id: 'sci1',
      text: 'What is the chemical formula for water?',
      options: ['H2O', 'CO2', 'O2', 'H2O2'],
      correctAnswer: 0,
      subject: 'science'
    },
    {
      id: 'sci2',
      text: 'Which planet is known as the Red Planet?',
      options: ['Earth', 'Mars', 'Jupiter', 'Venus'],
      correctAnswer: 1,
      subject: 'science'
    },
  ],
  'social': [
    {
      id: 'soc1',
      text: 'Who was the first Prime Minister of India?',
      options: ['Mahatma Gandhi', 'Jawaharlal Nehru', 'Sardar Patel', 'B.R. Ambedkar'],
      correctAnswer: 1,
      subject: 'social'
    },
    {
      id: 'soc2',
      text: 'The Great Wall of China was built primarily to defend against which people?',
      options: ['Romans', 'Mongols', 'Japanese', 'Persians'],
      correctAnswer: 1,
      subject: 'social'
    },
  ],
  'mat': [
    {
      id: 'mat1',
      text: 'If 5 cats can catch 5 rats in 5 minutes, how many cats would be needed to catch 100 rats in 100 minutes?',
      options: ['5', '20', '100', '1'],
      correctAnswer: 0,
      subject: 'mat'
    },
    {
      id: 'mat2',
      text: 'Find the odd one out: 3, 5, 7, 9, 11',
      options: ['3', '5', '7', '9'],
      correctAnswer: 3, // 9 is not a prime number
      subject: 'mat'
    },
  ]
};

export const QuizProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([
    {
      id: 'quiz1',
      title: 'Basic Mathematics Quiz',
      subject: 'mathematics',
      questions: mockPracticeQuestions.mathematics,
      createdBy: '1', // Teacher ID
      instituteId: 'INST001',
    },
    {
      id: 'quiz2',
      title: 'Science Quiz',
      subject: 'science',
      questions: mockPracticeQuestions.science,
      createdBy: '1',
      instituteId: 'INST001',
    }
  ]);
  
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([
    {
      id: 'attempt1',
      quizId: 'quiz1',
      studentId: '1', // Student ID
      answers: [2, 1],
      score: 2, // Out of 2
      date: new Date('2025-05-10')
    }
  ]);
  
  const createQuiz = (quizData: Omit<Quiz, 'id'>) => {
    const newQuiz = {
      ...quizData,
      id: `quiz${quizzes.length + 1}`,
    };
    
    setQuizzes([...quizzes, newQuiz]);
    
    toast({
      title: "Quiz Created",
      description: `Quiz ID: ${newQuiz.id}`,
    });
    
    return newQuiz.id;
  };
  
  const getQuizById = (id: string) => {
    return quizzes.find(quiz => quiz.id === id);
  };
  
  const attemptQuiz = (quizId: string, studentId: string, answers: number[]) => {
    const quiz = getQuizById(quizId);
    
    if (!quiz) {
      throw new Error('Quiz not found');
    }
    
    // Calculate score
    let score = 0;
    for (let i = 0; i < answers.length; i++) {
      if (i < quiz.questions.length && answers[i] === quiz.questions[i].correctAnswer) {
        score++;
      }
    }
    
    const newAttempt = {
      id: `attempt${quizAttempts.length + 1}`,
      quizId,
      studentId,
      answers,
      score,
      date: new Date(),
    };
    
    setQuizAttempts([...quizAttempts, newAttempt]);
    
    return newAttempt;
  };
  
  const getStudentAttempts = (studentId: string) => {
    return quizAttempts.filter(attempt => attempt.studentId === studentId);
  };
  
  const getTeacherQuizzes = (teacherId: string) => {
    return quizzes.filter(quiz => quiz.createdBy === teacherId);
  };
  
  const getQuizAttempts = (quizId: string) => {
    return quizAttempts.filter(attempt => attempt.quizId === quizId);
  };
  
  const value = {
    quizzes,
    quizAttempts,
    practiceQuestions: mockPracticeQuestions,
    createQuiz,
    getQuizById,
    attemptQuiz,
    getStudentAttempts,
    getTeacherQuizzes,
    getQuizAttempts,
  };
  
  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
};
