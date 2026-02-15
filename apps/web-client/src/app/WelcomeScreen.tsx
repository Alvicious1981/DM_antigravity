'use client';
import React, { useState } from 'react';
import Image from 'next/image';

interface WelcomeScreenProps {
  onEnter: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onEnter }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black text-red-700 font-serif">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/welcome-bg.jpg"
          alt="Dark Fantasy Background"
          fill
          style={{ objectFit: 'cover', opacity: 0.6 }}
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-80" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full space-y-12">
        {/* Title / Logo Area */}
        <div className="text-center animate-pulse">
          <h1 className="text-6xl md:text-8xl font-bold tracking-widest text-red-600 drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] border-b-2 border-red-900 pb-4 mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
            ANTIGRAVITY
          </h1>
          <p className="text-xl md:text-2xl text-stone-400 tracking-widest uppercase opacity-80">
            Fate is Suspended
          </p>
        </div>

        {/* Enter Button */}
        <button
          onClick={onEnter}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`
            group relative px-12 py-4 
            border-2 border-red-900 bg-black/80 
            text-red-600 uppercase tracking-[0.2em] font-bold text-xl
            transition-all duration-500 ease-in-out
            hover:border-red-500 hover:text-red-500 hover:bg-black/90
            hover:shadow-[0_0_30px_rgba(220,38,38,0.4)]
          `}
        >
          <span className="relative z-10">Enter Peril</span>

          {/* Hover Glow Effect */}
          <div className={`absolute inset-0 bg-red-900/20 blur-xl transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />

          {/* Corner Accents */}
          <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-red-800 group-hover:border-red-500 transition-colors duration-300" />
          <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-red-800 group-hover:border-red-500 transition-colors duration-300" />
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-red-800 group-hover:border-red-500 transition-colors duration-300" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-red-800 group-hover:border-red-500 transition-colors duration-300" />
        </button>

        {/* Footer Warning */}
        <div className="absolute bottom-10 text-stone-600 text-sm tracking-widest">
          <span className="opacity-50">v6.0.0 // PROTOCOL: OMEGA</span>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
