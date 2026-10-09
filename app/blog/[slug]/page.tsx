// ============================================================
// XIVIZLEY — Blog Article Detail Page (/blog/[slug])
// app/blog/[slug]/page.tsx
// ============================================================

import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Navbar } from '@/components/shared/Navbar';
import { BLOG_POSTS } from '@/lib/data/blog';
import {
  BookOpen,
  Boxes,
  Sparkles,
  ArrowLeft,
  Clock,
  ExternalLink,
  ShieldCheck,
  Server,
  Zap,
} from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    return {
      title: 'Yazı Bulunamadı — XIVIZLEY Blog',
    };
  }

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: `${post.title} | XIVIZLEY`,
      description: post.description,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author.name],
      tags: post.tags,
      images: ['/og.png'],
    },
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
  };
}

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    author: {
      '@type': 'Person',
      name: post.author.name,
      jobTitle: post.author.role,
    },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    publisher: {
      '@type': 'Organization',
      name: 'XIVIZLEY',
      logo: {
        '@type': 'ImageObject',
        url: 'https://xivizley.com.tr/icon.svg',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://xivizley.com.tr/blog/${post.slug}`,
    },
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#08090e] text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">
        {/* Back Link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-indigo-400 mb-8 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Tüm Rehberlere Dön</span>
        </Link>

        {/* Article Header */}
        <header className="mb-10 space-y-4 border-b border-slate-800/80 pb-8">
          <div className="flex items-center gap-2 text-xs">
            <span className="rounded-full bg-indigo-500/15 border border-indigo-500/30 px-3 py-0.5 font-bold text-indigo-300 flex items-center gap-1">
              <span>{post.icon}</span>
              <span>{post.categoryLabel}</span>
            </span>
            <span className="flex items-center gap-1 text-slate-500">
              <Clock className="h-3 w-3" />
              <span>{post.readTime}</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            {post.title}
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed font-medium">
            {post.subtitle}
          </p>

          <div className="flex items-center justify-between pt-4 text-xs text-slate-400">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/20 border border-indigo-500/40 text-sm">
                {post.author.avatar}
              </div>
              <div>
                <p className="font-bold text-slate-200">{post.author.name}</p>
                <p className="text-[10px] text-slate-500">{post.author.role}</p>
              </div>
            </div>
            <span>{new Date(post.publishedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
        </header>

        {/* Interactive Template Funnel CTA Banner */}
        {post.templateId && (
          <div className="mb-10 rounded-3xl border border-indigo-500/40 bg-gradient-to-r from-indigo-950/40 via-[#0e111a] to-purple-950/30 p-6 shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-300">
                <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                <span>Canlı Görsel Mimar Entegrasyonu</span>
              </div>
              <h3 className="text-base font-bold text-white">Bu Mimariyi Editörde Açıp Tek Tıkla Kurun</h3>
              <p className="text-xs text-slate-400">
                Port çakışmalarını otomatik çözün ve VDS sunucunuza tek satırlık bash scripti ile kurun.
              </p>
            </div>
            <Link
              href={`/architect?template=${post.templateId}`}
              className="shrink-0 flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 hover:brightness-110 px-5 py-3 text-xs font-bold text-white transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
            >
              <Boxes className="h-4 w-4" />
              <span>Mimarda Tasarla ➔</span>
            </Link>
          </div>
        )}

        {/* Article Body Content */}
        <div className="prose prose-invert max-w-none space-y-6 text-sm sm:text-base text-slate-300 leading-relaxed">
          {post.content.split('\n\n').map((block, idx) => {
            if (block.startsWith('## ')) {
              return (
                <h2 key={idx} className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-8 mb-4 border-b border-slate-800/80 pb-2">
                  {block.replace('## ', '')}
                </h2>
              );
            }
            if (block.startsWith('---')) {
              return <hr key={idx} className="border-slate-800 my-6" />;
            }
            if (block.startsWith('```')) {
              const codeStr = block.replace(/```[a-z]*\n?/g, '').trim();
              return (
                <pre key={idx} className="rounded-2xl border border-slate-800 bg-[#08090E] p-4 text-xs font-mono text-indigo-300 overflow-x-auto my-4">
                  <code>{codeStr}</code>
                </pre>
              );
            }
            return <p key={idx}>{block}</p>;
          })}
        </div>

        {/* Sponsor VDS Recommendation Card */}
        <div className="mt-12 rounded-3xl border border-indigo-500/30 bg-[#0e111a] p-6 text-center space-y-3 shadow-xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/40 bg-indigo-950/40 px-3 py-1 text-xs font-bold text-indigo-300">
            <Server className="h-3.5 w-3.5" />
            <span>Önerilen High-Speed VDS Altyapısı</span>
          </div>
          <h3 className="text-lg font-bold text-white">10 Gbps NVMe VDS Sunucularda Tek Tıkla Çalıştırın</h3>
          <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
            Resmi sponsorumuz <strong>OWEB (TR Cloud)</strong> ve <strong>Hosting.com.tr</strong> 10 Gbit/s NVMe VDS sunucularında XIVIZLEY tek tıkla kurulum scripti %100 uyumluluk garantisiyle çalışır.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://www.oweb.net.tr/aff.php?aff=975"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-500/40 bg-indigo-950/20 hover:bg-indigo-900/40 px-4 py-2 text-xs font-bold text-indigo-300 transition-all"
            >
              <span>OWEB TR Cloud 10 Gbps İncele</span>
              <ExternalLink className="h-3 w-3" />
            </a>
            <a
              href="https://www.hosting.com.tr/aff.php?aff=1702"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-purple-500/40 bg-purple-950/20 hover:bg-purple-900/40 px-4 py-2 text-xs font-bold text-purple-300 transition-all"
            >
              <span>Hosting.com.tr VDS Ultra İncele</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#08090e] py-6 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} XIVIZLEY — Açık Kaynak Görsel Homelab & Sunucu Mimarı</p>
      </footer>
    </div>
  );
}
