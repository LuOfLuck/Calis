import React, { useState } from 'react';

interface NodeContent {
  tag: string;
  title: string;
  desc: string;
}

const BISO_DATA: Record<number, NodeContent> = {
  1: {
    tag: 'MARCO MENTAL 01 // CALISTENIA ADAPTADA',
    title: 'Barras y Fuerza Corporal llevadas al Agua',
    desc: 'Tomamos la filosofía de la calistenia —dominar el propio cuerpo mediante barras paralelas y tracciones— y eliminamos la barrera de la gravedad extrema sumergiendo la estación.'
  },
  2: {
    tag: 'MARCO MENTAL 02 // HIDROCINESITERAPIA («PONYO»)',
    title: 'El Agua como Medio de Libertad Neurológica',
    desc: 'Inspirados en la fluidez acuática y la rehabilitación motora, aprovechamos la reducción de impacto y la relajación muscular para transformar la terapia en disfrute.'
  },
  3: {
    tag: 'MARCO MENTAL 03 // ROBÓTICA ASISTIVA',
    title: '«Escalera al Cielo»: El Puente Tecnológico',
    desc: 'Fusionamos una silla ergonómica con una plataforma sumergible y escalera automática, logrando que el ingreso y egreso del agua sea 100% seguro, suave y autónomo.'
  }
};

const FUSION_ALL: NodeContent = {
  tag: 'SÍNTESIS FINAL // BISOCIACIÓN COMPLETA',
  title: 'CALISPONYO: Tecnología que Emerge con Vos',
  desc: 'La unión perfecta entre Calistenia + Agua + Mecatrónica Asistiva. Un ecosistema que devuelve la autonomía y abre las puertas del deporte acuático a todas las capacidades motrices.'
};

export const BisociacionLab: React.FC = () => {
  const [activeNode, setActiveNode] = useState<number | 'all'>('all');

  const currentContent = activeNode === 'all' ? FUSION_ALL : BISO_DATA[activeNode];

  return (
    <div className="space-y-8 w-full min-w-0">
      {/* Interactive 3-Node Reactor */}
      <div className="grid lg:grid-cols-3 gap-6 relative w-full min-w-0">
        {/* Node 1: Calistenia */}
        <div
          onClick={() => setActiveNode(1)}
          className={`bento-card rounded-3xl p-5 sm:p-7 cursor-pointer transition-all w-full min-w-0 reveal-up delay-75 ${
            activeNode === 1 || activeNode === 'all'
              ? 'border-[#00d4ea] ring-2 ring-[#00d4ea]/30 bg-sky-50/50'
              : 'border-slate-200/90 hover:border-slate-300 bg-white'
          }`}
        >
          <span className="font-mono text-xs font-semibold text-[#0891b2] block mb-2">01 // FUERZA</span>
          <h3 className="font-['Syne'] font-bold text-xl sm:text-2xl text-slate-900 mb-2">Calistenia & Autocarga</h3>
          <p className="text-sm text-slate-600 leading-relaxed font-['Plus_Jakarta_Sans']">
            Entrenamiento mediante barras paralelas, dominadas y anillas que desarrolla el control neuromuscular y la fuerza funcional adaptada a cada cuerpo.
          </p>
        </div>

        {/* Node 2: Medio Acuático / Ponyo */}
        <div
          onClick={() => setActiveNode(2)}
          className={`bento-card rounded-3xl p-5 sm:p-7 cursor-pointer transition-all w-full min-w-0 reveal-up delay-150 ${
            activeNode === 2 || activeNode === 'all'
              ? 'border-emerald-500 ring-2 ring-emerald-500/30 bg-emerald-50/50'
              : 'border-slate-200/90 hover:border-slate-300 bg-white'
          }`}
        >
          <span className="font-mono text-xs font-semibold text-emerald-600 block mb-2">02 // INGRAVIDEZ</span>
          <h3 className="font-['Syne'] font-bold text-xl sm:text-2xl text-slate-900 mb-2">Hidrocinesiterapia</h3>
          <p className="text-sm text-slate-600 leading-relaxed font-['Plus_Jakarta_Sans']">
            El agua como medio liberador: el empuje hidrostático relaja la musculatura, disminuye la espasticidad y elimina el impacto sobre las articulaciones.
          </p>
        </div>

        {/* Node 3: Tecnología Asistiva */}
        <div
          onClick={() => setActiveNode(3)}
          className={`bento-card rounded-3xl p-5 sm:p-7 cursor-pointer transition-all w-full min-w-0 reveal-up delay-250 ${
            activeNode === 3 || activeNode === 'all'
              ? 'border-blue-500 ring-2 ring-blue-500/30 bg-blue-50/50'
              : 'border-slate-200/90 hover:border-slate-300 bg-white'
          }`}
        >
          <span className="font-mono text-xs font-semibold text-blue-600 block mb-2">03 // INGENIERÍA</span>
          <h3 className="font-['Syne'] font-bold text-xl sm:text-2xl text-slate-900 mb-2">Robótica Asistiva</h3>
          <p className="text-sm text-slate-600 leading-relaxed font-['Plus_Jakarta_Sans']">
            Sistemas de elevación e inmersión automatizados que reemplazan las escaleras inaccesibles por una transición suave, segura y autónoma.
          </p>
        </div>
      </div>

      {/* Fusion Result Core Banner */}
      <div className="bento-card rounded-3xl p-5 sm:p-8 border border-[#00d4ea]/40 bg-gradient-to-r from-sky-50/80 via-white to-emerald-50/80 w-full min-w-0 reveal-up delay-300 shadow-sm">
        <div className="grid md:grid-cols-12 gap-6 items-center w-full min-w-0">
          <div className="md:col-span-8 space-y-2 w-full min-w-0">
            <div className="flex items-center gap-2 font-mono text-xs text-[#0891b2] font-semibold">
              <span>{currentContent.tag}</span>
            </div>
            <h4 className="font-['Syne'] font-extrabold text-2xl sm:text-3xl text-slate-900">
              {currentContent.title}
            </h4>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-['Plus_Jakarta_Sans']">
              {currentContent.desc}
            </p>
          </div>
          <div className="md:col-span-4 flex md:justify-end w-full min-w-0">
            <button
              type="button"
              onClick={() => setActiveNode('all')}
              className="w-full md:w-auto px-6 py-4 rounded-2xl bg-gradient-to-r from-[#00d4ea] to-[#22c55e] text-white font-['Syne'] font-bold text-sm uppercase tracking-wider hover:opacity-95 transition shadow-lg shadow-[#00f2fe]/25 cursor-pointer"
            >
              Fusionar los 3 Marcos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
