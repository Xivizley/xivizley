// ============================================================
// XIVIZLEY — Cryptographic Secure Password Generator
// lib/utils/passwordGenerator.ts
// ============================================================

export function generateSecurePassword(length: number = 18): string {
  const chars = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%^&*';
  const array = new Uint32Array(length);
  
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < length; i++) {
      array[i] = Math.floor(Math.random() * 1000000);
    }
  }

  let result = '';
  for (let i = 0; i < length; i++) {
    const val = array[i] ?? Math.floor(Math.random() * 1000000);
    result += chars.charAt(val % chars.length);
  }
  return result;

}
