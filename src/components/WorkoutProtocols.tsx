import React, { useState } from 'react';

interface ProtocolItem {
  code: string;
  title: string;
  metric: string;
  desc: string;
}

const PROTOCOLS_DATA: Record<'neuro' | 'movilidad' | 'avanzado', ProtocolItem[]> = {
  neuro: [
    {
      code: 'MOD-N01',
      title: 'Tracción Asistida en Silla Postural',
      metric: '-85% Carga Axial',
      desc: 'El usuario realiza ejercicios de tracción escapular sentado de forma segura en la plataforma sumergida, estimulando el control motor sin riesgo de caída.'
    },
    {
      code: 'MOD-N02',
      title: 'Flotación Neurológica Guiada',
      metric: 'Relajación Muscular',
      desc: 'El soporte ergonómico permite liberar la rigidez y espasticidad en miembros inferiores mientras se sostiene de las barras perimetrales.'
    },
    {
      code: 'MOD-N03',
      title: 'Bipedestación Progresiva en Agua',
      metric: 'Equilibrio Propioceptivo',
      desc: 'Con la plataforma regulada a la altura del pecho, el usuario practica ponerse de pie asistido por las barras paralelas y el empuje hidrostático.'
    }
  ],
  movilidad: [
    {
      code: 'MOD-M01',
      title: 'Fondos en Paralelas Subacuáticas',
      metric: 'Cero Dolor Articular',
      desc: 'Fortalecimiento de tríceps, pectorales y cintura escapular aprovechando la flotabilidad para asistir el ascenso en cada repetición.'
    },
    {
      code: 'MOD-M02',
      title: 'Marcha y Escalón Automatizado',
      metric: 'Reeducación de Marcha',
      desc: 'Uso de los peldaños sumergibles a alturas personalizadas para recuperar patrones de subida y bajada de escaleras sin impacto.'
    },
    {
      code: 'MOD-M03',
      title: 'Remo Hidrodinámico',
      metric: 'Resistencia 360°',
      desc: 'Tracciones horizontales en barra frontal donde el agua actúa como resistencia isocinética natural y segura.'
    }
  ],
  avanzado: [
    {
      code: 'MOD-F01',
      title: 'Dominadas y Suspensión en Pórtico',
      metric: 'Fuerza de Tracción',
      desc: 'El arco superior de la «Escalera al Cielo» permite ejecutar dominadas asistidas por el agua y ejercicios de descompresión vertebral.'
    },
    {
      code: 'MOD-F02',
      title: 'L-Sit y Core en Ingravidez',
      metric: 'Estabilidad Central',
      desc: 'Elevaciones de piernas en barras paralelas venciendo la resistencia viscosa del agua para un trabajo abdominal intenso y seguro.'
    },
    {
      code: 'MOD-F03',
      title: 'Impulso Pliométrico Acuático',
      metric: 'Potencia sin Impacto',
      desc: 'Saltos y empujes controlados desde la plataforma antideslizante con amortiguación total en el aterrizaje.'
    }
  ]
};

export const WorkoutProtocols: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'neuro' | 'movilidad' | 'avanzado'>('neuro');

  const currentItems = PROTOCOLS_DATA[activeTab];

  return (
    <div className="space-y-8 w-full min-w-0">
      {/* Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 w-full min-w-0 reveal-left">
        <div className="min-w-0">
          <span className="font-mono text-xs text-[#0891b2] font-semibold uppercase tracking-widest">
            ENTRENAMIENTO ADAPTATIVO
          </span>
          <h2 className="font-['Syne'] font-extrabold text-2xl sm:text-4xl md:text-5xl text-slate-900 mt-2">
            Estaciones según <span className="text-liquid-gradient">Capacidad Motriz</span>
          </h2>
        </div>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('neuro')}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-['Syne'] font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'neuro'
                ? 'bg-[#00d4ea] text-white border border-[#00d4ea]'
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            01. Asistencia Neurológica
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('movilidad')}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-['Syne'] font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'movilidad'
                ? 'bg-[#00d4ea] text-white border border-[#00d4ea]'
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            02. Movilidad Reducida
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('avanzado')}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-['Syne'] font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'avanzado'
                ? 'bg-[#00d4ea] text-white border border-[#00d4ea]'
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            03. Calistenia Funcional
          </button>
        </div>
      </div>

      {/* Protocol Cards Grid */}
      <div className="grid md:grid-cols-3 gap-6 w-full min-w-0">
        {currentItems.map((item, idx) => (
          <div
            key={item.code}
            className={`bento-card rounded-3xl p-5 sm:p-7 space-y-3 w-full min-w-0 bg-white border border-slate-200/90 shadow-sm reveal-up ${
              idx === 0 ? 'delay-75' : idx === 1 ? 'delay-150' : 'delay-250'
            }`}
          >
            <span className="font-mono text-xs font-semibold text-[#0891b2] block">{item.code}</span>
            <h3 className="font-['Syne'] font-bold text-xl text-slate-900">{item.title}</h3>
            <p className="text-sm text-slate-600 leading-relaxed font-['Plus_Jakarta_Sans']">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
