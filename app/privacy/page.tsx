'use client';

import Link from 'next/link';
import { ShieldCheck, Database, HardDrive, Lock, ArrowLeft, Terminal, DollarSign } from 'lucide-react';
import { useI18nStore, useTranslation } from '@/lib/i18n/store';
import { Navbar } from '@/components/shared/Navbar';

export default function PrivacyPage() {
  const { t } = useTranslation();
  const { lang } = useI18nStore();

  return (
    <div className="flex min-h-screen flex-col bg-[#08090E] text-slate-200">
      {/* Unified Global Navbar */}
      <Navbar />

      <main className="mx-auto max-w-4xl flex-1 px-4 py-16">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-cyan-400 transition-colors mb-4">
            <ArrowLeft className="h-3.5 w-3.5" />
            {t('privacy.backLink')}
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            {t('privacy.title')}
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            {t('privacy.subtitle')}
          </p>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-white/[0.08] bg-[#0C1017] p-6 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                <HardDrive className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-100">{t('privacy.card1Title')}</h2>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {t('privacy.card1Desc')}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-[#0e111a] p-6 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                <Lock className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-100">{t('privacy.card2Title')}</h2>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {t('privacy.card2Desc')}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-[#0e111a] p-6 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <Database className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-100">{t('privacy.card3Title')}</h2>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {t('privacy.card3Desc')}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-[#0e111a] p-6 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-100">{t('privacy.card4Title')}</h2>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {t('privacy.card4Desc')}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-[#0e111a] p-6 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Terminal className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-100">{t('privacy.card5Title')}</h2>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {t('privacy.card5Desc')}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-[#0e111a] p-6 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-100">Topluluk & Forum Veri İşleme Şartları</h2>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              XIVIZLEY Topluluk ve Forum alanlarında paylaştığınız kamuya açık mimari tasarımları, yorumlar ve profil bilgileri (kullanıcı adı, avatar) platform üyelerine gösterilir. Parola veya hassas VDS erişim bilgileri asla talep edilmez ve saklanmaz. İsteğiniz halinde hesabınız ve paylaşımlarınız KVKK/GDPR kapsamında kalıcı olarak silinir.
            </p>
          </div>

          <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/30 via-slate-900/60 to-[#0e111a] p-6 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                <DollarSign className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-100">
                {lang === 'tr' ? 'Affiliate & Sponsorluk Bildirimi' : 'Affiliate & Sponsorship Disclosure'}
              </h2>
            </div>
            <div className="space-y-2 text-sm text-slate-300 leading-relaxed">
              <p>
                {lang === 'tr'
                  ? 'XIVIZLEY platformunda (özellikle /templates şablon marketi, /feed ve ana sayfa üzerinde) yer alan bazı bağlantılar ve öneriler anlaşmalı iş ortaklarımıza (OWEB ve Hosting.com.tr) aittir. Bu bağlantılar arama motorları ve şeffaflık standartlarına uygun olarak rel="sponsored noopener" ile işaretlenir.'
                  : 'Some links and recommendations across XIVIZLEY (specifically in the /templates market, /feed, and the landing page) belong to our commercial partners (OWEB and Hosting.com.tr). These links are clearly identified with rel="sponsored noopener" in accordance with search engine guidelines and consumer transparency standards.'}
              </p>
              <p>
                {lang === 'tr'
                  ? 'Bu bağlantılar üzerinden bir sunucu (VDS/VPS) satın alırsanız, XIVIZLEY küçük bir komisyon kazanabilir. Bu durum sizin ödeyeceğiniz nihai fiyatı kesinlikle artırmaz veya değiştirmez; aksine birçok ortaklıkta platformumuza özel indirim kodları (%50\'ye varan) sunulmaktadır.'
                  : 'If you choose to purchase a server (VDS/VPS) through these referral links, XIVIZLEY may earn an affiliate commission at zero additional cost to you. In fact, many of these partnerships provide exclusive discounts (up to 50% off) for our community.'}
              </p>
              <p>
                {lang === 'tr'
                  ? 'Önemli Not: Platformumuzdaki hiçbir şablon, araç veya Docker tuval özelliği ücretli bir ödeme duvarı (paywall/gating) ardına gizlenmemiştir. Tüm mimari şablonları herkes için %100 ücretsiz, şeffaf ve erişilebilirdir.'
                  : 'Important Note: None of our architecture templates, canvas tools, or features are locked behind a paywall. All templates and builders remain 100% free, open, and accessible to everyone.'}
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-800/60 py-6 text-center text-xs text-slate-600">
        {t('privacy.footer')} {new Date().getFullYear()}
      </footer>
    </div>
  );
}
