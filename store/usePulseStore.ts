import { create } from 'zustand';

// ============================================================
// XIVIZLEY Pulse Store — Real-time Server & Telemetry State
// store/usePulseStore.ts
// ============================================================

export interface PulseMonitorItem {
  id: string;
  name: string;
  target: string;
  type: 'http' | 'tcp' | 'ping';
  status: 'up' | 'down';
  latencyMs: number;
  uptime: number;
}

export interface PulseTelemetrySummary {
  upCount: number;
  downCount: number;
  totalCount: number;
  uptimePercentage: number;
  avgLatencyMs: number;
}

export interface PulseTelemetryData {
  ok: boolean;
  timestamp: string;
  isFallback?: boolean;
  summary: PulseTelemetrySummary;
  monitors: PulseMonitorItem[];
}

interface PulseState {
  telemetry: PulseTelemetryData | null;
  isLoading: boolean;
  isLiveConnected: boolean;
  lastUpdated: Date | null;
  autoRefresh: boolean;

  fetchTelemetry: () => Promise<void>;
  setAutoRefresh: (enabled: boolean) => void;
  getMonitorForNode: (
    label?: string,
    moduleId?: string,
    dockerImage?: string
  ) => PulseMonitorItem | null;
}

export const usePulseStore = create<PulseState>((set, get) => ({
  telemetry: null,
  isLoading: false,
  isLiveConnected: false,
  lastUpdated: null,
  autoRefresh: true,

  fetchTelemetry: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/pulse/telemetry');
      if (!res.ok) throw new Error('Telemetri alınamadı');
      const data: PulseTelemetryData = await res.json();
      set({
        telemetry: data,
        isLiveConnected: true,
        lastUpdated: new Date(),
        isLoading: false,
      });
    } catch {
      set({ isLoading: false, isLiveConnected: false });
    }
  },

  setAutoRefresh: (enabled) => set({ autoRefresh: enabled }),

  getMonitorForNode: (label = '', moduleId = '', dockerImage = '') => {
    const { telemetry } = get();
    if (!telemetry || !telemetry.monitors || telemetry.monitors.length === 0) {
      return null;
    }

    const cleanLabel = (label || '').toLowerCase();
    const cleanModule = (moduleId || '').toLowerCase();
    const cleanImg = (dockerImage || '').toLowerCase();

    // 1. Minecraft PaperMC Eşleşmesi
    if (
      cleanLabel.includes('minecraft') ||
      cleanModule.includes('minecraft') ||
      cleanImg.includes('minecraft') ||
      cleanLabel.includes('paper')
    ) {
      const mon = telemetry.monitors.find((m) => m.id === 'mon-minecraft');
      if (mon) return mon;
    }

    // 2. SSO & Suite Eşleşmesi
    if (
      cleanLabel.includes('sso') ||
      cleanLabel.includes('suite') ||
      cleanLabel.includes('auth') ||
      cleanModule.includes('sso')
    ) {
      const mon = telemetry.monitors.find((m) => m.id === 'mon-sso');
      if (mon) return mon;
    }

    // 3. Sunucu A (Odeaweb Test VDS / CasaOS / Jellyfin / Nginx) Eşleşmesi
    if (
      cleanLabel.includes('casaos') ||
      cleanLabel.includes('odeaweb') ||
      cleanLabel.includes('vds') ||
      cleanLabel.includes('jellyfin') ||
      cleanLabel.includes('qbittorrent') ||
      cleanLabel.includes('nginx')
    ) {
      const mon = telemetry.monitors.find((m) => m.id === 'mon-sunucu-a');
      if (mon) return mon;
    }

    // 4. XIVIZLEY Ana Platform Eşleşmesi
    if (
      cleanLabel.includes('xivizley') ||
      cleanModule.includes('xivizley') ||
      cleanLabel.includes('portal')
    ) {
      const mon = telemetry.monitors.find((m) => m.id === 'mon-xivizley');
      if (mon) return mon;
    }

    // 5. Genel İsim Benzerliği Araması
    return (
      telemetry.monitors.find(
        (m) =>
          cleanLabel.includes(m.name.toLowerCase()) ||
          m.name.toLowerCase().includes(cleanLabel)
      ) || null
    );
  },
}));
