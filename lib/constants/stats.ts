/**
 * Single source of truth for platform statistics and catalog numbers.
 * Derived directly from MODULE_CATALOG (115) and STACK_TEMPLATES (31).
 */
export const PLATFORM_STATS = {
  totalModules: 115,
  totalTemplates: 31,
  modulesDisplay: '115',
  templatesDisplay: '31',
  // Single source of truth for the Suite release label/stage.
  // Keep every UI reference (landing, /suite, navbar, installer) fed from here
  // so the public version can never drift out of sync again.
  suiteVersion: 'v0.2',
  suiteStage: 'Public Beta',
  suiteLabel: 'v0.2 Public Beta',
  suiteInstallCmd: 'curl -fsSL https://xivizley.com.tr/suite/install | sudo bash',
  taglineTr: "XIVIZLEY, 115 Docker servisini görsel tuvalde sürükle-bırak bağlayıp tek SSH komutuyla VDS'e kuran, ücretsiz ve MIT lisanslı self-host mimarlık aracıdır.",
  taglineEn: "XIVIZLEY is a free, visual self-hosted architecture tool to connect 115 Docker services via canvas and deploy via SSH.",
} as const;
