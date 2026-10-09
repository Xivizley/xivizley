// ============================================================
// XIVIZLEY — Destek & Güvenli Talep Merkezi
// app/contact/page.tsx (and app/destek)
// ============================================================

'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/shared/Navbar';
import { useSession } from 'next-auth/react';
import { useI18nStore } from '@/lib/i18n/store';
import {
  LifeBuoy,
  Mail,
  Send,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Sparkles,
  User,
  AlertCircle,
  Copy,
  Check,
  Inbox,
  Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TurnstileWidget } from '@/components/shared/TurnstileWidget';

interface TicketItem {
  id: string;
  userEmail: string;
  name: string;
  category: string;
  priority: string;
  subject: string;
  message: string;
  status: 'İnceleniyor' | 'Yanıtlandı' | 'Çözüldü';
  createdAt: string;
  reply?: string;
}

const OFFICIAL_EMAILS = [
  {
    roleTr: 'Kullanıcı & Teknik Destek',
    roleEn: 'User & Technical Support',
    email: 'destek@xivizley.com.tr',
    descTr: 'Kurulum hataları, port çakışmaları ve Docker teknik yardım.',
    descEn: 'Deployment issues, port conflicts, and Docker technical assistance.',
    badgeTr: '7/24 Teknik',
    badgeEn: '24/7 Support',
    color: 'border-cyan-500/40 bg-cyan-950/20 text-cyan-400',
  },
  {
    roleTr: 'Sponsorluk & İş Birlikleri',
    roleEn: 'Sponsorships & Partnerships',
    email: 'sales@xivizley.com.tr',
    descTr: 'Hosting sağlayıcıları, VDS altyapı sponsorlukları ve kurumsal ortaklıklar.',
    descEn: 'Hosting providers, VDS infrastructure sponsors, and partnerships.',
    badgeTr: 'İş Geliştirme',
    badgeEn: 'Partnerships',
    color: 'border-emerald-500/40 bg-emerald-950/20 text-emerald-400',
  },
  {
    roleTr: 'Kurucu & Doğrudan İletişim',
    roleEn: 'Founder Direct Contact',
    email: 'contact@xivizley.com.tr',
    descTr: 'Alperen ile doğrudan stratejik vizyon ve özel görüşmeler.',
    descEn: 'Direct strategic inquiries and conversations with Alperen.',
    badgeTr: 'Kurucu',
    badgeEn: 'Founder',
    color: 'border-amber-500/40 bg-amber-950/20 text-amber-400',
  },
  {
    roleTr: 'Sistem Yönetimi & Güvenlik',
    roleEn: 'System Ops & Security',
    email: 'admin@xivizley.com.tr',
    descTr: 'Güvenlik bildirimleri, DNS ve altyapı yönetimi.',
    descEn: 'Security vulnerability disclosures, DNS, and server management.',
    badgeTr: 'Yönetim',
    badgeEn: 'Ops',
    color: 'border-rose-500/40 bg-rose-950/20 text-rose-400',
  },
  {
    roleTr: 'Teknik Ekip & API',
    roleEn: 'Core Engineering & API',
    email: 'tech@xivizley.com.tr',
    descTr: 'Geliştirici entegrasyonları, API ve CLI modül geliştirmeleri.',
    descEn: 'Developer integrations, API, and CLI module developments.',
    badgeTr: 'Geliştirici',
    badgeEn: 'Dev Team',
    color: 'border-indigo-500/40 bg-indigo-950/20 text-indigo-400',
  },
];

export default function ContactSupportPage() {
  const { data: session } = useSession();
  const { lang } = useI18nStore();
  const isTr = lang === 'tr';
  const [tab, setTab] = useState<'create' | 'my-tickets' | 'emails'>('create');

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState(isTr ? 'Teknik Destek' : 'Technical Support');
  const [priority, setPriority] = useState(isTr ? 'Normal' : 'Normal');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  // UI State
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [myTickets, setMyTickets] = useState<TicketItem[]>([]);
  const [turnstileToken, setTurnstileToken] = useState<string>('');

  // Auto-fill from authenticated session
  useEffect(() => {
    if (session?.user) {
      if (session.user.name) setName(session.user.name);
      if (session.user.email) setEmail(session.user.email);
    }
  }, [session]);

  // Load account's private tickets
  useEffect(() => {
    const userKey = session?.user?.email ? `tickets_${session.user.email}` : 'tickets_guest';
    const stored = JSON.parse(localStorage.getItem(userKey) || '[]');
    setMyTickets(stored);
  }, [session, success]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const userEmail = email.trim();
    const newTicket: TicketItem = {
      id: `TKT-${Date.now().toString().slice(-6)}`,
      userEmail,
      name: name.trim(),
      category,
      priority,
      subject: subject.trim(),
      message: message.trim(),
      status: 'İnceleniyor',
      createdAt: new Date().toISOString(),
    };

    try {
      // Send to server
      const res = await fetch('/api/support/ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTicket,
          turnstileToken,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || (isTr ? 'Talep iletilemedi.' : 'Failed to submit ticket.'));
      }

      // Save securely under user's private key
      const userKey = session?.user?.email ? `tickets_${session.user.email}` : 'tickets_guest';
      const current = JSON.parse(localStorage.getItem(userKey) || '[]');
      current.unshift(newTicket);
      localStorage.setItem(userKey, JSON.stringify(current));

      setSuccess(true);
      setSubject('');
      setMessage('');
      setTurnstileToken('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : (isTr ? 'Talep gönderilirken bağlantı hatası oluştu.' : 'Connection error while submitting ticket.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#08090e] text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      <Navbar />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12">
        {/* Header Hero */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-300 mb-4 shadow-inner">
            <LifeBuoy className="h-3.5 w-3.5 text-indigo-400" />
            <span>{isTr ? 'XIVIZLEY Destek & Talep Merkezi' : 'XIVIZLEY Support & Help Center'}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            {isTr ? 'Destek ve İletişim' : 'Support & Contact'}
          </h1>
          <p className="mt-3 text-sm text-slate-400 leading-relaxed">
            {isTr
              ? 'Sorularınız ve teknik yardım talepleriniz için doğrudan talep oluşturabilir veya resmi e-posta adreslerimizden bize ulaşabilirsiniz.'
              : 'Create a ticket directly for technical questions, or reach out to us via our official email addresses.'}
          </p>

          {/* Navigation Tabs */}
          <div className="flex items-center justify-center gap-2 mt-6 p-1 rounded-2xl bg-[#0e111a] border border-slate-800 max-w-md mx-auto shadow-lg">
            <button
              onClick={() => setTab('create')}
              className={cn(
                'flex-1 py-2 text-xs font-bold rounded-xl transition-all',
                tab === 'create' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20' : 'text-slate-400 hover:text-slate-200'
              )}
            >
              {isTr ? '✉️ Yeni Talep' : '✉️ New Ticket'}
            </button>
            <button
              onClick={() => setTab('my-tickets')}
              className={cn(
                'flex-1 py-2 text-xs font-bold rounded-xl transition-all relative',
                tab === 'my-tickets' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20' : 'text-slate-400 hover:text-slate-200'
              )}
            >
              {isTr ? `📋 Taleplerim (${myTickets.length})` : `📋 My Tickets (${myTickets.length})`}
            </button>
            <button
              onClick={() => setTab('emails')}
              className={cn(
                'flex-1 py-2 text-xs font-bold rounded-xl transition-all',
                tab === 'emails' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20' : 'text-slate-400 hover:text-slate-200'
              )}
            >
              {isTr ? '📬 E-postalar' : '📬 Emails'}
            </button>
          </div>
        </div>

        {/* Tab 1: Create Ticket Form */}
        {tab === 'create' && (
          <div className="max-w-2xl mx-auto">
            {/* Quick AI Channels */}
            <div className="mb-6 p-4 rounded-2xl border border-slate-800 bg-[#0e111a]/80 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-2.5">
                <Sparkles className="h-4 w-4 text-cyan-400 shrink-0" />
                <span className="text-xs text-slate-300">
                  {isTr ? 'Bilet beklemeden anında yapay zeka ile görüşmek ister misin?' : 'Want instant answers from our AI assistants?'}
                </span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <a
                  href="https://t.me/xivizley_destek_bot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border border-cyan-500/40 bg-cyan-950/30 text-cyan-300 hover:bg-cyan-900/40 text-[11px] font-semibold transition-all"
                >
                  <span>Telegram AI 🤖</span>
                </a>
                <a
                  href="https://instagram.com/xivizley"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border border-pink-500/40 bg-pink-950/30 text-pink-300 hover:bg-pink-900/40 text-[11px] font-semibold transition-all"
                >
                  <span>Instagram (@xivizley) 📸</span>
                </a>
              </div>
            </div>

            {success ? (
              <div className="rounded-3xl border border-emerald-500/40 bg-gradient-to-b from-emerald-950/20 to-[#0e111a] p-8 text-center shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-200">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-2xl shadow-inner">
                  ✓
                </div>
                <h3 className="text-xl font-bold text-white">
                  {isTr ? 'Talebiniz Başarıyla Alındı!' : 'Ticket Received Successfully!'}
                </h3>
                <p className="text-xs text-slate-300 mt-2 max-w-md mx-auto">
                  {isTr
                    ? <>Destek talebiniz teknik ekibimize iletildi. Yanıt doğrudan <strong>{email}</strong> adresinize gönderilecek ve &quot;Taleplerim&quot; sekmesinde görüntülenecektir.</>
                    : <>Your support ticket has been sent to our team. A response will be sent directly to <strong>{email}</strong> and will appear under &quot;My Tickets&quot;.</>}
                </p>

                <div className="flex gap-3 justify-center mt-6">
                  <button
                    onClick={() => setSuccess(false)}
                    className="rounded-xl bg-slate-800 hover:bg-slate-700 px-5 py-2.5 text-xs font-semibold text-slate-200 transition-all"
                  >
                    {isTr ? 'Yeni Talep Yaz' : 'New Ticket'}
                  </button>
                  <button
                    onClick={() => setTab('my-tickets')}
                    className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:brightness-110 px-5 py-2.5 text-xs font-bold text-white transition-all shadow-lg shadow-indigo-500/20"
                  >
                    {isTr ? 'Taleplerime Git ➔' : 'Go to My Tickets ➔'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-slate-800 bg-[#0e111a] p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        {isTr ? 'Adınız Soyadınız *' : 'Full Name *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={isTr ? 'Örn: Alperen' : 'e.g. Alex'}
                        className="w-full rounded-xl border border-slate-800 bg-[#131724] px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        {isTr ? 'E-posta Adresiniz *' : 'Email Address *'}
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@domain.com"
                        className="w-full rounded-xl border border-slate-800 bg-[#131724] px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        {isTr ? 'Kategori' : 'Category'}
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full rounded-xl border border-slate-800 bg-[#131724] px-3 py-2.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
                      >
                        <option>{isTr ? 'Teknik Destek' : 'Technical Support'}</option>
                        <option>{isTr ? 'VDS & Kurulum Sorunu' : 'VDS & Deployment Issue'}</option>
                        <option>{isTr ? 'Port Çakışması' : 'Port Conflict'}</option>
                        <option>{isTr ? 'Satış Ortaklığı & Sponsorluk' : 'Partnership & Sponsorship'}</option>
                        <option>{isTr ? 'Yeni Modül Önerisi' : 'Module Suggestion'}</option>
                        <option>{isTr ? 'Diğer' : 'Other'}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        {isTr ? 'Öncelik' : 'Priority'}
                      </label>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className="w-full rounded-xl border border-slate-800 bg-[#131724] px-3 py-2.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
                      >
                        <option>{isTr ? 'Düşük' : 'Low'}</option>
                        <option>{isTr ? 'Normal' : 'Normal'}</option>
                        <option>{isTr ? 'Yüksek' : 'High'}</option>
                        <option>{isTr ? 'Acil (Sunucu/Servis Çalışmıyor)' : 'Urgent (Service Down)'}</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      {isTr ? 'Konu Başlığı *' : 'Subject *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder={isTr ? 'Örn: Nextcloud kurulumunda port çakışması yaşıyorum' : 'e.g. Experiencing port conflict on Nextcloud setup'}
                      className="w-full rounded-xl border border-slate-800 bg-[#131724] px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      {isTr ? 'Mesajınız ve Açıklama *' : 'Message / Details *'}
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={isTr ? 'Sorununuzu veya iletmek istediğiniz detayları buraya yazın...' : 'Describe your question or issue in detail...'}
                      className="w-full rounded-xl border border-slate-800 bg-[#131724] p-3.5 text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 resize-none transition-all"
                    />
                  </div>

                  {error && (
                    <div className="p-3 rounded-xl border border-red-500/40 bg-red-950/20 text-xs text-red-300 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="py-1">
                    <TurnstileWidget
                      onSuccess={(token) => setTurnstileToken(token)}
                      onError={() => setTurnstileToken('')}
                      onExpire={() => setTurnstileToken('')}
                      theme="dark"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 hover:brightness-110 py-3 text-xs font-bold text-white transition-all shadow-lg shadow-indigo-500/20 active:scale-98 disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                    <span>{loading ? (isTr ? 'Talep Gönderiliyor...' : 'Submitting...') : (isTr ? 'Talebi İlet ➔' : 'Submit Ticket ➔')}</span>
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: My Account Tickets & Notifications */}
        {tab === 'my-tickets' && (
          <div className="max-w-3xl mx-auto space-y-4">
            {myTickets.length === 0 ? (
              <div className="rounded-3xl border border-slate-800 bg-[#0e111a] p-12 text-center shadow-xl">
                <Inbox className="mx-auto h-12 w-12 text-slate-600 mb-3" />
                <h3 className="text-base font-bold text-slate-300">Henüz Açık Bir Talebiniz Yok</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Bir sorunla karşılaştığınızda veya yardıma ihtiyaç duyduğunuzda yukarıdaki sekmeden yeni bir talep oluşturabilirsiniz.
                </p>
                <button
                  onClick={() => setTab('create')}
                  className="mt-5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:brightness-110 px-5 py-2 text-xs font-bold text-white transition-all shadow-lg shadow-indigo-500/20"
                >
                  Talep Oluştur
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {myTickets.map((t) => (
                  <div
                    key={t.id}
                    className="rounded-3xl border border-slate-800 bg-[#0e111a] p-5 backdrop-blur-md shadow-xl space-y-3 hover:border-indigo-500/40 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs font-bold text-indigo-400">{t.id}</span>
                          <span className="rounded-full bg-[#131724] px-2 py-0.5 text-[10px] text-slate-400 font-medium border border-slate-700">
                            {t.category}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-100">{t.subject}</h4>
                      </div>
                      <span className="rounded-full bg-indigo-500/15 border border-indigo-500/30 px-2.5 py-0.5 text-[11px] font-bold text-indigo-300">
                        {t.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed bg-[#08090e] p-3 rounded-xl border border-slate-800/80">
                      {t.message}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-800/80">
                      <span>Oluşturulma: {new Date(t.createdAt).toLocaleString('tr-TR')}</span>
                      <span>İletişim: {t.userEmail}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Official Emails Directory */}
        {tab === 'emails' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {OFFICIAL_EMAILS.map((item) => (
                <div
                  key={item.email}
                  className="rounded-3xl border border-slate-800 bg-[#0e111a] p-6 backdrop-blur-md shadow-xl flex flex-col justify-between hover:border-indigo-500/40 transition-all group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className={cn('rounded-full px-2.5 py-0.5 text-[10px] font-bold border', item.color)}>
                        {isTr ? item.badgeTr : item.badgeEn}
                      </span>
                      <Mail className="h-4 w-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                    </div>
                    <h3 className="text-base font-bold text-slate-100">{isTr ? item.roleTr : item.roleEn}</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{isTr ? item.descTr : item.descEn}</p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <a
                      href={`mailto:${item.email}`}
                      className="font-mono text-sm font-bold text-indigo-400 hover:text-indigo-300 hover:underline"
                    >
                      {item.email}
                    </a>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(item.email);
                        alert(`Kopyalandı: ${item.email}`);
                      }}
                      className="p-1.5 text-slate-500 hover:text-slate-200 rounded-lg hover:bg-[#131724] transition-colors"
                      title="E-postayı kopyala"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Official Sponsor Notice */}
            <div className="p-4 rounded-2xl border border-indigo-500/30 bg-[#0e111a] text-center text-xs text-slate-400 shadow-md">
              🛡️ Resmi sunucularımız <strong>OWEB TR Cloud 10 Gbit/s NVMe</strong> altyapısı üzerinde SPF, DKIM ve DMARC korumalı olarak 7/24 hizmet vermektedir.
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#08090e] py-6 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} XIVIZLEY — Açık Kaynak Görsel Homelab & Sunucu Mimarı</p>
      </footer>
    </div>
  );
}
