"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { GitBranch, Mail, ArrowRight, Loader2, Sparkles, UserPlus, LogIn, ShieldCheck } from "lucide-react";
import { TurnstileWidget } from "@/components/shared/TurnstileWidget";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingGithub, setLoadingGithub] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string>("");

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    if (!turnstileToken) {
      setErrorMsg("Lütfen güvenlik doğrulamasını (Cloudflare Turnstile) tamamlayın.");
      return;
    }

    setLoadingEmail(true);
    setErrorMsg(null);

    try {
      const res = await signIn("credentials", {
        email,
        name: name || email.split("@")[0],
        turnstileToken: turnstileToken,
        callbackUrl: "/architect",
        redirect: true,
      });

      setLoadingEmail(false);
      if (res?.error) {
        setErrorMsg("Giriş yapılırken bir hata oluştu veya doğrulama başarısız oldu.");
      }
    } catch {
      setLoadingEmail(false);
      setErrorMsg("Bağlantı hatası oluştu. Lütfen tekrar deneyin.");
    }
  };

  const handleOAuth = (provider: string) => {
    if (provider === "github") setLoadingGithub(true);
    if (provider === "google") setLoadingGoogle(true);
    signIn(provider, { callbackUrl: "/architect", redirect: true });
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center bg-[#08090e] px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-slate-800/80 bg-[#0e111a]/90 p-8 shadow-2xl backdrop-blur-2xl ring-1 ring-indigo-500/20">
        {/* Brand */}
        <div className="mb-6 text-center">
          <Link href="/" className="inline-block hover:opacity-90 transition-opacity mb-2">
            <Image
              src="/xivizley-logo.png"
              alt="XIVIZLEY"
              width={180}
              height={44}
              className="h-10 w-auto mx-auto object-contain"
              priority
            />
          </Link>
          <p className="mt-1 text-xs text-slate-400">
            {isSignUp ? "Yeni bir hesap oluşturun" : "Hesabınıza giriş yapın ve mimarinizi yönetin"}
          </p>
        </div>

        {/* Tab Toggle: Giriş Yap / Hesap Oluştur */}
        <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-[#0e111a] p-1 border border-slate-800/80">
          <button
            type="button"
            onClick={() => { setIsSignUp(false); }}
            className={`flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition-all ${
              !isSignUp ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20" : "text-slate-400 hover:text-white"
            }`}
          >
            <LogIn className="h-3.5 w-3.5" />
            Giriş Yap
          </button>
          <button
            type="button"
            onClick={() => { setIsSignUp(true); }}
            className={`flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition-all ${
              isSignUp ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20" : "text-slate-400 hover:text-white"
            }`}
          >
            <UserPlus className="h-3.5 w-3.5" />
            Hesap Oluştur
          </button>
        </div>

        {/* OAuth Buttons */}
        <div className="flex flex-col gap-2.5 mb-6">
          <button
            onClick={() => handleOAuth("google")}
            disabled={loadingGoogle || loadingGithub}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-800 bg-[#0e111a] hover:border-indigo-500/40 hover:bg-[#131724] px-4 py-2.5 text-xs font-semibold text-slate-200 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-50"
          >
            {loadingGoogle ? (
              <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
            ) : (
              <>
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{isSignUp ? "Google ile Kayıt Ol" : "Google ile Giriş Yap"}</span>
              </>
            )}
          </button>

          <button
            onClick={() => handleOAuth("github")}
            disabled={loadingGithub || loadingGoogle}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-700/80 bg-slate-900/60 hover:bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-slate-200 transition-all focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:opacity-50"
          >
            {loadingGithub ? (
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            ) : (
              <>
                <GitBranch className="h-4 w-4 text-slate-400" />
                <span>{isSignUp ? "GitHub ile Kayıt Ol" : "GitHub ile Giriş Yap"}</span>
              </>
            )}
          </button>
        </div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800"></div>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
            <span className="bg-[#090d16] px-2 text-slate-500">veya e-posta ile</span>
          </div>
        </div>

        {/* Email Form */}
        <form onSubmit={handleEmailAuth} className="space-y-3">
          {isSignUp && (
            <div>
              <label htmlFor="name" className="sr-only">
                İsim / Kullanıcı Adı
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="İsim veya Kullanıcı Adı"
                className="block w-full rounded-xl border border-slate-800 bg-[#0e111a] py-2.5 px-3 text-xs text-slate-200 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-colors"
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="sr-only">
              E-posta
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Mail className="h-3.5 w-3.5 text-slate-500" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@email.com"
                required
                className="block w-full rounded-xl border border-slate-800 bg-[#0e111a] py-2.5 pl-9 pr-3 text-xs text-slate-200 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-colors"
              />
            </div>
          </div>

          {/* Cloudflare Turnstile CAPTCHA Widget */}
          <TurnstileWidget
            onSuccess={(token) => setTurnstileToken(token)}
            onExpire={() => setTurnstileToken("")}
            onError={() => setTurnstileToken("")}
          />

          {errorMsg && (
            <p className="text-xs text-red-400 text-center">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={loadingEmail}
            className="group relative flex w-full justify-center rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-cyan-500 hover:brightness-110 px-4 py-2.5 text-xs font-bold text-white transition-all shadow-[0_0_15px_rgba(99,102,241,0.25)] disabled:opacity-50 active:scale-[0.99]"
          >
            {loadingEmail ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <div className="flex items-center gap-1.5">
                <span>{isSignUp ? "Hesap Oluştur ve Başla" : "E-posta ile Giriş Yap"}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            )}
          </button>
        </form>

        {/* Security badge footer */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Cloudflare Turnstile ile korunmaktadır</span>
        </div>
      </div>
    </div>
  );
}
