'use client';

import React, { useState } from 'react';
import { useArchitectStore } from '@/store/useArchitectStore';
import { runAIDoctor } from '@/lib/engines/aiDoctor';
import { useI18nStore } from '@/lib/i18n/store';
import { X, Sparkles, CheckCircle2, Wrench, ShieldCheck, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToast?: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
}

export function AIDoctorModal({ isOpen, onClose, onToast }: AIDoctorModalProps) {
  const { lang } = useI18nStore();
  const isTr = lang === 'tr';
  const isPt = lang === 'pt';

  const nodes = useArchitectStore((s) => s.nodes);
  const edges = useArchitectStore((s) => s.edges);
  const loadCustomStack = useArchitectStore((s) => s.loadCustomStack);

  const [report, setReport] = useState<string[] | null>(null);

  if (!isOpen) return null;

  const handleRunDoctor = () => {
    const result = runAIDoctor(nodes, edges, lang);
    loadCustomStack(result.stackNodes, result.stackEdges);
    setReport(result.actionsTaken);
    onToast?.(
      'success',
      isTr
        ? 'AI Doktor Onarımı Tamamlandı!'
        : isPt
        ? 'Reparo do Médico IA Concluído!'
        : 'AI Doctor Fix Complete!',
      isTr
        ? `${result.actionsTaken.length} iyileştirme yapıldı.`
        : isPt
        ? `${result.actionsTaken.length} melhorias aplicadas.`
        : `${result.actionsTaken.length} optimizations applied.`
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#090514]/85 p-4 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-xl overflow-hidden rounded-[2px] border border-[#2B1A42] bg-[#0D0719] shadow-2xl text-[#F5F3FF]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2B1A42] px-6 py-4 bg-[#120A21]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[2px] border border-[#2B1A42] bg-[#06030D] text-[#C084FC]">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <h2
                className="text-base font-bold text-[#F5F3FF] flex items-center gap-2"
                style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}
              >
                {isTr
                  ? 'AI Mimar Doktoru (Auto-Fix & Optimize)'
                  : isPt
                  ? 'Médico de Arquitetura IA (Auto-Correção & Otimização)'
                  : 'AI Architect Doctor (Auto-Fix & Optimize)'}
                <span className="rounded-[2px] bg-[#1E1235] px-2 py-0.5 text-[10px] font-mono font-bold text-[#C084FC] border border-[#2B1A42]">
                  {isTr ? 'Otomatik Onar' : isPt ? 'Auto-Correção' : 'Auto-Fix'}
                </span>
              </h2>
              <p className="text-xs text-[#A19BAF] mt-0.5">
                {isTr
                  ? 'Port çakışmalarını, eksik veritabanlarını ve ağ bağlantılarını tek tıkla analiz edip onarır.'
                  : isPt
                  ? 'Analisa e repara conflitos de portas, bancos de dados ausentes e redes em 1 clique.'
                  : 'Analyzes and heals port collisions, missing databases, and network links in 1-click.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-[2px] p-1.5 text-[#8B7D9E] hover:bg-[#1E1235] hover:text-[#F5F3FF] transition-colors"
            aria-label={isTr ? 'Kapat' : isPt ? 'Fechar' : 'Close'}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {!report ? (
            <div className="space-y-4 text-center py-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[2px] border border-[#2B1A42] bg-[#120A21] text-[#C084FC]">
                <Sparkles className="h-7 w-7 animate-pulse text-[#8B5CF6]" />
              </div>
              <div>
                <h3
                  className="text-sm font-bold text-[#F5F3FF]"
                  style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}
                >
                  {isTr
                    ? `Tuvalinizdeki ${nodes.length} Servis Taranacak`
                    : isPt
                    ? `${nodes.length} Serviços na Tela Serão Escaneados`
                    : `${nodes.length} Services on Canvas Will Be Scanned`}
                </h3>
                <p className="mt-1 text-xs text-[#A19BAF] max-w-sm mx-auto leading-relaxed">
                  {isTr
                    ? 'AI Doktoru port çakışmalarını otomatik alternatif portlarla değiştirecek ve Nextcloud/Immich gibi servislerinize eksik veritabanlarını ekleyecektir.'
                    : isPt
                    ? 'O Médico IA resolverá conflitos de porta com alternativas livres e anexará bancos de dados ausentes para serviços como Nextcloud ou Immich.'
                    : 'AI Doctor will resolve port conflicts with free alternatives and automatically attach missing databases for services like Nextcloud or Immich.'}
                </p>
              </div>

              <div className="pt-3">
                <button
                  onClick={handleRunDoctor}
                  disabled={nodes.length === 0}
                  className="inline-flex items-center gap-2 rounded-[2px] bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-40 disabled:cursor-not-allowed px-6 py-2.5 text-xs font-mono font-bold text-white transition-all shadow-md active:scale-95"
                >
                  <Wrench className="h-4 w-4" />
                  <span>
                    {isTr
                      ? 'Şimdi Analiz Et ve Onar'
                      : isPt
                      ? 'Analisar e Corrigir Agora'
                      : 'Analyze & Heal Stack Now'}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>
                  {isTr
                    ? 'Uygulanan Optimizasyon Raporu:'
                    : isPt
                    ? 'Relatório de Otimizações Aplicadas:'
                    : 'Optimization Report Applied:'}
                </span>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2 rounded-[2px] border border-[#2B1A42] bg-[#06030D] p-4 text-xs font-mono text-[#C4B5FD] scrollbar-thin scrollbar-thumb-[#2B1A42]">
                {report.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 shrink-0">✓</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end pt-3">
                <button
                  onClick={onClose}
                  className="rounded-[2px] border border-[#2B1A42] bg-[#120A21] hover:border-[#8B5CF6] px-5 py-2 text-xs font-mono font-semibold text-[#F5F3FF] transition-all"
                >
                  {isTr ? 'Tamam, Kapat' : isPt ? 'Concluir e Fechar' : 'Done, Close'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
