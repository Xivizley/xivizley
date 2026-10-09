'use client';

// ============================================================
// XIVIZLEY — Theme Selector Dropdown
// components/shared/ThemeSelector.tsx
// ============================================================

import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check } from 'lucide-react';
import { useThemeStore, THEME_OPTIONS } from '@/store/useThemeStore';
import { useI18nStore } from '@/lib/i18n/store';
import { cn } from '@/lib/utils';

export function ThemeSelector() {
  const { lang } = useI18nStore();
  const { theme, setTheme } = useThemeStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentTheme = THEME_OPTIONS.find((t) => t.id === theme) || THEME_OPTIONS[0]!;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        title={lang === 'tr' ? 'Tema Değiştir' : 'Change Theme'}
        className="flex h-7 items-center gap-1.5 rounded-[2px] border border-[#2B1A42] bg-[#120A21] px-2 text-[11px] font-mono font-semibold text-[#A19BAF] hover:border-[#8B5CF6] hover:text-[#F5F3FF] transition-all"
      >
        <span>{currentTheme.icon}</span>
        <Palette className="h-3 w-3 text-[#8B7D9E]" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 rounded-[2px] border border-[#2B1A42] bg-[#120A21] p-1.5 shadow-2xl backdrop-blur-xl z-50 animate-fade-in">
          <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-[#8B7D9E] border-b border-[#2B1A42] mb-1">
            {lang === 'tr' ? 'Tema Seçin' : 'Select Theme'}
          </div>
          <div className="space-y-1">
            {THEME_OPTIONS.map((opt) => {
              const isSelected = opt.id === theme;
              return (
                <button
                  key={opt.id}
                  onClick={() => {
                    setTheme(opt.id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-center justify-between rounded-[2px] px-2.5 py-1.5 text-xs font-mono font-medium transition-all text-left',
                    isSelected
                      ? 'bg-[#7C3AED]/20 text-[#C084FC] border border-[#8B5CF6]/40 font-semibold'
                      : 'text-[#A19BAF] hover:bg-[#1E1235] hover:text-[#F5F3FF]'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{opt.icon}</span>
                    <span>{lang === 'tr' ? opt.name : opt.nameEn}</span>
                  </div>
                  {isSelected && <Check className="h-3.5 w-3.5 text-[#C084FC]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
