'use client';

// ============================================================
// XIVIZLEY — Comprehensive User Guide & Homelab Encyclopedia (/guide)
// app/guide/page.tsx
// ============================================================

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/shared/Navbar';
import {
  BookOpen,
  Sparkles,
  Layers,
  Cpu,
  ArrowRight,
  Terminal,
  ShieldCheck,
  Zap,
  HelpCircle,
  Download,
  AlertTriangle,
  Move,
  Link as LinkIcon,
  Globe,
  Server,
  Cloud,
  Film,
  Gamepad2,
  Lock,
  Database,
  HardDrive,
  Copy,
  Check,
  Boxes,
  Shield,
  RefreshCw,
} from 'lucide-react';
import { useI18nStore, useTranslation } from '@/lib/i18n/store';
import { cn } from '@/lib/utils';
import { InteractiveTerminal } from '@/components/guide/InteractiveTerminal';

function CodeBlock({ code, title, isTr = true }: { code: string; title?: string; isTr?: boolean }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-[#08090E] overflow-hidden my-3 shadow-lg">
      {title && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-[#0e111a] text-xs text-slate-400 font-mono">
          <span>{title}</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            <span>{copied ? (isTr ? 'Kopyalandı' : 'Copied') : (isTr ? 'Kopyala' : 'Copy')}</span>
          </button>
        </div>
      )}
      <pre className="p-4 text-xs font-mono text-indigo-300 overflow-x-auto selection:bg-indigo-500 selection:text-white">
        {code}
      </pre>
    </div>
  );
}

export default function GuidePage() {
  const { t } = useTranslation();
  const { lang, setLang } = useI18nStore();
  const isTr = lang === 'tr';
  const [activeTab, setActiveTab] = useState('all');

  const GUIDE_SECTIONS = [
    {
      id: 'docker-basics',
      category: 'basics',
      title: isTr ? '🐧 1. Bölüm: Linux & Docker Homelab Temelleri' : '🐧 Chapter 1: Linux & Docker Homelab Fundamentals',
      icon: Terminal,
      badge: isTr ? 'Temel Seviye' : 'Fundamentals',
      content: (
        <div className="space-y-4 text-slate-300 leading-relaxed text-sm">
          <p>
            {isTr
              ? 'Homelab (Ev/Kişisel Sunucu Laboratuvarı), kendi VDS veya yerel sunucunuzda Google Drive, Netflix, Bitwarden gibi servislerin açık kaynaklı alternatiflerini tamamen kendi kontrolünüzde barındırmanızı sağlar.'
              : 'A Homelab empowers you to self-host open-source alternatives to services like Google Drive, Netflix, and Bitwarden on your own VDS or home server with total data ownership.'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="rounded-xl border border-slate-800 bg-[#0e111a] p-3.5 text-center">
              <div className="flex justify-center mb-1.5 text-indigo-400"><Boxes className="h-5 w-5" /></div>
              <h4 className="font-semibold text-xs text-slate-200">{isTr ? 'İzolasyon' : 'Isolation'}</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                {isTr ? 'Her Docker servisi kendi izole ortamında çalışır, sunucu çökmez.' : 'Every Docker container operates in an isolated environment, avoiding system conflicts.'}
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-[#0e111a] p-3.5 text-center">
              <div className="flex justify-center mb-1.5 text-emerald-400"><ShieldCheck className="h-5 w-5" /></div>
              <h4 className="font-semibold text-xs text-slate-200">{isTr ? 'Tam Gizlilik' : 'Zero Tracking'}</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                {isTr ? 'Verileriniz hiçbir üçüncü taraf şirketin eline geçmez.' : 'Your private files and configurations never touch third-party commercial clouds.'}
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-[#0e111a] p-3.5 text-center">
              <div className="flex justify-center mb-1.5 text-purple-400"><RefreshCw className="h-5 w-5" /></div>
              <h4 className="font-semibold text-xs text-slate-200">{isTr ? 'Taşınabilirlik' : 'Portability'}</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                {isTr ? 'Tek bir komut ve YAML dosyasıyla istediğiniz sunucuya taşıyın.' : 'Migrate your entire stack to any server with a single compose file.'}
              </p>
            </div>
          </div>

          <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider pt-3">
            {isTr ? '🚀 En Sık Kullanılan Docker Komutları:' : '🚀 Essential Docker CLI Commands:'}
          </h4>
          <CodeBlock
            isTr={isTr}
            title={isTr ? 'Temel Docker Yönetim Komutları' : 'Basic Docker Management Commands'}
            code={`# ${isTr ? 'Çalışan tüm konteynerleri listele' : 'List all active running containers'}
docker ps

# ${isTr ? 'Tüm servisleri ve logları anlık takip et' : 'Follow container logs in real time'}
docker logs -f [container-name]

# ${isTr ? 'Sistemi ve kullanılmayan eski imajları temizle' : 'Prune unused containers, networks, and images'}
docker system prune -af --volumes

# ${isTr ? 'XIVIZLEY Durum Raporunu Al' : 'Fetch XIVIZLEY status report'}
durum`}
          />
        </div>
      ),
    },
    {
      id: 'security-stack',
      category: 'security',
      title: isTr ? '🛡️ 2. Bölüm: Sıfır-Güven (Zero-Trust) & Güvenlik Duvarı (UFW)' : '🛡️ Chapter 2: Zero-Trust Security & Firewall (UFW)',
      icon: Shield,
      badge: isTr ? 'Kritik Güvenlik' : 'Hardening',
      content: (
        <div className="space-y-4 text-slate-300 leading-relaxed text-sm">
          <p>
            {isTr
              ? 'Bir VDS kiraladığınızda ilk yapmanız gereken güvenlik duvarını yapılandırmaktır. Sadece gerekli portları açarak brute-force saldırılarını engelleyin.'
              : 'The essential first step upon provisioning a server is firewall hardening. Restrict all inbound traffic except explicitly allowed operational ports.'}
          </p>
          <CodeBlock
            isTr={isTr}
            title={isTr ? 'Temel UFW ve SSH Sertleştirme Komutları' : 'Core UFW & SSH Hardening Commands'}
            code={`# UFW Güvenlik Duvarını Kur ve Yapılandır
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp comment 'SSH Portu'
sudo ufw allow 80/tcp comment 'HTTP (Let's Encrypt SSL)'
sudo ufw allow 443/tcp comment 'HTTPS (Web Trafiği)'
sudo ufw enable
sudo ufw status verbose`}
          />
          <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 space-y-1.5 text-xs">
            <h5 className="font-bold text-amber-300 flex items-center gap-1.5">
              <span>⚠️</span>
              <span>{isTr ? 'Kritik Uyarı: SSH Bağlantınızı Kesmeyin!' : 'Critical Notice: Do not drop SSH!'}</span>
            </h5>
            <p className="text-slate-300">
              {isTr
                ? '`sudo ufw enable` komutunu çalıştırmadan ÖNCE `sudo ufw allow 22/tcp` komutuyla SSH portunuzu izin verdiğinizden kesinlikle emin olun; aksi halde sunucunuza erişiminiz kilitlenebilir.'
                : 'Always verify `sudo ufw allow 22/tcp` is executed BEFORE enabling UFW, otherwise you will lock yourself out.'}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'network-reverse-proxy',
      category: 'network',
      title: isTr ? '🌐 3. Bölüm: Reverse Proxy & Caddy / Nginx ile Otomatik SSL' : '🌐 Chapter 3: Reverse Proxy & Auto-SSL (Caddy / Nginx)',
      icon: Globe,
      badge: isTr ? 'Ağ & SSL' : 'Networking & SSL',
      content: (
        <div className="space-y-4 text-slate-300 leading-relaxed text-sm">
          <p>
            {isTr
              ? 'Birden fazla servisi (Nextcloud, Jellyfin, Vaultwarden) tek bir sunucuda barındırırken port ezberlemek yerine her birine bulut.domain.com gibi alan adları atamak için Ters Proxy (Reverse Proxy) kullanılır.'
              : 'Reverse Proxies allow routing clean subdomains like cloud.yourdomain.com directly to internal container ports without exposing raw port numbers.'}
          </p>
          <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-4 space-y-2 text-xs">
            <h5 className="font-bold text-indigo-300">
              {isTr ? '💡 Neden Caddy veya Nginx Proxy Manager?' : '💡 Why Caddy or Nginx Proxy Manager?'}
            </h5>
            <p className="text-slate-300">
              {isTr
                ? "Caddy veya Nginx Proxy Manager, Let's Encrypt üzerinden ücretsiz ve otomatik yenilenen SSL (HTTPS) sertifikası sağlar. Tarayıcınızda yeşil kilit simgesi görünür."
                : "Caddy and Nginx Proxy Manager provide automated, free SSL (HTTPS) certificates via Let's Encrypt with zero renewal maintenance."}
            </p>
          </div>
          <CodeBlock
            isTr={isTr}
            title={isTr ? 'Örnek Caddyfile Konfigürasyonu' : 'Example Caddyfile Configuration'}
            code={`# ${isTr ? 'Cloudflare Proxied DNS ile Caddy Otomatik SSL' : 'Cloudflare Proxied DNS with Auto-SSL'}
cloud.yourdomain.com {
    reverse_proxy localhost:8081
}

media.yourdomain.com {
    reverse_proxy localhost:8096
}`}
          />
        </div>
      ),
    },
    {
      id: 'cloud-storage',
      category: 'cloud',
      title: isTr ? '☁️ 4. Bölüm: Özel Kişisel Bulut (Nextcloud + PostgreSQL + Redis)' : '☁️ Chapter 4: Private Cloud Storage (Nextcloud + PostgreSQL + Redis)',
      icon: Cloud,
      badge: isTr ? 'Depolama' : 'Cloud Storage',
      content: (
        <div className="space-y-4 text-slate-300 leading-relaxed text-sm">
          <p>
            {isTr
              ? 'Nextcloud, Google Drive, Dropbox ve Google Fotoğraflar\'ın açık kaynaklı alternatifidir. Yüksek hız için SQLite yerine PostgreSQL ve Redis önbellekleme ile kurulmalıdır.'
              : 'Nextcloud delivers an enterprise-grade private alternative to Google Drive and Dropbox. Pairing it with PostgreSQL and Redis caching ensures sub-second responses.'}
          </p>
          <div className="space-y-2 text-xs text-slate-400">
            <p>⚡ <strong>PostgreSQL:</strong> {isTr ? 'Yüzbinlerce dosya ve fotoğrafı milisaniyeler içinde indeksler.' : 'Indexes hundreds of thousands of files and assets in milliseconds.'}</p>
            <p>⚡ <strong>Redis {isTr ? 'Önbellek' : 'Cache'}:</strong> {isTr ? 'Dosya kilitleme ve anlık kuyruk işlemlerini RAM üzerinde tutarak sunucuyu 5 kat hızlandırır.' : 'Keeps file transactional locks in memory, accelerating file ops by 5x.'}</p>
          </div>
          <CodeBlock
            isTr={isTr}
            title={isTr ? 'XIVIZLEY CLI ile Tek Komutla Kurulum' : '1-Command Deployment via XIVIZLEY CLI'}
            code={`# ${isTr ? "XIVIZLEY CLI ile Nextcloud'u tek komutla kurmak için:" : 'Deploy Nextcloud with 1 command via XIVIZLEY CLI:'}
durum kur nextcloud

# ${isTr ? 'Veya tuvalden Nextcloud + PostgreSQL + Redis\'i bağlayıp "Sunucuya Kur" butonuna basın!' : 'Or connect Nextcloud + PostgreSQL + Redis on the canvas and click Deploy!'}`}
          />

          {/* Trusted Domain Error Box */}
          <div className="rounded-2xl border border-amber-500/40 bg-amber-950/20 p-4 space-y-3">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-xs sm:text-sm">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
              <span>
                {isTr
                  ? '⚠️ Sık Karşılaşılan Hata: "Güvenilmeyen etki alanı üzerinden erişim" (Trusted Domains)'
                  : '⚠️ Common Issue: "Access through untrusted domain" (Trusted Domains)'}
              </span>
            </div>
            <p className="text-xs text-slate-300">
              {isTr
                ? 'Nextcloud\'a yeni bir IP veya domain ile ilk kez girdiğinizde güvenlik gereği bu uyarıyla karşılaşırsınız. Sunucu IP\'nizi veya alan adınızı aşağıdaki komutla trusted_domains listesine ekleyin:'
                : 'When accessing Nextcloud via a new server IP or domain, Nextcloud displays this security screen. Add your specific IP or domain to the trusted_domains list using the command below:'}
            </p>
            <CodeBlock
              isTr={isTr}
              title={isTr ? 'Güvenilir Alan Adı Ekle (Spesifik IP veya Domain)' : 'Add Trusted Domain (Specific IP or Domain)'}
              code={`# Sunucu IP veya domain adresinizi trusted_domains listesine ekleyin:
docker exec -u www-data nextcloud php occ config:system:set trusted_domains 1 --value="SUNUCU_IP_VEYA_DOMAIN"`}
            />
            <div className="text-[11px] text-slate-400 space-y-1.5 pt-1">
              <p>
                {isTr
                  ? '💡 Belirli bir alan adı eklemek isterseniz (Örn: bulut.alanadiniz.com):'
                  : '💡 To allow a specific domain only (e.g. cloud.yourdomain.com):'}
              </p>
              <pre className="p-2.5 rounded-lg bg-[#08090E] border border-slate-800 text-indigo-300 font-mono text-[11px] overflow-x-auto selection:bg-indigo-500 selection:text-white">
                docker exec -u www-data nextcloud php occ config:system:set trusted_domains 2 --value="bulut.alanadiniz.com"
              </pre>
              <p className="text-[10px] text-slate-500">
                {isTr
                  ? 'Komutu çalıştırdıktan hemen sonra tarayıcınızda sayfayı yenilemeniz yeterlidir.'
                  : 'Simply refresh the browser tab after running the command.'}
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'media-stack',
      category: 'media',
      title: isTr ? '🎬 5. Bölüm: 4K Medya ve Otomasyon (Jellyfin + Radarr + Sonarr)' : '🎬 Chapter 5: 4K Media & Automation (Jellyfin + Radarr + Sonarr)',
      icon: Film,
      badge: isTr ? 'Medya & Akış' : 'Media Streaming',
      content: (
        <div className="space-y-4 text-slate-300 leading-relaxed text-sm">
          <p>
            {isTr
              ? 'Kendi özel Netflix sunucunuzu oluşturun. Jellyfin ile tüm akıllı TV, telefon ve bilgisayarlarınızdan 4K HDR filmlerinizi izleyin.'
              : 'Build your private home media streaming center. Stream 4K HDR movies across smart TVs, phones, and consoles without subscription fees.'}
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-400">
            <li><strong>Jellyfin:</strong> {isTr ? 'Ücretsiz, reklamsız medya oynatıcı ve akış sunucusu.' : 'Free, open-source ad-free streaming media server.'}</li>
            <li><strong>Radarr & Sonarr:</strong> {isTr ? 'Yeni çıkan film ve dizi bölümlerini otomatik takip eden yöneticiler.' : 'Automated movie and TV series library downloaders.'}</li>
            <li><strong>qBittorrent:</strong> {isTr ? 'Web tabanlı yüksek hızlı dosya indirici.' : 'Web-managed high-speed downloading engine.'}</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'minecraft-paper',
      category: 'game',
      title: isTr ? '🎮 6. Bölüm: Profesyonel Minecraft PaperMC Sunucu Yönetimi' : '🎮 Chapter 6: Professional Minecraft PaperMC Server Management',
      icon: Gamepad2,
      badge: isTr ? 'Oyun Sunucusu' : 'Game Server',
      content: (
        <div className="space-y-4 text-slate-300 leading-relaxed text-sm">
          <p>
            {isTr
              ? 'PaperMC, standart Vanilla Minecraft sunucularına göre %300 daha yüksek performans ve düşük gecikme (TPS: 20.0) sunan en popüler sunucu çekirdeğidir.'
              : 'PaperMC is the industry-standard server fork delivering rock-solid 20.0 TPS and up to 300% better optimization than Vanilla Minecraft.'}
          </p>
          <div className="space-y-2 text-xs text-slate-400">
            <p>🔌 <strong>ViaVersion & ViaBackwards:</strong> {isTr ? '1.8 ile 1.21+ arasındaki tüm oyuncuların aynı sunucuya girmesini sağlar.' : 'Enables players from 1.8 through 1.21+ to connect to the same server seamlessly.'}</p>
            <p>🔌 <strong>AuthMe Reloaded:</strong> {isTr ? 'Cracked oyuncular için /register ve /login şifre koruması.' : 'Registration and authentication security for offline/cracked clients.'}</p>
            <p>🔌 <strong>EssentialsX:</strong> {isTr ? '/home, /spawn, /warp ve ekonomi komutları.' : 'Core commands: /home, /spawn, /warp, and player currency.'}</p>
          </div>
          <CodeBlock
            isTr={isTr}
            title={isTr ? 'Minecraft Port Yönlendirme (Port Forwarding)' : 'Minecraft Port Forwarding Configuration'}
            code={`# ${isTr ? 'Minecraft varsayılan portunu açın' : 'Open Minecraft default game port'}
ufw allow 25565/tcp
ufw allow 25565/udp

# ${isTr ? 'Sunucuyu XIVIZLEY CLI ile başlatın' : 'Launch the server with XIVIZLEY CLI'}
durum kur minecraft`}
          />
        </div>
      ),
    },
    {
      id: 'backup-recovery',
      category: 'security',
      title: isTr ? '💾 7. Bölüm: 3-2-1 Yedekleme Stratejisi & Felaket Kurtarma' : '💾 Chapter 7: 3-2-1 Backup Strategy & Disaster Recovery',
      icon: HardDrive,
      badge: isTr ? 'Yedekleme & DR' : 'Backup & DR',
      content: (
        <div className="space-y-4 text-slate-300 leading-relaxed text-sm">
          <p>
            {isTr
              ? 'Bir homelab yöneticisinin altın kuralı: Yedeği alınmamış veri aslında hiç var olmamıştır!'
              : 'Golden rule of homelab administration: Data without a verified backup does not really exist!'}
          </p>
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2 text-xs">
            <h5 className="font-bold text-slate-200">
              {isTr ? '🛡️ 3-2-1 Yedekleme Kuralı Nedir?' : '🛡️ What is the 3-2-1 Backup Rule?'}
            </h5>
            <ul className="list-disc list-inside text-slate-400 space-y-1">
              <li><strong>{isTr ? '3 Kopya:' : '3 Copies:'}</strong> {isTr ? 'Verilerinizin her zaman 3 ayrı kopyasını tutun.' : 'Maintain 3 separate copies of your mission-critical data.'}</li>
              <li><strong>{isTr ? '2 Farklı Medya:' : '2 Storage Media:'}</strong> {isTr ? "Biri SSD'de, biri harici disk veya NAS'ta olsun." : 'Keep data on 2 different physical media types (e.g. SSD and NAS).'}</li>
              <li><strong>{isTr ? '1 Uzak Konum (Off-site):' : '1 Off-site Copy:'}</strong> {isTr ? 'En az 1 kopya bulutta (Cloudflare R2, AWS S3 veya Google Drive) şifreli saklansın.' : 'Store at least 1 encrypted copy off-site (Cloudflare R2, AWS S3, or Backblaze).'}</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'macos-menubar',
      category: 'tools',
      title: isTr ? '🍏 8. Bölüm: macOS Menubar & Terminal Canlı İzleme Aracı' : '🍏 Chapter 8: macOS Menubar & Terminal Live Monitor',
      icon: Cpu,
      badge: isTr ? 'Mac & CLI' : 'Mac & CLI',
      content: (
        <div className="space-y-4 text-slate-300 leading-relaxed text-sm">
          <p>
            {isTr
              ? "MacBook veya Linux bilgisayarınızın menü çubuğundan veya terminalinden VDS'lerinizin CPU, RAM, Disk kullanımını canlı izlemek için hazırladığımız hafif aracı kullanabilirsiniz."
              : 'Monitor CPU, RAM, and Disk metrics across all your VDS servers directly from your macOS menubar or terminal.'}
          </p>
          <CodeBlock
            isTr={isTr}
            title={isTr ? 'MacBook / Linux Canlı İzleyici Tek Komut Kurulumu' : 'MacBook / Linux Live Monitor 1-Line Setup'}
            code={`# ${isTr ? 'VDS durumunu anında ekrana basan CLI izleyici' : 'Instant live VDS telemetry tool'}
curl -sSL https://xivizley.com.tr/durum | bash`}
          />
        </div>
      ),
    },
  ];

  const filteredSections = activeTab === 'all'
    ? GUIDE_SECTIONS
    : GUIDE_SECTIONS.filter((s) => s.category === activeTab);

  return (
    <div className="min-h-screen bg-[#08090e] text-slate-100 flex flex-col">
      {/* Unified Navbar with Language Switcher */}
      <Navbar />

      {/* Hero Header */}
      <header className="relative border-b border-slate-800/80 bg-gradient-to-b from-indigo-950/20 via-[#0e111a]/40 to-transparent py-14 px-4 sm:px-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-300 mb-4 shadow-sm">
          <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
          <span>{isTr ? 'Homelab & DevOps Ansiklopedisi v3.0' : 'Homelab & DevOps Encyclopedia v3.0'}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
          {isTr ? "A'dan Z'ye Kapsamlı Homelab Rehberi" : 'The Complete A-to-Z Homelab Guide'}
        </h1>
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-400 leading-relaxed mb-6">
          {isTr
            ? 'Kendi VDS veya ev sunucunuzu kurun, Docker ile 115 servisi yönetin, Cloudflare ile alan adı bağlayın ve verilerinizi güvence altına alın.'
            : 'Deploy your own VDS or home server, manage 115 Docker services, connect domains with Cloudflare, and secure your data.'}
        </p>

        <div className="flex items-center justify-center gap-3 mb-8">
          <Link
            href="/architect"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 px-6 py-2.5 text-xs sm:text-sm font-bold text-white hover:brightness-110 transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
          >
            <Sparkles className="h-4 w-4" />
            <span>{isTr ? 'Görsel Mimarı Aç' : 'Open Visual Architect'}</span>
          </Link>
          <Link
            href="/templates"
            className="flex items-center gap-2 rounded-xl border border-slate-800 bg-[#0e111a] px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition-all"
          >
            <span>{isTr ? 'Hazır Şablonlar' : 'Ready Stacks'}</span>
          </Link>
        </div>

        {/* Live Interactive CLI Terminal Simulator */}
        <div className="max-w-4xl mx-auto text-left">
          <InteractiveTerminal />
        </div>

        {/* Video Tutorial Embed */}
        <div className="max-w-4xl mx-auto rounded-3xl border border-indigo-500/30 bg-[#0e111a] p-4 sm:p-6 shadow-2xl overflow-hidden ring-1 ring-indigo-500/20 text-left">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                {isTr ? '🎬 Resmi Video Rehberi: 1 Dakikada Sunucu Kurma' : '🎬 Official Video Guide: Deploy a Server in 1 Minute'}
              </span>
            </div>
            <a
              href="https://www.youtube.com/watch?v=ldWLCBx-69g"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              {isTr ? "YouTube'da İzle ↗" : "Watch on YouTube ↗"}
            </a>
          </div>

          <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-800 bg-black shadow-inner">
            <iframe
              src="https://www.youtube-nocookie.com/embed/ldWLCBx-69g"
              title="Kod Yazmadan 1 Dakikada Minecraft & Web Sunucusu Kurma! (XIVIZLEY)"
              className="absolute inset-0 w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      </header>

      {/* Category Pills */}
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 pt-8">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {[
            { id: 'all', label: isTr ? 'Tüm Konular (8 Bölüm)' : 'All Topics (8 Parts)' },
            { id: 'basics', label: isTr ? '🐧 Linux & Docker' : '🐧 Linux & Docker' },
            { id: 'security', label: isTr ? '🛡️ Güvenlik & UFW' : '🛡️ Security & UFW' },
            { id: 'network', label: isTr ? '🌐 Reverse Proxy & SSL' : '🌐 Reverse Proxy & SSL' },
            { id: 'cloud', label: isTr ? '☁️ Kişisel Bulut' : '☁️ Cloud & Nextcloud' },
            { id: 'media', label: isTr ? '🎬 Medya & Akış' : '🎬 Media & Streaming' },
            { id: 'game', label: isTr ? '🎮 Minecraft' : '🎮 Minecraft' },
            { id: 'tools', label: isTr ? '🍏 Mac & Araçlar' : '🍏 Mac & Tools' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border',
                activeTab === tab.id
                  ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300 shadow-sm'
                  : 'bg-[#0e111a] border-slate-800 text-slate-400 hover:text-slate-200'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Layout */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8">
        <div className="space-y-8">
          {filteredSections.map((sec) => {
            const Icon = sec.icon;
            return (
              <section
                key={sec.id}
                id={sec.id}
                className="rounded-3xl border border-slate-800/80 bg-[#0e111a] backdrop-blur-sm p-6 sm:p-8 shadow-xl transition-all hover:border-indigo-500/40"
              >
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/30">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-100">{sec.title}</h2>
                  </div>
                  <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full border border-slate-700/80 bg-[#131724] text-slate-300">
                    {sec.badge}
                  </span>
                </div>

                {sec.content}
              </section>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-[#0e111a] to-[#131724] p-8 text-center shadow-2xl">
          <h3 className="text-xl font-bold text-slate-100 mb-2">
            {isTr ? 'Kendi Homelab Mimarini Tasarlamaya Hazır mısın?' : 'Ready to Design Your Own Homelab Architecture?'}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">
            {isTr
              ? 'Sol menüden modülleri tuvale sürükleyin, port çakışmalarını otomatik çözün ve tek komutla sunucunuza kurun.'
              : 'Drag modules from the sidebar onto the canvas, auto-resolve port conflicts, and deploy with one command.'}
          </p>
          <Link
            href="/architect"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 px-7 py-3 text-xs sm:text-sm font-bold text-white hover:brightness-110 transition-all shadow-xl shadow-indigo-500/25 active:scale-95"
          >
            <span>{isTr ? 'Tasarlamaya Başla →' : 'Start Building →'}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#08090e] py-8 px-4 sm:px-8 text-xs text-slate-500 text-center">
        <p>
          {isTr
            ? 'XIVIZLEY OS © 2026 — Açık Kaynak Homelab & Sunucu Mimarı Platformu • https://xivizley.com.tr'
            : 'XIVIZLEY OS © 2026 — Open Source Homelab & Server Architect Platform • https://xivizley.com.tr'}
        </p>
      </footer>
    </div>
  );
}
