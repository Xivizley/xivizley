// ============================================================
// XIVIZLEY — NextAuth Configuration
// lib/auth.ts
// ============================================================

import { type NextAuthOptions, type DefaultSession } from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';

// Augment next-auth types to include user.id and user.role on the session
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession['user'];
  }

  interface User {
    role?: string;
  }
}

import { verifyTurnstileToken } from '@/lib/turnstile';

// Safe URL sanitization for NextAuth to avoid build-time crashes if Vercel secrets are redacted
if (typeof process !== 'undefined' && process.env) {
  const authUrl = process.env.NEXTAUTH_URL;
  if (!authUrl || authUrl.includes('[SENSITIVE]') || !authUrl.startsWith('http')) {
    process.env.NEXTAUTH_URL = 'https://xivizley.com.tr';
  }
}

export const authOptions: NextAuthOptions = {
  secret: process.env['NEXTAUTH_SECRET'] || process.env['AUTH_SECRET'] || '',
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'E-posta ile Giriş',
      credentials: {
        email: { label: 'E-posta', type: 'email', placeholder: 'admin@xivizley.com.tr' },
        name: { label: 'İsim', type: 'text', placeholder: 'Admin' },
        turnstileToken: { label: 'Turnstile Token', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;

        // Verify Cloudflare Turnstile token if secret key is configured
        if (process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY) {
          if (!credentials.turnstileToken) {
            console.warn('[Auth] Turnstile token missing for:', credentials.email);
            return null;
          }
          const verifyResult = await verifyTurnstileToken(credentials.turnstileToken);
          if (!verifyResult.success) {
            console.warn('[Auth] Turnstile verification failed for:', credentials.email, verifyResult.errorCodes);
            return null;
          }
        }
        const email = credentials.email.trim();
        const name = credentials.name?.trim() || email.split('@')[0] || 'Kullanıcı';
        return {
          id: email,
          name: name,
          email: email,
          image: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
          role:
            email === 'admin@xivizley.com.tr' || email === process.env['ADMIN_EMAIL']
              ? 'ADMIN'
              : 'USER',
        };
      },
    }),
    GitHubProvider({
      clientId: process.env['GITHUB_CLIENT_ID'] || '',
      clientSecret: process.env['GITHUB_CLIENT_SECRET'] || '',
    }),
    GoogleProvider({
      clientId: process.env['GOOGLE_CLIENT_ID'] || '',
      clientSecret: process.env['GOOGLE_CLIENT_SECRET'] || '',
      checks: ['none'],
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn() {
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id || token.sub || 'user_id';
        token.role =
          user.email === 'alperen@xivizley.com.tr' || user.email === process.env['ADMIN_EMAIL']
            ? 'ADMIN'
            : 'USER';
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token) {
        session.user.id = (token.id as string) || (token.sub as string) || 'user_id';
        session.user.role = (token.role as string) || 'USER';
      }
      return session;
    },
  },
  debug: process.env['NODE_ENV'] === 'development',
  pages: {
    signIn: '/login',
    error: '/login',
  },
};
