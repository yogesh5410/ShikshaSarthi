import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [currentUserRole, setCurrentUserRole] = useState<string>('');
  const [currentUsername, setCurrentUsername] = useState<string>('');
  const [currentUserSchoolId, setCurrentUserSchoolId] = useState<string>('');
  const [roleToRegister, setRoleToRegister] = useState<string>('');
  const [formData, setFormData] = useState<any>({});
  const [schools, setSchools] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Get current user role
    const role = localStorage.getItem('userRole');
    const currentUser = localStorage.getItem('currentUser');
    
    if (!role) {
      toast({
        title: "Access Denied",
        description: "Please login first",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    if (role === 'student') {
      toast({
        title: "Access Denied",
        description: "Students cannot register other users",
        variant: "destructive",
      });
      navigate('/student');
      return;
    }

    setCurrentUserRole(role);

    if (currentUser) {
      try {
        const user = JSON.parse(currentUser);
        setCurrentUsername(user.username || user.teacherId || '');
        setCurrentUserSchoolId(user.schoolId || '');
        
        // If teacher or schooladmin, set default role
        if (role === 'teacher') {
          setRoleToRegister('student');
        }
      } catch (e) {
        console.error('Error parsing user', e);
      }
    }

    // Fetch schools for superadmin
    if (role === 'superadmin') {
      fetchSchools();
    }
  }, [navigate]);

  const fetchSchools = async () => {
    try {
      const response = await axios.get(`${API_URL}/superadmin/schools`);
      setSchools(response.data);
    } catch (error) {
      console.error('Error fetching schools:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let endpoint = '';
      let payload: any = { ...formData };

      // Add creator info and schoolId based on current user role
      if (currentUserRole === 'teacher') {
        payload.teacherId = currentUsername;
        payload.schoolId = currentUserSchoolId; // Auto-assign teacher's school
        endpoint = `${API_URL}/teachers/register/student`;
      } else if (currentUserRole === 'schooladmin') {
        payload.adminUsername = currentUsername;
        payload.schoolId = currentUserSchoolId; // Auto-assign school admin's school
        if (roleToRegister === 'teacher') {
          endpoint = `${API_URL}/schooladmin/register/teacher`;
        } else if (roleToRegister === 'student') {
          endpoint = `${API_URL}/schooladmin/register/student`;
        }
      } else if (currentUserRole === 'superadmin') {
        if (roleToRegister === 'school') {
          endpoint = `${API_URL}/superadmin/register/school`;
        } else if (roleToRegister === 'schooladmin') {
          endpoint = `${API_URL}/superadmin/register/schooladmin`;
        } else if (roleToRegister === 'teacher') {
          endpoint = `${API_URL}/superadmin/register/teacher`;
        } else if (roleToRegister === 'student') {
          endpoint = `${API_URL}/superadmin/register/student`;
        }
      }

      const response = await axios.post(endpoint, payload);

      toast({
        title: "Success",
        description: `${roleToRegister} registered successfully`,
      });

      // Reset form
      setFormData({});
      setRoleToRegister('');
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.response?.data?.error || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderFields = () => {
    if (!roleToRegister) return null;

    const commonFields = (
      <>
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="Enter name"
            value={formData.name || ''}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
          />
        </div>
      </>
    );

    switch (roleToRegister) {
      case 'school':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="schoolId">School ID</Label>
              <Input
                id="schoolId"
                type="text"
                placeholder="Enter school ID"
                value={formData.schoolId || ''}
                onChange={(e) => handleInputChange('schoolId', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="schoolName">School Name</Label>
              <Input
                id="schoolName"
                type="text"
                placeholder="Enter school name"
                value={formData.schoolName || ''}
                onChange={(e) => handleInputChange('schoolName', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                type="text"
                placeholder="Enter location"
                value={formData.location || ''}
                onChange={(e) => handleInputChange('location', e.target.value)}
                required
              />
            </div>
          </>
        );

      case 'schooladmin':
      case 'teacher':
      case 'student':
        const isSchoolAdmin = roleToRegister === 'schooladmin';
        const isTeacher = roleToRegister === 'teacher';
        const isStudent = roleToRegister === 'student';
        
        return (
          <>
            {commonFields}
            
            {/* School selection for school admin registration */}
            {isSchoolAdmin && currentUserRole === 'superadmin' && (
              <div className="space-y-2">
                <Label htmlFor="schoolId">School</Label>
                <Select
                  value={formData.schoolId || ''}
                  onValueChange={(value) => handleInputChange('schoolId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select school" />
                  </SelectTrigger>
                  <SelectContent>
                    {schools.map((school) => (
                      <SelectItem key={school.schoolId} value={school.schoolId}>
                        {school.schoolName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="username">
                {isStudent ? 'Student ID' : isTeacher ? 'Teacher ID' : 'Username'}
              </Label>
              <Input
                id="username"
                type="text"
                placeholder={`Enter ${isStudent ? 'student ID' : isTeacher ? 'teacher ID' : 'username'}`}
                value={formData[isStudent ? 'studentId' : isTeacher ? 'teacherId' : 'username'] || ''}
                onChange={(e) => handleInputChange(
                  isStudent ? 'studentId' : isTeacher ? 'teacherId' : 'username',
                  e.target.value
                )}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={formData.password || ''}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter phone number"
                value={formData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </div>
            
            {/* School selection for teachers and students when super admin registers */}
            {currentUserRole === 'superadmin' && (isTeacher || isStudent) && (
              <div className="space-y-2">
                <Label htmlFor="schoolId">School</Label>
                <Select
                  value={formData.schoolId || ''}
                  onValueChange={(value) => handleInputChange('schoolId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select school" />
                  </SelectTrigger>
                  <SelectContent>
                    {schools.map((school) => (
                      <SelectItem key={school.schoolId} value={school.schoolId}>
                        {school.schoolName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {isStudent && (
              <div className="space-y-2">
                <Label htmlFor="class">Class</Label>
                <Input
                  id="class"
                  type="text"
                  placeholder="Enter class (e.g., 6, 7, 8)"
                  value={formData.class || ''}
                  onChange={(e) => handleInputChange('class', e.target.value)}
                />
              </div>
            )}
          </>
        );

      default:
        return null;
    }
  };

  const getRoleOptions = () => {
    if (currentUserRole === 'superadmin') {
      return ['school', 'schooladmin', 'teacher', 'student'];
    } else if (currentUserRole === 'schooladmin') {
      return ['teacher', 'student'];
    } else if (currentUserRole === 'teacher') {
      return ['student'];
    }
    return [];
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 flex items-center justify-center py-12 bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Register New User</CardTitle>
            <CardDescription className="text-center">
              As a {currentUserRole}, you can register: {getRoleOptions().join(', ')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="roleToRegister">Role to Register</Label>
                <Select value={roleToRegister} onValueChange={setRoleToRegister}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {getRoleOptions().map((role) => (
                      <SelectItem key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {renderFields()}

              {roleToRegister && (
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Registering...' : `Register ${roleToRegister}`}
                </Button>
              )}
            </form>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default Register;
