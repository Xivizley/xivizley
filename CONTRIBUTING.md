# Contributing to XIVIZLEY Core

Thank you for your interest in contributing to **XIVIZLEY**! 🎉
XIVIZLEY is an open-source, visual Docker Compose architect designed to eliminate port conflicts before deployment and make self-hosting effortless.

---

## 🛠️ Development Setup

XIVIZLEY is built with **Next.js 14**, **React Flow (@xyflow/react)**, **TypeScript**, and **Tailwind CSS**.

### Prerequisites
- Node.js >= 18.17.0
- pnpm >= 8 (or npm >= 9)

### Getting Started
```bash
# Clone the repository
git clone https://github.com/Xivizley/xivizley.git
cd xivizley

# Install dependencies
pnpm install

# Start local development server
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Adding a New Docker Module

All container modules live in `lib/data/modules.ts`. To contribute a new service:

1. Open `lib/data/modules.ts`.
2. Add your module specification to `MODULE_CATALOG`:
```typescript
{
  id: 'your-service',
  name: 'Your Service Name',
  category: 'media', // media, security, database, monitoring, ai, etc.
  description: 'One-line description of what this container does.',
  image: 'official/image:latest',
  defaultPort: 8080,
  recommendedMemory: '512MB',
  ports: [
    { container: 8080, host: 8080, protocol: 'tcp', label: 'Web UI' }
  ],
  volumes: [
    { host: './data', container: '/config', description: 'Persistent data' }
  ],
  env: [
    { key: 'PUID', defaultValue: '1000', description: 'User ID' }
  ]
}
```
3. Run the automated catalog integrity tests:
```bash
npx tsx scripts/test_launch_gates_1_and_2.ts
```

---

## 🧩 Adding a Curated Stack Template

Pre-configured stacks are located in `lib/data/templates.ts`:
1. Define services, edges (dependencies), and an optimized `docker-compose.yml` snippet.
2. Verify that services do not conflict internally or that conflict resolution works deterministically.

---

## 🧪 Testing

Before opening a pull request, ensure all verification suites pass cleanly:
```bash
# 1. Typecheck
npx tsc --noEmit

# 2. P0 Architect Engine test suite
npx tsx scripts/test_p0_suite.ts

# 3. Deterministic conflict resolver test
npx tsx scripts/test_deterministic_conflict_resolver.ts
```

---

## 📜 Pull Request Guidelines

1. **Keep PRs focused:** One feature or fix per pull request.
2. **Follow Code Conventions:** Use clean TypeScript with zero runtime overhead and strict type safety.
3. **Preserve Privacy & Zero-Telemetry:** XIVIZLEY Core is 100% client-side. No network calls should leak user architectures or compose definitions to remote servers.

All contributions are licensed under the [MIT License](LICENSE).
