'use client';

import React, { useState } from 'react';
import { Mail, Sparkles, CheckCircle2, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { useI18nStore } from '@/lib/i18n/store';
import { TurnstileWidget } from './TurnstileWidget';

export function NewsletterSection() {
  const { lang } = useI18nStore();
  const isTr = lang === 'tr';

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus('error');
      setErrorMessage(isTr ? 'Lütfen geçerli bir e-posta adresi yazın.' : 'Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setStatus('idle');
    setErrorMessage('');

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

      setStatus('success');
      setEmail('');
      setTurnstileToken('');
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || (isTr ? 'Bir hata oluştu.' : 'Something went wrong.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative mx-auto max-w-5xl px-4 sm:px-6 py-12">
      <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-slate-900/90 to-slate-950 p-8 sm:p-12 backdrop-blur-xl shadow-2xl shadow-indigo-500/10 text-center">
        {/* Ambient Glows */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full bg-indigo-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 -bottom-20 h-56 w-56 rounded-full bg-cyan-500/15 blur-3xl" />

        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-300 mb-4">
          <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
          <span>{isTr ? 'XIVIZLEY Self-Host Bülteni' : 'XIVIZLEY Self-Host Dispatch'}</span>
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-100 tracking-tight max-w-2xl mx-auto">
          {isTr
            ? 'Yeni Docker Mimarileri ve Sunucu İpuçları Gelen Kutunuzda'
            : 'New Docker Stacks and Server Guides Delivered to Your Inbox'}
        </h2>

        <p className="text-sm text-slate-400 max-w-xl mx-auto mt-3 leading-relaxed">
          {isTr
            ? 'Her hafta en popüler self-host şablonları, güvenlik tüyoları ve OWEB & Hosting.com.tr özel VDS indirim kodları. Sıfır spam, dilediğiniz an tek tıkla çıkış.'
            : 'Weekly trending self-hosted templates, cloud security guides, and partner VDS discounts. Zero spam, unsubscribe anytime.'}
        </p>

        {/* Form */}
        <div className="mt-8 max-w-md mx-auto">
          {status === 'success' ? (
            <div className="flex items-center justify-center gap-3 rounded-2xl border border-emerald-500/40 bg-emerald-950/40 p-4 text-emerald-300 animate-in fade-in zoom-in-95">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
              <span className="text-sm font-semibold">
                {isTr
                  ? 'Harika! Bültene katıldınız. Yeni mimari güncellemelerini kaçırmayacaksınız.'
                  : 'Awesome! You are subscribed. Stay tuned for upcoming architecture releases.'}
              </span>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={isTr ? 'ornek@alanadi.com' : 'you@domain.com'}
                    disabled={loading}
                    required
                    className="w-full rounded-2xl border border-slate-800 bg-[#0e111a]/90 pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98] shrink-0 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <span>{isTr ? 'Abone Ol' : 'Subscribe'}</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
              <TurnstileWidget
                onSuccess={(token) => setTurnstileToken(token)}
                onError={() => setTurnstileToken('')}
                onExpire={() => setTurnstileToken('')}
                className="mt-2"
                theme="dark"
              />
            </form>
          )}

          {status === 'error' && (
            <p className="text-xs text-rose-400 mt-2 text-center">{errorMessage}</p>
          )}

          <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-slate-300">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              {isTr ? 'SendPulse Güvencesi' : 'Powered by SendPulse'}
            </span>
            <span>•</span>
            <span>{isTr ? 'Haftada 1 E-posta' : '1 Email / Week'}</span>
            <span>•</span>
            <span>{isTr ? 'Tek Tıkla Ayrılma' : 'Instant Opt-out'}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
