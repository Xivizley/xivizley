import { create } from 'zustand';

export interface LiveContainer {
  Id: string;
  Names: string[];
  Image: string;
  State: string;
  Status: string;
  Ports: Array<{ IP?: string; PrivatePort: number; PublicPort?: number; Type: string }>;
}

export interface LiveSystemStats {
  cpuUsage: number;
  memoryUsedMB: number;
  memoryTotalMB: number;
  diskUsagePercent: number;
  uptimeSeconds: number;
  activeContainersCount: number;
  osName?: string;
}

export type DeployStatus = 'idle' | 'running' | 'success' | 'error';

interface LiveAgentState {
  serverUrl: string;
  token: string;
  isConnected: boolean;
  isConnecting: boolean;
  lastError: string | null;
  stats: LiveSystemStats | null;
  containers: LiveContainer[];
  selectedContainerLogs: { id: string; name: string; logs: string } | null;
  isLoadingLogs: boolean;
  isDeploying: boolean;

  // Live Deployment Console & Logs
  deployLogs: string;
  isDeployRunning: boolean;
  deployStatus: DeployStatus;
  isDeployTerminalOpen: boolean;

  setServerUrl: (url: string) => void;
  setToken: (token: string) => void;
  setDeployTerminalOpen: (open: boolean) => void;
  connect: (customUrl?: string, customToken?: string) => Promise<boolean>;
  disconnect: () => void;
  fetchStats: () => Promise<void>;
  fetchContainers: () => Promise<void>;
  fetchDeployStatus: () => Promise<void>;
  clearDeployLogs: () => void;
  executeContainerAction: (containerId: string, action: 'start' | 'stop' | 'restart') => Promise<boolean>;
  fetchContainerLogs: (containerId: string, containerName: string) => Promise<void>;
  closeLogs: () => void;
  deployYamlToLiveServer: (dockerComposeYaml: string, title?: string) => Promise<{ success: boolean; message: string }>;
}

const STORAGE_KEY = 'xivizley_live_agent_url';
const STORAGE_TOKEN_KEY = 'xivizley_live_agent_token';

// Server-side relay helper: protects against Mixed Content, self-signed SSL warnings and CORS
async function agentRelay(targetUrl: string, endpoint: string, token: string, method = 'GET', body?: unknown) {
  const res = await fetch('/api/agent/relay', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetUrl, endpoint, token, method, body }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `HTTP ${res.status}: İstek başarısız`);
  }
  return data;
}

function normalizeContainers(data: any): LiveContainer[] {
  const list = Array.isArray(data)
    ? data
    : Array.isArray(data?.containers)
    ? data.containers
    : [];

  return list.map((c: any) => {
    const rawId = c.Id || c.id || '';
    const rawNames = Array.isArray(c.Names)
      ? c.Names
      : [c.name ? (c.name.startsWith('/') ? c.name : `/${c.name}`) : rawId.slice(0, 12)];

    return {
      Id: rawId,
      Names: rawNames,
      Image: c.Image || c.image || 'bilinmiyor',
      State: c.State || c.state || (c.isRunning ? 'running' : 'stopped'),
      Status: c.Status || c.status || (c.State || c.state || ''),
      Ports: Array.isArray(c.Ports)
        ? c.Ports
        : (c.ports || []).map((p: any) => ({
            PublicPort: p.PublicPort ?? p.public,
            PrivatePort: p.PrivatePort ?? p.private,
            Type: p.Type ?? p.type ?? 'tcp',
          })),
    };
  });
}

export const useLiveAgentStore = create<LiveAgentState>((set, get) => ({
  serverUrl: typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) || 'https://178.210.168.163:8050' : 'https://178.210.168.163:8050',
  token: typeof window !== 'undefined' ? localStorage.getItem(STORAGE_TOKEN_KEY) || '' : '',
  isConnected: false,
  isConnecting: false,
  lastError: null,
  stats: null,
  containers: [],
  selectedContainerLogs: null,
  isLoadingLogs: false,
  isDeploying: false,

  deployLogs: '',
  isDeployRunning: false,
  deployStatus: 'idle',
  isDeployTerminalOpen: false,

  setServerUrl: (url: string) => {
    const cleanUrl = url.trim().replace(/\/$/, '');
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, cleanUrl);
    }
    set({ serverUrl: cleanUrl });
  },

  setToken: (token: string) => {
    const cleanToken = token.trim();
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_TOKEN_KEY, cleanToken);
    }
    set({ token: cleanToken });
  },

  setDeployTerminalOpen: (open: boolean) => {
    set({ isDeployTerminalOpen: open });
  },

  connect: async (customUrl?: string, customToken?: string) => {
    const targetUrl = (customUrl !== undefined ? customUrl : get().serverUrl).trim().replace(/\/$/, '');
    const activeToken = (customToken !== undefined ? customToken : get().token).trim();

    set({ isConnecting: true, lastError: null, serverUrl: targetUrl, token: activeToken });
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, targetUrl);
      localStorage.setItem(STORAGE_TOKEN_KEY, activeToken);
    }

    try {
      // 1. Fetch system status through secure server-side relay
      const statsData = await agentRelay(targetUrl, '/api/stats', activeToken, 'GET');

      // Normalize stats data
      const stats: LiveSystemStats = {
        cpuUsage: Math.round(statsData.cpu?.currentLoad ?? statsData.cpu?.usage ?? statsData.cpuUsage ?? 0),
        memoryUsedMB: Math.round((statsData.memory?.active ?? statsData.memory?.usedMB ?? statsData.memoryUsedMB ?? 0) / (statsData.memory?.active ? 1024 * 1024 : 1)),
        memoryTotalMB: Math.round((statsData.memory?.total ?? statsData.memory?.totalMB ?? statsData.memoryTotalMB ?? 0) / (statsData.memory?.total ? 1024 * 1024 : 1)),
        diskUsagePercent: Math.round(statsData.disk?.[0]?.use ?? statsData.disk?.percent ?? statsData.diskUsagePercent ?? 0),
        uptimeSeconds: Math.round(statsData.time?.uptime ?? statsData.uptime ?? statsData.uptimeSeconds ?? 0),
        activeContainersCount: statsData.containers?.running ?? 0,
        osName: statsData.os?.distro ?? statsData.os ?? 'Linux',
      };

      // 2. Fetch containers through relay
      let containers: LiveContainer[] = [];
      try {
        const containersData = await agentRelay(targetUrl, '/api/containers', activeToken, 'GET');
        containers = normalizeContainers(containersData);
        stats.activeContainersCount = containers.filter((c) => c.State === 'running').length;
      } catch {
        // non-blocking
      }

      set({
        isConnected: true,
        isConnecting: false,
        lastError: null,
        stats,
        containers,
      });

      return true;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Sunucuya bağlanılamadı.';
      set({
        isConnected: false,
        isConnecting: false,
        lastError: msg,
      });
      return false;
    }
  },

  disconnect: () => {
    set({
      isConnected: false,
      stats: null,
      containers: [],
      selectedContainerLogs: null,
      lastError: null,
      deployLogs: '',
      isDeployRunning: false,
      deployStatus: 'idle',
      isDeployTerminalOpen: false,
    });
  },

  fetchStats: async () => {
    const { serverUrl, token, isConnected } = get();
    if (!isConnected || !serverUrl) return;

    try {
      const statsData = await agentRelay(serverUrl, '/api/stats', token, 'GET');
      set({
        stats: {
          cpuUsage: Math.round(statsData.cpu?.currentLoad ?? statsData.cpu?.usage ?? statsData.cpuUsage ?? 0),
          memoryUsedMB: Math.round((statsData.memory?.active ?? statsData.memory?.usedMB ?? statsData.memoryUsedMB ?? 0) / (statsData.memory?.active ? 1024 * 1024 : 1)),
          memoryTotalMB: Math.round((statsData.memory?.total ?? statsData.memory?.totalMB ?? statsData.memoryTotalMB ?? 0) / (statsData.memory?.total ? 1024 * 1024 : 1)),
          diskUsagePercent: Math.round(statsData.disk?.[0]?.use ?? statsData.disk?.percent ?? statsData.diskUsagePercent ?? 0),
          uptimeSeconds: Math.round(statsData.time?.uptime ?? statsData.uptime ?? statsData.uptimeSeconds ?? 0),
          activeContainersCount: get().containers.filter((c) => c.State === 'running').length,
          osName: statsData.os?.distro ?? statsData.os ?? 'Linux',
        },
      });
    } catch {
      // ignore transient poll error
    }
  },

  fetchContainers: async () => {
    const { serverUrl, token, isConnected } = get();
    if (!isConnected || !serverUrl) return;

    try {
      const containersData = await agentRelay(serverUrl, '/api/containers', token, 'GET');
      const containers = normalizeContainers(containersData);
      set({ containers });
    } catch {
      // ignore
    }
  },

  fetchDeployStatus: async () => {
    const { serverUrl, token, isConnected } = get();
    if (!isConnected || !serverUrl) return;

    try {
      const data = await agentRelay(serverUrl, '/api/deploy/status', token, 'GET');
      const isRunning = Boolean(data?.isRunning);
      const status: DeployStatus = data?.status || (isRunning ? 'running' : 'idle');
      const logs = data?.logs || '';

      set({
        deployLogs: logs,
        isDeployRunning: isRunning,
        deployStatus: status,
      });

      if (!isRunning) {
        get().fetchContainers();
        get().fetchStats();
      }
    } catch {
      // ignore
    }
  },

  clearDeployLogs: () => {
    set({ deployLogs: '', isDeployRunning: false, deployStatus: 'idle' });
  },

  executeContainerAction: async (containerId: string, action: 'start' | 'stop' | 'restart') => {
    const { serverUrl, token } = get();
    if (!serverUrl) return false;

    try {
      await agentRelay(serverUrl, `/api/containers/${containerId}/${action}`, token, 'POST');
      setTimeout(() => {
        get().fetchContainers();
        get().fetchStats();
      }, 1000);
      return true;
    } catch {
      return false;
    }
  },

  fetchContainerLogs: async (containerId: string, containerName: string) => {
    const { serverUrl, token } = get();
    if (!serverUrl) return;

    set({ isLoadingLogs: true, selectedContainerLogs: { id: containerId, name: containerName, logs: 'Loglar çekiliyor...' } });

    try {
      const data = await agentRelay(serverUrl, `/api/containers/${containerId}/logs?tail=200`, token, 'GET');
      const rawLogs = typeof data === 'string' ? data : (data.logs || JSON.stringify(data, null, 2));
      set({
        selectedContainerLogs: { id: containerId, name: containerName, logs: rawLogs },
        isLoadingLogs: false,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bağlantı zaman aşımına uğradı';
      set({
        selectedContainerLogs: { id: containerId, name: containerName, logs: `Hata: ${msg}` },
        isLoadingLogs: false,
      });
    }
  },

  closeLogs: () => {
    set({ selectedContainerLogs: null });
  },

  deployYamlToLiveServer: async (dockerComposeYaml: string, title?: string) => {
    const { serverUrl, token, isConnected } = get();
    if (!isConnected || !serverUrl) {
      return { success: false, message: 'Önce canlı sunucuya bağlanmanız gerekmektedir.' };
    }

    const initialLog = `🚀 [XIVIZLEY ENGINE] ${title || 'Self-Host Mimarisi'} canlı dağıtımı başlatılıyor...\n📡 Sunucu: ${serverUrl}\n📦 Compose konfigürasyonu aktarılıyor...\n`;

    set({
      isDeploying: true,
      isDeployRunning: true,
      deployStatus: 'running',
      deployLogs: initialLog,
      isDeployTerminalOpen: true,
    });

    try {
      let data: any;
      try {
        data = await agentRelay(serverUrl, '/api/cloud-push', token, 'POST', {
          composeYaml: dockerComposeYaml,
          title: title || 'XIVIZLEY Mimari',
        });
      } catch {
        data = await agentRelay(serverUrl, '/api/deploy', token, 'POST', {
          composeYaml: dockerComposeYaml,
          title: title || 'XIVIZLEY Mimari',
        });
      }

      set({ isDeploying: false });

      // Poll status immediately
      setTimeout(() => {
        get().fetchDeployStatus();
      }, 500);

      if (data && data.success) {
        return {
          success: true,
          message: data.message || 'Canlı dağıtım komutu sunucuda başlatıldı! Konsoldan canlı takip edebilirsiniz.',
        };
      } else {
        set({ isDeployRunning: false, deployStatus: 'error' });
        return { success: false, message: data?.message || data?.error || 'Dağıtım sırasında bir hata oluştu.' };
      }
    } catch (err: unknown) {
      set({ isDeploying: false, isDeployRunning: false, deployStatus: 'error' });
      const msg = err instanceof Error ? err.message : 'İstek başarısız';
      return { success: false, message: `Sunucu hatası: ${msg}` };
    }
  },
}));
