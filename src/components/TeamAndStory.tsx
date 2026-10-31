import React from 'react';
import { Quote } from 'lucide-react';

export const TeamAndStory: React.FC = () => {
  return (
    <div className="space-y-16 sm:space-y-20 w-full min-w-0">
      {/* ================= BENTO GRID: EL ORIGEN Y LA MISIÓN ================= */}
      <div id="bento-origen" className="space-y-8 sm:space-y-12 w-full min-w-0">
        <div className="min-w-0 reveal-left">
          <span className="font-mono text-xs text-[#0891b2] font-semibold uppercase tracking-widest">
            IMPACTO HUMANO Y SOCIAL
          </span>
          <h2 className="font-['Syne'] font-extrabold text-2xl sm:text-4xl md:text-5xl text-slate-900 mt-2">
            De una Necesidad Familiar a una <span className="text-liquid-gradient">Revolución Inclusiva</span>
          </h2>
        </div>

        {/* Asymmetric Bento Architecture */}
        <div className="grid lg:grid-cols-12 gap-6 w-full min-w-0">
          {/* Card 1: El Origen Real (7 Cols) */}
          <div className="lg:col-span-7 bento-card rounded-3xl p-5 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6 w-full min-w-0 bg-white border border-slate-200/90 shadow-sm reveal-left delay-100">
            <div className="space-y-4">
              <h3 className="font-['Syne'] font-bold text-xl sm:text-3xl lg:text-4xl text-slate-900 leading-tight">
                Una niña con desafíos neurológicos y la barrera del primer escalón.
              </h3>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-['Plus_Jakarta_Sans']">
                El proyecto nace de una problemática familiar concreta: las escaleras convencionales de las piletas impedían el ingreso autónomo. Identificamos el agua como el medio ideal para su terapia gracias a la <strong className="text-slate-900">relajación muscular</strong> y la <strong className="text-slate-900">reducción de impacto</strong>, pero el acceso seguro seguía siendo el obstáculo principal.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200 w-full min-w-0">
              <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200/60 w-full min-w-0">
                <span className="font-mono text-xs text-rose-600 font-semibold block mb-1">ANTES (BARRERA)</span>
                <p className="text-xs text-slate-600 font-['Plus_Jakarta_Sans']">
                  Dependencia física total de terceros, riesgo de resbalones en escaleras verticales y pérdida de autonomía.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-sky-50/80 border border-sky-200/80 w-full min-w-0">
                <span className="font-mono text-xs text-[#0891b2] font-semibold block mb-1">AHORA (CALISPONYO)</span>
                <p className="text-xs text-slate-700 font-['Plus_Jakarta_Sans']">
                  Ingreso sentado, suave y controlado que se transforma en un gimnasio acuático personalizado.
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Filosofía & Eslogan (5 Cols) */}
          <div className="lg:col-span-5 bento-card rounded-3xl p-5 sm:p-8 lg:p-10 flex flex-col justify-between bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 border border-slate-700 text-white w-full min-w-0 shadow-lg reveal-right delay-150">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-[#00ffaa] uppercase tracking-widest font-semibold">
                NUESTRA FILOSOFÍA
              </span>
              <Quote className="w-8 h-8 text-white/20" />
            </div>

            <div className="my-auto py-6 space-y-4">
              <p className="font-['Syne'] font-extrabold text-xl sm:text-2xl lg:text-4xl text-white leading-tight">
                «No solo creamos equipos; creamos puentes hacia una mejor calidad de vida.»
              </p>
              <p className="font-mono text-sm text-[#00f2fe]">
                — Ciencia que impulsa tu salud.
              </p>
            </div>
          </div>

          {/* Card 3: Silla + Plataforma (4 Cols) */}
          <div className="lg:col-span-4 bento-card rounded-3xl p-5 sm:p-7 space-y-3 w-full min-w-0 bg-white border border-slate-200/90 shadow-sm reveal-up delay-75">
            <h4 className="font-['Syne'] font-bold text-lg sm:text-xl text-slate-900">Silla + Plataforma Sumergible</h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-['Plus_Jakarta_Sans']">
              Integración estructural sin costuras: la silla acompaña al usuario desde el borde seco hasta la profundidad terapéutica seleccionada.
            </p>
          </div>

          {/* Card 4: Escalera Automática (4 Cols) */}
          <div className="lg:col-span-4 bento-card rounded-3xl p-5 sm:p-7 space-y-3 w-full min-w-0 bg-white border border-slate-200/90 shadow-sm reveal-up delay-150">
            <h4 className="font-['Syne'] font-bold text-lg sm:text-xl text-slate-900">Sistema de Escalera Automática</h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-['Plus_Jakarta_Sans']">
              Peldaños inteligentes que se articulan durante el descenso y ascenso, permitiendo también el uso peatonal asistido con barandas.
            </p>
          </div>

          {/* Card 5: Calistenia Acuática Inclusiva (4 Cols) */}
          <div className="lg:col-span-4 bento-card rounded-3xl p-5 sm:p-7 space-y-3 w-full min-w-0 bg-white border border-slate-200/90 shadow-sm reveal-up delay-250">
            <h4 className="font-['Syne'] font-bold text-lg sm:text-xl text-slate-900">Calistenia Acuática Inclusiva</h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-['Plus_Jakarta_Sans']">
              Primera línea de barras, paralelas y agarres sumergibles adaptados según las capacidades motrices únicas de cada persona.
            </p>
          </div>
        </div>
      </div>

      {/* ================= EQUIPO "GRUPO TRES GENERACIONES" ================= */}
      <div id="equipo" className="pt-10 border-t border-slate-200 w-full min-w-0">
        <div className="space-y-8 w-full min-w-0">
          <div className="reveal-left">
            <span className="font-mono text-xs text-[#0891b2] font-semibold uppercase tracking-widest">
              FICHA TÉCNICA CONCEPTUAL // INTEGRANTES
            </span>
            <h2 className="font-['Syne'] font-extrabold text-2xl sm:text-4xl md:text-5xl text-slate-900 mt-2">
              GRUPO TRES GENERACIONES
            </h2>
            <p className="text-slate-500 text-sm mt-1 font-['Plus_Jakarta_Sans']">
              Taller IHeCSI 2026 Edición Especial — Práctica de Bisociación Creativa.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 w-full min-w-0">
            {/* 1. Lucas */}
            <div className="bento-card rounded-2xl p-6 border border-slate-200 bg-white shadow-sm flex flex-col items-center text-center reveal-up delay-75">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 border-amber-200 shadow-md mb-4 bg-slate-100">
                <img
                  src="/assets/aistudio/20260924_140106_3cb0fd9a.jpg"
                  alt="Lucas Guerrero"
                  className="w-full h-full object-cover object-[center_20%]"
                />
              </div>
              <h3 className="font-['Syne'] font-bold text-lg text-slate-900">Lucas Guerrero</h3>
            </div>

            {/* 2. Adri */}
            <div className="bento-card rounded-2xl p-6 border border-slate-200 bg-white shadow-sm flex flex-col items-center text-center reveal-up delay-150">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 border-sky-200 shadow-md mb-4 bg-slate-100">
                <img
                  src="/assets/aistudio/IMG-20261030-WA0008_dcd26f57.jpg"
                  alt="Adriana Antonuccio"
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <h3 className="font-['Syne'] font-bold text-lg text-slate-900">Adriana Antonuccio</h3>
            </div>

            {/* 3. Ana */}
            <div className="bento-card rounded-2xl p-6 border border-slate-200 bg-white shadow-sm flex flex-col items-center text-center reveal-up delay-250">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 border-emerald-200 shadow-md mb-4 bg-slate-100">
                <img
                  src="/assets/aistudio/IMG-20261029-WA0133_1d496b55.jpg"
                  alt="Ana Laura López Ado"
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <h3 className="font-['Syne'] font-bold text-lg text-slate-900">Ana Laura López Ado</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
