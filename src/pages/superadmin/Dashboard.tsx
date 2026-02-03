import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { School, Users, GraduationCap, UserCog, PlusCircle } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const SuperAdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    schools: 0,
    teachers: 0,
    students: 0,
    schoolAdmins: 0
  });
  const [schools, setSchools] = useState<any[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<string>('');
  const [schoolTeachers, setSchoolTeachers] = useState<any[]>([]);
  const [schoolStudents, setSchoolStudents] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
    fetchSchools();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/superadmin/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchSchools = async () => {
    try {
      const response = await axios.get(`${API_URL}/superadmin/schools`);
      setSchools(response.data);
    } catch (error) {
      console.error('Error fetching schools:', error);
    }
  };

  const handleSchoolSelect = async (schoolId: string) => {
    setSelectedSchool(schoolId);
    try {
      const [teachersRes, studentsRes] = await Promise.all([
        axios.get(`${API_URL}/superadmin/schools/${schoolId}/teachers`),
        axios.get(`${API_URL}/superadmin/schools/${schoolId}/students`)
      ]);
      setSchoolTeachers(teachersRes.data);
      setSchoolStudents(studentsRes.data);
    } catch (error) {
      console.error('Error fetching school data:', error);
    }
  };

  const statsData = [
    { 
      title: "Total Schools",
      value: stats.schools,
      icon: <School className="h-8 w-8 text-edu-blue" />,
      description: "Registered schools",
    },
    { 
      title: "School Admins", 
      value: stats.schoolAdmins,
      icon: <UserCog className="h-8 w-8 text-edu-purple" />,
      description: "School administrators",
    },
    { 
      title: "Total Teachers", 
      value: stats.teachers,
      icon: <GraduationCap className="h-8 w-8 text-edu-green" />,
      description: "Across all schools",
    },
    { 
      title: "Total Students", 
      value: stats.students,
      icon: <Users className="h-8 w-8 text-edu-yellow" />,
      description: "Enrolled students",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 py-8 bg-gray-50">
        <div className="edu-container">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
            <p className="text-gray-600">Manage all schools, admins, teachers, and students</p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {statsData.map((stat, i) => (
              <Card key={i} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{stat.title}</CardTitle>
                    {stat.icon}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline">
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{stat.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <Card className="border-2 border-edu-blue/20 hover:border-edu-blue/40 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl mb-1">Register New Users</CardTitle>
                    <CardDescription>Add schools, admins, teachers, or students</CardDescription>
                  </div>
                  <PlusCircle className="h-8 w-8 text-edu-blue" />
                </div>
              </CardHeader>
              <CardContent>
                <Link to="/register">
                  <Button className="w-full">Register</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-2 border-edu-purple/20 hover:border-edu-purple/40 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl mb-1">Upload Questions</CardTitle>
                    <CardDescription>Manage question bank for all schools</CardDescription>
                  </div>
                  <School className="h-8 w-8 text-edu-purple" />
                </div>
              </CardHeader>
              <CardContent>
                <Link to="/uploadquestion">
                  <Button variant="outline" className="w-full border-edu-purple text-edu-purple hover:bg-edu-purple/10">
                    Upload Questions
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Schools List */}
          <Card>
            <CardHeader>
              <CardTitle>Schools Overview</CardTitle>
              <CardDescription>View teachers and students by school</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Select School</label>
                  <select
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    value={selectedSchool}
                    onChange={(e) => handleSchoolSelect(e.target.value)}
                  >
                    <option value="">-- Select a school --</option>
                    {schools.map((school) => (
                      <option key={school.schoolId} value={school.schoolId}>
                        {school.schoolName} ({school.location})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedSchool && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Teachers ({schoolTeachers.length})</h3>
                      <div className="space-y-2 max-h-96 overflow-y-auto border rounded p-2">
                        {schoolTeachers.length === 0 ? (
                          <p className="text-gray-500">No teachers found</p>
                        ) : (
                          schoolTeachers.map((teacher) => (
                            <div key={teacher.teacherId} className="p-3 bg-gray-50 rounded">
                              <p className="font-medium">{teacher.name}</p>
                              <p className="text-sm text-gray-600">ID: {teacher.teacherId}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-lg mb-3">Students ({schoolStudents.length})</h3>
                      <div className="space-y-2 max-h-96 overflow-y-auto border rounded p-2">
                        {schoolStudents.length === 0 ? (
                          <p className="text-gray-500">No students found</p>
                        ) : (
                          schoolStudents.map((student) => (
                            <div key={student.studentId} className="p-3 bg-gray-50 rounded">
                              <p className="font-medium">{student.name}</p>
                              <p className="text-sm text-gray-600">ID: {student.studentId} | Class: {student.class}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SuperAdminDashboard;
