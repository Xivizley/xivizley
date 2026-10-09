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
    const image = `${def?.dockerImage || 'alpine'}:${def?.defaultTag || 'latest'}`;

    out += `# [${idx + 1}/${nodes.length}] ${node.data.label}\n`;
    out += `docker run -d \\\n  --name ${serviceName} \\\n  --network xivizley-network \\\n  --restart unless-stopped`;

    // Ports
    def?.ports.forEach((p) => {
      const hostPort = node.data.portOverrides?.[p.internal] ?? p.default;
      out += ` \\\n  -p ${hostPort}:${p.internal}`;
    });

    // Env
    const envMap: Record<string, string> = {};
    (def?.environment || []).forEach((e) => {
      envMap[e.key] = e.defaultValue;
    });
    Object.assign(envMap, node.data.envOverrides || {});

    Object.entries(envMap).forEach(([k, v]) => {
      out += ` \\\n  -e ${k}="${v}"`;
    });

    // Volumes
    def?.volumes.forEach((vol) => {
      out += ` \\\n  -v ${vol.hostPath}:${vol.containerPath}`;
    });

    out += ` \\\n  ${image}\n\n`;
  });

  return out.trim();
}

/**
 * Generates Kubernetes Deployments and Services manifest.
 */
export function exportToKubernetesYAML(nodes: Node<ModuleNodeData>[]): string {
  if (nodes.length === 0) return '# Tuvalde henüz modül yok.';

  let out = '# ========================================================\n';
  out += '# ☸️ XIVIZLEY — Kubernetes (K8s) Deployments & Services\n';
  out += '# 🌐 https://xivizley.com.tr\n';
  out += '# ========================================================\n\n';

  nodes.forEach((node) => {
    const def = MODULE_CATALOG.find((m) => m.id === node.data.moduleId);
    const name = (node.data.label || def?.name || 'app')
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-');
    const image = `${def?.dockerImage || 'alpine'}:${def?.defaultTag || 'latest'}`;

    // Deployment
    out += `apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: ${name}\n  labels:\n    app: ${name}\nspec:\n  replicas: 1\n  selector:\n    matchLabels:\n      app: ${name}\n  template:\n    metadata:\n      labels:\n        app: ${name}\n    spec:\n      containers:\n      - name: ${name}\n        image: ${image}\n`;

    if (def?.ports && def.ports.length > 0) {
      out += `        ports:\n`;
      def.ports.forEach((p) => {
        out += `        - containerPort: ${p.internal}\n          name: p-${p.internal}\n`;
      });
    }

    const envMap: Record<string, string> = {};
    (def?.environment || []).forEach((e) => {
      envMap[e.key] = e.defaultValue;
    });
    Object.assign(envMap, node.data.envOverrides || {});

    if (Object.keys(envMap).length > 0) {
      out += `        env:\n`;
      Object.entries(envMap).forEach(([k, v]) => {
        out += `        - name: ${k}\n          value: "${v}"\n`;
      });
    }

    out += `---\n`;

    // Service
    if (def?.ports && def.ports.length > 0) {
      out += `apiVersion: v1\nkind: Service\nmetadata:\n  name: ${name}-svc\nspec:\n  type: ClusterIP\n  selector:\n    app: ${name}\n  ports:\n`;
      def.ports.forEach((p) => {
        const hostPort = node.data.portOverrides?.[p.internal] ?? p.default;
        out += `  - port: ${hostPort}\n    targetPort: ${p.internal}\n    name: p-${p.internal}\n`;
      });
      out += `---\n`;
    }
  });

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
    const image = `${def?.dockerImage || 'alpine'}:${def?.defaultTag || 'latest'}`;

    out += `    - name: Deploy container ${serviceName}\n      docker_container:\n        name: ${serviceName}\n        image: ${image}\n        state: started\n        restart_policy: unless-stopped\n`;

    if (def?.ports && def.ports.length > 0) {
      out += `        published_ports:\n`;
      def.ports.forEach((p) => {
        const hostPort = node.data.portOverrides?.[p.internal] ?? p.default;
        out += `          - "${hostPort}:${p.internal}"\n`;
      });
    }

    const envMap: Record<string, string> = {};
    (def?.environment || []).forEach((e) => {
      envMap[e.key] = e.defaultValue;
    });
    Object.assign(envMap, node.data.envOverrides || {});

    if (Object.keys(envMap).length > 0) {
      out += `        env:\n`;
      Object.entries(envMap).forEach(([k, v]) => {
        out += `          ${k}: "${v}"\n`;
      });
    }

    if (def?.volumes && def.volumes.length > 0) {
      out += `        volumes:\n`;
      def.volumes.forEach((vol) => {
        out += `          - "${vol.hostPath}:${vol.containerPath}"\n`;
      });
    }

    out += `\n`;
  });

  return out.trim();
}
