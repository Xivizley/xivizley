import type { Node } from 'reactflow';
import type { ModuleNodeData } from '@/lib/types';
import { MODULE_CATALOG } from '@/lib/data/modules';

/**
 * Generates individual 'docker run' commands for each node in the canvas.
 */
export function exportToDockerRunCLI(nodes: Node<ModuleNodeData>[]): string {
  if (nodes.length === 0) return '# Tuvalde henüz modül yok.';

  let out = '# ========================================================\n';
  out += '# 🚀 XIVIZLEY — Tek Satırlık Docker CLI Kurulum Komutları\n';
  out += '# 🌐 https://xivizley.com.tr\n';
  out += '# ========================================================\n\n';
  out += '# 1. Ortak Köprü Ağı Oluştur\n';
  out += 'docker network create xivizley-network 2>/dev/null || true\n\n';

  nodes.forEach((node, idx) => {
    const def = MODULE_CATALOG.find((m) => m.id === node.data.moduleId);
    const serviceName = (node.data.label || def?.name || 'app')
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-');
    const image = node.data.customImage || `${def?.dockerImage || 'alpine'}:${def?.defaultTag || 'latest'}`;

    out += `# [${idx + 1}/${nodes.length}] ${node.data.label}\n`;
    out += `docker run -d \\\n  --name ${serviceName} \\\n  --network xivizley-network \\\n  --restart unless-stopped`;

    // Ports
    if (node.data.isCustom && node.data.customPorts && node.data.customPorts.length > 0) {
      node.data.customPorts.forEach((p) => {
        out += ` \\\n  -p ${p.host}:${p.container}`;
      });
    } else if (def?.ports) {
      def.ports.forEach((p) => {
        const hostPort = node.data.portOverrides?.[p.internal] ?? p.default;
        out += ` \\\n  -p ${hostPort}:${p.internal}`;
      });
    }

    // Env
    const envMap: Record<string, string> = {};
    if (def?.environment) {
      def.environment.forEach((e) => {
        envMap[e.key] = e.defaultValue;
      });
    }
    Object.assign(envMap, node.data.customEnv || {}, node.data.envOverrides || {});

    Object.entries(envMap).forEach(([k, v]) => {
      out += ` \\\n  -e ${k}="${v}"`;
    });

    // Volumes
    if (node.data.isCustom && node.data.customVolumes && node.data.customVolumes.length > 0) {
      node.data.customVolumes.forEach((vol) => {
        out += ` \\\n  -v ${vol.hostPath}:${vol.containerPath}`;
      });
    } else if (def?.volumes) {
      def.volumes.forEach((vol) => {
        out += ` \\\n  -v ${vol.hostPath}:${vol.containerPath}`;
      });
    }

    out += ` \\\n  ${image}\n\n`;
  });

  return out.trim();
}

const SENSITIVE_KEY_REGEX = /(?:PASSWORD|SECRET|KEY|TOKEN|AUTH|PASS|PRIVATE)/i;

function cleanK8sName(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/^-+|-+$/g, '') || 'app';
}

function cleanVolName(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/^-+|-+$/g, '') || 'data';
}

/**
 * Generates Enterprise Kubernetes (K8s) Deployments, Services,
 * PersistentVolumeClaims (PVC), and Secret vs ConfigMap split.
 */
export function exportToKubernetesYAML(nodes: Node<ModuleNodeData>[]): string {
  if (nodes.length === 0) return '# Tuvalde henüz modül yok.';

  let out = '# ========================================================\n';
  out += '# ☸️ XIVIZLEY — Production-Grade Kubernetes (K8s) Stack\n';
  out += '# 🌐 https://xivizley.com.tr\n';
  out += '# Spec: PVC Persistence, Secret/ConfigMap Split, ClusterIP\n';
  out += '# ========================================================\n\n';

  nodes.forEach((node) => {
    const def = MODULE_CATALOG.find((m) => m.id === node.data.moduleId);
    const name = cleanK8sName(node.data.label || def?.name || 'app');
    const image = node.data.customImage || `${def?.dockerImage || 'alpine'}:${def?.defaultTag || 'latest'}`;

    // ── 1. Environment: Separate Secret vs ConfigMap ──
    const envMap: Record<string, string> = {};
    if (def?.environment) {
      def.environment.forEach((e) => {
        envMap[e.key] = e.defaultValue;
      });
    }
    Object.assign(envMap, node.data.customEnv || {}, node.data.envOverrides || {});

    const secretVars: Record<string, string> = {};
    const configVars: Record<string, string> = {};

    Object.entries(envMap).forEach(([k, v]) => {
      if (SENSITIVE_KEY_REGEX.test(k)) {
        secretVars[k] = v;
      } else {
        configVars[k] = v;
      }
    });

    const hasSecrets = Object.keys(secretVars).length > 0;
    const hasConfig = Object.keys(configVars).length > 0;

    // ── Secret Manifest ──
    if (hasSecrets) {
      out += `apiVersion: v1\nkind: Secret\nmetadata:\n  name: ${name}-secret\n  labels:\n    app: ${name}\ntype: Opaque\nstringData:\n`;
      Object.entries(secretVars).forEach(([k, v]) => {
        out += `  ${k}: "${v.replace(/"/g, '\\"')}"\n`;
      });
      out += `---\n`;
    }

    // ── ConfigMap Manifest ──
    if (hasConfig) {
      out += `apiVersion: v1\nkind: ConfigMap\nmetadata:\n  name: ${name}-config\n  labels:\n    app: ${name}\ndata:\n`;
      Object.entries(configVars).forEach(([k, v]) => {
        out += `  ${k}: "${v.replace(/"/g, '\\"')}"\n`;
      });
      out += `---\n`;
    }

    // ── 2. Volumes & PersistentVolumeClaim (PVC) ──
    const volumesList: Array<{ name: string; mountPath: string }> = [];
    const rawVolumes =
      node.data.isCustom && node.data.customVolumes && node.data.customVolumes.length > 0
        ? node.data.customVolumes
        : def?.volumes || [];

    rawVolumes.forEach((vol, vIdx) => {
      const volSuffix = cleanVolName(vol.containerPath.replace(/^\//, '').replace(/\//g, '-')) || `vol-${vIdx}`;
      const pvcName = `${name}-${volSuffix}-pvc`;
      const volMountName = `storage-${volSuffix}`;

      volumesList.push({ name: volMountName, mountPath: vol.containerPath });

      out += `apiVersion: v1\nkind: PersistentVolumeClaim\nmetadata:\n  name: ${pvcName}\n  labels:\n    app: ${name}\nspec:\n  accessModes:\n    - ReadWriteOnce\n  resources:\n    requests:\n      storage: 10Gi\n---\n`;
    });

    // ── 3. Deployment Manifest ──
    out += `apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: ${name}\n  labels:\n    app: ${name}\nspec:\n  replicas: 1\n  selector:\n    matchLabels:\n      app: ${name}\n  template:\n    metadata:\n      labels:\n        app: ${name}\n    spec:\n      containers:\n      - name: ${name}\n        image: ${image}\n`;

    // Ports
    const portsToExpose: Array<{ internal: number; host: number }> = [];
    if (node.data.isCustom && node.data.customPorts && node.data.customPorts.length > 0) {
      node.data.customPorts.forEach((p) => {
        portsToExpose.push({ internal: p.container, host: p.host });
      });
    } else if (def?.ports) {
      def.ports.forEach((p) => {
        const hostPort = node.data.portOverrides?.[p.internal] ?? p.default;
        portsToExpose.push({ internal: p.internal, host: hostPort });
      });
    }

    if (portsToExpose.length > 0) {
      out += `        ports:\n`;
      portsToExpose.forEach((p) => {
        out += `        - containerPort: ${p.internal}\n          name: p-${p.internal}\n`;
      });
    }

    // envFrom linking Secret and ConfigMap
    if (hasSecrets || hasConfig) {
      out += `        envFrom:\n`;
      if (hasConfig) {
        out += `        - configMapRef:\n            name: ${name}-config\n`;
      }
      if (hasSecrets) {
        out += `        - secretRef:\n            name: ${name}-secret\n`;
      }
    }

    // Volume Mounts
    if (volumesList.length > 0) {
      out += `        volumeMounts:\n`;
      volumesList.forEach((v) => {
        out += `        - name: ${v.name}\n          mountPath: ${v.mountPath}\n`;
      });
    }

    // Pod Volumes
    if (volumesList.length > 0) {
      out += `      volumes:\n`;
      rawVolumes.forEach((vol, vIdx) => {
        const volSuffix = cleanVolName(vol.containerPath.replace(/^\//, '').replace(/\//g, '-')) || `vol-${vIdx}`;
        const pvcName = `${name}-${volSuffix}-pvc`;
        const volMountName = `storage-${volSuffix}`;
        out += `      - name: ${volMountName}\n        persistentVolumeClaim:\n          claimName: ${pvcName}\n`;
      });
    }

    out += `---\n`;

    // ── 4. Service Manifest ──
    if (portsToExpose.length > 0) {
      out += `apiVersion: v1\nkind: Service\nmetadata:\n  name: ${name}-svc\n  labels:\n    app: ${name}\nspec:\n  type: ClusterIP\n  selector:\n    app: ${name}\n  ports:\n`;
      portsToExpose.forEach((p) => {
        out += `  - port: ${p.host}\n    targetPort: ${p.internal}\n    name: p-${p.internal}\n`;
      });
      out += `---\n`;
    }
  });

  return out.trim();
}

/**
 * Generates an authentic Helm 3 Chart package bundle (Chart.yaml, values.yaml, and templates).
 */
export function exportToHelmChart(nodes: Node<ModuleNodeData>[]): string {
  if (nodes.length === 0) return '# Tuvalde henüz modül yok.';

  let out = '# ========================================================\n';
  out += '# ⎈ XIVIZLEY — Helm 3 Production Chart Package\n';
  out += '# 🌐 https://xivizley.com.tr\n';
  out += '# ========================================================\n\n';

  // 1. Chart.yaml
  out += '### FILE: Chart.yaml\n';
  out += 'apiVersion: v2\n';
  out += 'name: xivizley-stack\n';
  out += 'description: Production Helm Chart exported from XIVIZLEY Architectural Station\n';
  out += 'type: application\n';
  out += 'version: 1.0.0\n';
  out += 'appVersion: "1.0.0"\n\n';

  // 2. values.yaml
  out += '### FILE: values.yaml\n';
  out += 'global:\n  storageClass: ""\n\nservices:\n';

  nodes.forEach((node) => {
    const def = MODULE_CATALOG.find((m) => m.id === node.data.moduleId);
    const name = cleanK8sName(node.data.label || def?.name || 'app');
    const fullImg = node.data.customImage || `${def?.dockerImage || 'alpine'}:${def?.defaultTag || 'latest'}`;
    const [repo, tag] = fullImg.split(':');

    out += `  ${name}:\n`;
    out += `    replicaCount: 1\n`;
    out += `    image:\n      repository: ${repo || 'alpine'}\n      tag: "${tag || 'latest'}"\n      pullPolicy: IfNotPresent\n`;

    // Ports
    const portsToExpose: Array<{ internal: number; host: number }> = [];
    if (node.data.isCustom && node.data.customPorts && node.data.customPorts.length > 0) {
      node.data.customPorts.forEach((p) => portsToExpose.push({ internal: p.container, host: p.host }));
    } else if (def?.ports) {
      def.ports.forEach((p) => {
        const hostPort = node.data.portOverrides?.[p.internal] ?? p.default;
        portsToExpose.push({ internal: p.internal, host: hostPort });
      });
    }

    if (portsToExpose.length > 0) {
      out += `    service:\n      type: ClusterIP\n      port: ${portsToExpose[0]?.host || 80}\n      targetPort: ${portsToExpose[0]?.internal || 80}\n`;
    }

    // Persistence
    const rawVolumes =
      node.data.isCustom && node.data.customVolumes && node.data.customVolumes.length > 0
        ? node.data.customVolumes
        : def?.volumes || [];
    out += `    persistence:\n      enabled: ${rawVolumes.length > 0}\n      size: 10Gi\n`;

    // Resources
    const ramMB = def?.resources?.ramMB || 256;
    const cpuCores = def?.resources?.cpuCores || 1;
    out += `    resources:\n      requests:\n        cpu: "${Math.max(100, Math.floor(cpuCores * 250))}m"\n        memory: "${Math.max(128, Math.floor(ramMB * 0.75))}Mi"\n      limits:\n        cpu: "${cpuCores}"\n        memory: "${ramMB}Mi"\n`;
  });

  out += '\n';

  // 3. templates/deployment.yaml
  out += '### FILE: templates/deployment.yaml\n';
  out += `{{- range $serviceName, $service := .Values.services }}\n`;
  out += `apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: {{ $serviceName }}\n  labels:\n    app: {{ $serviceName }}\nspec:\n  replicas: {{ $service.replicaCount }}\n  selector:\n    matchLabels:\n      app: {{ $serviceName }}\n  template:\n    metadata:\n      labels:\n        app: {{ $serviceName }}\n    spec:\n      containers:\n      - name: {{ $serviceName }}\n        image: "{{ $service.image.repository }}:{{ $service.image.tag }}"\n        imagePullPolicy: {{ $service.image.pullPolicy }}\n        resources:\n{{ toYaml $service.resources | indent 10 }}\n---\n`;
  out += `{{- end }}\n\n`;

  // 4. templates/service.yaml
  out += '### FILE: templates/service.yaml\n';
  out += `{{- range $serviceName, $service := .Values.services }}\n`;
  out += `{{- if $service.service }}\n`;
  out += `apiVersion: v1\nkind: Service\nmetadata:\n  name: {{ $serviceName }}-svc\n  labels:\n    app: {{ $serviceName }}\nspec:\n  type: {{ $service.service.type }}\n  selector:\n    app: {{ $serviceName }}\n  ports:\n  - port: {{ $service.service.port }}\n    targetPort: {{ $service.service.targetPort }}\n    protocol: TCP\n---\n`;
  out += `{{- end }}\n`;
  out += `{{- end }}\n`;

  return out.trim();
}

/**
 * Generates an Ansible Playbook for multi-node automated deployment.
 */
export function exportToAnsiblePlaybook(nodes: Node<ModuleNodeData>[]): string {
  if (nodes.length === 0) return '# Tuvalde henüz modül yok.';

  let out = '# ========================================================\n';
  out += '# 📜 XIVIZLEY — Ansible Homelab & Server Deployment Playbook\n';
  out += '# 🌐 https://xivizley.com.tr\n';
  out += '# ========================================================\n\n';
  out += '---\n- name: Deploy XIVIZLEY Homelab Stack\n  hosts: all\n  become: true\n  tasks:\n';
  out += '    - name: Ensure Docker and Docker SDK are installed\n      apt:\n        name:\n          - docker.io\n          - python3-docker\n        state: present\n        update_cache: yes\n\n';

  nodes.forEach((node) => {
    const def = MODULE_CATALOG.find((m) => m.id === node.data.moduleId);
    const serviceName = (node.data.label || def?.name || 'app')
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-');
    const image = node.data.customImage || `${def?.dockerImage || 'alpine'}:${def?.defaultTag || 'latest'}`;

    out += `    - name: Deploy container ${serviceName}\n      docker_container:\n        name: ${serviceName}\n        image: ${image}\n        state: started\n        restart_policy: unless-stopped\n`;

    if (node.data.isCustom && node.data.customPorts && node.data.customPorts.length > 0) {
      out += `        published_ports:\n`;
      node.data.customPorts.forEach((p) => {
        out += `          - "${p.host}:${p.container}"\n`;
      });
    } else if (def?.ports && def.ports.length > 0) {
      out += `        published_ports:\n`;
      def.ports.forEach((p) => {
        const hostPort = node.data.portOverrides?.[p.internal] ?? p.default;
        out += `          - "${hostPort}:${p.internal}"\n`;
      });
    }

    const envMap: Record<string, string> = {};
    if (def?.environment) {
      def.environment.forEach((e) => {
        envMap[e.key] = e.defaultValue;
      });
    }
    Object.assign(envMap, node.data.customEnv || {}, node.data.envOverrides || {});

    if (Object.keys(envMap).length > 0) {
      out += `        env:\n`;
      Object.entries(envMap).forEach(([k, v]) => {
        out += `          ${k}: "${v}"\n`;
      });
    }

    const volumes =
      node.data.isCustom && node.data.customVolumes && node.data.customVolumes.length > 0
        ? node.data.customVolumes
        : def?.volumes || [];

    if (volumes.length > 0) {
      out += `        volumes:\n`;
      volumes.forEach((vol) => {
        out += `          - "${vol.hostPath}:${vol.containerPath}"\n`;
      });
    }

    out += `\n`;
  });

  return out.trim();
}
