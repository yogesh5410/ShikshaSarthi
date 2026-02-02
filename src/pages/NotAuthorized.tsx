
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ShieldAlert } from 'lucide-react';
const API_URL = import.meta.env.VITE_API_URL;
const NotAuthorized: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="text-center">
          <ShieldAlert className="h-24 w-24 text-red-500 mx-auto mb-6" />
          <h1 className="text-4xl font-bold mb-3">Access Denied</h1>
          <p className="text-xl text-gray-600 mb-6">
            You do not have permission to view this page.
          </p>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Please log in with the appropriate account type to access this content.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button size="lg">
                Log In
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" size="lg">
                Go to Home
              </Button>
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default NotAuthorized;
