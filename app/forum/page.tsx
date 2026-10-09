// ============================================================
// XIVIZLEY — Homelab & Docker Community Forum (/forum)
// app/forum/page.tsx
// ============================================================

'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/shared/Navbar';
import { FORUM_TOPICS, ForumTopicItem } from '@/lib/data/forum';
import {
  MessageSquare,
  Search,
  Sparkles,
  Pin,
  Eye,
  MessageCircle,
  Clock,
  User,
  PlusCircle,
  Filter,
  Boxes,
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

export default function ForumIndexPage() {
  const { lang } = useI18nStore();
  const isTr = lang === 'tr';

  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [showNewTopicModal, setShowNewTopicModal] = useState(false);

  // New topic state
  const [newTitle, setNewTitle] = useState('');
  const [newCat, setNewCat] = useState('genel');
  const [newContent, setNewContent] = useState('');
  const [topics, setTopics] = useState<ForumTopicItem[]>(FORUM_TOPICS);

  const categories = [
    { id: 'all', label: isTr ? 'Tüm Konular' : 'All Topics', icon: '💬' },
    { id: 'vds', label: isTr ? 'VDS & Sunucu' : 'VDS & Server', icon: '🖥️' },
    { id: 'docker', label: isTr ? 'Docker & Compose' : 'Docker & Compose', icon: '🐳' },
    { id: 'mimari', label: isTr ? 'Mimari Tasarım' : 'Architecture Design', icon: '📐' },
    { id: 'yardim', label: isTr ? 'Yardım & Destek' : 'Help & Support', icon: '🆘' },
  ];

  const filteredTopics = useMemo(() => {
    const q = search.toLowerCase().trim();
    return topics.filter((t) => {
      const en = FORUM_TOPIC_EN_MAP[t.id];
      const title = !isTr && en ? en.title : t.title;

      const matchesCat = selectedCat === 'all' || t.category === selectedCat;
      const matchesSearch =
        q === '' ||
        title.toLowerCase().includes(q) ||
        t.content.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [search, selectedCat, topics, isTr]);

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const created: ForumTopicItem = {
      id: `topic-${Date.now()}`,
      slug: newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      title: newTitle.trim(),
      category: newCat as any,
      categoryLabel: categories.find((c) => c.id === newCat)?.label || 'Genel',
      categoryBadge: 'border-indigo-500/40 bg-indigo-950/30 text-indigo-300',
      author: {
        name: isTr ? 'Siz (Topluluk Üyesi)' : 'You (Community Member)',
        avatar: '👤',
        role: isTr ? 'Üye' : 'Member',
      },
      isPinned: false,
      viewCount: 1,
      replyCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      content: newContent.trim(),
      replies: [],
    };

    setTopics([created, ...topics]);
    setNewTitle('');
    setNewContent('');
    setShowNewTopicModal(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#08090e] text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-12">
        {/* Header Hero */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-10 pb-8 border-b border-slate-800/80">
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-300 shadow-inner">
              <MessageSquare className="h-3.5 w-3.5 text-indigo-400" />
              <span>{isTr ? 'XIVIZLEY Homelab & Docker Topluluk Forumu' : 'XIVIZLEY Homelab & Docker Community Forum'}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              {isTr ? 'Topluluk Tartışmaları' : 'Community Discussions'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              {isTr
                ? 'VDS sunucu deneyimlerinizi paylaşın, Docker port çakışmalarına yardım isteyin ve mimari önerileri tartışın.'
                : 'Share your VDS experiences, troubleshoot Docker port conflicts, and discuss architecture proposals.'}
            </p>
          </div>

          <button
            onClick={() => setShowNewTopicModal(true)}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 hover:brightness-110 px-5 py-3 text-xs font-bold text-white transition-all shadow-lg shadow-indigo-500/20 active:scale-95 shrink-0"
          >
            <PlusCircle className="h-4 w-4" />
            <span>{isTr ? 'Yeni Konu Aç' : 'New Topic'}</span>
          </button>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none w-full sm:w-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border whitespace-nowrap shrink-0',
                  selectedCat === cat.id
                    ? 'border-indigo-500/50 bg-indigo-500/20 text-indigo-300 shadow-lg shadow-indigo-500/10'
                    : 'border-slate-800 bg-[#0e111a]/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                )}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72 shrink-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isTr ? 'Konularda ara...' : 'Search discussions...'}
              className="w-full rounded-xl border border-slate-800 bg-[#0e111a] pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 transition-all"
            />
          </div>
        </div>

        {/* Forum Topic List */}
        <div className="space-y-3">
          {filteredTopics.map((topic) => {
            const en = FORUM_TOPIC_EN_MAP[topic.id];
            const title = !isTr && en ? en.title : topic.title;
            const categoryLabel = !isTr && en ? en.categoryLabel : topic.categoryLabel;
            const authorRole = !isTr
              ? (topic.author.role === 'Sistem Yöneticisi' ? 'System Architect' : topic.author.role === 'Medya Homelab Uzmanı' ? 'Media Homelab Specialist' : topic.author.role)
              : topic.author.role;

            return (
              <div
                key={topic.id}
                className="group rounded-2xl border border-slate-800/80 bg-[#0e111a] p-5 backdrop-blur-md shadow-xl hover:border-indigo-500/40 transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {topic.isPinned && (
                      <span className="flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-300 shrink-0">
                        <Pin className="h-3 w-3 text-amber-400" />
                        {isTr ? 'Sabit' : 'Pinned'}
                      </span>
                    )}
                    <span className={cn('rounded-full px-2.5 py-0.5 text-[10px] font-bold border shrink-0', topic.categoryBadge)}>
                      {categoryLabel}
                    </span>
                  </div>

                  <Link href={`/forum/topic/${topic.id}`} className="block">
                    <h3 className="text-sm sm:text-base font-bold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-1">
                      {title}
                    </h3>
                  </Link>

                  <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3 text-slate-400" />
                      <strong className="text-slate-300">{topic.author.name}</strong>
                      <span className="text-[10px] text-slate-500">({authorRole})</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(topic.createdAt).toLocaleDateString(isTr ? 'tr-TR' : 'en-US')}</span>
                    </span>
                  </div>
                </div>

                {/* Stats & Actions */}
                <div className="flex items-center gap-4 text-xs text-slate-400 border-t sm:border-t-0 sm:border-l border-slate-800/80 pt-3 sm:pt-0 sm:pl-5 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-slate-400" title={isTr ? 'Görüntülenme' : 'Views'}>
                      <Eye className="h-3.5 w-3.5 text-slate-500" />
                      <span>{topic.viewCount}</span>
                    </span>
                    <span className="flex items-center gap-1 text-slate-400" title={isTr ? 'Yanıtlar' : 'Replies'}>
                      <MessageCircle className="h-3.5 w-3.5 text-slate-500" />
                      <span>{topic.replyCount}</span>
                    </span>
                  </div>

                  <Link
                    href={`/forum/topic/${topic.id}`}
                    className="rounded-xl border border-slate-700/60 bg-[#131724] hover:bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-indigo-300 hover:text-white transition-all"
                  >
                    {isTr ? 'Oku & Yanıtla' : 'Read & Reply'}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* New Topic Modal */}
      {showNewTopicModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-3xl border border-slate-800 bg-[#0e111a] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {isTr ? 'Yeni Tartışma Konusu Aç' : 'Start New Discussion'}
              </h3>
              <button
                onClick={() => setShowNewTopicModal(false)}
                className="text-slate-500 hover:text-slate-300"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTopic} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isTr ? 'Kategori' : 'Category'}
                </label>
                <select
                  value={newCat}
                  onChange={(e) => setNewCat(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-[#131724] px-3 py-2 text-xs text-slate-200"
                >
                  <option value="vds">{isTr ? 'VDS & Sunucu' : 'VDS & Server'}</option>
                  <option value="docker">Docker & Compose</option>
                  <option value="mimari">{isTr ? 'Mimari Tasarım' : 'Architecture Design'}</option>
                  <option value="yardim">{isTr ? 'Yardım & Destek' : 'Help & Support'}</option>
                  <option value="genel">{isTr ? 'Genel Tartışma' : 'General Discussion'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isTr ? 'Konu Başlığı *' : 'Topic Title *'}
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={isTr ? 'Örn: Ubuntu VDS üzerinde Port 8050 erişim sorunu' : 'e.g. Port 8050 access issue on Ubuntu VDS'}
                  className="w-full rounded-xl border border-slate-800 bg-[#131724] px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isTr ? 'Açıklama ve Detaylar *' : 'Description & Details *'}
                </label>
                <textarea
                  required
                  rows={5}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder={
                    isTr
                      ? 'Sorunuzu, aldığınız hata mesajını veya mimari fikrinizi detaylıca açıklayın...'
                      : 'Describe your issue, error message, or architecture concept in detail...'
                  }
                  className="w-full rounded-xl border border-slate-800 bg-[#131724] p-3 text-xs text-slate-200 placeholder-slate-500 resize-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewTopicModal(false)}
                  className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
                >
                  {isTr ? 'İptal' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:brightness-110 px-5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-500/20"
                >
                  {isTr ? 'Konuyu Yayınla' : 'Publish Topic'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#08090e] py-6 text-center text-xs text-slate-500">
        <p>
          {isTr
            ? `© ${new Date().getFullYear()} XIVIZLEY — Açık Kaynak Görsel Homelab & Sunucu Mimarı`
            : `© ${new Date().getFullYear()} XIVIZLEY — Open Source Visual Homelab & Server Architect`}
        </p>
      </footer>
    </div>
  );
}

