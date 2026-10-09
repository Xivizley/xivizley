'use client';

import React, { useState } from 'react';
import { X, Sparkles, Send, ExternalLink, Bot, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { useI18nStore } from '@/lib/i18n/store';

export function TelegramSupportWidget() {
  const { lang } = useI18nStore();
  const isTr = lang === 'tr';
  const isPt = lang === 'pt';

  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // On architect canvas, suppress floating widget to prevent overlapping the OutputPanel deploy CTA & inspector tabs
  const isArchitect = pathname?.startsWith('/architect');

  if (!mounted || isArchitect) return null;

  const handleQuickQuestion = (question: string) => {
    const encoded = encodeURIComponent(question);
    window.open(`https://t.me/xivizley_destek_bot?start=${encoded}`, '_blank', 'noopener,noreferrer');
  };

  const quickQuestions = isTr
    ? [
        '🔍 Port çakışması nasıl çözülür?',
        '🚀 VDS sunucuma nasıl kurarım?',
        '🛡️ AdGuard & Pi-hole aynı anda çalışır mı?',
        '📦 Docker Compose dosyamı nasıl alırım?',
      ]
    : isPt
    ? [
        '🔍 Como resolver conflito de portas?',
        '🚀 Como implantar no meu servidor VDS?',
        '🛡️ AdGuard e Pi-hole rodam juntos?',
        '📦 Como baixar meu Docker Compose?',
      ]
    : [
        '🔍 How to resolve port conflicts?',
        '🚀 How to deploy to my VDS server?',
        '🛡️ Can AdGuard & Pi-hole run together?',
        '📦 How to get my Docker Compose file?',
      ];

  return (
    <div
      className={cn(
        'fixed z-50 transition-all duration-300',
        isArchitect ? 'bottom-20 right-4 md:bottom-6 md:right-6' : 'bottom-6 right-6',
      )}
    >
      {/* Expanded Support Card */}
      {isOpen && (
        <div className="mb-3 w-[340px] sm:w-[380px] overflow-hidden rounded-2xl border border-cyan-500/30 bg-[#0c1322]/95 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.6)] ring-1 ring-white/10 animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 p-4 border-b border-slate-800/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-md shadow-cyan-500/20 text-white">
                  <Bot className="h-5 w-5" />
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0c1322] bg-emerald-500" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-white tracking-wide">
                      {isTr ? 'XIVIZLEY Destek' : isPt ? 'Suporte XIVIZLEY' : 'XIVIZLEY Support'}
                    </h3>
                    <span className="rounded-full bg-cyan-500/10 border border-cyan-500/30 px-1.5 py-0.2 text-[9px] font-semibold text-cyan-300">
                      AI 7/24
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-400 flex items-center gap-1 mt-0.5 font-medium">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {isTr ? 'Çevrimiçi · GPT-4o Destekli' : isPt ? 'Online · Com suporte GPT-4o' : 'Online · Powered by GPT-4o'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800/80 hover:text-white transition-colors"
                aria-label={isTr ? 'Kapat' : isPt ? 'Fechar' : 'Close'}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-4 space-y-3.5">
            {/* AI Welcome Message Bubble */}
            <div className="flex gap-2.5">
              <div className="shrink-0 mt-0.5">
                <div className="h-6 w-6 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-slate-800/70 border border-slate-700/60 p-3 text-xs text-slate-200 leading-relaxed">
                {isTr
                  ? 'Merhaba! 👋 Ben XIVIZLEY AI Destek Asistanı.'
                  : isPt
                  ? 'Olá! 👋 Sou o Assistente de Suporte IA do XIVIZLEY.'
                  : 'Hello! 👋 I am the XIVIZLEY AI Support Assistant.'}
                <p className="mt-1.5 text-slate-300">
                  {isTr
                    ? 'Docker servisleri, port çakışmaları veya sunucu kurulumuyla ilgili her şeyi Telegram üzerinden anında sorabilirsin!'
                    : isPt
                    ? 'Pergunte qualquer coisa sobre serviços Docker, conflitos de portas ou implantação no servidor pelo Telegram!'
                    : 'Ask anything about Docker services, port conflicts, or server deployment instantly via Telegram!'}
                </p>
              </div>
            </div>

            {/* Quick Prompt Chips */}
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
                {isTr ? 'Hızlı Sorular:' : isPt ? 'Perguntas Rápidas:' : 'Quick Questions:'}
              </p>
              <div className="flex flex-col gap-1.5">
                {quickQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleQuickQuestion(q)}
                    className="flex items-center justify-between text-left text-xs text-slate-300 bg-slate-800/40 hover:bg-cyan-950/40 hover:text-cyan-200 hover:border-cyan-500/40 border border-slate-800 px-3 py-2 rounded-xl transition-all group"
                  >
                    <span>{q}</span>
                    <Send className="h-3 w-3 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>

            {/* Direct Link Button to Telegram */}
            <a
              href="https://t.me/xivizley_destek_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 py-2.5 px-4 text-xs font-bold text-white shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.458c.538-.196 1.006.128.832.963z" />
              </svg>
              <span>
                {isTr
                  ? "Telegram'da Sohbete Başla"
                  : isPt
                  ? 'Iniciar Conversa no Telegram'
                  : 'Start Chat on Telegram'}
              </span>
              <ExternalLink className="h-3.5 w-3.5 opacity-80" />
            </a>

            {/* Direct Link Button to Instagram AI */}
            <a
              href="https://instagram.com/xivizley"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-amber-600 hover:opacity-95 py-2 px-3 text-xs font-bold text-white shadow-lg shadow-pink-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <span>
                {isTr
                  ? "Instagram AI'ya DM At (@xivizley)"
                  : isPt
                  ? 'Enviar DM no Instagram (@xivizley)'
                  : 'Send DM on Instagram (@xivizley)'}
              </span>
              <ExternalLink className="h-3.5 w-3.5 opacity-80" />
            </a>

            <div className="flex items-center justify-between px-1 text-[10px] text-slate-500 mt-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-emerald-400" />
                {isTr ? '7/24 AI Destek' : isPt ? 'Suporte IA 24/7' : '24/7 AI Support'}
              </span>
              <span>@xivizley_destek_bot · @xivizley</span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'group flex items-center gap-2.5 rounded-full p-2.5 sm:px-4 sm:py-2.5 shadow-2xl transition-all duration-300',
          'border border-cyan-500/40 bg-gradient-to-r from-[#0c1628] via-[#0f1d38] to-[#0c1628]',
          'hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(6,182,212,0.35)] hover:scale-105 active:scale-95',
          isOpen && 'ring-2 ring-cyan-400/50',
        )}
        aria-label={isTr ? 'Telegram AI Destek Botunu Aç' : isPt ? 'Abrir Bot de Suporte Telegram' : 'Open Telegram AI Support Bot'}
      >
        <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/30">
          <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.458c.538-.196 1.006.128.832.963z" />
          </svg>
          <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-slate-900" />
          </span>
        </div>

        <div className="hidden sm:flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
              {isTr ? 'AI Destek' : isPt ? 'Suporte IA' : 'AI Support'}
            </span>
            <span className="rounded bg-cyan-500/20 px-1 py-0.2 text-[9px] font-semibold text-cyan-300">
              7/24
            </span>
          </div>
          <span className="text-[10px] text-slate-400">
            {isTr ? 'Telegram Asistanı' : isPt ? 'Assistente Telegram' : 'Telegram Assistant'}
          </span>
        </div>
      </button>
    </div>
  );
}
