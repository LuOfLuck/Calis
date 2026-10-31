import React from 'react';
import { Play, Pause } from 'lucide-react';

interface FloatingNavProps {
  onNavigate: (sectionId: string) => void;
  isPitchActive: boolean;
  onTogglePitch: () => void;
}

export const FloatingNav: React.FC<FloatingNavProps> = ({
  onNavigate,
  isPitchActive,
  onTogglePitch
}) => {
  return (
    <header className="fixed top-5 left-0 right-0 z-50 px-4 flex justify-center pointer-events-none">
      <nav className="pointer-events-auto bento-card rounded-full px-3.5 sm:px-6 py-2.5 flex items-center gap-3 sm:gap-7 shadow-2xl border border-white/15 bg-[#02070e]/85 backdrop-blur-xl">
        {/* Brand Identity */}
        <a
          href="#hero"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('hero');
          }}
          className="flex items-center gap-2.5 pr-2 group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#00f2fe] to-[#00ffaa] p-[1.5px] transition-transform duration-300 group-hover:scale-105">
            <div className="w-full h-full bg-[#02070e] rounded-full flex items-center justify-center">
              {/* Custom SVG Ladder + Wave Icon */}
              <svg className="w-5 h-5" viewBox="0 0 64 64" fill="none">
                <path
                  d="M22 44V14C22 10.5 25 8 28 8C31 8 34 10.5 34 14"
                  stroke="#00f2fe"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                <path
                  d="M36 44V14C36 10.5 39 8 42 8C45 8 48 10.5 48 14"
                  stroke="#00ffaa"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                <line x1="22" y1="24" x2="36" y2="24" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
                <line x1="22" y1="33" x2="36" y2="33" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
                <path
                  d="M8 46C15 40 21 40 28 46C35 52 41 52 48 46C52 42 55 42 58 46"
                  stroke="#00f2fe"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
          <div className="leading-none text-left">
            <span className="font-['Syne'] font-extrabold text-sm sm:text-base tracking-wider text-white block">
              CALISPONYO
            </span>
            <span className="font-mono text-[9px] text-[#00f2fe] uppercase tracking-widest">
              Tech.Emerge // 2026
            </span>
          </div>
        </a>

        {/* Navigation Links */}
        <div className="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-300 uppercase tracking-widest">
          <a
            href="#gemelo-3d"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('gemelo-3d');
            }}
            className="hover:text-[#00f2fe] transition-colors cursor-pointer"
          >
            Gemelo 3D
          </a>
          <a
            href="#bisociacion"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('bisociacion');
            }}
            className="hover:text-[#00f2fe] transition-colors cursor-pointer"
          >
            Fusión Mental
          </a>
          <a
            href="#bento-origen"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('bento-origen');
            }}
            className="hover:text-[#00f2fe] transition-colors cursor-pointer"
          >
            El Origen
          </a>
          <a
            href="#protocolos"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('protocolos');
            }}
            className="hover:text-[#00f2fe] transition-colors cursor-pointer"
          >
            Calistenia Aqua
          </a>
          <a
            href="#equipo"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('equipo');
            }}
            className="hover:text-[#00f2fe] transition-colors cursor-pointer"
          >
            Tres Generaciones
          </a>
        </div>

        {/* Action CTA: Video Pitch 30s */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onTogglePitch}
            className={`relative pulse-ring px-4 py-2 rounded-full font-['Syne'] font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg cursor-pointer ${
              isPitchActive
                ? 'bg-[#fbbf24] text-[#02070e] shadow-[#fbbf24]/30'
                : 'bg-gradient-to-r from-[#00f2fe] to-[#00ffaa] text-[#02070e] hover:brightness-110 shadow-[#00f2fe]/20'
            }`}
          >
            {isPitchActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPitchActive ? 'Pausar Pitch' : 'Pitch 30s'}</span>
          </button>
        </div>
      </nav>
    </header>
  );
};
