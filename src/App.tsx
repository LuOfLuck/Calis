import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { DigitalTwin3D } from './components/DigitalTwin3D';
import { BisociacionLab } from './components/BisociacionLab';
import { WorkoutProtocols } from './components/WorkoutProtocols';
import { TeamAndStory } from './components/TeamAndStory';
import { WaterCausticsCanvas } from './components/WaterCausticsCanvas';
import { useScrollReveal } from './hooks/useScrollReveal';

export default function App() {
  useScrollReveal();

  const [immersion3D, setImmersion3D] = useState<number>(0);
  const [cameraPreset3D] = useState<'iso' | 'side' | 'front'>('iso');

  // Smooth scroll to section
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth' });
  };

  // Mouse Spotlight tracking for Bento Cards and Caustic Background (rAF-batched, zero layout thrashing)
  useEffect(() => {
    let rafId = 0;
    let latestX = 0;
    let latestY = 0;
    let hoveredCard: HTMLElement | null = null;

    const updateSpotlight = () => {
      rafId = 0;
      document.documentElement.style.setProperty('--mouse-x', `${latestX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${latestY}px`);

      if (hoveredCard) {
        const rect = hoveredCard.getBoundingClientRect();
        hoveredCard.style.setProperty('--card-x', `${latestX - rect.left}px`);
        hoveredCard.style.setProperty('--card-y', `${latestY - rect.top}px`);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      latestX = e.clientX;
      latestY = e.clientY;
      const target = e.target as HTMLElement | null;
      hoveredCard = target?.closest ? target.closest<HTMLElement>('.bento-card') : null;

      if (!rafId) {
        rafId = requestAnimationFrame(updateSpotlight);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="caustic-bg min-h-screen text-slate-900 relative selection:bg-[#00f2fe] selection:text-slate-900 w-full max-w-full">
      {/* Ambient Water Caustics & Bubbles Canvas */}
      <WaterCausticsCanvas />

      {/* =========================================================================
          NIVEL 01: HERO SECTION - EXACT REPLICA OF REFERENCE MOCKUP
          ========================================================================= */}
      <section id="hero" className="relative min-h-screen w-full flex flex-col justify-center z-10 py-12 sm:py-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full min-w-0 my-auto">
          <div className="max-w-4xl w-full min-w-0 reveal-left">
            {/* Top Logo: Grupo Tres Generaciones */}
            <div className="mb-6 sm:mb-8">
              <img
                src="/assets/aistudio/image_9482af03.png"
                alt="Grupo Tres Generaciones"
                className="h-16 sm:h-20 md:h-24 w-auto object-contain drop-shadow-sm select-none"
              />
            </div>

            {/* Massive Editorial Typography */}
            <h1 className="font-['Syne'] font-extrabold text-[2.1rem] min-[400px]:text-[2.6rem] sm:text-6xl md:text-7xl lg:text-8xl tracking-tight leading-[0.95] text-[#0a0f1d] mb-6 sm:mb-8 break-words">
              CIENCIA <br />
              QUE IMPULSA <br />
              <span className="text-[#00f2fe] drop-shadow-[0_2px_18px_rgba(0,242,254,0.35)]">TU SALUD.</span>
            </h1>

            {/* Description */}
            <p className="text-slate-600 text-base sm:text-lg md:text-xl max-w-2xl font-normal leading-relaxed font-['Plus_Jakarta_Sans'] mb-8 sm:mb-10">
              Combinamos la experiencia de <strong className="text-slate-900 font-bold">tres generaciones</strong> con la <strong className="text-slate-900 font-bold">innovación científica</strong> para acercar soluciones que mejoran tu bienestar, hoy y en el futuro.
            </p>

            {/* Action CTA Button */}
            <div>
              <button
                type="button"
                onClick={() => scrollToSection('gemelo-3d')}
                className="group px-7 py-3.5 rounded-2xl bg-white border border-slate-300 hover:border-[#00d4ea] text-slate-900 hover:text-[#0891b2] font-['Syne'] font-bold text-xs sm:text-sm tracking-wider uppercase transition-all inline-flex items-center gap-3 cursor-pointer"
              >
                <span>CONOCÉ NUESTRO TRABAJO</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          NIVEL 02: GEMELO DIGITAL 3D (DESCENTRO HIDROMECÁNICO - 0.45m)
          ========================================================================= */}
      <section id="gemelo-3d" className="relative min-h-screen w-full flex flex-col justify-center py-16 sm:py-20 z-10 border-t border-slate-200/80 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full min-w-0 my-auto">
          <div className="mb-10 reveal-left">
            <h2 className="font-['Syne'] font-extrabold text-3xl sm:text-5xl text-slate-900">
              Gemelo Digital 3D: <span className="text-liquid-gradient">«Escalera al Cielo»</span>
            </h2>
          </div>

          <div className="reveal-up delay-150">
            <DigitalTwin3D
              immersion={immersion3D}
              onImmersionChange={setImmersion3D}
              externalCameraAngle={cameraPreset3D}
            />
          </div>
        </div>
      </section>

      {/* =========================================================================
          NIVEL 03: MOTOR DE BISOCIACIÓN CREATIVA (-0.75m)
          ========================================================================= */}
      <section id="bisociacion" className="relative min-h-screen w-full flex flex-col justify-center py-16 sm:py-20 z-10 border-t border-slate-200/80 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full min-w-0 my-auto">
          <div className="text-center max-w-3xl mx-auto mb-14 reveal-up">
            <h2 className="font-['Syne'] font-extrabold text-2xl sm:text-4xl md:text-5xl text-slate-900">
              Motor de <span className="text-liquid-gradient">Bisociación Creativa</span>
            </h2>
            <p className="text-slate-600 mt-3 text-sm sm:text-base font-['Plus_Jakarta_Sans']">
              La bisociación consiste en conectar marcos de referencia independientes para crear una solución disruptiva. Seleccioná cada nodo para ver cómo se fusionan en <strong>CALISPONYO</strong>.
            </p>
          </div>

          <BisociacionLab />
        </div>
      </section>

      {/* =========================================================================
          NIVEL 04: PROTOCOLOS DE CALISTENIA ACUÁTICA (-1.00m)
          ========================================================================= */}
      <section id="protocolos" className="relative min-h-screen w-full flex flex-col justify-center py-16 sm:py-20 z-10 border-t border-slate-200/80 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full min-w-0 my-auto">
          <WorkoutProtocols />
        </div>
      </section>

      {/* =========================================================================
          NIVEL 05: EL ORIGEN REAL & EQUIPO TRES GENERACIONES (-1.20m)
          ========================================================================= */}
      <section id="equipo-historia" className="relative min-h-screen w-full flex flex-col justify-center py-16 sm:py-20 z-10 border-t border-slate-200/80 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full min-w-0 my-auto">
          <TeamAndStory />
        </div>
      </section>

      {/* Footer minimalista */}
      <footer className="py-8 border-t border-slate-200/80 text-center font-mono text-xs text-slate-500 relative z-10 w-full max-w-full overflow-hidden reveal-up bg-white/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 w-full min-w-0 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            CALISPONYO © 2026 — Grupo Tres Generaciones (IHeCSI Edición Especial).
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Ciencia que Impulsa tu Salud</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
