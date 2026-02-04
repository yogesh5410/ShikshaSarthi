
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Home,
  BookOpen, 
  LogOut,
  UserPlus,
  Upload,
  User,
  LayoutDashboard
} from 'lucide-react';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    // Check for logged in user
    const role = localStorage.getItem('userRole');
    const currentUser = localStorage.getItem('currentUser');
    
    if (role) {
      setUserRole(role);
    }
    
    if (currentUser) {
      try {
        const user = JSON.parse(currentUser);
        setUserName(user.name || user.username || '');
      } catch (e) {
        console.error('Error parsing user data', e);
      }
    }
  }, []);

  const handleLogout = () => {
    // Clear all storage
    localStorage.removeItem('userRole');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('student');
    localStorage.removeItem('schooladmin');
    localStorage.removeItem('superadmin');
    localStorage.clear();
    
    // Clear cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    setUserRole(null);
    setUserName('');
    navigate('/login');
  };

  const getDashboardPath = () => {
    switch(userRole) {
      case 'superadmin': return '/superadmin';
      case 'schooladmin': return '/schooladmin';
      case 'teacher': return '/teacher';
      case 'student': return '/student';
      default: return '/';
    }
  };

  return (
    <header className="bg-white shadow">
      <div className="edu-container py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link to="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-edu-blue" />
            <span className="text-2xl font-bold text-edu-blue">NMMS Prep</span>
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
          {userRole ? (
            <>
              {/* Show Dashboard and Profile buttons for teachers */}
              {userRole === 'teacher' && (
                <>
                  <Link to="/teacher">
                    <Button variant="ghost" size="sm">
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                  <Link to="/teacher/profile">
                    <Button variant="ghost" size="sm">
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Button>
                  </Link>
                </>
              )}

              {/* Show Register button for admins and teachers */}
              {(userRole === 'superadmin' || userRole === 'schooladmin' || userRole === 'teacher') && (
                <Link to="/register">
                  <Button variant="ghost" size="sm">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Register
                  </Button>
                </Link>
              )}

              
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </>
          ) : (
            <div className="flex space-x-2">
              <Link to="/login">
                <Button size="sm">Login</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
