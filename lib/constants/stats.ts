/**
 * Single source of truth for platform statistics and catalog numbers.
 * Derived directly from MODULE_CATALOG (115) and STACK_TEMPLATES (31).
 */
export const PLATFORM_STATS = {
  totalModules: 115,
  totalTemplates: 31,
  modulesDisplay: '115',
  templatesDisplay: '31',
  taglineTr: "XIVIZLEY, 115 Docker servisini görsel tuvalde sürükle-bırak bağlayıp tek SSH komutuyla VDS'e kuran, ücretsiz ve MIT lisanslı self-host mimarlık aracıdır.",
  taglineEn: "XIVIZLEY is a free, visual self-hosted architecture tool to connect 115 Docker services via canvas and deploy via SSH.",
} as const;
