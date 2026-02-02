
import React from 'react';
import { Book, BookText, Calculator, FlaskConical, Users } from 'lucide-react';

interface SubjectIconProps {
  subject: string;
  size?: number;
  className?: string;
}

const SubjectIcon: React.FC<SubjectIconProps> = ({ subject, size = 24, className = '' }) => {
  switch (subject.toLowerCase()) {
    case 'mathematics':
      return <Calculator size={size} className={`text-edu-blue ${className}`} />;
    case 'science':
      return <FlaskConical size={size} className={`text-edu-green ${className}`} />;
    case 'social':
      return <Users size={size} className={`text-edu-purple ${className}`} />;
    case 'mat':
      return <BookText size={size} className={`text-edu-yellow ${className}`} />;
    default:
      return <Book size={size} className={`text-gray-500 ${className}`} />;
  }
};

export default SubjectIcon;
