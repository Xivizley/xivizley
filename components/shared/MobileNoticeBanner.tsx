'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Monitor, X, BookOpen, Layers } from 'lucide-react';
import { useI18nStore } from '@/lib/i18n/store';

export function MobileNoticeBanner() {
  const { lang } = useI18nStore();
  const isTr = lang === 'tr';
  const isPt = lang === 'pt';

  const [mounted, setMounted] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true);

  React.useEffect(() => {
    setMounted(true);
    try {
      setIsDismissed(!!sessionStorage.getItem('xivizley_mobile_banner_dismissed'));
    } catch {
      setIsDismissed(false);
    }
  }, []);

  if (!mounted || isDismissed) return null;

  return (
    <div className="md:hidden relative z-40 bg-[#120A21]/95 border-b border-[#2B1A42] px-3.5 py-2.5 backdrop-blur-md transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-[2px] bg-[#1E1235] text-[#C084FC] border border-[#2B1A42]">
            <Monitor className="h-4 w-4" />
          </div>
          <div className="text-left">
            <p className="text-xs font-mono font-semibold text-[#F5F3FF]">
              {isTr
                ? 'Masaüstü Ekranı Önerilir'
                : isPt
                ? 'Tela Desktop Recomendada'
                : 'Desktop Screen Recommended'}
            </p>
            <p className="mt-0.5 text-[11px] font-mono text-[#A19BAF] leading-tight">
              {isTr
                ? 'Sürükle-bırak tuval ve mimari bağlantılar en iyi deneyimi masaüstü tarayıcılarda sunar.'
                : isPt
                ? 'A tela de arrastar e soltar e conexões de arquitetura funcionam melhor em telas de computador.'
                : 'Drag-and-drop canvas and wiring offer the best experience on desktop browsers.'}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Link
                href="/templates"
                className="inline-flex items-center gap-1 rounded-[2px] bg-[#1E1235] px-2 py-1 text-[11px] font-mono font-medium text-[#C084FC] hover:bg-[#251542] hover:text-[#F5F3FF] border border-[#2B1A42] transition-colors"
              >
                <Layers className="h-3 w-3" />
                <span>{isTr ? 'Hazır Şablonlar' : isPt ? 'Modelos Prontos' : 'Explore Stacks'}</span>
              </Link>
              <Link
                href="/guide"
                className="inline-flex items-center gap-1 rounded-[2px] bg-[#090514] px-2 py-1 text-[11px] font-mono font-medium text-[#A19BAF] hover:bg-[#1E1235] hover:text-[#F5F3FF] border border-[#2B1A42] transition-colors"
              >
                <BookOpen className="h-3 w-3" />
                <span>{isTr ? 'Rehberi Oku' : isPt ? 'Ler Guia' : 'Read Guide'}</span>
              </Link>
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            setIsDismissed(true);
            sessionStorage.setItem('xivizley_mobile_banner_dismissed', 'true');
          }}
          className="shrink-0 rounded-[2px] p-1 text-[#8B7D9E] hover:bg-[#1E1235] hover:text-[#F5F3FF] transition-colors"
          aria-label={isTr ? 'Uyarıyı kapat' : isPt ? 'Fechar aviso' : 'Dismiss banner'}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
