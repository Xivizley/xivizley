// ============================================================
// XIVIZLEY — Forum Topic Detail & Reply Page (/forum/topic/[id])
// app/forum/topic/[id]/page.tsx
// ============================================================

'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Navbar } from '@/components/shared/Navbar';
import { FORUM_TOPICS, ForumTopicItem } from '@/lib/data/forum';
import {
  MessageSquare,
  ArrowLeft,
  Clock,
  User,
  Send,
  Boxes,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18nStore } from '@/lib/i18n/store';

const FORUM_TOPIC_EN_MAP: Record<string, { title: string; categoryLabel: string }> = {
  'topic-1': {
    title: '📢 Docker Performance & Port Configuration on 10 Gbps NVMe VDS Servers',
    categoryLabel: 'VDS & Server',
  },
  'topic-2': {
    title: '🎬 Jellyfin 4K NVENC/VAAPI Hardware Transcoding Configuration',
    categoryLabel: 'Architecture Design',
  },
  'topic-3': {
    title: '🛡️ Port 53 Conflict: How to Disable systemd-resolved',
    categoryLabel: 'Help & Support',
  },
};

interface Props {
  params: Promise<{ id: string }>;
}

export default function ForumTopicDetailPage({ params }: Props) {
  const { lang } = useI18nStore();
  const isTr = lang === 'tr';

  const { id } = use(params);
  const initialTopic = FORUM_TOPICS.find((t) => t.id === id || t.slug === id);

  const [topic, setTopic] = useState<ForumTopicItem | undefined>(initialTopic);
  const [replyText, setReplyText] = useState('');
  const [replySuccess, setReplySuccess] = useState(false);

  if (!topic) {
    return (
      <div className="flex min-h-screen flex-col bg-[#08090e] text-slate-100">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8 text-center">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-200">
              {isTr ? 'Konu Bulunamadı' : 'Topic Not Found'}
            </h2>
            <p className="text-xs text-slate-400">
              {isTr
                ? 'Aradığınız tartışma konusu silinmiş veya taşınmış olabilir.'
                : 'The discussion topic you are looking for may have been removed or moved.'}
            </p>
            <Link href="/forum" className="inline-block rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white">
              {isTr ? 'Foruma Dön' : 'Back to Forum'}
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const enTopic = FORUM_TOPIC_EN_MAP[topic.id];
  const displayTitle = !isTr && enTopic ? enTopic.title : topic.title;
  const displayCategoryLabel = !isTr && enTopic ? enTopic.categoryLabel : topic.categoryLabel;

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    const newReply = {
      id: `r-${Date.now()}`,
      author: {
        name: isTr ? 'Siz (Topluluk Üyesi)' : 'You (Community Member)',
        avatar: '👤',
        role: isTr ? 'Üye' : 'Member',
      },
      content: replyText.trim(),
      createdAt: new Date().toISOString(),
    };

    setTopic({
      ...topic,
      replyCount: topic.replyCount + 1,
      replies: [...topic.replies, newReply],
    });

    setReplyText('');
    setReplySuccess(true);
    setTimeout(() => setReplySuccess(false), 3000);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#08090e] text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      <Navbar />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">
        {/* Back Link */}
        <Link
          href="/forum"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-indigo-400 mb-8 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>{isTr ? 'Tüm Tartışmalara Dön' : 'Back to All Discussions'}</span>
        </Link>

        {/* Topic Card */}
        <article className="rounded-3xl border border-slate-800 bg-[#0e111a] p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6 mb-8">
          <div className="space-y-3">
            <span className={cn('inline-block rounded-full px-3 py-0.5 text-xs font-bold border', topic.categoryBadge)}>
              {displayCategoryLabel}
            </span>
            <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              {displayTitle}
            </h1>

            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500/20 border border-indigo-500/40 text-xs">
                  {topic.author.avatar}
                </div>
                <div>
                  <span className="font-bold text-slate-200">{topic.author.name}</span>
                  <span className="text-[10px] text-slate-500 ml-1">({topic.author.role})</span>
                </div>
              </div>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{new Date(topic.createdAt).toLocaleString('tr-TR')}</span>
              </span>
            </div>
          </div>

          {/* Topic Body Content */}
          <div className="text-xs sm:text-sm text-slate-300 leading-relaxed space-y-4 whitespace-pre-line font-sans">
            {topic.content}
          </div>

          {/* Template Funnel CTA Banner */}
          {topic.templateId && (
            <div className="pt-4 border-t border-slate-800/80">
              <div className="rounded-2xl border border-indigo-500/40 bg-indigo-950/30 p-4 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-indigo-300">
                    {isTr ? 'İlgili Mimari Şablonu Mimarımda Açın' : 'Open Architecture Template in Architect'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {isTr
                      ? 'Bu konuda bahsedilen Docker yığınını tek tıkla tuvalinize yükleyin.'
                      : 'Load the Docker stack discussed in this topic onto your canvas with 1-click.'}
                  </p>
                </div>
                <Link
                  href={`/architect?template=${topic.templateId}`}
                  className="shrink-0 flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3.5 py-2 text-xs font-bold text-white transition-all shadow-md shadow-indigo-500/20"
                >
                  <Boxes className="h-3.5 w-3.5" />
                  <span>{isTr ? 'Mimarda Aç' : 'Open in Architect'}</span>
                </Link>
              </div>
            </div>
          )}
        </article>

        {/* Replies Section */}
        <section className="space-y-6">
          <h3 className="text-base font-bold text-slate-200 border-b border-slate-800/80 pb-3 flex items-center gap-2">
            <span>{isTr ? 'Yanıtlar' : 'Replies'}</span>
            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400 font-mono">
              {topic.replies.length}
            </span>
          </h3>

          {topic.replies.length === 0 ? (
            <div className="rounded-2xl border border-slate-800/80 bg-[#0e111a] p-8 text-center text-xs text-slate-500">
              {isTr ? 'Henüz bu konuya yanıt yazılmadı. İlk yanıtı yazan siz olun!' : 'No replies yet. Be the first to join the conversation!'}
            </div>
          ) : (
            <div className="space-y-3">
              {topic.replies.map((reply) => (
                <div
                  key={reply.id}
                  className="rounded-2xl border border-slate-800/80 bg-[#0e111a] p-5 space-y-2 backdrop-blur-md"
                >
                  <div className="flex items-center justify-between text-xs border-b border-slate-800/60 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{reply.author.avatar}</span>
                      <span className="font-bold text-slate-200">{reply.author.name}</span>
                      <span className="text-[10px] text-indigo-400 bg-indigo-950/60 border border-indigo-800 px-1.5 py-0.2 rounded-full">
                        {reply.author.role}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {new Date(reply.createdAt).toLocaleString(isTr ? 'tr-TR' : 'en-US')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans pt-1">
                    {reply.content}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Reply Form */}
          <div className="rounded-3xl border border-slate-800 bg-[#0e111a] p-6 shadow-xl space-y-4">
            <h4 className="text-sm font-bold text-slate-200">
              {isTr ? 'Yanıt Yazın' : 'Post a Reply'}
            </h4>
            {replySuccess && (
              <div className="p-3 rounded-xl border border-emerald-500/40 bg-emerald-950/20 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{isTr ? 'Yanıtınız başarıyla yayınlandı!' : 'Your reply has been posted successfully!'}</span>
              </div>
            )}
            <form onSubmit={handleSendReply} className="space-y-3">
              <textarea
                required
                rows={4}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={isTr ? 'Bu konuya düşüncelerinizi veya çözüm önerinizi yazın...' : 'Share your thoughts or troubleshooting solution...'}
                className="w-full rounded-2xl border border-slate-800 bg-[#131724] p-3.5 text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 resize-none transition-all"
              />
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 hover:brightness-110 px-5 py-2.5 text-xs font-bold text-white transition-all shadow-md shadow-indigo-500/20 active:scale-95 ml-auto"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{isTr ? 'Yanıtı Gönder' : 'Send Reply'}</span>
              </button>
            </form>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#08090e] py-6 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} XIVIZLEY — {isTr ? 'Açık Kaynak Görsel Homelab & Sunucu Mimarı' : 'Open Source Visual Homelab & Server Architect'}</p>
      </footer>
    </div>
  );
}
