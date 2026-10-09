'use client';

import React, { useState } from 'react';
import { Sparkles, X, Loader2 } from 'lucide-react';

interface AIGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (nodes: Array<{id: string; moduleId: string; x: number; y: number}>, edges: Array<{source: string; target: string}>) => void;
}

const EXAMPLE_PROMPTS = [
  "🎬 Medya Sunucusu",
  "☁️ Kişisel Bulut",
  "🎮 Oyun Sunucusu",
  "🔒 Güvenli Ağ"
];

export function AIGeneratorModal({ isOpen, onClose, onApply }: AIGeneratorModalProps) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    explanation: string;
    nodes: Array<{ id: string; moduleId: string; x: number; y: number }>;
    edges: Array<{ source: string; target: string }>;
  } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    setSuccessData(null);
    
    try {
      const res = await fetch('/api/ai/architect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      
      if (!res.ok) {
        throw new Error('Bir hata oluştu');
      }
      
      const data = await res.json();
      
      if (data.error) {
         throw new Error(data.error);
      }
      
      setSuccessData({
        explanation: data.explanation,
        nodes: data.nodes || [],
        edges: data.edges || []
      });
      
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (successData) {
      onApply(successData.nodes, successData.edges);
      onClose();
      // Reset state for next time
      setPrompt('');
      setSuccessData(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="max-w-lg w-full rounded-[2px] border border-[#2B1A42] bg-[#120A21] p-6 shadow-2xl font-mono">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#C084FC]" />
            <h2 className="text-lg font-mono font-semibold text-[#F5F3FF]">AI Mimar</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-[2px] p-1 text-[#8B7D9E] hover:bg-[#1E1235] hover:text-[#F5F3FF] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {!successData ? (
          <>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Plex ve WireGuard ile güvenli bir medya sunucusu istiyorum..."
              className="w-full rounded-[2px] border border-[#2B1A42] bg-[#090514] p-3 text-xs font-mono text-[#F5F3FF] placeholder-[#5E4E77] focus:border-[#8B5CF6] focus:outline-none"
            />
            
            <div className="mt-3 flex flex-wrap gap-2">
              {EXAMPLE_PROMPTS.map((ex) => (
                <button
                  key={ex}
                  onClick={() => setPrompt(ex)}
                  className="rounded-[2px] border border-[#2B1A42] bg-[#090514] px-3 py-1 text-xs font-mono text-[#A19BAF] transition-colors hover:border-[#8B5CF6] hover:bg-[#1E1235] hover:text-[#F5F3FF]"
                >
                  {ex}
                </button>
              ))}
            </div>
            
            {error && (
              <div className="mt-4 rounded-[2px] bg-red-950/50 border border-red-500/50 p-3 text-xs font-mono text-red-400">
                {error}
              </div>
            )}
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={loading || !prompt.trim()}
                className="flex items-center justify-center gap-2 rounded-[2px] bg-[#8B5CF6] hover:bg-[#7C3AED] px-4 py-2 text-xs font-mono font-bold text-white shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                ✨ Tuvale Yerleştir
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-4 rounded-[2px] bg-[#090514] border border-emerald-500/50 p-4 text-xs font-mono text-emerald-300">
              {successData.explanation}
            </div>
            <div className="flex justify-end gap-3 font-mono">
              <button
                onClick={() => setSuccessData(null)}
                className="rounded-[2px] px-4 py-2 text-xs font-mono font-medium text-[#A19BAF] hover:bg-[#1E1235] hover:text-[#F5F3FF] border border-[#2B1A42] transition-colors"
              >
                Geri Dön
              </button>
              <button
                onClick={handleApply}
                className="flex items-center gap-2 rounded-[2px] bg-[#8B5CF6] hover:bg-[#7C3AED] px-4 py-2 text-xs font-mono font-bold text-white shadow-lg transition-all"
              >
                <Sparkles className="h-4 w-4" />
                ✨ Tuvale Yerleştir
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
