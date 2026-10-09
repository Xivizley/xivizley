'use client';

import React, { useState } from 'react';
import { X, UploadCloud, FileCode, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { parseComposeToCanvas } from '@/lib/utils/composeParser';
import { useArchitectStore } from '@/store/useArchitectStore';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (msg: string) => void;
}

export function ImportModal({ isOpen, onClose, onSuccess }: ImportModalProps) {
  const [yamlInput, setYamlInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ detected: number; unmatched: number } | null>(null);

  const loadFromJson = useArchitectStore((s) => s.loadFromJson);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setYamlInput(content);
      validateYaml(content);
    };
    reader.readAsText(file);
  };

  const validateYaml = (text: string) => {
    if (!text.trim()) {
      setError(null);
      setPreview(null);
      return;
    }
    try {
      const res = parseComposeToCanvas(text);
      setPreview({ detected: res.detectedCount, unmatched: res.unmatchedCount });
      setError(null);
    } catch (err: any) {
      setError(err.message);
      setPreview(null);
    }
  };

  const handleImport = () => {
    try {
      const res = parseComposeToCanvas(yamlInput);
      if (res.nodes.length === 0) {
        setError('Herhangi bir servis algılanamadı.');
        return;
      }
      loadFromJson(JSON.stringify({ nodes: res.nodes, edges: res.edges }));
      onSuccess?.(`${res.nodes.length} servis tuvale başarıyla yüklendi!`);
      onClose();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const SAMPLE_YAML = `version: "3.8"
services:
  nextcloud:
    image: nextcloud:latest
    ports:
      - "8080:80"
    depends_on:
      - postgres
  postgres:
    image: postgres:15
    ports:
      - "5432:5432"`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-[#0e111a] shadow-2xl p-6 overflow-hidden">
        {/* Glow Header */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-indigo-500/10 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <UploadCloud className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                Docker Compose İçe Aktar
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Otomatik Tuval Dönüştürücü
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Mevcut <code className="text-indigo-400">docker-compose.yml</code> dosyanızı yapıştırın; servisler otomatik görsel şemaya dönüşsün.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="mt-4 space-y-4">
          {/* File Upload Button & Helper */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-700 bg-[#131724] hover:bg-slate-800 text-xs font-medium text-slate-200 cursor-pointer transition-colors">
              <FileCode className="h-4 w-4 text-indigo-400" />
              <span>.yml / .yaml Dosyası Seç</span>
              <input type="file" accept=".yml,.yaml,.txt" onChange={handleFileUpload} className="hidden" />
            </label>
            <button
              onClick={() => {
                setYamlInput(SAMPLE_YAML);
                validateYaml(SAMPLE_YAML);
              }}
              className="text-xs text-indigo-400 hover:underline flex items-center gap-1"
            >
              <Sparkles className="h-3 w-3" />
              Örnek YAML Doldur
            </button>
          </div>

          {/* Textarea */}
          <textarea
            value={yamlInput}
            onChange={(e) => {
              setYamlInput(e.target.value);
              validateYaml(e.target.value);
            }}
            placeholder="version: '3.8'&#10;services:&#10;  nextcloud:&#10;    image: nextcloud:latest..."
            rows={10}
            className="w-full rounded-xl border border-slate-800 bg-[#08090E] p-3 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/60 resize-none scrollbar-thin scrollbar-thumb-slate-700"
          />

          {/* Validation & Preview status */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-xs text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {preview && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>
                  <strong>{preview.detected + preview.unmatched} Servis</strong> algılandı ({preview.detected} katalog eşleşti, {preview.unmatched} özel servis).
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            İptal
          </button>
          <button
            onClick={handleImport}
            disabled={!yamlInput.trim() || !!error}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold text-white shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
          >
            <Sparkles className="h-4 w-4" />
            <span>Tuvale Dönüştür & Yükle</span>
          </button>
        </div>
      </div>
    </div>
  );
}
