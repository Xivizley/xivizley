'use client';

// ============================================================
// XIVIZLEY — Pro Studio Cyber Edge Component
// Obsidian Violet & DIN 40719 Industrial Hardware Spec
// Flowing electric violet data lines with SVG photon particles
// ============================================================

import React, { memo } from 'react';
import {
  getBezierPath,
  type EdgeProps,
  EdgeLabelRenderer,
} from 'reactflow';
import { useArchitectStore } from '@/store/useArchitectStore';
import { useI18nStore } from '@/lib/i18n/store';
import { X, Activity } from 'lucide-react';

function CyberEdgeInner({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const onEdgesChange = useArchitectStore((s) => s.onEdgesChange);
  const lang = useI18nStore((s) => s.lang);
  const isTr = lang === 'tr';
  const isPt = lang === 'pt';

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdgesChange([{ type: 'remove', id }]);
  };

  const gradientId = `cyber-gradient-${id}`;

  // Check if style stroke is a legacy cyan color or default
  const isCyanStroke =
    style?.stroke &&
    ['#06b6d4', '#06B6D4', '#00ffff', 'cyan', 'rgb(6, 182, 212)'].includes(
      String(style.stroke)
    );

  const resolvedStroke = selected
    ? '#C084FC'
    : (style?.stroke && !isCyanStroke ? style.stroke : `url(#${gradientId})`);

  const cleanStyle: React.CSSProperties = {
    ...style,
    stroke: resolvedStroke,
    strokeWidth: selected ? 2.5 : (style?.strokeWidth ?? 2),
  };

  return (
    <>
      <defs>
        <linearGradient
          id={gradientId}
          gradientUnits="userSpaceOnUse"
          x1={sourceX}
          y1={sourceY}
          x2={targetX}
          y2={targetY}
        >
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="50%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#A78BFA" />
        </linearGradient>
      </defs>

      {/* Layer 0: Wide invisible click/hover target */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={24}
        className="cursor-pointer react-flow__edge-interaction"
      />

      {/* Layer 1: Subtle outer violet aura (no blurry over-glow) */}
      <path
        d={edgePath}
        fill="none"
        stroke={selected ? '#C084FC' : '#8B5CF6'}
        strokeWidth={selected ? 5.5 : 3.5}
        strokeOpacity={selected ? 0.45 : 0.22}
        className="transition-all duration-200 pointer-events-none"
        style={{
          filter: selected
            ? 'drop-shadow(0 0 6px rgba(192, 132, 252, 0.6))'
            : 'drop-shadow(0 0 4px rgba(139, 92, 246, 0.35))',
        }}
      />

      {/* Layer 2: Clean electric violet core laser/wire path */}
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke={resolvedStroke}
        strokeWidth={selected ? 2.5 : 2}
        className="react-flow__edge-path transition-colors duration-200 pointer-events-none"
        markerEnd={markerEnd}
        style={cleanStyle}
      />

      {/* Layer 3: Flowing animated dashed data pulses */}
      <path
        d={edgePath}
        fill="none"
        stroke="#F5F3FF"
        strokeWidth={1.5}
        strokeDasharray="8 14"
        strokeLinecap="round"
        className="cyber-flowing-line pointer-events-none opacity-80"
      />

      {/* Layer 4: Flowing violet photon particles traveling along wire */}
      <circle r="2.5" fill="#C084FC" className="pointer-events-none">
        <animateMotion
          dur="2.4s"
          repeatCount="indefinite"
          path={edgePath}
          rotate="auto"
        />
      </circle>
      <circle r="1.8" fill="#E9D5FF" className="pointer-events-none">
        <animateMotion
          dur="2.4s"
          begin="1.2s"
          repeatCount="indefinite"
          path={edgePath}
          rotate="auto"
        />
      </circle>

      {/* Selected quick action overlay */}
      {selected && Number.isFinite(labelX) && Number.isFinite(labelY) && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan z-30"
          >
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] bg-[#120A21] border border-[#8B5CF6] shadow-[0_0_12px_rgba(139,92,246,0.25)] backdrop-blur-md animate-in fade-in zoom-in-90 duration-150 text-[10px]">
              <Activity className="h-3 w-3 text-[#A78BFA] animate-pulse" />
              <span className="font-mono font-bold text-[#F5F3FF]">
                {isTr ? 'BAĞLANTI' : isPt ? 'CONEXÃO' : 'CONNECTION'}
              </span>
              <button
                onClick={handleDelete}
                className="ml-1 p-0.5 rounded-[1px] hover:bg-rose-950/60 text-[#8B7D9E] hover:text-rose-400 border border-transparent hover:border-rose-500/40 transition-colors"
                title={isTr ? 'Bağlantıyı Sil' : isPt ? 'Excluir Conexão' : 'Delete Connection'}
                aria-label={isTr ? 'Bağlantıyı Sil' : isPt ? 'Excluir Conexão' : 'Delete Connection'}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export const CyberEdge = memo(CyberEdgeInner);
