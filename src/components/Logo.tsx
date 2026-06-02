import React from 'react';
import { useApp } from '../context/AppContext';

interface LogoProps {
  className?: string; // Icon styling
  showText?: boolean;
  textSize?: string;
  light?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ 
  className = "w-8 h-8", 
  showText = true, 
  textSize = "text-xl", 
  light = false 
}) => {
  const { language } = useApp();

  return (
    <div className="flex items-center gap-2.5 select-none font-serif">
      {/* Interlocking Red Reels / Double Loops Icon as uploaded under "metabook" branding */}
      <svg 
        viewBox="0 0 160 100" 
        className={`${className} transition-transform duration-300 hover:scale-[1.03]`}
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Left ring */}
        <circle 
          cx="55" 
          cy="50" 
          r="26" 
          stroke="#e11d48" 
          strokeWidth="9" 
        />
        {/* Right ring */}
        <circle 
          cx="105" 
          cy="50" 
          r="26" 
          stroke="#e11d48" 
          strokeWidth="9" 
        />
        {/* The clever interlocking arc: Re-draw right-top sector of the left ring on top */}
        {/* from coordinates approximately (55, 24) to (81, 50) of the left circle */}
        <path 
          d="M 55 24 A 26 26 0 0 1 81 50" 
          stroke="#e11d48" 
          strokeWidth="9" 
          strokeLinecap="round" 
        />
      </svg>

      {/* Stylized Logo Text */}
      {showText && (
        <span className={`font-serif tracking-tight font-bold ${textSize} ${
          light ? 'text-white' : 'text-slate-900'
        }`}>
          {language === 'ar' ? 'ميتابوك' : 'metabook'}
        </span>
      )}
    </div>
  );
};

export default Logo;
