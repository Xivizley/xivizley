'use client';

import { useState, useEffect, useMemo } from 'react';
import { useI18nStore } from '@/lib/i18n/store';

export function OnboardingTour() {
  const lang = useI18nStore((s) => s.lang);
  const isTr = lang === 'tr';
  const isPt = lang === 'pt';

  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = useMemo(() => [
    {
      title: isTr ? "Servisleri Keşfet" : isPt ? "Descubra Serviços" : "Discover Services",
      description: isTr ? "👈 Buradan servis seç veya sürükle" : isPt ? "👈 Escolha ou arraste serviços daqui" : "👈 Choose or drag services from here",
      emoji: "👈"
    },
    {
      title: isTr ? "Tuvale Ekle" : isPt ? "Adicione ao Canvas" : "Add to Canvas",
      description: isTr ? "🖥️ Servisleri buraya bırak ya da tıklayarak ekle" : isPt ? "🖥️ Solte os serviços aqui ou clique para adicionar" : "🖥️ Drop services here or click to add",
      emoji: "🖥️"
    },
    {
      title: isTr ? "Bağlantıları Kur" : isPt ? "Conecte Serviços" : "Connect Services",
      description: isTr ? "🔗 Servisleri birbirine bağlamak için bir node'dan diğerine sürükle" : isPt ? "🔗 Arraste entre nós para conectar dependências" : "🔗 Drag between nodes to connect dependencies",
      emoji: "🔗"
    },
    {
      title: isTr ? "Dışa Aktar" : isPt ? "Exportar Stack" : "Export Stack",
      description: isTr ? "📄 docker-compose.yml hazır! İndir veya kopyala" : isPt ? "📄 docker-compose.yml pronto! Baixe ou copie" : "📄 docker-compose.yml is ready! Download or copy",
      emoji: "📄"
    }
  ], [isTr, isPt]);

  useEffect(() => {
    const isDone = localStorage.getItem('xivizley_tour_done');
    if (!isDone) {
      setIsOpen(true);
    }
  }, []);

  const handleSkip = () => {
    localStorage.setItem('xivizley_tour_done', '1');
    setIsOpen(false);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSkip();
    }
  };

  if (!isOpen) return null;

  const step = steps[currentStep];
  if (!step) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#090514]/85 backdrop-blur-md flex items-center justify-center pointer-events-auto p-4 animate-in fade-in duration-150">
      <div className="max-w-sm w-full rounded-[2px] border border-[#2B1A42] bg-[#0D0719] p-6 shadow-2xl flex flex-col items-center text-center">
        <div className="mb-4 text-[10px] font-mono font-semibold text-[#C084FC] bg-[#120A21] border border-[#2B1A42] px-2.5 py-1 rounded-[2px] tracking-wider uppercase">
          {isTr ? 'Rehber Adım' : isPt ? 'Passo' : 'Step'} {currentStep + 1}/{steps.length}
        </div>
        <div className="text-5xl mb-4 select-none">{step.emoji}</div>
        <h3
          className="text-lg font-bold text-[#F5F3FF] mb-2"
          style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}
        >
          {step.title}
        </h3>
        <p className="text-xs font-mono text-[#A19BAF] mb-6 leading-relaxed">{step.description}</p>
        <div className="flex gap-3 w-full">
          <button 
            onClick={handleSkip}
            className="flex-1 py-2 rounded-[2px] border border-[#2B1A42] font-mono text-xs text-[#8B7D9E] hover:text-[#F5F3FF] hover:border-[#8B5CF6] transition-colors cursor-pointer"
          >
            {isTr ? 'Atla' : isPt ? 'Pular' : 'Skip'}
          </button>
          <button 
            onClick={handleNext}
            className="flex-1 py-2 rounded-[2px] bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-mono text-xs font-bold transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)] active:scale-95 cursor-pointer"
          >
            {currentStep === steps.length - 1
              ? (isTr ? 'Tuvali Başlat!' : isPt ? 'Começar!' : 'Get Started!')
              : (isTr ? 'Devam' : isPt ? 'Avançar' : 'Next')}
          </button>
        </div>
      </div>
    </div>
  );
}
