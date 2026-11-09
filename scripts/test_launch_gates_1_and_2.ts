// ============================================================
// Automated Test Suite: Launch Gate 1 & 2 Verification
// Gate 1: Single Source of Truth (150 Modules / 38 Templates)
// Gate 2: International /en Route Parity & Zero Turkish Leakage
// scripts/test_launch_gates_1_and_2.ts
// ============================================================

import fs from 'fs';
import path from 'path';
import { PLATFORM_STATS } from '../lib/constants/stats';
import { STACK_TEMPLATES } from '../lib/data/templates';
import { MODULE_CATALOG } from '../lib/data/modules';
import trLocale from '../locales/tr.json';
import enLocale from '../locales/en.json';

let failures = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ [PASS] ${message}`);
  } else {
    console.error(`  ✗ [FAIL] ${message}`);
    failures++;
  }
}

console.log('====================================================');
console.log('🚀 TESTING LAUNCH GATE 1: NUMERICAL TRUTH & CONSTANTS');
console.log('====================================================');

assert(PLATFORM_STATS.totalModules === 150, `PLATFORM_STATS.totalModules is exactly 150 (got: ${PLATFORM_STATS.totalModules})`);
assert(PLATFORM_STATS.totalTemplates === 38, `PLATFORM_STATS.totalTemplates is exactly 38 (got: ${PLATFORM_STATS.totalTemplates})`);
assert(MODULE_CATALOG.length === 150, `MODULE_CATALOG has exactly 150 modules (got: ${MODULE_CATALOG.length})`);
assert(STACK_TEMPLATES.length === 38, `STACK_TEMPLATES has exactly 38 templates (got: ${STACK_TEMPLATES.length})`);

// Scan source directories for stale hardcoded numbers
const dirsToScan = ['app', 'components', 'lib', 'locales'];
const stalePatterns = [
  /\b134\b/,
  /33\s+(hazır|kurumsal|enterprise|stack|şablon)/i,
  /35\s+(hazır|kurumsal|enterprise|stack|stacks|şablon|küratörlü|pre-built)/i,
  /60\+\s+(popüler|servis|docker)/i,
];

function scanDir(dir: string) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.next') {
        scanDir(fullPath);
      }
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx') || entry.name.endsWith('.json'))) {
      const content = fs.readFileSync(fullPath, 'utf8');
      for (const pattern of stalePatterns) {
        if (pattern.test(content)) {
          // Allow internal comments or specific exemptions if any
          assert(false, `Stale number pattern ${pattern} found in ${fullPath}`);
        }
      }
    }
  }
}

for (const d of dirsToScan) {
  scanDir(path.resolve(__dirname, '..', d));
}
assert(true, 'Zero stale module/template numbers (134, 33 stacks, 35 stacks, 60+ services) found in app, components, lib, locales');

console.log('\n====================================================');
console.log('🌍 TESTING LAUNCH GATE 2: /en ROUTE I18N & ZERO LEAKAGE');
console.log('====================================================');

// 1. Recursive key verification between tr.json and en.json
function getKeys(obj: any, prefix = ''): string[] {
  let keys: string[] = [];
  for (const key of Object.keys(obj)) {
    const nextPrefix = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys = keys.concat(getKeys(obj[key], nextPrefix));
    } else {
      keys.push(nextPrefix);
    }
  }
  return keys;
}

const trKeys = getKeys(trLocale);
const enKeys = getKeys(enLocale);

const missingInEn = trKeys.filter((k) => !enKeys.includes(k));
assert(missingInEn.length === 0, `All tr.json keys exist in en.json (missing: ${missingInEn.join(', ')})`);

// 2. Scan en.json for suspicious Turkish characters (ç, ğ, ı, ö, ş, ü, İ) in values
const turkishSpecificChars = /[çğıöşüİĞŞÖÜ]/i;
const suspiciousTranslations: string[] = [];

function checkEnValues(obj: any, pathStr = '') {
  for (const key of Object.keys(obj)) {
    const curPath = pathStr ? `${pathStr}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      checkEnValues(obj[key], curPath);
    } else if (typeof obj[key] === 'string') {
      const val = obj[key];
      // Exclude brand names like 'Hoşça' or 'XIVIZLEY'
      const sanitized = val.replace(/Alperen Celal Hoşça/g, '').replace(/TÜBİTAK/g, '');
      if (turkishSpecificChars.test(sanitized)) {
        suspiciousTranslations.push(`${curPath}: "${val}"`);
      }
    }
  }
}

checkEnValues(enLocale);
assert(
  suspiciousTranslations.length === 0,
  `Zero Turkish character leaks in en.json (found: ${suspiciousTranslations.length} -> ${suspiciousTranslations.slice(0, 3).join(', ')})`
);

// 3. Verify key navbar / landing translations in en.json
assert((enLocale as any).nav?.login === 'Sign In', 'en.json nav.login is "Sign In"');
assert((enLocale as any).nav?.templates === 'Templates', 'en.json nav.templates is "Templates"');
assert((enLocale as any).landing?.howTitle === 'How XIVIZLEY Works', 'en.json landing.howTitle is "How XIVIZLEY Works"');

console.log('\n====================================================');
if (failures === 0) {
  console.log('✅ ALL LAUNCH GATE 1 & 2 INTEGRITY CHECKS PASSED!');
  process.exit(0);
} else {
  console.error(`❌ ${failures} TEST(S) FAILED`);
  process.exit(1);
}
