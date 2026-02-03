import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ArrowLeft, Users, PlusCircle, Trash2, Search } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

interface Student {
  studentId: string;
  name: string;
  class: string;
  phone?: string;
}

interface ClassData {
  classId: string;
  className: string;
  subject: string;
  teacherId: string;
  schoolId: string;
  students: string[];
  studentDetails?: Student[];
}

const ClassStudents: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [studentToAdd, setStudentToAdd] = useState<string>('');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    if (classId) {
      fetchClassData();
    }
  }, [classId]);

  const fetchClassData = async () => {
    try {
      const response = await axios.get(`${API_URL}/classes/${classId}`);
      setClassData(response.data);
      
      // Fetch all students from the same school
      if (response.data.schoolId) {
        const studentsRes = await axios.get(`${API_URL}/classes/school/${response.data.schoolId}/students`);
        setAllStudents(studentsRes.data);
      }
    } catch (error) {
      console.error('Error fetching class data:', error);
      toast({
        title: "Error",
        description: "Failed to load class data",
        variant: "destructive",
      });
    }
  };

  const handleAddStudent = async () => {
    if (!studentToAdd) {
      toast({
        title: "Error",
        description: "Please select a student",
        variant: "destructive",
      });
      return;
    }

    try {
      await axios.post(`${API_URL}/classes/${classId}/students`, {
        studentId: studentToAdd
      });

      toast({
        title: "Success",
        description: "Student added to class",
      });

      setStudentToAdd('');
      fetchClassData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to add student",
        variant: "destructive",
      });
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (!confirm('Are you sure you want to remove this student from the class?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/classes/${classId}/students/${studentId}`);

      toast({
        title: "Success",
        description: "Student removed from class",
      });

      fetchClassData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to remove student",
        variant: "destructive",
      });
    }
  };

  // Filter available students
  const availableStudents = allStudents.filter(student => {
    // Not already in class
    if (classData?.students?.includes(student.studentId)) return false;
    
    // Class filter
    if (classFilter && classFilter !== 'all' && student.class !== classFilter) return false;
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        student.name.toLowerCase().includes(query) ||
        student.studentId.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  // Get enrolled students with details
  const enrolledStudents = classData?.studentDetails || [];

  // Get unique class numbers from all students for filter
  const availableClasses = Array.from(new Set(allStudents.map(s => s.class))).sort();

  if (!classData) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p>Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 py-8 bg-gray-50">
        <div className="edu-container">
          {/* Header */}
          <div className="mb-8 flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/teacher/manage-classes')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Classes
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Class {classData.className} - {classData.subject}
              </h1>
              <p className="text-gray-600">Manage student enrollment</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Add Students */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PlusCircle className="h-5 w-5" />
                  Add Students
                </CardTitle>
                <CardDescription>
                  {availableStudents.length} students available to add
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filters */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="classFilter">Filter by Class</Label>
                    <Select value={classFilter} onValueChange={setClassFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All classes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All classes</SelectItem>
                        {availableClasses.map((cls) => (
                          <SelectItem key={cls} value={cls}>
                            Class {cls}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="search">Search Student</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="search"
                        placeholder="Name or ID"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                </div>

                {/* Student Selection */}
                <div className="space-y-2">
                  <Label htmlFor="student">Select Student</Label>
                  <Select value={studentToAdd} onValueChange={setStudentToAdd}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a student" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {availableStudents.length === 0 ? (
                        <div className="p-2 text-sm text-gray-500">
                          No students available
                        </div>
                      ) : (
                        availableStudents.map((student) => (
                          <SelectItem key={student.studentId} value={student.studentId}>
                            {student.name} ({student.studentId}) - Class {student.class}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleAddStudent} 
                  className="w-full"
                  disabled={!studentToAdd}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Student
                </Button>
              </CardContent>
            </Card>

            {/* Enrolled Students */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Enrolled Students ({enrolledStudents.length})
                </CardTitle>
                <CardDescription>
                  Students currently in this class
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {enrolledStudents.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                      <p className="text-gray-500">No students enrolled yet</p>
                      <p className="text-sm text-gray-400">Add students from the left panel</p>
                    </div>
                  ) : (
                    enrolledStudents.map((student) => (
                      <div
                        key={student.studentId}
                        className="p-3 bg-gray-50 rounded border flex justify-between items-center hover:bg-gray-100 transition-colors"
                      >
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-gray-600">
                            ID: {student.studentId} | Class: {student.class}
                          </p>
                          {student.phone && (
                            <p className="text-xs text-gray-500">Phone: {student.phone}</p>
                          )}
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveStudent(student.studentId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ClassStudents;
