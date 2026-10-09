'use client';

import React, { useState } from 'react';
import { X, Plus, Trash2, Box, Sparkles, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ModuleDefinition, ModuleCategory } from '@/lib/data/modules';

interface CustomModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddModule: (module: ModuleDefinition) => void;
}

const CATEGORY_OPTIONS: { id: ModuleCategory; label: string }[] = [
  { id: 'app', label: 'Uygulama & Web' },
  { id: 'network', label: 'Ağ & DNS' },
  { id: 'storage', label: 'Depolama & Veritabanı' },
  { id: 'media', label: 'Medya & Akış' },
  { id: 'security', label: 'Güvenlik & VPN' },
  { id: 'game', label: 'Oyun Sunucusu' },
];

const PRESET_COLORS = [
  '#06B6D4', // Cyan
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#3B82F6', // Blue
  '#EF4444', // Red
];

export function CustomModuleModal({ isOpen, onClose, onAddModule }: CustomModuleModalProps) {
  const [name, setName] = useState('');
  const [dockerImage, setDockerImage] = useState('');
  const [defaultTag, setDefaultTag] = useState('latest');
  const [category, setCategory] = useState<ModuleCategory>('app');
  const [color, setColor] = useState('#06B6D4');
  const [description, setDescription] = useState('');
  
  // Ports
  const [ports, setPorts] = useState<{ internal: number; default: number; label: string }[]>([
    { internal: 8080, default: 8080, label: 'Web UI' },
  ]);

  // Env
  const [envs, setEnvs] = useState<{ key: string; val: string }[]>([]);

  // Volumes
  const [volumes, setVolumes] = useState<{ hostPath: string; containerPath: string; label: string }[]>([
    { hostPath: './custom/data', containerPath: '/data', label: 'Data' },
  ]);

  if (!isOpen) return null;

  const handleAddPort = () => {
    setPorts([...ports, { internal: 80, default: 80, label: 'Port' }]);
  };

  const handleRemovePort = (idx: number) => {
    setPorts(ports.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !dockerImage.trim()) return;

    const id = `custom-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;

    const environmentList = envs
      .filter((e) => e.key.trim().length > 0)
      .map((e) => ({
        key: e.key.trim(),
        defaultValue: e.val,
        description: 'Özel ortam değişkeni',
        required: false,
      }));

    const newModule: ModuleDefinition = {
      id,
      name: name.trim(),
      category,
      description: description.trim() || 'Kullanıcı tarafından oluşturulmuş özel Docker modülü.',
      dockerImage: dockerImage.trim(),
      defaultTag: defaultTag.trim() || 'latest',
      color,
      icon: 'Box',
      ports: ports.filter((p) => p.internal > 0),
      environment: environmentList,
      volumes: volumes.filter((v) => v.hostPath.trim().length > 0),
      notes: ['Bu modül Özel Modül Stüdyosu ile oluşturulmuştur.'],
      suggestedDependencies: [],
    };

    onAddModule(newModule);
    onClose();

    // Reset Form
    setName('');
    setDockerImage('');
    setDescription('');
    setPorts([{ internal: 8080, default: 8080, label: 'Web UI' }]);
    setEnvs([]);
    setVolumes([{ hostPath: './custom/data', containerPath: '/data', label: 'Data' }]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-[2px] border border-[#2B1A42] bg-[#120A21] shadow-2xl overflow-hidden text-[#F5F3FF] font-mono">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2B1A42] bg-[#0D0719]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[2px] bg-[#1E1235] text-[#C084FC] border border-[#2B1A42]">
              <Box className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-mono font-bold text-[#F5F3FF] flex items-center gap-2">
                Özel Docker Modülü Ekle
                <span className="text-[10px] px-2 py-0.5 rounded-[2px] bg-[#120A21] border border-[#2B1A42] text-[#C084FC] font-mono">v2.5</span>
              </h2>
              <p className="text-xs text-[#8B7D9E]">Kendi Docker imajınızı tuvale sürüklenebilir bir modüle dönüştürün</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-[2px] p-1.5 text-[#8B7D9E] hover:text-[#F5F3FF] hover:bg-[#1E1235] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin scrollbar-thumb-[#2B1A42]">
          
          {/* Row 1: Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-semibold text-[#A19BAF] mb-1.5">
                Modül / Servis Adı *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Örn: RustDesk Server, Ghost CMS"
                className="w-full rounded-[2px] border border-[#2B1A42] bg-[#090514] px-3.5 py-2 text-xs font-mono text-[#F5F3FF] placeholder-[#5E4E77] focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-semibold text-[#A19BAF] mb-1.5">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ModuleCategory)}
                className="w-full rounded-[2px] border border-[#2B1A42] bg-[#090514] px-3.5 py-2 text-xs font-mono text-[#F5F3FF] focus:outline-none focus:border-[#8B5CF6]"
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Docker Image & Tag */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-mono font-semibold text-[#A19BAF] mb-1.5">
                Docker İmajı *
              </label>
              <input
                type="text"
                required
                value={dockerImage}
                onChange={(e) => setDockerImage(e.target.value)}
                placeholder="Örn: rustdesk/rustdesk-server, ghost, redis"
                className="w-full rounded-[2px] border border-[#2B1A42] bg-[#090514] px-3.5 py-2 text-xs font-mono text-[#F5F3FF] placeholder-[#5E4E77] focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-semibold text-[#A19BAF] mb-1.5">
                Tag / Sürüm
              </label>
              <input
                type="text"
                value={defaultTag}
                onChange={(e) => setDefaultTag(e.target.value)}
                placeholder="latest, alpine, 1.2.0"
                className="w-full rounded-[2px] border border-[#2B1A42] bg-[#090514] px-3.5 py-2 text-xs font-mono text-[#F5F3FF] focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>
          </div>

          {/* Description & Color */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-mono font-semibold text-[#A19BAF] mb-1.5">
                Açıklama (İsteğe Bağlı)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Bu servisin ne işe yaradığını kısaca açıklayın..."
                className="w-full rounded-[2px] border border-[#2B1A42] bg-[#090514] px-3.5 py-2 text-xs font-mono text-[#F5F3FF] placeholder-[#5E4E77] focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-semibold text-[#A19BAF] mb-1.5">
                Kart Vurgu Rengi
              </label>
              <div className="flex items-center gap-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={cn(
                      'h-6 w-6 rounded-[2px] transition-transform flex items-center justify-center border border-[#2B1A42]',
                      color === c ? 'scale-110 ring-2 ring-[#8B5CF6]' : 'hover:scale-105'
                    )}
                    style={{ backgroundColor: c }}
                  >
                    {color === c && <Check className="h-3 w-3 text-black stroke-[3]" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-[#2B1A42] pt-4" />

          {/* Port Mappings */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-semibold text-[#A19BAF]">
                Port Eşlemeleri (Host : Konteyner)
              </label>
              <button
                type="button"
                onClick={handleAddPort}
                className="flex items-center gap-1 text-xs font-mono text-[#C084FC] hover:text-[#F5F3FF]"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Port Ekle</span>
              </button>
            </div>

            {ports.map((p, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Dış Port"
                  value={p.default}
                  onChange={(e) => {
                    const newPorts = [...ports];
                    const val = parseInt(e.target.value, 10) || 0;
                    if (newPorts[idx]) newPorts[idx].default = val;
                    setPorts(newPorts);
                  }}
                  className="w-24 rounded-[2px] border border-[#2B1A42] bg-[#090514] px-2.5 py-1.5 text-xs font-mono text-[#F5F3FF] focus:outline-none focus:border-[#8B5CF6]"
                />
                <span className="text-[#8B7D9E]">:</span>
                <input
                  type="number"
                  placeholder="İç Port"
                  value={p.internal}
                  onChange={(e) => {
                    const newPorts = [...ports];
                    const val = parseInt(e.target.value, 10) || 0;
                    if (newPorts[idx]) newPorts[idx].internal = val;
                    setPorts(newPorts);
                  }}
                  className="w-24 rounded-[2px] border border-[#2B1A42] bg-[#090514] px-2.5 py-1.5 text-xs font-mono text-[#F5F3FF] focus:outline-none focus:border-[#8B5CF6]"
                />
                <input
                  type="text"
                  placeholder="Etiket (Örn: Web UI)"
                  value={p.label}
                  onChange={(e) => {
                    const newPorts = [...ports];
                    if (newPorts[idx]) newPorts[idx].label = e.target.value;
                    setPorts(newPorts);
                  }}
                  className="flex-1 rounded-[2px] border border-[#2B1A42] bg-[#090514] px-2.5 py-1.5 text-xs font-mono text-[#F5F3FF] focus:outline-none focus:border-[#8B5CF6]"
                />
                <button
                  type="button"
                  onClick={() => handleRemovePort(idx)}
                  className="p-1.5 text-[#8B7D9E] hover:text-red-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-[#2B1A42] flex items-center justify-end gap-3 font-mono">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-[2px] border border-[#2B1A42] text-xs font-medium text-[#A19BAF] hover:text-[#F5F3FF] hover:bg-[#1E1235] transition-colors"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-[2px] bg-[#8B5CF6] hover:bg-[#7C3AED] text-xs font-bold text-white shadow-lg transition-all"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Modülü Kütüphaneye Ekle</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
