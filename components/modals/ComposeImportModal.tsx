'use client';

import React, { useState } from 'react';
import { useArchitectStore } from '@/store/useArchitectStore';
import { parseDockerComposeYaml } from '@/lib/parsers/composeParser';
import { useI18nStore } from '@/lib/i18n/store';
import { X, FileCode2, Upload, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ComposeImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToast?: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
}

export function ComposeImportModal({ isOpen, onClose, onToast }: ComposeImportModalProps) {
  const { lang } = useI18nStore();
  const isTr = lang === 'tr';
  const isPt = lang === 'pt';

  const [yamlText, setYamlText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const loadCustomStack = useArchitectStore((s) => s.loadCustomStack);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setYamlText(content);
      setError(null);
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (!yamlText.trim()) {
      setError(
        isTr
          ? 'Lütfen bir docker-compose.yml içeriği yapıştırın veya dosya yükleyin.'
          : isPt
          ? 'Por favor, cole o conteúdo do docker-compose.yml ou carregue um arquivo.'
          : 'Please paste docker-compose.yml content or upload a file.'
      );
      return;
    }

    const result = parseDockerComposeYaml(yamlText);

    if (result.errors.length > 0) {
      setError(result.errors.join('\n'));
      return;
    }

    if (result.stackNodes.length === 0) {
      setError(
        isTr
          ? 'Ayrıştırılabilecek geçerli bir servis bulunamadı.'
          : isPt
          ? 'Nenhum serviço válido encontrado para importar.'
          : 'No valid services found to parse.'
      );
      return;
    }

    loadCustomStack(result.stackNodes, result.stackEdges);

    onToast?.(
      'success',
      isTr ? 'Compose İçe Aktarıldı!' : isPt ? 'Compose Importado!' : 'Compose Imported!',
      isTr
        ? `${result.stackNodes.length} servis tuvale başarıyla yerleştirildi.`
        : isPt
        ? `${result.stackNodes.length} serviços posicionados na tela com sucesso.`
        : `${result.stackNodes.length} services successfully placed on canvas.`
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-800 bg-[#0e111a] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 px-6 py-4 bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-[#0e111a]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400 ring-1 ring-indigo-500/40 shadow-inner">
              <FileCode2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                {isTr
                  ? 'Docker Compose İçe Aktar & Tersine Mühendislik'
                  : isPt
                  ? 'Importar Docker Compose & Engenharia Reversa'
                  : 'Import Docker Compose & Reverse Engineer'}
                <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-300 border border-indigo-500/30">
                  Auto-Visualizer
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {isTr
                  ? 'Mevcut docker-compose.yml dosyanızı yükleyin, görsel tuval mimarisine anında dönüştürün.'
                  : isPt
                  ? 'Carregue seu docker-compose.yml existente e converta-o instantaneamente em arquitetura visual.'
                  : 'Upload your existing docker-compose.yml file and turn it into a visual canvas stack instantly.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-500 hover:bg-slate-800 hover:text-slate-200 transition-colors"
            aria-label={isTr ? 'Kapat' : isPt ? 'Fechar' : 'Close'}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Drag or upload box */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              {isTr
                ? 'YAML İçeriği Yapıştırın veya Dosya Seçin:'
                : isPt
                ? 'Cole o Conteúdo YAML ou Selecione um Arquivo:'
                : 'Paste YAML Content or Select File:'}
            </span>
            <label className="flex items-center gap-1.5 cursor-pointer rounded-xl border border-slate-700/80 bg-[#131724] px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-indigo-500 transition-all shadow-sm">
              <Upload className="h-3.5 w-3.5 text-indigo-400" />
              <span>{isTr ? 'Dosya Seç (.yml)' : isPt ? 'Selecionar Arquivo (.yml)' : 'Select File (.yml)'}</span>
              <input
                type="file"
                accept=".yml,.yaml,text/yaml"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          <textarea
            value={yamlText}
            onChange={(e) => {
              setYamlText(e.target.value);
              setError(null);
            }}
            placeholder={`version: '3.8'\nservices:\n  nextcloud:\n    image: nextcloud:latest\n    ports:\n      - "8080:80"\n  heimdall:\n    image: linuxserver/heimdall:latest\n    ports:\n      - "3080:80"`}
            rows={10}
            className="w-full rounded-2xl border border-slate-800 bg-[#08090e] p-3.5 text-xs font-mono text-indigo-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 resize-none scrollbar-thin scrollbar-thumb-slate-700 shadow-inner"
          />

          {error && (
            <div className="flex items-start gap-2 rounded-2xl border border-red-500/30 bg-red-950/30 p-3 text-xs text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
              <pre className="whitespace-pre-wrap font-sans">{error}</pre>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all"
            >
              {isTr ? 'İptal' : isPt ? 'Cancelar' : 'Cancel'}
            </button>
            <button
              type="button"
              onClick={handleImport}
              disabled={!yamlText.trim()}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed px-5 py-2.5 text-xs font-bold text-white transition-all shadow-md shadow-indigo-500/20 active:scale-95"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{isTr ? 'Görsel Tuvale Aktar' : isPt ? 'Importar para Tela Visual' : 'Import to Visual Canvas'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
