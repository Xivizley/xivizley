import { Metadata } from 'next';
import Link from 'next/link';
import { TemplatesClient } from './TemplatesClient';
import { Navbar } from '@/components/shared/Navbar';
import { PLATFORM_STATS } from '@/lib/constants/stats';

export const metadata: Metadata = {
  title: 'Hazır Web & Homelab Docker Şablonları',
  description:
    `${PLATFORM_STATS.totalModules} Docker servisi ve ${PLATFORM_STATS.totalTemplates} hazır şablon ile 1-tıkla kurulabilen WordPress, Ghost, AI, Medya ve DevOps mimarileri.`,
  openGraph: {
    title: 'Hazır Web & Homelab Docker Şablonları | XIVIZLEY',
    description: `${PLATFORM_STATS.totalModules} Docker servisi ve ${PLATFORM_STATS.totalTemplates} hazır şablon ile 1-tıkla kurulabilen mimariler.`,
    url: 'https://xivizley.com.tr/templates',
    siteName: 'XIVIZLEY',
    type: 'website',
  },
  twitter: {
    title: 'Hazır Web & Homelab Docker Şablonları | XIVIZLEY',
    description: `${PLATFORM_STATS.totalModules} Docker servisi ve ${PLATFORM_STATS.totalTemplates} hazır şablon ile 1-tıkla kurulabilen mimariler.`,
  },
  alternates: {
    canonical: 'https://xivizley.com.tr/templates',
  },
};

export default function TemplatesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#090514] text-[#F5F3FF]">
      <Navbar />
      <main className="flex-1">
        <TemplatesClient />
      </main>
      <footer className="border-t border-[#2B1A42] bg-[#070310] py-6 px-4 font-mono text-[11px] text-[#8B7D9E]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[#C084FC] font-semibold">XIVIZLEY</span>
            <span className="text-[#3B255E]">//</span>
            <span>DIN 40719 INDUSTRIAL SPEC</span>
            <span className="text-[#3B255E]">·</span>
            <span>{new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-4 text-[10px] uppercase tracking-wider">
            <Link href="/" className="hover:text-[#F5F3FF] transition-colors">Ana Sayfa</Link>
            <span className="text-[#3B255E]">·</span>
            <Link href="/architect" className="hover:text-[#F5F3FF] transition-colors">Tuval</Link>
            <span className="text-[#3B255E]">·</span>
            <Link href="/blog" className="hover:text-[#F5F3FF] transition-colors">Rehber</Link>
            <span className="text-[#3B255E]">·</span>
            <Link href="/suite" className="hover:text-[#F5F3FF] transition-colors">Suite</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
