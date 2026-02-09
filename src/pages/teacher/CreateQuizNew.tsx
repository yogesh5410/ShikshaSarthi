import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { Calendar, Clock, Plus, Edit, Save, CheckCircle } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

interface Question {
  _id: string;
  questionId?: string;
  subject: string;
  class: string;
  topic: string;
  subtopic?: string;
  question?: string; // Optional for video questions
  options?: string[]; // Optional for video questions
  correctAnswer?: string;
  questionImage?: string;
  difficulty?: string;
  type?: 'mcq' | 'audio' | 'video' | 'puzzle';
  
  // Audio question specific fields
  audio?: string;
  
  // Video question specific fields
  videoUrl?: string;
  videoTitle?: string;
  videoDescription?: string;
  videoDuration?: string;
  questions?: Array<{
    question: string;
    options: string[];
    correctAnswer: string;
    hint?: {
      text?: string;
      image?: string;
    };
  }>;
}

interface QuizConfig {
  quizId: string;
  timeLimit: number;
  totalQuestions: number;
  mcqCount: number;
  audioCount: number;
  videoCount: number;
  puzzleCount: number;
  startTime: string;
  endTime: string; // This will be auto-calculated
}

interface QuestionSlot {
  index: number;
  type: 'mcq' | 'audio' | 'video' | 'puzzle';
  question: Question | null;
}

export default function CreateQuizNew() {
  const [step, setStep] = useState<1 | 2>(1);
  const [config, setConfig] = useState<QuizConfig>({
    quizId: '',
    timeLimit: 60,
    totalQuestions: 0,
    mcqCount: 0,
    audioCount: 0,
    videoCount: 0,
    puzzleCount: 0,
    startTime: '',
    endTime: ''
  });
  
  const [questionSlots, setQuestionSlots] = useState<QuestionSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  
  // Filter states
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [filters, setFilters] = useState({
    subject: '',
    topic: '',
    subtopic: '',
    class: '',
    difficulty: ''
  });
  
  const [teacherId, setTeacherId] = useState('');
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [quizToUpdate, setQuizToUpdate] = useState<string>('');
  
  const { toast } = useToast();

  useEffect(() => {
    // Get teacher info from localStorage and cookies
    const currentUser = localStorage.getItem('currentUser');
    const teacherCookie = Cookies.get('teacher');
    
    let teacherData = null;
    
    console.log('Raw currentUser:', currentUser);
    console.log('Raw teacherCookie:', teacherCookie);
    
    // Try to get from localStorage first
    if (currentUser) {
      try {
        teacherData = JSON.parse(currentUser);
        console.log('Parsed currentUser:', teacherData);
      } catch (e) {
        console.error('Error parsing currentUser', e);
      }
    }
    
    // Fallback to cookie if needed
    if (teacherCookie && (!teacherData || !teacherData.teacherId)) {
      try {
        const cookieData = JSON.parse(teacherCookie);
        console.log('Parsed cookie data:', cookieData);
        // The cookie structure is { teacher: {...} }
        teacherData = cookieData.teacher || cookieData;
        console.log('Extracted teacher data from cookie:', teacherData);
      } catch (e) {
        console.error('Error parsing teacher cookie', e);
      }
    }
    
    if (teacherData) {
      // Use teacherId first, fallback to _id, then username
      const id = teacherData.teacherId || teacherData._id || teacherData.username || '';
      console.log('Teacher data found:', teacherData);
      console.log('Teacher ID set to:', id);
      setTeacherId(id);
    } else {
      console.error('No teacher data found');
    }
  }, []);

  // Auto-calculate end time when start time or time limit changes
  useEffect(() => {
    if (config.startTime && config.timeLimit > 0) {
      // Parse the datetime-local value which is already in local timezone
      const startDate = new Date(config.startTime);
      
      // Add time limit in minutes
      const endDate = new Date(startDate.getTime() + config.timeLimit * 60000);
      
      // Convert to IST (UTC+5:30)
      const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
      const endDateIST = new Date(endDate.getTime());
      
      // Format for datetime-local input (YYYY-MM-DDTHH:mm) in local timezone
      const year = endDateIST.getFullYear();
      const month = String(endDateIST.getMonth() + 1).padStart(2, '0');
      const day = String(endDateIST.getDate()).padStart(2, '0');
      const hours = String(endDateIST.getHours()).padStart(2, '0');
      const minutes = String(endDateIST.getMinutes()).padStart(2, '0');
      
      const endTimeString = `${year}-${month}-${day}T${hours}:${minutes}`;
      setConfig(prev => ({ ...prev, endTime: endTimeString }));
    }
  }, [config.startTime, config.timeLimit]);

  // Validate quiz configuration
  const validateConfig = () => {
    const { quizId, timeLimit, totalQuestions, mcqCount, audioCount, videoCount, puzzleCount, startTime } = config;
    
    if (!quizId.trim()) {
      toast({ title: "Error", description: "Quiz ID is required", variant: "destructive" });
      return false;
    }
    
    if (timeLimit <= 0) {
      toast({ title: "Error", description: "Time limit must be greater than 0", variant: "destructive" });
      return false;
    }
    
    // Calculate total from individual counts (1 video = 1 question slot)
    const calculatedTotal = mcqCount + audioCount + puzzleCount + videoCount;
    
    if (totalQuestions !== calculatedTotal) {
      toast({ 
        title: "Error", 
        description: `Total questions (${totalQuestions}) must equal MCQ + Audio + Puzzles + Videos = ${calculatedTotal}`,
        variant: "destructive" 
      });
      return false;
    }
    
    if (!startTime) {
      toast({ title: "Error", description: "Start time is required", variant: "destructive" });
      return false;
    }
    
    return true;
  };

  // Check if quiz ID exists
  const checkQuizIdExists = async (id: string): Promise<boolean> => {
    try {
      const response = await axios.get(`${API_URL}/quizzes/check/${id}`);
      return response.data.exists;
    } catch (error) {
      return false;
    }
  };

  // Initialize question slots based on config
  const initializeSlots = () => {
    const slots: QuestionSlot[] = [];
    let index = 0;
    
    // First: MCQ questions
    for (let i = 0; i < config.mcqCount; i++) {
      slots.push({ index: index++, type: 'mcq', question: null });
    }
    
    // Second: Audio questions
    for (let i = 0; i < config.audioCount; i++) {
      slots.push({ index: index++, type: 'audio', question: null });
    }
    
    // Third: Video questions (1 video = 1 question slot)
    for (let i = 0; i < config.videoCount; i++) {
      slots.push({ index: index++, type: 'video', question: null });
    }
    
    // Fourth: Puzzle questions
    for (let i = 0; i < config.puzzleCount; i++) {
      slots.push({ index: index++, type: 'puzzle', question: null });
    }
    
    setQuestionSlots(slots);
  };

  const handleConfigSubmit = async () => {
    if (!validateConfig()) return;
    
    // Check if quiz ID already exists (unless in update mode)
    if (!isUpdateMode) {
      const exists = await checkQuizIdExists(config.quizId);
      if (exists) {
        toast({ 
          title: "Error", 
          description: "Quiz ID already exists. Please use a unique ID or use Update mode.",
          variant: "destructive" 
        });
        return;
      }
    }
    
    initializeSlots();
    setStep(2);
    
    toast({
      title: "Configuration Saved",
      description: `Now select questions for your quiz (${config.totalQuestions} questions needed)`
    });
  };

  // Load questions based on type and filters
  const loadQuestionsForSlot = async (slotIndex: number) => {
    const slot = questionSlots[slotIndex];
    setSelectedSlot(slotIndex);
    
    try {
      let endpoint = '';
      
      switch (slot.type) {
        case 'mcq':
          endpoint = `${API_URL}/questions/`;
          break;
        case 'audio':
          endpoint = `${API_URL}/audio-questions/`;
          break;
        case 'video':
          endpoint = `${API_URL}/video-questions/`;
          break;
        case 'puzzle':
          endpoint = `${API_URL}/puzzles/`;
          break;
      }
      
      const response = await axios.get(endpoint);
      const questions = response.data.map((q: any) => ({
        _id: q._id || q.id,
        questionId: q.questionId || q.id,
        subject: q.subject || 'N/A',
        class: q.class || 'N/A',
        topic: q.topic || 'N/A',
        subtopic: q.subtopic || '',
        question: q.question || q.questionText || '',
        options: q.options || [],
        correctAnswer: q.correctAnswer || q.answer || '',
        questionImage: q.questionImage || q.image || '',
        difficulty: q.difficulty || '',
        type: slot.type
      }));
      
      setAvailableQuestions(questions);
      setFilteredQuestions(questions);
      setIsFilterDialogOpen(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load questions",
        variant: "destructive"
      });
    }
  };

  // Apply filters
  const applyFilters = () => {
    let filtered = [...availableQuestions];
    
    if (filters.subject && filters.subject !== '') {
      filtered = filtered.filter(q => q.subject && q.subject.toLowerCase().includes(filters.subject.toLowerCase()));
    }
    if (filters.topic && filters.topic !== '') {
      filtered = filtered.filter(q => q.topic && q.topic.toLowerCase().includes(filters.topic.toLowerCase()));
    }
    if (filters.subtopic && filters.subtopic !== '') {
      filtered = filtered.filter(q => q.subtopic && q.subtopic.toLowerCase().includes(filters.subtopic.toLowerCase()));
    }
    if (filters.class && filters.class !== '') {
      filtered = filtered.filter(q => q.class && q.class.toString() === filters.class);
    }
    if (filters.difficulty && filters.difficulty !== '') {
      filtered = filtered.filter(q => q.difficulty && q.difficulty.toLowerCase().includes(filters.difficulty.toLowerCase()));
    }
    
    setFilteredQuestions(filtered);
  };

  // Select question for a slot
  const selectQuestion = (question: Question) => {
    if (selectedSlot === null) return;
    
    const newSlots = [...questionSlots];
    newSlots[selectedSlot].question = question;
    setQuestionSlots(newSlots);
    
    setIsFilterDialogOpen(false);
    setSelectedSlot(null);
    setFilters({ subject: '', topic: '', subtopic: '', class: '', difficulty: '' });
    
    toast({
      title: "Question Selected",
      description: `Question assigned to slot ${selectedSlot + 1}`
    });
  };

  // Create or update quiz
  const handleCreateQuiz = async () => {
    // Check if teacherId is set
    if (!teacherId) {
      toast({
        title: "Error",
        description: "Teacher ID not found. Please log in again.",
        variant: "destructive"
      });
      return;
    }
    
    console.log('Creating/Updating quiz with teacherId:', teacherId);
    
    // For update mode, allow partial slots to be filled
    // For create mode, all slots must be filled
    const filledSlots = questionSlots.filter(slot => slot.question);
    const unfilledSlots = questionSlots.filter(slot => !slot.question);
    
    if (!isUpdateMode && unfilledSlots.length > 0) {
      toast({
        title: "Error",
        description: `Please fill all question slots. ${unfilledSlots.length} slots remaining.`,
        variant: "destructive"
      });
      return;
    }
    
    // In update mode, warn but allow submission with only filled slots
    if (isUpdateMode && unfilledSlots.length > 0) {
      console.log(`Update mode: ${filledSlots.length} slots filled, ${unfilledSlots.length} slots empty`);
    }
    
    try {
      // Only include questions that are actually filled
      const questionIds = filledSlots.map(slot => slot.question!._id);
      
      const quizData = {
        quizId: config.quizId,
        teacherId,
        questions: questionIds,
        timeLimit: config.timeLimit,
        totalQuestions: questionIds.length, // Use actual filled count
        questionTypes: {
          mcq: filledSlots.filter(s => s.type === 'mcq').length,
          audio: filledSlots.filter(s => s.type === 'audio').length,
          video: filledSlots.filter(s => s.type === 'video').length,
          puzzle: filledSlots.filter(s => s.type === 'puzzle').length
        },
        startTime: config.startTime, // Send as ISO string, backend will parse
        endTime: config.endTime
      };
      
      console.log('Quiz data being sent:', quizData);
      
      if (isUpdateMode && quizToUpdate) {
        await axios.put(`${API_URL}/quizzes/update/${quizToUpdate}`, quizData);
        toast({
          title: "Quiz Updated",
          description: `Quiz "${config.quizId}" has been updated successfully`
        });
      } else {
        await axios.post(`${API_URL}/quizzes/create`, quizData);
        toast({
          title: "Quiz Created",
          description: `Quiz "${config.quizId}" created with ${config.totalQuestions} questions`
        });
      }
      
      // Reset form
      setStep(1);
      setConfig({
        quizId: '',
        timeLimit: 60,
        totalQuestions: 0,
        mcqCount: 0,
        audioCount: 0,
        videoCount: 0,
        puzzleCount: 0,
        startTime: '',
        endTime: ''
      });
      setQuestionSlots([]);
      setIsUpdateMode(false);
      setQuizToUpdate('');
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to create quiz",
        variant: "destructive"
      });
    }
  };

  // Load existing quiz for update
  const loadQuizForUpdate = async () => {
    if (!quizToUpdate.trim()) {
      toast({ title: "Error", description: "Please enter a quiz ID", variant: "destructive" });
      return;
    }
    
    try {
      console.log('Loading quiz with ID:', quizToUpdate);
      const response = await axios.get(`${API_URL}/quizzes/by-id/${quizToUpdate}`);
      const quiz = response.data;
      
      console.log('Quiz loaded:', quiz);
      console.log('Questions in quiz:', quiz.questions);
      console.log('Question types:', quiz.questionTypes);
      
      // Format dates for datetime-local input
      const formatDateForInput = (dateString: string) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };
      
      setConfig({
        quizId: quiz.quizId,
        timeLimit: quiz.timeLimit,
        totalQuestions: quiz.totalQuestions,
        mcqCount: quiz.questionTypes.mcq,
        audioCount: quiz.questionTypes.audio,
        videoCount: quiz.questionTypes.video,
        puzzleCount: quiz.questionTypes.puzzle,
        startTime: formatDateForInput(quiz.startTime),
        endTime: formatDateForInput(quiz.endTime)
      });
      
      // Initialize slots based on question types
      const slots: QuestionSlot[] = [];
      let slotIndex = 0;
      
      // Add MCQ slots
      for (let i = 0; i < quiz.questionTypes.mcq; i++) {
        slots.push({ index: slotIndex++, type: 'mcq', question: null });
      }
      
      // Add Audio slots
      for (let i = 0; i < quiz.questionTypes.audio; i++) {
        slots.push({ index: slotIndex++, type: 'audio', question: null });
      }
      
      // Add Video slots
      for (let i = 0; i < quiz.questionTypes.video; i++) {
        slots.push({ index: slotIndex++, type: 'video', question: null });
      }
      
      // Add Puzzle slots
      for (let i = 0; i < quiz.questionTypes.puzzle; i++) {
        slots.push({ index: slotIndex++, type: 'puzzle', question: null });
      }
      
      console.log('Created slots:', slots);
      
      // Load existing questions into slots
      if (quiz.questions && quiz.questions.length > 0) {
        console.log('Loading questions into slots...');
        const loadedSlots = await Promise.all(
          slots.map(async (slot) => {
            const questionId = quiz.questions[slot.index];
            console.log(`Slot ${slot.index} (${slot.type}): Loading question ${questionId}`);
            
            if (!questionId) {
              console.log(`Slot ${slot.index}: No question ID`);
              return slot;
            }
            
            let endpoint = '';
            switch (slot.type) {
              case 'mcq':
                endpoint = `${API_URL}/questions/${questionId}`;
                break;
              case 'audio':
                endpoint = `${API_URL}/audio-questions/question/${questionId}`;
                break;
              case 'video':
                endpoint = `${API_URL}/video-questions/single/${questionId}`;
                break;
              case 'puzzle':
                endpoint = `${API_URL}/puzzles/${questionId}`;
                break;
            }

            console.log(`Fetching from: ${endpoint}`);
            
            try {
              const qResponse = await axios.get(endpoint);
              console.log(`Successfully loaded question ${questionId}:`, qResponse.data);
              return {
                ...slot,
                question: {
                  _id: questionId,
                  questionId: questionId,
                  type: slot.type,
                  ...qResponse.data
                }
              };
            } catch (err: any) {
              console.error(`Error loading ${slot.type} question ${questionId}:`, err.response?.data || err.message);
              return slot;
            }
          })
        );
        
        console.log('All slots loaded:', loadedSlots);
        setQuestionSlots(loadedSlots);
      } else {
        console.log('No questions to load, using empty slots');
        setQuestionSlots(slots);
      }
      
      setIsUpdateMode(true);
      setStep(2); // Go directly to question selection
      
      toast({
        title: "Quiz Loaded",
        description: `Loaded ${quiz.questions?.length || 0} existing questions. You can modify them now.`
      });
      
    } catch (error: any) {
      console.error('Error loading quiz:', error);
      console.error('Error response:', error.response?.data);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Quiz not found or failed to load",
        variant: "destructive"
      });
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'mcq': return 'bg-blue-500';
      case 'audio': return 'bg-green-500';
      case 'video': return 'bg-purple-500';
      case 'puzzle': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'mcq': return 'MCQ';
      case 'audio': return '🔊 Audio';
      case 'video': return '📹 Video';
      case 'puzzle': return '🧩 Puzzle';
      default: return type;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Create Quiz</h1>
        
        <div className="flex gap-2">
          <Input
            placeholder="Enter Quiz ID to Update"
            value={quizToUpdate}
            onChange={(e) => setQuizToUpdate(e.target.value)}
            className="w-64"
          />
          <Button onClick={loadQuizForUpdate} variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Load Quiz
          </Button>
        </div>
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Quiz Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quizId">Quiz ID *</Label>
                <Input
                  id="quizId"
                  value={config.quizId}
                  onChange={(e) => setConfig({ ...config, quizId: e.target.value })}
                  placeholder="e.g., QUIZ001"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeLimit">Time Limit (minutes) *</Label>
                <Input
                  id="timeLimit"
                  type="number"
                  value={config.timeLimit}
                  onChange={(e) => setConfig({ ...config, timeLimit: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mcqCount">MCQ Questions</Label>
                <Input
                  id="mcqCount"
                  type="number"
                  value={config.mcqCount}
                  onChange={(e) => {
                    const count = parseInt(e.target.value) || 0;
                    const total = count + config.audioCount + config.puzzleCount + config.videoCount;
                    setConfig({ ...config, mcqCount: count, totalQuestions: total });
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="audioCount">Audio Questions</Label>
                <Input
                  id="audioCount"
                  type="number"
                  value={config.audioCount}
                  onChange={(e) => {
                    const count = parseInt(e.target.value) || 0;
                    const total = config.mcqCount + count + config.puzzleCount + config.videoCount;
                    setConfig({ ...config, audioCount: count, totalQuestions: total });
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="puzzleCount">Puzzle Questions</Label>
                <Input
                  id="puzzleCount"
                  type="number"
                  value={config.puzzleCount}
                  onChange={(e) => {
                    const count = parseInt(e.target.value) || 0;
                    const total = config.mcqCount + config.audioCount + count + config.videoCount;
                    setConfig({ ...config, puzzleCount: count, totalQuestions: total });
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="videoCount">Video Questions</Label>
                <Input
                  id="videoCount"
                  type="number"
                  value={config.videoCount}
                  onChange={(e) => {
                    const count = parseInt(e.target.value) || 0;
                    const total = config.mcqCount + config.audioCount + config.puzzleCount + count;
                    setConfig({ ...config, videoCount: count, totalQuestions: total });
                  }}
                />
                <p className="text-sm text-gray-500">
                  Each video contains multiple questions
                </p>
              </div>

              <div className="space-y-2">
                <Label>Total Questions (Auto-calculated)</Label>
                <Input
                  value={config.totalQuestions}
                  disabled
                  className="bg-gray-100 font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">
                  <Calendar className="inline mr-2 h-4 w-4" />
                  Start Time *
                </Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={config.startTime}
                  onChange={(e) => setConfig({ ...config, startTime: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">
                  <Clock className="inline mr-2 h-4 w-4" />
                  End Time (Auto-calculated)
                </Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={config.endTime}
                  disabled
                  className="bg-gray-100 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500">
                  Calculated as: Start Time + {config.timeLimit} minutes
                </p>
              </div>
            </div>

            <Button onClick={handleConfigSubmit} className="w-full" size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Continue to Question Selection
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Step 2: Select Questions</CardTitle>
              <div className="text-sm text-gray-600">
                Click on a question slot to select a question. Questions are ordered: MCQ → Audio → Puzzles → Videos
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-10 gap-2">
                {questionSlots.map((slot) => (
                  <Button
                    key={slot.index}
                    variant={slot.question ? "default" : "outline"}
                    className={`relative ${!slot.question ? 'border-2 border-dashed' : ''}`}
                    onClick={() => loadQuestionsForSlot(slot.index)}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-xs">{slot.index + 1}</span>
                      <Badge className={`mt-1 text-xs ${getTypeColor(slot.type)}`}>
                        {getTypeLabel(slot.type)}
                      </Badge>
                      {slot.question && (
                        <CheckCircle className="absolute -top-1 -right-1 h-4 w-4 text-green-500" />
                      )}
                    </div>
                  </Button>
                ))}
              </div>

              <div className="mt-6 flex gap-4">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back to Configuration
                </Button>
                <Button onClick={handleCreateQuiz} className="flex-1" size="lg">
                  <Save className="mr-2 h-4 w-4" />
                  {isUpdateMode ? 'Update Quiz' : 'Create Quiz'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Question Filter Dialog */}
          <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  Select Question for Slot {selectedSlot !== null ? selectedSlot + 1 : ''} 
                  {selectedSlot !== null && (
                    <Badge className={`ml-2 ${getTypeColor(questionSlots[selectedSlot].type)}`}>
                      {getTypeLabel(questionSlots[selectedSlot].type)}
                    </Badge>
                  )}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {/* Filters */}
                <div className="grid grid-cols-5 gap-2">
                  <Input
                    placeholder="Subject"
                    value={filters.subject}
                    onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                  />
                  <Input
                    placeholder="Topic"
                    value={filters.topic}
                    onChange={(e) => setFilters({ ...filters, topic: e.target.value })}
                  />
                  <Input
                    placeholder="Subtopic"
                    value={filters.subtopic}
                    onChange={(e) => setFilters({ ...filters, subtopic: e.target.value })}
                  />
                  <Input
                    placeholder="Class"
                    value={filters.class}
                    onChange={(e) => setFilters({ ...filters, class: e.target.value })}
                  />
                  <Button onClick={applyFilters}>Apply Filters</Button>
                </div>

                {/* Questions List */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredQuestions.map((question) => {
                    // Determine question type and render accordingly
                    const isVideoQuestion = question.type === 'video' || question.videoUrl;
                    const isAudioQuestion = question.type === 'audio' || question.audio;
                    
                    return (
                      <Card 
                        key={question._id} 
                        className="cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => selectQuestion(question)}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              {/* Video Question Display */}
                              {isVideoQuestion && (
                                <>
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge className="bg-purple-500">Video</Badge>
                                    <p className="font-bold text-lg">{question.videoTitle || 'Video Question'}</p>
                                  </div>
                                  {question.videoDescription && (
                                    <p className="text-sm text-gray-600 mb-2">{question.videoDescription}</p>
                                  )}
                                  {question.videoUrl && (
                                    <div className="text-xs text-blue-600 mb-2">
                                      📹 Video URL: {question.videoUrl.substring(0, 50)}...
                                    </div>
                                  )}
                                  {question.questions && question.questions.length > 0 && (
                                    <div className="mt-2 p-2 bg-gray-50 rounded">
                                      <p className="text-sm font-semibold mb-1">Questions in this video: {question.questions.length}</p>
                                      <div className="space-y-2">
                                        {question.questions.slice(0, 2).map((q: any, idx: number) => (
                                          <div key={idx} className="text-xs text-gray-700 border-l-2 border-purple-300 pl-2">
                                            <p className="font-medium">{idx + 1}. {q.question}</p>
                                          </div>
                                        ))}
                                        {question.questions.length > 2 && (
                                          <p className="text-xs text-gray-500">...and {question.questions.length - 2} more</p>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </>
                              )}
                              
                              {/* Audio Question Display */}
                              {isAudioQuestion && !isVideoQuestion && (
                                <>
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge className="bg-green-500">Audio</Badge>
                                  </div>
                                  <p className="font-medium">{question.question || 'Audio Question'}</p>
                                  {question.audio && (
                                    <div className="text-xs text-green-600 mb-2 flex items-center gap-1">
                                      🔊 Audio file attached
                                    </div>
                                  )}
                                  {question.questionImage && (
                                    <img src={question.questionImage} alt="Question" className="mt-2 max-w-xs rounded" />
                                  )}
                                  {question.options && question.options.length > 0 && (
                                    <div className="mt-2 space-y-1">
                                      {question.options.map((opt: string, i: number) => (
                                        <div key={i} className="text-sm text-gray-600">
                                          {String.fromCharCode(65 + i)}. {opt}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </>
                              )}
                              
                              {/* MCQ/Regular Question Display */}
                              {!isVideoQuestion && !isAudioQuestion && (
                                <>
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge className="bg-blue-500">MCQ</Badge>
                                  </div>
                                  <p className="font-medium">{question.question || 'No question text'}</p>
                                  {question.questionImage && (
                                    <img src={question.questionImage} alt="Question" className="mt-2 max-w-xs rounded" />
                                  )}
                                  {question.options && question.options.length > 0 && (
                                    <div className="mt-2 space-y-1">
                                      {question.options.map((opt: string, i: number) => (
                                        <div key={i} className="text-sm text-gray-600">
                                          {String.fromCharCode(65 + i)}. {opt}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                            <div className="ml-4 text-right text-sm text-gray-500">
                              <div>Subject: {question.subject || 'N/A'}</div>
                              <div>Topic: {question.topic || 'N/A'}</div>
                              <div>Class: {question.class || 'N/A'}</div>
                              {question.subtopic && <div>Subtopic: {question.subtopic}</div>}
                              {question.difficulty && <div>Difficulty: {question.difficulty}</div>}
                              {question.videoDuration && <div>Duration: {question.videoDuration}</div>}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                  
                  {filteredQuestions.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      No questions found. Try adjusting your filters.
                    </div>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
