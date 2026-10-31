import React from 'react';
import { X, Radio } from 'lucide-react';

interface PitchDirectorHUDProps {
  isActive: boolean;
  onClose: () => void;
  seconds: number;
}

export const PITCH_TIMELINE = [
  {
    start: 0,
    end: 7,
    scene: 'ESCENA 1/4 // EL PROBLEMA REAL (00:00 - 00:07)',
    script:
      '"La hidroterapia sana, pero para muchas personas con desafíos motrices, entrar al agua es una barrera imposible."',
    targetSection: 'gemelo-3d',
    camera: 'side' as const,
    immersion: 0
  },
  {
    start: 7,
    end: 15,
    scene: 'ESCENA 2/4 // LA BISOCIACIÓN CREATIVA (00:07 - 00:15)',
    script:
      '"En CALISPONYO unimos la calistenia con la tecnología asistiva para crear inclusión en movimiento."',
    targetSection: 'bisociacion',
    camera: 'iso' as const,
    immersion: 45
  },
  {
    start: 15,
    end: 23,
    scene: 'ESCENA 3/4 // PRODUCTO ESTRELLA: ESCALERA AL CIELO (00:15 - 00:23)',
    script:
      '"Presentamos «Escalera al Cielo»: una plataforma con silla sumergible y escalera automática que devuelve la autonomía."',
    targetSection: 'gemelo-3d',
    camera: 'front' as const,
    immersion: 100
  },
  {
    start: 23,
    end: 30,
    scene: 'ESCENA 4/4 // CIERRE & IMPACTO (00:23 - 00:30)',
    script:
      '"CALISPONYO: tecnología que emerge con vos. Presentado por Grupo Tres Generaciones."',
    targetSection: 'equipo',
    camera: 'iso' as const,
    immersion: 100
  }
];

export const PitchDirectorHUD: React.FC<PitchDirectorHUDProps> = ({
  isActive,
  onClose,
  seconds
}) => {
  if (!isActive) return null;

  const currentStage =
    PITCH_TIMELINE.find((s) => seconds >= s.start && seconds < s.end) || PITCH_TIMELINE[3];

  const progressPct = Math.min(100, (seconds / 30) * 100);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-3xl pointer-events-auto">
      <div className="bento-card rounded-3xl p-5 sm:p-6 border-2 border-[#00d4ea] shadow-2xl shadow-[#00f2fe]/25 bg-white/95 backdrop-blur-2xl space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
            <span className="font-mono text-xs text-[#0891b2] uppercase tracking-widest font-bold flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-red-500" />
              {currentStage.scene}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-sm text-slate-900 bg-slate-100 border border-slate-200 px-3 py-1 rounded-lg">
              00:{String(seconds).padStart(2, '0')} / 00:30
            </span>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Cerrar Pitch"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#00d4ea] via-[#22c55e] to-amber-400 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Teleprompter Script Text */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
          <p className="font-['Syne'] font-bold text-base sm:text-xl text-slate-900 leading-snug">
            {currentStage.script}
          </p>
        </div>
      </div>
    </div>
  );
};
