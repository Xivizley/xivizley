/**
 * Single source of truth for platform statistics and catalog numbers.
 * Derived directly from MODULE_CATALOG (150) and STACK_TEMPLATES (35).
 */
export const PLATFORM_STATS = {
  totalModules: 150,
  totalTemplates: 35,
  modulesDisplay: '150',
  templatesDisplay: '35',
  // Single source of truth for the Suite release label/stage.
  // Keep every UI reference (landing, /suite, navbar, installer) fed from here
  // so the public version can never drift out of sync again.
  suiteVersion: 'v1.0',
  suiteStage: 'Stable',
  suiteLabel: 'v1.0',
  suiteInstallCmd: 'curl -fsSL https://xivizley.com.tr/suite/install | sudo bash',
  // Product Architecture Pillars
  architechName: 'XIVIZLEY Architech',
  spaceName: 'XIVIZLEY Space',
  engineName: 'XIVIZLEY Engine',
  sentinelName: 'XIVIZLEY Sentinel',
  taglineTr: "XIVIZLEY, 150 Docker servisini görsel tuvalde sürükle-bırak bağlayıp tek SSH komutuyla VDS'e kuran, ücretsiz ve MIT lisanslı self-host mimarlık aracıdır.",
  taglineEn: "XIVIZLEY is a free, visual Docker Compose architect with deterministic port conflict detection, DIN EN 61082-1 hardware sizing radar, and 1-click SSH deployment for 150+ containers.",
} as const;
