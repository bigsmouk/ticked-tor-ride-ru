import React from 'react';

const AnimatedTrainBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Subtle vintage paper texture overlay */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Railway tracks pattern */}
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        <defs>
          <pattern id="tracks" x="0" y="0" width="100" height="20" patternUnits="userSpaceOnUse">
            <line x1="0" y1="4" x2="100" y2="4" stroke="hsl(30 30% 60%)" strokeWidth="2" opacity="0.2"/>
            <line x1="0" y1="16" x2="100" y2="16" stroke="hsl(30 30% 60%)" strokeWidth="2" opacity="0.2"/>
            {/* Sleepers */}
            <line x1="10" y1="0" x2="10" y2="20" stroke="hsl(30 30% 55%)" strokeWidth="3" opacity="0.15"/>
            <line x1="30" y1="0" x2="30" y2="20" stroke="hsl(30 30% 55%)" strokeWidth="3" opacity="0.15"/>
            <line x1="50" y1="0" x2="50" y2="20" stroke="hsl(30 30% 55%)" strokeWidth="3" opacity="0.15"/>
            <line x1="70" y1="0" x2="70" y2="20" stroke="hsl(30 30% 55%)" strokeWidth="3" opacity="0.15"/>
            <line x1="90" y1="0" x2="90" y2="20" stroke="hsl(30 30% 55%)" strokeWidth="3" opacity="0.15"/>
          </pattern>
        </defs>
        
        {/* Diagonal track lines */}
        <g className="animate-tracks-scroll" style={{ transform: 'rotate(-15deg) translateY(-50%)' }}>
          <rect x="-100%" y="0" width="300%" height="300%" fill="url(#tracks)" />
        </g>
      </svg>
      
      {/* Animated train silhouette */}
      <div className="absolute bottom-20 animate-train-move">
        <svg width="200" height="60" viewBox="0 0 200 60" className="opacity-20">
          {/* Locomotive */}
          <rect x="0" y="20" width="60" height="30" rx="5" fill="hsl(24 60% 25%)" />
          <rect x="5" y="10" width="30" height="15" rx="3" fill="hsl(24 60% 25%)" />
          <circle cx="15" cy="50" r="8" fill="hsl(24 60% 30%)" stroke="hsl(43 70% 50%)" strokeWidth="2"/>
          <circle cx="45" cy="50" r="8" fill="hsl(24 60% 30%)" stroke="hsl(43 70% 50%)" strokeWidth="2"/>
          {/* Chimney */}
          <rect x="10" y="2" width="10" height="12" fill="hsl(24 60% 20%)" />
          {/* Steam puffs */}
          <circle cx="15" cy="-5" r="6" fill="hsl(30 20% 70%)" className="animate-steam-1" opacity="0.6"/>
          <circle cx="25" cy="-12" r="8" fill="hsl(30 20% 75%)" className="animate-steam-2" opacity="0.4"/>
          <circle cx="10" cy="-18" r="5" fill="hsl(30 20% 80%)" className="animate-steam-3" opacity="0.3"/>
          
          {/* Wagons */}
          <rect x="70" y="25" width="35" height="25" rx="3" fill="hsl(0 65% 40%)" opacity="0.8"/>
          <circle cx="80" cy="50" r="6" fill="hsl(24 60% 30%)" stroke="hsl(43 70% 50%)" strokeWidth="1.5"/>
          <circle cx="95" cy="50" r="6" fill="hsl(24 60% 30%)" stroke="hsl(43 70% 50%)" strokeWidth="1.5"/>
          
          <rect x="115" y="25" width="35" height="25" rx="3" fill="hsl(210 70% 40%)" opacity="0.8"/>
          <circle cx="125" cy="50" r="6" fill="hsl(24 60% 30%)" stroke="hsl(43 70% 50%)" strokeWidth="1.5"/>
          <circle cx="140" cy="50" r="6" fill="hsl(24 60% 30%)" stroke="hsl(43 70% 50%)" strokeWidth="1.5"/>
          
          <rect x="160" y="25" width="35" height="25" rx="3" fill="hsl(120 50% 35%)" opacity="0.8"/>
          <circle cx="170" cy="50" r="6" fill="hsl(24 60% 30%)" stroke="hsl(43 70% 50%)" strokeWidth="1.5"/>
          <circle cx="185" cy="50" r="6" fill="hsl(24 60% 30%)" stroke="hsl(43 70% 50%)" strokeWidth="1.5"/>
        </svg>
      </div>
      
      {/* Second train going opposite direction */}
      <div className="absolute top-32 animate-train-move-reverse">
        <svg width="150" height="50" viewBox="0 0 150 50" className="opacity-10 scale-75">
          <rect x="0" y="15" width="45" height="25" rx="4" fill="hsl(24 60% 25%)" />
          <rect x="4" y="8" width="22" height="12" rx="2" fill="hsl(24 60% 25%)" />
          <circle cx="12" cy="40" r="6" fill="hsl(24 60% 30%)" />
          <circle cx="35" cy="40" r="6" fill="hsl(24 60% 30%)" />
          
          <rect x="55" y="18" width="28" height="22" rx="2" fill="hsl(48 95% 45%)" opacity="0.7"/>
          <circle cx="63" cy="40" r="5" fill="hsl(24 60% 30%)" />
          <circle cx="75" cy="40" r="5" fill="hsl(24 60% 30%)" />
          
          <rect x="93" y="18" width="28" height="22" rx="2" fill="hsl(330 60% 45%)" opacity="0.7"/>
          <circle cx="101" cy="40" r="5" fill="hsl(24 60% 30%)" />
          <circle cx="113" cy="40" r="5" fill="hsl(24 60% 30%)" />
        </svg>
      </div>
      
      {/* Decorative corner ornaments */}
      <svg className="absolute top-0 left-0 w-32 h-32 opacity-20" viewBox="0 0 100 100">
        <path d="M0 0 L100 0 L100 10 L10 10 L10 100 L0 100 Z" fill="hsl(43 70% 50%)" />
        <circle cx="20" cy="20" r="8" fill="none" stroke="hsl(43 70% 50%)" strokeWidth="2" />
        <path d="M10 30 Q30 30 30 10" fill="none" stroke="hsl(43 70% 50%)" strokeWidth="2" />
      </svg>
      
      <svg className="absolute top-0 right-0 w-32 h-32 opacity-20 scale-x-[-1]" viewBox="0 0 100 100">
        <path d="M0 0 L100 0 L100 10 L10 10 L10 100 L0 100 Z" fill="hsl(43 70% 50%)" />
        <circle cx="20" cy="20" r="8" fill="none" stroke="hsl(43 70% 50%)" strokeWidth="2" />
        <path d="M10 30 Q30 30 30 10" fill="none" stroke="hsl(43 70% 50%)" strokeWidth="2" />
      </svg>
      
      <svg className="absolute bottom-0 left-0 w-32 h-32 opacity-20 scale-y-[-1]" viewBox="0 0 100 100">
        <path d="M0 0 L100 0 L100 10 L10 10 L10 100 L0 100 Z" fill="hsl(43 70% 50%)" />
        <circle cx="20" cy="20" r="8" fill="none" stroke="hsl(43 70% 50%)" strokeWidth="2" />
        <path d="M10 30 Q30 30 30 10" fill="none" stroke="hsl(43 70% 50%)" strokeWidth="2" />
      </svg>
      
      <svg className="absolute bottom-0 right-0 w-32 h-32 opacity-20 scale-[-1]" viewBox="0 0 100 100">
        <path d="M0 0 L100 0 L100 10 L10 10 L10 100 L0 100 Z" fill="hsl(43 70% 50%)" />
        <circle cx="20" cy="20" r="8" fill="none" stroke="hsl(43 70% 50%)" strokeWidth="2" />
        <path d="M10 30 Q30 30 30 10" fill="none" stroke="hsl(43 70% 50%)" strokeWidth="2" />
      </svg>
    </div>
  );
};

export default AnimatedTrainBackground;
