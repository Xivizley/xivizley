'use client';

// ============================================================
// XIVIZLEY — Interactive Architecture Embed Page (/embed)
// Minimalist, high-performance, iframe-ready canvas widget
// ============================================================

import React, { Suspense, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { useArchitectStore } from '@/store/useArchitectStore';
import { Loader2 } from 'lucide-react';
import { useI18nStore } from '@/lib/i18n/store';

function EmbedCanvasLoading() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#08090e]">
      <div className="flex flex-col items-center gap-3 text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
        <p className="text-xs font-mono text-slate-400">Loading interactive architecture...</p>
      </div>
    </div>
  );
}

const ArchitectCanvas = dynamic(
  () => import('@/components/canvas/ArchitectCanvas').then((m) => m.ArchitectCanvas),
  {
    ssr: false,
    loading: () => <EmbedCanvasLoading />,
  }
);

function EmbedContent() {
  const searchParams = useSearchParams();
  const loadFromJson = useArchitectStore((s) => s.loadFromJson);
  const setLang = useI18nStore((s) => s.setLang);

  useEffect(() => {
    if (!searchParams) return;

    // Optional lang param (?lang=en | pt | tr)
    const langParam = searchParams.get('lang');
    if (langParam === 'en' || langParam === 'tr' || langParam === 'pt') {
      setLang(langParam);
    }

    // Canvas state via base64 encoded JSON
    const canvasParam = searchParams.get('canvas');
    if (canvasParam) {
      try {
        const json = decodeURIComponent(
          escape(
            atob(
              canvasParam.replace(/-/g, '+').replace(/_/g, '/') +
                '=='.slice((canvasParam.length * 3) % 3 === 0 ? 0 : 1)
            )
          )
        );
        loadFromJson(json);
        return;
      } catch (err) {
        console.warn('[XIVIZLEY Embed] Failed to parse canvas param', err);
      }
    }

    // Template query param (e.g. ?template=ai-studio)
    const templateParam = searchParams.get('template');
    if (templateParam) {
      useArchitectStore.getState().loadTemplate(templateParam);
      return;
    }

    // Modules query param (e.g. ?modules=jellyfin,radarr,sonarr)
    const modulesParam = searchParams.get('modules');
    if (modulesParam) {
      const moduleIds = modulesParam.split(',').map((s) => s.trim()).filter(Boolean);
      if (moduleIds.length > 0) {
        useArchitectStore.getState().clearCanvas();
        moduleIds.forEach((id, idx) => {
          const col = idx % 3;
          const row = Math.floor(idx / 3);
          useArchitectStore.getState().addModule(id, { x: 100 + col * 260, y: 100 + row * 240 });
        });
      }
    }
  }, [searchParams, loadFromJson, setLang]);

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-[#08090e]">
      <h1 className="sr-only">XIVIZLEY Interactive Architecture Embed</h1>
      <ArchitectCanvas isEmbed={true} />
    </main>
  );
}

export default function EmbedPage() {
  return (
    <Suspense fallback={<EmbedCanvasLoading />}>
      <EmbedContent />
    </Suspense>
  );
}
