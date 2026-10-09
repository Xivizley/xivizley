'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { X, Sparkles, CheckCircle2, ShieldCheck, Terminal, Cpu, ArrowRight, Loader2, Gift } from 'lucide-react';
import { TurnstileWidget } from './TurnstileWidget';

export function openLeadMagnetModal() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('open-lead-magnet-modal'));
  }
}

export function LeadMagnetModal() {
  const pathname = usePathname();
  const isArchitect = pathname?.startsWith('/architect');
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string>('');

  const dismissModal = useCallback(() => {
    setIsOpen(false);
    setError(null);
  }, []);

  // Listen for manual trigger events from buttons across the site
  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      setSuccess(false);
      setError(null);
    };

    window.addEventListener('open-lead-magnet-modal', handleOpen);
    return () => window.removeEventListener('open-lead-magnet-modal', handleOpen);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Lütfen geçerli bir e-posta adresi giriniz.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, turnstileToken }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Bir hata oluştu.');
      }

      setSuccess(true);
      setTurnstileToken('');
      setTimeout(() => {
        setIsOpen(false);
      }, 3500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'İşlem tamamlanamadı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* 🎁 Floating Button on Bottom-Left (Always accessible, never intrusive) */}
      {!isArchitect && (
        <div className="fixed bottom-4 left-4 z-40">
          <button
            onClick={() => setIsOpen(true)}
            className="group flex items-center gap-2 rounded-full border border-cyan-500/40 bg-[#0c1220]/90 px-3.5 py-2 text-xs font-semibold text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.2)] backdrop-blur-md transition-all hover:border-cyan-400 hover:bg-cyan-950/60 hover:text-white hover:scale-105 active:scale-95"
            title="Ücretsiz Self-Host Rehberi & Şablonları"
          >
            <Gift className="h-4 w-4 text-pink-400 group-hover:rotate-12 transition-transform" />
            <span className="hidden sm:inline">Ücretsiz Self-Host Rehberi</span>
            <span className="sm:hidden">Rehber</span>
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
          </button>
        </div>
      )}

      {/* Modal Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
          onClick={dismissModal}
        >
          <div 
            className="relative w-full max-w-md rounded-2xl border border-cyan-500/40 bg-[#090d16]/95 p-6 md:p-8 shadow-[0_0_50px_rgba(6,182,212,0.2)] backdrop-blur-xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Glow Accent */}
            <div className="absolute -top-12 -left-12 w-36 h-36 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={dismissModal}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 transition-colors"
              aria-label="Kapat"
            >
              <X className="w-5 h-5" />
            </button>

            {success ? (
              <div className="text-center py-6 space-y-3 animate-in fade-in zoom-in duration-300">
                <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-100">Rehber Yola Çıktı! 🚀</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Self-host başlangıç şablonları ve hoş geldin e-postan <span className="text-cyan-400 font-mono">{email}</span> adresine gönderildi.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Header Badge */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-cyan-500/30 bg-cyan-950/40 text-[11px] font-semibold text-cyan-300">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>ÜCRETSİZ SELF-HOST REHBERİ &amp; ŞABLONLARI</span>
                </div>

                {/* Title & Description */}
                <div>
                  <h2 className="text-xl font-extrabold text-slate-100 tracking-tight leading-snug">
                    Docker Stack&apos;ini Sıfır Çakışmayla Kur 🛠️
                  </h2>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    115 popüler servis için hazırlanmış hazır mimari konfigürasyonları, port rehberleri ve 1-tıkla kurulum betikleri gelen kutunda.
                  </p>
                </div>

                {/* Benefits */}
                <div className="space-y-2 py-1">
                  <div className="flex items-center gap-2.5 text-xs text-slate-300">
                    <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Port 80, 443 ve 53 çakışma çözüm matrisi</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-300">
                    <Terminal className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Tek tıkla VDS kurulum scriptleri (curl | bash)</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-300">
                    <Cpu className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>7/24 Telegram &amp; Instagram AI Destek Asistanı erişimi</span>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-3 pt-1">
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ornek@alanadi.com"
                      required
                      className="w-full rounded-xl border border-slate-700/80 bg-slate-900/90 px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                    />
                  </div>

                  {error && (
                    <p className="text-[11px] text-red-400 font-medium">{error}</p>
                  )}

                  <TurnstileWidget
                    onSuccess={(token) => setTurnstileToken(token)}
                    onError={() => setTurnstileToken('')}
                    onExpire={() => setTurnstileToken('')}
                    className="py-1"
                    theme="dark"
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-white px-4 py-2.5 text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Gönderiliyor...</span>
                      </>
                    ) : (
                      <>
                        <span>Rehberi ve Şablonları Gönder</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Footer note */}
                <p className="text-[10px] text-center text-slate-500">
                  Spam göndermeyiz. İstediğin zaman tek tıkla abonelikten çıkabilirsin.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
