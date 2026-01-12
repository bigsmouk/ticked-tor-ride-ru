/**
 * SVG-based Europe Map for Railway Adventure
 * Hand-drawn style map with stylized land masses, seas, and borders
 */
import React from 'react';

interface EuropeMapSVGProps {
  className?: string;
}

export const EuropeMapSVG: React.FC<EuropeMapSVGProps> = ({ className }) => {
  return (
    <g className={className}>
      {/* Ocean/Sea background */}
      <rect x="0" y="0" width="1920" height="1080" fill="#b8d4e3" />
      
      {/* Mediterranean Sea - darker */}
      <ellipse cx="750" cy="750" rx="500" ry="200" fill="#9ec5d9" opacity="0.7" />
      
      {/* Atlantic Ocean pattern */}
      <ellipse cx="100" cy="500" rx="200" ry="400" fill="#a5c9db" opacity="0.5" />
      
      {/* North Sea */}
      <path 
        d="M 400 100 Q 500 200 550 150 Q 600 100 650 150 Q 700 200 600 250 Q 500 300 400 200 Z"
        fill="#9ec5d9"
        opacity="0.6"
      />
      
      {/* Baltic Sea */}
      <path
        d="M 650 80 Q 750 120 850 100 Q 950 80 1000 150 Q 1050 220 950 200 Q 850 180 750 160 Q 650 140 650 80 Z"
        fill="#8bbad0"
        opacity="0.7"
      />
      
      {/* Black Sea */}
      <ellipse cx="1050" cy="480" rx="180" ry="80" fill="#7ba9c0" opacity="0.8" />
      
      {/* Aegean Sea */}
      <ellipse cx="920" cy="620" rx="60" ry="100" fill="#8bbad0" opacity="0.6" />

      {/* LAND MASSES */}
      
      {/* Scandinavia */}
      <path
        d="M 580 30 Q 650 20 720 40 Q 800 60 850 30 Q 900 0 950 20 
           Q 1000 40 1050 30 Q 1100 50 1100 100 Q 1080 150 1050 120 
           Q 1000 90 950 100 Q 900 110 850 90 Q 800 70 750 90 
           Q 700 110 650 100 Q 600 90 580 60 Z"
        fill="#d4c4a8"
        stroke="#a89880"
        strokeWidth="2"
      />
      
      {/* British Isles */}
      <path
        d="M 280 120 Q 320 100 360 120 Q 400 140 420 180 Q 440 220 400 260 
           Q 360 300 380 340 Q 400 380 360 380 Q 320 380 300 340 
           Q 280 300 260 280 Q 240 260 260 220 Q 280 180 260 140 Z"
        fill="#c9b896"
        stroke="#a89880"
        strokeWidth="2"
      />
      {/* Ireland */}
      <path
        d="M 220 200 Q 260 180 280 220 Q 300 260 280 300 Q 260 340 220 320 
           Q 180 300 180 260 Q 180 220 220 200 Z"
        fill="#c9b896"
        stroke="#a89880"
        strokeWidth="2"
      />
      
      {/* Iberian Peninsula */}
      <path
        d="M 120 450 Q 180 420 280 430 Q 380 440 420 480 Q 460 520 440 580 
           Q 420 640 380 680 Q 340 720 280 720 Q 220 720 160 680 
           Q 100 640 80 580 Q 60 520 80 470 Q 100 440 120 450 Z"
        fill="#d4c4a8"
        stroke="#a89880"
        strokeWidth="2"
      />
      
      {/* France */}
      <path
        d="M 350 320 Q 400 300 450 320 Q 500 340 520 380 Q 540 420 520 460 
           Q 500 500 460 520 Q 420 540 380 520 Q 340 500 320 460 
           Q 300 420 320 380 Q 340 340 350 320 Z"
        fill="#d9cfb8"
        stroke="#a89880"
        strokeWidth="2"
      />
      
      {/* Central Europe (Germany, Poland, etc.) */}
      <path
        d="M 500 240 Q 600 220 700 240 Q 800 260 900 250 Q 1000 240 1050 280 
           Q 1100 320 1080 380 Q 1060 440 1000 420 Q 940 400 880 420 
           Q 820 440 760 420 Q 700 400 640 420 Q 580 440 540 400 
           Q 500 360 500 300 Q 500 260 500 240 Z"
        fill="#d4c4a8"
        stroke="#a89880"
        strokeWidth="2"
      />
      
      {/* Italy */}
      <path
        d="M 560 440 Q 600 420 640 450 Q 680 480 720 520 Q 760 560 740 620 
           Q 720 680 680 720 Q 640 760 600 740 Q 560 720 580 660 
           Q 600 600 580 540 Q 560 480 560 440 Z"
        fill="#d9cfb8"
        stroke="#a89880"
        strokeWidth="2"
      />
      {/* Sicily */}
      <ellipse cx="680" cy="700" rx="50" ry="30" fill="#d9cfb8" stroke="#a89880" strokeWidth="2" />
      
      {/* Balkans */}
      <path
        d="M 740 440 Q 800 420 860 450 Q 920 480 960 520 Q 1000 560 980 620 
           Q 960 680 900 700 Q 840 720 800 680 Q 760 640 760 580 
           Q 760 520 740 480 Q 720 440 740 440 Z"
        fill="#d4c4a8"
        stroke="#a89880"
        strokeWidth="2"
      />
      
      {/* Greece */}
      <path
        d="M 820 620 Q 860 600 900 630 Q 940 660 920 720 Q 900 780 860 780 
           Q 820 780 800 740 Q 780 700 800 660 Q 820 640 820 620 Z"
        fill="#d9cfb8"
        stroke="#a89880"
        strokeWidth="2"
      />
      
      {/* Turkey (Anatolia) */}
      <path
        d="M 960 520 Q 1020 500 1100 520 Q 1180 540 1260 560 Q 1340 580 1380 620 
           Q 1420 660 1380 700 Q 1340 740 1260 720 Q 1180 700 1100 680 
           Q 1020 660 980 620 Q 940 580 960 520 Z"
        fill="#ddd4c0"
        stroke="#a89880"
        strokeWidth="2"
      />
      
      {/* Eastern Europe (Ukraine, Russia) */}
      <path
        d="M 900 200 Q 1000 180 1100 200 Q 1200 220 1300 200 Q 1400 180 1500 220 
           Q 1600 260 1700 240 Q 1800 220 1900 260 Q 1920 280 1920 400 
           Q 1900 500 1800 480 Q 1700 460 1600 480 Q 1500 500 1400 480 
           Q 1300 460 1200 480 Q 1100 500 1050 460 Q 1000 420 960 380 
           Q 920 340 900 280 Q 880 220 900 200 Z"
        fill="#d4c4a8"
        stroke="#a89880"
        strokeWidth="2"
      />
      
      {/* Caucasus */}
      <path
        d="M 1200 480 Q 1280 460 1360 480 Q 1440 500 1480 540 Q 1520 580 1480 620 
           Q 1440 660 1360 640 Q 1280 620 1220 580 Q 1160 540 1200 480 Z"
        fill="#c9b896"
        stroke="#a89880"
        strokeWidth="2"
      />
      
      {/* Decorative elements */}
      
      {/* Compass rose */}
      <g transform="translate(140, 160)">
        <circle cx="0" cy="0" r="50" fill="#f5f0e6" stroke="#8b7355" strokeWidth="2" />
        <circle cx="0" cy="0" r="40" fill="none" stroke="#a89880" strokeWidth="1" />
        {/* N-S-E-W */}
        <path d="M 0 -45 L 5 -10 L 0 0 L -5 -10 Z" fill="#8b7355" />
        <path d="M 0 45 L 5 10 L 0 0 L -5 10 Z" fill="#c9b896" stroke="#8b7355" strokeWidth="0.5" />
        <path d="M 45 0 L 10 5 L 0 0 L 10 -5 Z" fill="#c9b896" stroke="#8b7355" strokeWidth="0.5" />
        <path d="M -45 0 L -10 5 L 0 0 L -10 -5 Z" fill="#c9b896" stroke="#8b7355" strokeWidth="0.5" />
        {/* Diagonal points */}
        <path d="M 32 -32 L 8 -8 L 0 0 L -8 8 L -32 32" fill="none" stroke="#a89880" strokeWidth="1" />
        <path d="M -32 -32 L -8 -8 L 0 0 L 8 8 L 32 32" fill="none" stroke="#a89880" strokeWidth="1" />
        <text x="0" y="-55" textAnchor="middle" fontSize="14" fill="#5c4a32" fontWeight="bold">N</text>
        <text x="0" y="65" textAnchor="middle" fontSize="14" fill="#5c4a32" fontWeight="bold">S</text>
        <text x="60" y="5" textAnchor="middle" fontSize="14" fill="#5c4a32" fontWeight="bold">E</text>
        <text x="-60" y="5" textAnchor="middle" fontSize="14" fill="#5c4a32" fontWeight="bold">W</text>
      </g>
      
      {/* Title cartouche */}
      <g transform="translate(1600, 900)">
        <rect x="-150" y="-60" width="300" height="120" rx="10" fill="#f5f0e6" stroke="#8b7355" strokeWidth="3" />
        <rect x="-140" y="-50" width="280" height="100" rx="8" fill="none" stroke="#c9b896" strokeWidth="1" />
        <text x="0" y="-15" textAnchor="middle" fontSize="20" fill="#5c4a32" fontWeight="bold">
          RAILWAY ADVENTURE
        </text>
        <text x="0" y="15" textAnchor="middle" fontSize="16" fill="#8b7355">
          EUROPE
        </text>
        <text x="0" y="40" textAnchor="middle" fontSize="12" fill="#a89880">
          1920 × 1080
        </text>
      </g>
      
      {/* Scale bar */}
      <g transform="translate(1600, 1020)">
        <rect x="-100" y="-5" width="50" height="10" fill="#5c4a32" />
        <rect x="-50" y="-5" width="50" height="10" fill="#f5f0e6" stroke="#5c4a32" strokeWidth="1" />
        <rect x="0" y="-5" width="50" height="10" fill="#5c4a32" />
        <rect x="50" y="-5" width="50" height="10" fill="#f5f0e6" stroke="#5c4a32" strokeWidth="1" />
        <text x="-100" y="25" textAnchor="start" fontSize="10" fill="#5c4a32">0</text>
        <text x="100" y="25" textAnchor="end" fontSize="10" fill="#5c4a32">500 km</text>
      </g>
      
      {/* Decorative border */}
      <rect 
        x="10" y="10" 
        width="1900" height="1060" 
        fill="none" 
        stroke="#8b7355" 
        strokeWidth="4"
        rx="5"
      />
      <rect 
        x="20" y="20" 
        width="1880" height="1040" 
        fill="none" 
        stroke="#c9b896" 
        strokeWidth="2"
        rx="3"
      />
    </g>
  );
};

export default EuropeMapSVG;
