'use client';

import React from 'react';
import { SPONSORS } from '@/lib/config/sponsors';
import { ExternalLink, ShieldCheck, Zap, Rocket, Sparkles } from 'lucide-react';
import { useI18nStore } from '@/lib/i18n/store';

export function SponsorSection() {
  const { lang } = useI18nStore();
  const isTr = lang === 'tr';
  const odeaweb = SPONSORS.odeaweb;
  const hostingComTr = SPONSORS.hostingComTr;

  return (
    <section className="section-lazy mx-auto max-w-6xl px-4 sm:px-6 py-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-semibold text-cyan-300 mb-3">
          <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
          <span>{isTr ? 'Sponsorlarımız & Affiliate Ortaklar' : 'Sponsors & Affiliate Partners'}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
          {isTr ? "Gücünü Türkiye'nin Lider Bulut Altyapılarından Alıyor" : 'Powered by Leading Cloud Infrastructure Providers'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto mt-2">
          {isTr
            ? 'XIVIZLEY mimarileri, 10 Gbit/s yüksek hızlı Datacenter NVMe VDS ve kurumsal sunucu ortaklarımız tarafından optimize edilip desteklenmektedir.'
            : 'XIVIZLEY architectures are optimized and backed by high-speed 10 Gbit/s Datacenter NVMe VDS and enterprise server partners.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* OdeaWeb Card */}
        {odeaweb && odeaweb.enabled && (
          <div className="relative overflow-hidden rounded-3xl border border-cyan-500/40 bg-gradient-to-br from-cyan-950/40 via-slate-900/90 to-slate-950 p-6 backdrop-blur-xl shadow-2xl shadow-cyan-500/10 flex flex-col justify-between group hover:border-cyan-400/70 transition-all">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cyan-500/15 blur-3xl" />

            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 shadow-inner" aria-hidden="true">
                    <Zap className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-[10px] font-bold text-cyan-300 border border-cyan-500/40">
                      {odeaweb.badge}
                    </span>
                    <h3 className="text-base font-extrabold text-slate-100 mt-1">
                      {odeaweb.name}
                    </h3>
                  </div>
                </div>
                <span className="hidden sm:flex items-center gap-1 text-[11px] text-slate-300">
                  <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" aria-hidden="true" />
                  {isTr ? 'Altyapı' : 'Infra'}
                </span>
              </div>

              <p className="text-xs text-slate-300 mb-6 leading-relaxed">
                {isTr ? (
                  <>
                    XIVIZLEY projesinin canlı geliştirme, test ve mimarlık altyapısı <strong>10 Gbit/s port hızına</strong> ve <strong>Datacenter serisi NVMe Storage</strong> gücüne sahip <strong>OWEB (TR Cloud)</strong> tarafından resmi olarak desteklenmektedir.
                  </>
                ) : (
                  <>
                    The live development, test, and architecture platform of XIVIZLEY is officially supported by <strong>OWEB (TR Cloud)</strong> with <strong>10 Gbit/s network speed</strong> and <strong>Datacenter-grade NVMe Storage</strong>.
                  </>
                )}
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
              <span className="text-[11px] font-bold text-cyan-400">⚡ OWEB TR Cloud</span>
              <a
                href={odeaweb.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={isTr ? "OWEB TR Cloud İncele (yeni sekmede açılır)" : "Explore OWEB TR Cloud (opens in new tab)"}
                className="flex items-center gap-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 px-3.5 py-2 text-xs font-bold text-slate-950 transition-all shadow-lg shadow-cyan-500/25 active:scale-95 shrink-0"
              >
                <span>{isTr ? 'OWEB İncele' : 'Explore OWEB'}</span>
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>
        )}

        {/* Hosting.com.tr Card */}
        {hostingComTr && hostingComTr.enabled && (
          <div className="relative overflow-hidden rounded-3xl border border-violet-500/40 bg-gradient-to-br from-violet-950/40 via-slate-900/90 to-slate-950 p-6 backdrop-blur-xl shadow-2xl shadow-violet-500/10 flex flex-col justify-between group hover:border-violet-400/70 transition-all">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-violet-500/15 blur-3xl" />

            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-500/20 border border-violet-500/50 text-violet-400 shadow-inner" aria-hidden="true">
                    <Rocket className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="rounded-full bg-violet-500/20 px-2.5 py-0.5 text-[10px] font-bold text-violet-300 border border-violet-500/40">
                      {hostingComTr.badge}
                    </span>
                    <h3 className="text-base font-extrabold text-slate-100 mt-1">
                      {hostingComTr.name}
                    </h3>
                  </div>
                </div>
                <span className="hidden sm:flex items-center gap-1 text-[11px] text-slate-300">
                  <ShieldCheck className="h-3.5 w-3.5 text-violet-400" aria-hidden="true" />
                  {isTr ? 'Sunucu' : 'Cloud'}
                </span>
              </div>

              <p className="text-xs text-slate-300 mb-6 leading-relaxed">
                {isTr ? (
                  <>
                    Yüksek frekanslı CPU gücü ve NVMe VDS Ultra serisiyle büyük ölçekli Docker, mikroservis ve self-host mimarileri için önerilen altyapı ortağımız.
                  </>
                ) : (
                  <>
                    Powers large-scale Docker, microservice, and self-hosted architectures with high-frequency CPU and NVMe VDS Ultra series.
                  </>
                )}
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
              <span className="text-[11px] font-medium text-violet-300">{isTr ? 'VDS Ultra Bulut' : 'VDS Ultra Cloud'}</span>
              <a
                href={hostingComTr.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={isTr ? "Hosting.com.tr VDS İncele (yeni sekmede açılır)" : "Explore Hosting.com.tr VDS (opens in new tab)"}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 px-3.5 py-2 text-xs font-bold text-white transition-all shadow-lg shadow-violet-500/25 active:scale-95 shrink-0"
              >
                <span>{isTr ? 'VDS İncele' : 'Explore VDS'}</span>
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>
        )}

        {/* SendPulse Startup Grant Partner Card */}
        <div className="relative overflow-hidden rounded-3xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/40 via-slate-900/90 to-slate-950 p-6 backdrop-blur-xl shadow-2xl shadow-emerald-500/10 flex flex-col justify-between group hover:border-emerald-400/70 transition-all">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-500/15 blur-3xl" />

          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#009fc2]/20 border border-[#009fc2]/50 text-[#38bdf8] font-black text-base shadow-inner" aria-hidden="true">
                  SP
                </div>
                <div>
                  <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/40">
                    🚀 $5,000 Startup Grant Partner
                  </span>
                  <h3 className="text-base font-extrabold text-slate-100 mt-1">
                    SendPulse
                  </h3>
                </div>
              </div>
              <span className="hidden sm:flex items-center gap-1 text-[11px] text-emerald-300">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                Grant
              </span>
            </div>

            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              {isTr ? (
                <>
                  XIVIZLEY&apos;in e-posta otomasyonu, ücretsiz Self-Host rehberi teslimatı ve topluluk bildirim altyapısı <strong>SendPulse Startup Program ($5,000 Hibe)</strong> tarafından resmi olarak desteklenmektedir.
                </>
              ) : (
                <>
                  XIVIZLEY&apos;s email automation, self-hosting guide delivery flows, and community notifications are officially powered by the <strong>SendPulse Startup Program ($5,000 Grant)</strong>.
                </>
              )}
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
            <span className="text-[11px] font-bold text-emerald-400">✨ SendPulse for Startups</span>
            <a
              href="https://sendpulse.com/for-startups?utm_source=xivizley&utm_medium=partner"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Explore SendPulse Startup Program"
              className="flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-3.5 py-2 text-xs font-bold text-slate-950 transition-all shadow-lg shadow-emerald-500/25 active:scale-95 shrink-0"
            >
              <span>{isTr ? 'Programı İncele' : 'Startup Program'}</span>
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function SponsorNavbarBadge() {
  const { lang } = useI18nStore();
  const isTr = lang === 'tr';
  const odeaweb = SPONSORS.odeaweb;
  const hosting = SPONSORS.hostingComTr;

  return (
    <div className="hidden xl:flex items-center gap-2">
      {odeaweb && odeaweb.enabled && (
        <a
          href={odeaweb.url}
          target="_blank"
          rel="noopener noreferrer"
          title={isTr ? "Altyapı Sponsorumuz: OWEB (TR Cloud & 10 Gbit/s)" : "Infrastructure Sponsor: OWEB (TR Cloud & 10 Gbps)"}
          className="flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/40 px-2 py-1 text-[11px] font-semibold text-cyan-300 hover:bg-cyan-900/50 hover:border-cyan-400 transition-all shadow-sm"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span>Sponsor: OWEB (TR Cloud)</span>
        </a>
      )}
      {hosting && hosting.enabled && (
        <a
          href={hosting.url}
          target="_blank"
          rel="noopener noreferrer"
          title={isTr ? "Çözüm Ortağımız: Hosting.com.tr" : "Solution Partner: Hosting.com.tr"}
          className="flex items-center gap-1.5 rounded-lg border border-violet-500/40 bg-violet-950/40 px-2 py-1 text-[11px] font-semibold text-violet-300 hover:bg-violet-900/50 hover:border-violet-400 transition-all shadow-sm"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
          <span>Partner: Hosting.com.tr</span>
        </a>
      )}
    </div>
  );
}
