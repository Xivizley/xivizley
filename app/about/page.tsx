'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/shared/Navbar';
import { ArrowRight, Sparkles, Code2, Heart, Shield, Cpu, Terminal, Boxes } from 'lucide-react';
import { useI18nStore, useTranslation } from '@/lib/i18n/store';

export default function AboutPage() {
  const { t } = useTranslation();
  const { lang } = useI18nStore();
  const isTr = lang === 'tr';

  return (
    <div className="flex min-h-screen flex-col bg-[#08090e] text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      <Navbar />

      <main className="flex-1 mx-auto max-w-5xl px-4 sm:px-6 py-16 text-center">
        {/* Header Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1 text-xs font-semibold text-indigo-300 mb-6">
          <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
          <span>{isTr ? 'Ücretsiz & Bağımsız Geliştirme' : 'Free & Independent Development'}</span>
        </div>

        <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
          <span className="block">{isTr ? 'Görsel Homelab' : 'Visual Homelab'}</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400 animate-gradient-text">
            {isTr ? 'Devrimini Başlatıyoruz' : 'Revolution Starts Here'}
          </span>
        </h1>

        <p className="mx-auto mb-12 max-w-2xl text-base sm:text-lg text-slate-300 leading-relaxed">
          {t('about.subtitle') || (isTr
            ? 'XIVIZLEY, Linux ve VDS sunucularda karmaşık Docker Compose YAML dosyalarıyla uğraşmadan, sürükle-bırak yöntemiyle görsel mimari tasarlamanız için geliştirilmiş ücretsiz bir platformdur.'
            : 'XIVIZLEY is a free platform designed for visually building Docker server stacks on Linux and VDS without wrestling with complex YAML files.')}
        </p>

        {/* Vision & Mission Bento */}
        <div className="mb-16 grid gap-6 text-left md:grid-cols-2">
          <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-[#0e111a] via-[#131724] to-[#090b12] p-8 shadow-2xl relative overflow-hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400 mb-4 border border-indigo-500/40">
              <Code2 className="h-6 w-6" />
            </div>
            <h2 className="mb-3 text-xl font-bold text-slate-100">{t('about.visionTitle')}</h2>
            <p className="text-sm leading-relaxed text-slate-300">
              {t('about.visionDesc') || (isTr
                ? 'Sunucu yönetimini herkes için erişilebilir, anlaşılır ve hatasız hale getirmek. Geliştiricilerin ve Homelab meraklılarının vakit kaybetmeden sistemlerini yayına almasını sağlamak.'
                : 'Making server deployment accessible, transparent, and error-free for everyone. Helping developers and self-hosters deploy stacks seamlessly.')}
            </p>
          </div>

          <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-[#0e111a] via-[#131724] to-[#090b12] p-8 shadow-2xl relative overflow-hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-400 mb-4 border border-cyan-500/40">
              <Shield className="h-6 w-6" />
            </div>
            <h2 className="mb-3 text-xl font-bold text-slate-100">{t('about.missionTitle')}</h2>
            <p className="text-sm leading-relaxed text-slate-300">
              {t('about.missionDesc') || (isTr
                ? 'Port çakışmalarını önceden görsel olarak tespit eden, otomatik 1-tıkla kurulum komutları üreten ve kullanıcı verilerine %100 saygı duyan istemci taraflı bağımsız bir ekosistem sunmak.'
                : 'Delivering a client-side architecture engine that catches port collisions visually, generates instant deployment scripts, and fully respects privacy.')}
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="mb-16 grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-3xl border border-slate-800 bg-[#0e111a]">
          <div className="p-3 text-center">
            <p className="text-3xl font-black text-indigo-400">115</p>
            <p className="text-xs text-slate-400 mt-1">{isTr ? 'Docker Modülü' : 'Docker Modules'}</p>
          </div>
          <div className="p-3 text-center">
            <p className="text-3xl font-black text-purple-400">31</p>
            <p className="text-xs text-slate-400 mt-1">{isTr ? 'Hazır Şablon' : 'Stack Templates'}</p>
          </div>
          <div className="p-3 text-center">
            <p className="text-3xl font-black text-cyan-400">%100</p>
            <p className="text-xs text-slate-400 mt-1">{isTr ? 'Ücretsiz' : 'Free to Use'}</p>
          </div>
          <div className="p-3 text-center">
            <p className="text-3xl font-black text-emerald-400">1-Click</p>
            <p className="text-xs text-slate-400 mt-1">{isTr ? 'SSH Dağıtımı' : 'SSH Deployment'}</p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="rounded-3xl border border-slate-800 bg-gradient-to-b from-[#0e111a] to-[#08090e] p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">
            {isTr ? 'Kendi Mimarini Tasarlamaya Başla' : 'Start Building Your Architecture'}
          </h2>
          <p className="text-xs text-slate-400 mb-6 max-w-md mx-auto">
            {isTr ? 'Kayıt olma zorunluluğu yok, tamamen tarayıcınızda çalışır.' : 'Zero sign-up required, runs 100% in your browser.'}
          </p>
          <Link
            href="/architect"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-indigo-500/20 hover:opacity-95 transition-all active:scale-95"
          >
            <span>{t('about.cta') || (isTr ? 'Görsel Mimarı Aç' : 'Launch Visual Architect')}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>

      <footer className="border-t border-[#2B1A42] bg-[#090514] py-8 text-center text-xs text-[#A19BAF] font-mono">
        <p>© {new Date().getFullYear()} XIVIZLEY — Alperen • Turkey • {isTr ? 'Açık Kaynak Görsel Homelab & Sunucu Mimarı' : 'Open-Source Visual Homelab Architect'}</p>
      </footer>
    </div>
  );
}
