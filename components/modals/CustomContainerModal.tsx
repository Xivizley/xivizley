'use client';

import React, { useState } from 'react';
import { useArchitectStore } from '@/store/useArchitectStore';
import { useI18nStore } from '@/lib/i18n/store';
import { X, Box, Plus, Trash2, CheckCircle2 } from 'lucide-react';

interface CustomContainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToast?: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
}

export function CustomContainerModal({ isOpen, onClose, onToast }: CustomContainerModalProps) {
  const { lang } = useI18nStore();
  const isTr = lang === 'tr';
  const isPt = lang === 'pt';

  const addCustomContainer = useArchitectStore((s) => s.addCustomContainer);
  const nodes = useArchitectStore((s) => s.nodes);

  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [ports, setPorts] = useState<Array<{ host: number; container: number; protocol: 'tcp' | 'udp' }>>([
    { host: 8080, container: 80, protocol: 'tcp' },
  ]);
  const [envVars, setEnvVars] = useState<Array<{ key: string; value: string }>>([]);
  const volumes = [{ host: './data', container: '/app/data' }];
  const restart = 'unless-stopped';

  if (!isOpen) return null;

  const handleAddPort = () => {
    setPorts((p) => [...p, { host: 8000, container: 80, protocol: 'tcp' }]);
  };

  const handleRemovePort = (idx: number) => {
    setPorts((p) => p.filter((_, i) => i !== idx));
  };

  const handleAddEnv = () => {
    setEnvVars((e) => [...e, { key: '', value: '' }]);
  };

  const handleRemoveEnv = (idx: number) => {
    setEnvVars((e) => e.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !image.trim()) return;

    const posX = 200 + (nodes.length % 4) * 80;
    const posY = 150 + (nodes.length % 4) * 60;

    const envMap: Record<string, string> = {};
    for (const ev of envVars) {
      if (ev.key.trim()) {
        envMap[ev.key.trim()] = ev.value;
      }
    }

    addCustomContainer({
      label: name.trim(),
      image: image.trim(),
      ports: ports,
      volumes: volumes.map((v) => ({ hostPath: v.host, containerPath: v.container })),
      env: envMap,
      restart,
      position: { x: posX, y: posY },
    });

    onToast?.(
      'success',
      isTr ? 'Özel Konteyner Eklendi!' : isPt ? 'Contêiner Personalizado Adicionado!' : 'Custom Container Added!',
      isTr
        ? `'${name}' tuvale başarıyla yerleştirildi.`
        : isPt
        ? `'${name}' posicionado na tela com sucesso.`
        : `'${name}' placed on canvas successfully.`
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-[2px] border border-[#2B1A42] bg-[#120A21] shadow-2xl scrollbar-thin scrollbar-thumb-[#2B1A42] font-mono text-[#F5F3FF]">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#2B1A42] px-6 py-4 bg-[#0D0719]/95 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[2px] bg-[#1E1235] text-[#C084FC] border border-[#2B1A42]">
              <Box className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-mono font-bold text-[#F5F3FF] flex items-center gap-2">
                {isTr
                  ? 'Özel Docker Konteyneri Ekle'
                  : isPt
                  ? 'Adicionar Contêiner Docker Personalizado'
                  : 'Add Custom Docker Container'}
              </h2>
              <p className="text-xs text-[#8B7D9E]">
                {isTr
                  ? 'Docker Hub veya GHCR üzerindeki herhangi bir imajı tuvalinize ekleyin.'
                  : isPt
                  ? 'Adicione qualquer imagem do Docker Hub ou GHCR à sua tela.'
                  : 'Add any image from Docker Hub or GHCR onto your canvas.'}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono font-semibold text-[#A19BAF] mb-1 block">
                {isTr ? 'Konteyner Adı *' : isPt ? 'Nome do Contêiner *' : 'Container Name *'}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ornek-servis"
                className="w-full rounded-[2px] border border-[#2B1A42] bg-[#090514] px-3 py-2 text-xs font-mono text-[#F5F3FF] placeholder-[#5E4E77] focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>

            <div>
              <label className="text-xs font-mono font-semibold text-[#A19BAF] mb-1 block">
                {isTr ? 'Docker İmajı *' : isPt ? 'Imagem Docker *' : 'Docker Image *'}
              </label>
              <input
                type="text"
                required
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="nginx:alpine or user/app:v1"
                className="w-full rounded-[2px] border border-[#2B1A42] bg-[#090514] px-3 py-2 text-xs font-mono text-[#F5F3FF] placeholder-[#5E4E77] focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>
          </div>

          {/* Port Mappings */}
          <div className="space-y-2 pt-2 border-t border-[#2B1A42]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-semibold text-[#A19BAF]">
                {isTr
                  ? 'Port Eşlemeleri (Host : Container)'
                  : isPt
                  ? 'Mapeamento de Portas (Host : Contêiner)'
                  : 'Port Mappings (Host : Container)'}
              </label>
              <button
                type="button"
                onClick={handleAddPort}
                className="flex items-center gap-1 text-[11px] font-mono text-[#C084FC] hover:text-[#F5F3FF] font-semibold"
              >
                <Plus className="h-3 w-3" />{' '}
                {isTr ? 'Port Ekle' : isPt ? 'Adicionar Porta' : 'Add Port'}
              </button>
            </div>

            {ports.map((p, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="number"
                  value={p.host}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10) || 0;
                    setPorts((cur) => cur.map((item, i) => i === idx ? { ...item, host: val } : item));
                  }}
                  className="w-24 rounded-[2px] border border-[#2B1A42] bg-[#090514] px-2.5 py-1 text-xs font-mono text-[#F5F3FF] focus:outline-none focus:border-[#8B5CF6]"
                  placeholder="Host"
                />
                <span className="text-[#8B7D9E]">:</span>
                <input
                  type="number"
                  value={p.container}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10) || 0;
                    setPorts((cur) => cur.map((item, i) => i === idx ? { ...item, container: val } : item));
                  }}
                  className="w-24 rounded-[2px] border border-[#2B1A42] bg-[#090514] px-2.5 py-1 text-xs font-mono text-[#F5F3FF] focus:outline-none focus:border-[#8B5CF6]"
                  placeholder={isTr ? 'Konteyner' : isPt ? 'Contêiner' : 'Container'}
                />
                <select
                  value={p.protocol}
                  onChange={(e) => {
                    const val = e.target.value as 'tcp' | 'udp';
                    setPorts((cur) => cur.map((item, i) => i === idx ? { ...item, protocol: val } : item));
                  }}
                  className="rounded-[2px] border border-[#2B1A42] bg-[#090514] px-2 py-1 text-xs font-mono text-[#F5F3FF] focus:outline-none focus:border-[#8B5CF6]"
                >
                  <option value="tcp">TCP</option>
                  <option value="udp">UDP</option>
                </select>
                <button
                  type="button"
                  onClick={() => handleRemovePort(idx)}
                  className="p-1 text-[#8B7D9E] hover:text-red-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Environment Variables */}
          <div className="space-y-2 pt-2 border-t border-[#2B1A42]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-semibold text-[#A19BAF]">
                {isTr ? 'Ortam Değişkenleri (.env)' : isPt ? 'Variáveis de Ambiente (.env)' : 'Environment Variables (.env)'}
              </label>
              <button
                type="button"
                onClick={handleAddEnv}
                className="flex items-center gap-1 text-[11px] font-mono text-[#C084FC] hover:text-[#F5F3FF] font-semibold"
              >
                <Plus className="h-3 w-3" />{' '}
                {isTr ? 'Değişken Ekle' : isPt ? 'Adicionar Variável' : 'Add Variable'}
              </button>
            </div>

            {envVars.map((ev, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={ev.key}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEnvVars((cur) => cur.map((item, i) => i === idx ? { ...item, key: val } : item));
                  }}
                  placeholder="KEY"
                  className="flex-1 rounded-[2px] border border-[#2B1A42] bg-[#090514] px-2.5 py-1 text-xs text-[#F5F3FF] font-mono focus:outline-none focus:border-[#8B5CF6]"
                />
                <span className="text-[#8B7D9E]">=</span>
                <input
                  type="text"
                  value={ev.value}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEnvVars((cur) => cur.map((item, i) => i === idx ? { ...item, value: val } : item));
                  }}
                  placeholder="VALUE"
                  className="flex-1 rounded-[2px] border border-[#2B1A42] bg-[#090514] px-2.5 py-1 text-xs text-[#F5F3FF] font-mono focus:outline-none focus:border-[#8B5CF6]"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveEnv(idx)}
                  className="p-1 text-[#8B7D9E] hover:text-red-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2B1A42]">
            <button
              type="button"
              onClick={onClose}
              className="rounded-[2px] border border-[#2B1A42] px-4 py-2 text-xs font-mono font-medium text-[#A19BAF] hover:bg-[#1E1235] hover:text-[#F5F3FF] transition-all"
            >
              {isTr ? 'İptal' : isPt ? 'Cancelar' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={!name.trim() || !image.trim()}
              className="flex items-center gap-2 rounded-[2px] bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-40 disabled:cursor-not-allowed px-5 py-2 text-xs font-mono font-bold text-white transition-all shadow-md shadow-[#8B5CF6]/20"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{isTr ? 'Tuvale Ekle' : isPt ? 'Adicionar à Tela' : 'Add to Canvas'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
