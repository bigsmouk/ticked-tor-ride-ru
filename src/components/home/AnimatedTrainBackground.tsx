import React from 'react';
import homeBackground from '@/assets/home-background.jpg';

const AnimatedTrainBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Main background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${homeBackground})` }}
      />
      
      {/* Subtle overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/40 to-background/60" />
      
      {/* Decorative corner ornaments */}
      <svg className="absolute top-0 left-0 w-24 h-24 opacity-30" viewBox="0 0 100 100">
        <path d="M0 0 L100 0 L100 10 L10 10 L10 100 L0 100 Z" fill="hsl(43 70% 50%)" />
        <circle cx="20" cy="20" r="8" fill="none" stroke="hsl(43 70% 50%)" strokeWidth="2" />
        <path d="M10 30 Q30 30 30 10" fill="none" stroke="hsl(43 70% 50%)" strokeWidth="2" />
      </svg>
      
      <svg className="absolute top-0 right-0 w-24 h-24 opacity-30 scale-x-[-1]" viewBox="0 0 100 100">
        <path d="M0 0 L100 0 L100 10 L10 10 L10 100 L0 100 Z" fill="hsl(43 70% 50%)" />
        <circle cx="20" cy="20" r="8" fill="none" stroke="hsl(43 70% 50%)" strokeWidth="2" />
        <path d="M10 30 Q30 30 30 10" fill="none" stroke="hsl(43 70% 50%)" strokeWidth="2" />
      </svg>
      
      <svg className="absolute bottom-0 left-0 w-24 h-24 opacity-30 scale-y-[-1]" viewBox="0 0 100 100">
        <path d="M0 0 L100 0 L100 10 L10 10 L10 100 L0 100 Z" fill="hsl(43 70% 50%)" />
        <circle cx="20" cy="20" r="8" fill="none" stroke="hsl(43 70% 50%)" strokeWidth="2" />
        <path d="M10 30 Q30 30 30 10" fill="none" stroke="hsl(43 70% 50%)" strokeWidth="2" />
      </svg>
      
      <svg className="absolute bottom-0 right-0 w-24 h-24 opacity-30 scale-[-1]" viewBox="0 0 100 100">
        <path d="M0 0 L100 0 L100 10 L10 10 L10 100 L0 100 Z" fill="hsl(43 70% 50%)" />
        <circle cx="20" cy="20" r="8" fill="none" stroke="hsl(43 70% 50%)" strokeWidth="2" />
        <path d="M10 30 Q30 30 30 10" fill="none" stroke="hsl(43 70% 50%)" strokeWidth="2" />
      </svg>
    </div>
  );
};

export default AnimatedTrainBackground;
