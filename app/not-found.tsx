'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/shared/Navbar';
import { ServerCrash, Home, LayoutTemplate, LifeBuoy, Terminal } from 'lucide-react';
import { useI18nStore } from '@/lib/i18n/store';

export default function NotFound() {
  const { lang } = useI18nStore();
  const isTr = lang === 'tr';

  return (
    <div className="flex min-h-screen flex-col bg-[#08090e] text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 shadow-2xl shadow-indigo-500/10">
            <ServerCrash className="h-10 w-10 animate-pulse text-indigo-400" />
          </div>

          <div className="space-y-2">
            <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400 tracking-tight animate-glitch">
              404
            </h1>
            <h2 className="text-lg font-bold text-slate-200">
              {isTr ? 'Aradığınız Sayfa Bulunamadı' : 'Page Not Found'}
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
              {isTr
                ? 'Ulaşmaya çalıştığınız sayfa taşınmış, silinmiş veya geçici olarak erişilemiyor olabilir.'
                : 'The page you are looking for might have been removed, renamed, or is temporarily unavailable.'}
            </p>
          </div>

          {/* Terminal error mockup */}
          <div className="rounded-xl border border-slate-800 bg-[#0e111a] p-3 text-left font-mono text-[11px] space-y-1 text-slate-400 shadow-lg">
            <div className="flex items-center gap-1.5 text-slate-500 text-[10px] pb-1 border-b border-slate-800/80">
              <Terminal className="h-3 w-3 text-indigo-400" />
              <span>xivizley-cli // HTTP 404</span>
            </div>
            <p className="text-red-400"><span className="text-slate-600">$</span> docker inspect page_route</p>
            <p className="text-slate-400">Error response from daemon: No such container or route</p>
            <p className="text-emerald-400">STATUS: EXIT CODE 1 (CONTAINER_NOT_FOUND)</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/20 hover:brightness-110 transition-all active:scale-95"
            >
              <Home className="h-4 w-4" />
              <span>{isTr ? 'Ana Sayfaya Dön' : 'Return Home'}</span>
            </Link>

            <Link
              href="/architect"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-[#0e111a] hover:bg-[#131724] hover:border-slate-700 px-5 py-2.5 text-xs font-semibold text-slate-300 hover:text-white transition-all"
            >
              <LayoutTemplate className="h-4 w-4" />
              <span>{isTr ? 'Görsel Mimarı Aç' : 'Open Architect'}</span>
            </Link>
          </div>

          <div className="pt-4 border-t border-slate-800/80">
            <Link
              href="/destek"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-400 transition-colors"
            >
              <LifeBuoy className="h-3.5 w-3.5" />
              <span>{isTr ? 'Yardıma mı ihtiyacınız var? Destek Merkezi' : 'Need help? Support Center'}</span>
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-800/80 bg-[#08090e] py-6 text-center text-xs text-slate-400">
        <p>© {new Date().getFullYear()} XIVIZLEY — {isTr ? 'Açık Kaynak Görsel Self-Host & Sunucu Mimarı' : 'Open-Source Visual Self-Host & Server Architect'}</p>
      </footer>
    </div>
  );
}
