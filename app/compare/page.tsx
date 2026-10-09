// ============================================================
// XIVIZLEY — Comprehensive Platform Comparison (/compare)
// XIVIZLEY vs Coolify vs Portainer vs CasaOS
// DIN 40719 Engineering Spec & Obsidian Violet Design System
// ============================================================

import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { Navbar } from '@/components/shared/Navbar';
import {
  Sparkles,
  ArrowRight,
  Check,
  X,
  Minus,
  Layers,
  HardDrive,
  GitBranch,
  Server,
  Boxes,
  HelpCircle,
  ExternalLink,
  Globe,
} from 'lucide-react';

import { PLATFORM_STATS } from '@/lib/constants/stats';

export const metadata: Metadata = {
  title: 'XIVIZLEY vs Coolify vs Portainer vs CasaOS Karşılaştırması',
  description: `${PLATFORM_STATS.taglineTr} Coolify, Portainer ve CasaOS ile kapsamlı özellik matrisi ve seçim rehberi.`,
  openGraph: {
    title: 'XIVIZLEY vs Coolify vs Portainer vs CasaOS Karşılaştırması',
    description: PLATFORM_STATS.taglineTr,
    url: 'https://xivizley.com.tr/compare',
    siteName: 'XIVIZLEY',
    type: 'website',
    images: [
      {
        url: 'https://xivizley.com.tr/api/og',
        width: 1200,
        height: 630,
        alt: 'XIVIZLEY vs Coolify vs Portainer vs CasaOS Karşılaştırması',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'XIVIZLEY vs Coolify vs Portainer vs CasaOS Karşılaştırması',
    description: PLATFORM_STATS.taglineTr,
    creator: '@xivizley',
    images: ['https://xivizley.com.tr/api/og'],
  },
  alternates: {
    canonical: 'https://xivizley.com.tr/compare',
  },
};

interface ComparisonRow {
  feature: string;
  description: string;
  xivizley: string | boolean;
  xivizleyBadge?: string;
  coolify: string | boolean;
  portainer: string | boolean;
  casaos: string | boolean;
}

const COMPARISON_SECTIONS: {
  title: string;
  category: string;
  rows: ComparisonRow[];
}[] = [
  {
    title: 'Mimari & Görsel Tasarım Deneyimi',
    category: 'MİMARİ TASARIM',
    rows: [
      {
        feature: 'Görsel Sürükle-Bırak Tuvali',
        description: 'React Flow tabanlı interaktif düğümler ve yönlü bağlantı kenarları ile altyapı tasarımı.',
        xivizley: 'Evet (115 Modül, React Flow)',
        xivizleyBadge: 'Dahili Görsel Tuval',
        coolify: 'Hayır (Form ve Dashboard)',
        portainer: 'Hayır (Form ve Liste)',
        casaos: 'Hayır (Uygulama Mağazası Kartları)',
      },
      {
        feature: 'Deterministik Port Çakışma Motoru',
        description: 'Host port çakışmalarını (80, 443, 53 vb.) tasarım aşamasında anında yakalar ve boş port önerir.',
        xivizley: 'Evet (Otomatik Alternatif Port Önerisi)',
        xivizleyBadge: 'Akıllı Çözüm',
        coolify: 'Kısmi (Dağıtım esnasında hata verir)',
        portainer: 'Hayır (Kullanıcı manuel çözmeli)',
        casaos: 'Kısmi (Port girişi uyarısı)',
      },
      {
        feature: 'DIN 40719 Mühendislik Paftası Çıktısı',
        description: 'Endüstri standardında vektörel PDF ve yazdırılabilir CAD mimari şeması oluşturma.',
        xivizley: 'Evet (Tek Tık Vektörel PDF)',
        xivizleyBadge: 'DIN 40719 Standardı',
        coolify: 'Hayır',
        portainer: 'Hayır',
        casaos: 'Hayır',
      },
      {
        feature: 'Çift Yönlü YAML İçe / Dışa Aktarma',
        description: 'Mevcut docker-compose.yml dosyasını görselleştirebilme ve tuvali Compose YAML olarak indirebilme.',
        xivizley: 'Evet (Görselleştirme + Temiz YAML)',
        coolify: 'Kısmi (YAML editörü var, görsel yok)',
        portainer: 'Kısmi (YAML Stack düzenleme)',
        casaos: 'Kısmi (Custom App YAML)',
      },
    ],
  },
  {
    title: 'Sunucu & Kaynak Tüketimi',
    category: 'SUNUCU & PERFORMANS',
    rows: [
      {
        feature: 'Sunucu Kaynak Ayak İzi (RAM/CPU)',
        description: 'Aracın hedef sunucuda tükettiği sabit arka plan işlemci ve bellek miktarı.',
        xivizley: '0 MB (Tamamen İstemci Taraflı)',
        xivizleyBadge: 'Sıfır Sunucu Yükü',
        coolify: '~500 MB - 1 GB RAM (Daemon + DB)',
        portainer: '~150 - 300 MB RAM (Ajan + Server)',
        casaos: '~200 - 400 MB RAM (Go daemon)',
      },
      {
        feature: 'Sunucuya Kurulum Zorunluluğu',
        description: 'Kullanmak için VDS sunucunuza kalıcı yönetim yazılımı kurmanız gerekir mi?',
        xivizley: 'Gerektirmez (Doğrudan Tarayıcıdan)',
        xivizleyBadge: 'Sıfır Kurulum',
        coolify: 'Evet (curl ile tam daemon kurulumu)',
        portainer: 'Evet (Docker container olarak çalışır)',
        casaos: 'Evet (İşletim sistemi üzerine kurulur)',
      },
      {
        feature: '1-Tıkla Akıllı VDS Dağıtımı',
        description: 'Üretilen altyapıyı tek satırlık SSH komutuyla Linux sunucunuza kurabilme.',
        xivizley: 'Evet (curl -sSL .../os | bash)',
        xivizleyBadge: 'SSH Tek Komut',
        coolify: 'Git Push veya Dashboard Dağıtımı',
        portainer: 'Web Arayüzünden Stack Deploy',
        casaos: 'App Store Tıklamasıyla Kurulum',
      },
      {
        feature: 'Felaket Kurtarma & Otomatik Yedekleme',
        description: 'Tüm PostgreSQL, MySQL, MariaDB ve SQLite hacimleri için otomatik backup.sh / restore.sh üretimi.',
        xivizley: 'Evet (Otomatik DR Script Üretimi)',
        coolify: 'Dahili Veritabanı Yedekleme Paneli',
        portainer: 'Manuel Volume Yedekleme',
        casaos: 'Basit Dosya Yedekleme',
      },
    ],
  },
  {
    title: 'Gelişmiş Teşhis & OpsCenter v1.1 Araçları',
    category: 'OPSCENTER v1.1',
    rows: [
      {
        feature: 'OpsCenter v1.1 Web Terminal',
        description: 'Tarayıcı üzerinden sunucu ve konteyner konsoluna sıfır bağımlılıkla bağlanma.',
        xivizley: 'Evet (Entegre Web Terminal)',
        coolify: 'Evet (Dahili Web Konsolu)',
        portainer: 'Evet (Konteyner Exec Konsolu)',
        casaos: 'Evet (Basit Web Terminal)',
      },
      {
        feature: 'AI Crash Doctor (Akıllı Hata Teşhisi)',
        description: 'CrashLoop, OOM Kill, izin ve ağ hatalarını yapay zeka ile otomatik teşhis edip çözüm sunma.',
        xivizley: 'Evet (AI Destekli Log Analizi)',
        xivizleyBadge: 'Yapay Zeka Destekli',
        coolify: 'Hayır (Ham logları gösterir)',
        portainer: 'Hayır (Ham logları gösterir)',
        casaos: 'Hayır (Ham logları gösterir)',
      },
      {
        feature: 'Canlı Ağ Topolojisi Haritası',
        description: 'Docker bridge, macvlan ve overlay ağlarını, IP kiralarını ve trafik akışını görsel haritalandırma.',
        xivizley: 'Evet (Canlı Ağ Topoloji Grafiği)',
        coolify: 'Hayır',
        portainer: 'Kısmi (Ağ ve IP listesi)',
        casaos: 'Hayır',
      },
      {
        feature: 'SSL Radar (Sertifika & Yönlendirme İzleme)',
        description: 'Let\'s Encrypt kalan gün süreleri, SSL yenileme durumu ve ters proxy sağlığı denetimi.',
        xivizley: 'Evet (Dahili SSL Radar)',
        coolify: 'Otomatik Traefik/Caddy (İzleme paneli sınırlı)',
        portainer: 'Harici Nginx/Traefik gerektirir',
        casaos: 'Kısmi',
      },
    ],
  },
  {
    title: 'Lisans, Güvenlik & Gizlilik',
    category: 'LİSANS & GİZLİLİK',
    rows: [
      {
        feature: 'Lisans & Maliyet',
        description: 'Yazılımın kullanım koşulları, fiyatı ve lisans tipi.',
        xivizley: '%100 Ücretsiz & MIT Lisanslı',
        xivizleyBadge: 'Tamamen Açık Kaynak',
        coolify: 'Açık Kaynak (Bulut Sürümü Ücretli)',
        portainer: 'Freemium (İşletme Sürümü Ücretli)',
        casaos: '%100 Açık Kaynak (Apache 2.0)',
      },
      {
        feature: 'Veri Gizliliği & Veri Tabanı Kaydı',
        description: 'Tasarladığınız mimari, ortam değişkenleri ve API şifreleri nerede depolanır?',
        xivizley: 'Sadece Tarayıcı Belleğinde (%100 Client-Side)',
        xivizleyBadge: 'Sıfır İzleme / Gizlilik',
        coolify: 'Sunucudaki PostgreSQL Veritabanında',
        portainer: 'Portainer Veritabanında',
        casaos: 'Sunucu Yerel Konfigürasyonunda',
      },
      {
        feature: 'Hedef Kitle & İdeal Kullanım',
        description: 'Platformun en yüksek verim sağladığı kullanıcı profili.',
        xivizley: 'Homelab, VDS Sahipleri, DevOps & Sysadmin',
        coolify: 'Full-Stack Geliştiriciler & PaaS Arayanlar',
        portainer: 'Çoklu Konteyner & Cluster Yöneticileri',
        casaos: 'Ev Kullanıcıları & Basit Medya Sunucuları',
      },
    ],
  },
];

const FAQ_ITEMS = [
  {
    question: 'XIVIZLEY nedir ve Coolify veya Portainer\'dan temel farkı nedir?',
    answer:
      `${PLATFORM_STATS.taglineTr} Coolify bir PaaS (Heroku alternatifi), Portainer ise çalışan konteynerleri denetleyen bir yönetim panelidir. XIVIZLEY sunucunuzda hiçbir arka plan kaynağı (0 MB RAM) tüketmez; mimarinizi tarayıcınızda tasarlar, port çakışmalarını önceden çözer, DIN 40719 paftasını üretir ve doğrudan VDS'inize temiz Docker Compose mimarisi olarak kurar.`,
  },
  {
    question: 'Port çakışması (Port Conflict) nedir ve XIVIZLEY bunu nasıl engeller?',
    answer:
      'Birden fazla Docker servisi aynı host portunu (örneğin port 80 veya port 443) dinlemeye çalıştığında Docker başlatma hatası verir. XIVIZLEY, tuvale sürüklediğiniz servislerin kullandığı portları anlık olarak tarar. İki servis çakıştığında tuvalde kırmızı uyarı verir ve çakışan servis için boş bir alternatif port (örneğin 80 ➔ 8080) önererek çakışmayı tek tıkla çözer.',
  },
  {
    question: 'DIN 40719 mühendislik paftası nedir ve nerede kullanılır?',
    answer:
      'DIN 40719, endüstriyel sistemlerin ve elektrik/ağ şemalarının dokümantasyonu için uluslararası kabul görmüş bir mühendislik standardıdır. XIVIZLEY, çizdiğiniz sunucu mimarisini donanım ayak izi, port yönlendirme tablosu ve revizyon geçmişi içeren profesyonel bir vektörel PDF paftasına dönüştürür. Bu pafta kurumsal dokümantasyon, denetimler ve arşivleme için idealdir.',
  },
  {
    question: 'XIVIZLEY sunucuma kurulmak zorunda mı, ek kaynak tüketir mi?',
    answer:
      'Hayır. XIVIZLEY\'de mimari tasarımı ve YAML önizlemesi tarayıcınızda yerel bellekte gerçekleşir; tek tıkla kurulum betiği ise durumsuz (stateless) bir API üzerinden standart bash ve Compose çıktısı üretir. Sunucunuzda Portainer veya Coolify gibi arka planda sürekli 200MB - 1GB RAM tüketen herhangi bir daemon veya ajan çalıştırmazsınız.',
  },
  {
    question: 'AI Crash Doctor ve OpsCenter v1.1 Web Terminal ne işe yarar?',
    answer:
      'OpsCenter v1.1, kurduğunuz altyapıyı yönetmenizi sağlayan hafif bir araç setidir. Entegre Web Terminal ile tarayıcıdan sunucunuza bağlanabilirsiniz. AI Crash Doctor ise çöken konteynerlerin loglarını yapay zeka ile analiz eder; çökmenin yetersiz RAM\'den mi, port çakışmasından mı yoksa izin hatasından mı kaynaklandığını anında tespit edip tek tıkla onarım komutları sunar.',
  },
  {
    question: 'Coolify, Portainer veya CasaOS kullanırken de XIVIZLEY kullanabilir miyim?',
    answer:
      'Evet, tam uyumludur. XIVIZLEY çift yönlü YAML içe ve dışa aktarımını destekler. XIVIZLEY tuvalinde tasarlayıp port çakışmalarını çözdüğünüz temiz docker-compose.yml dosyasını Coolify Stack, Portainer Stack veya CasaOS Custom App içerisine doğrudan yapıştırabilir ya da tersine mevcut Compose dosyalarınızı XIVIZLEY\'e aktarıp görselleştirebilirsiniz.',
  },
  {
    question: 'XIVIZLEY tamamen ücretsiz ve açık kaynak mı?',
    answer:
      'Evet, XIVIZLEY %100 ücretsizdir ve MIT lisansı ile lisanslanmıştır. Kaynak kodları GitHub üzerinde herkese açıktır. Gizli abonelik ücreti, üyelik zorunluluğu veya kilitli özellikler bulunmaz.',
  },
];

export default function ComparePage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  const tableSchema = {
    '@context': 'https://schema.org',
    '@type': 'Table',
    name: 'XIVIZLEY vs Coolify vs Portainer vs CasaOS Karşılaştırma Matrisi',
    about: 'Self-Hosted ve Docker Altyapı Yönetim Araçları Karşılaştırması',
    description: `${PLATFORM_STATS.taglineTr} Coolify, Portainer ve CasaOS mimari ve kaynak tüketimi karşılaştırma matrisi.`,
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Ana Sayfa',
        item: 'https://xivizley.com.tr',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Karşılaştırma',
        item: 'https://xivizley.com.tr/compare',
      },
    ],
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#090514] text-[#F5F3FF] selection:bg-[#8B5CF6]/30 selection:text-[#F5F3FF]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(tableSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        {/* Header Section */}
        <section className="text-center mb-16 md:mb-24">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-mono font-medium text-violet-300 mb-6 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-violet-400" />
            <span>DIN 40719 SPEC // ALTYAPI KARŞILAŞTIRMA MATRİSİ</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight mb-6">
            <span className="block text-white">XIVIZLEY vs Coolify vs Portainer vs CasaOS</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-400">
              Self-Host ve Docker Araçları Karşılaştırması
            </span>
          </h1>

          <p className="mx-auto max-w-3xl text-base sm:text-lg text-[#A19BAF] leading-relaxed mb-8">
            <strong className="text-white font-medium">XIVIZLEY</strong>, 115 Docker servisini görsel tuvalde
            sürükle-bırak bağlayıp tek SSH komutuyla VDS&apos;e kuran, ücretsiz ve MIT lisanslı self-host
            mimarlık aracıdır. Hangi aracın projenize en uygun olduğunu belirlemek için aşağıdaki kapsamlı
            mühendislik matrisini inceleyin.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-mono">
            <Link
              href="/architect"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 font-semibold text-white shadow-lg shadow-violet-600/25 hover:from-violet-500 hover:to-indigo-500 transition-all active:scale-95"
            >
              <span>Görsel Tuvali Aç</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/templates"
              className="inline-flex items-center gap-2 rounded-xl border border-[#2B1A42] bg-[#0E091E] px-6 py-3 font-medium text-violet-200 hover:border-violet-500/40 hover:bg-[#150D2E] transition-all"
            >
              <Boxes className="h-4 w-4 text-violet-400" />
              <span>31+ Hazır Şablon</span>
            </Link>
            <a
              href="https://forum.xivizley.com.tr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-[#2B1A42] bg-[#0E091E] px-6 py-3 font-medium text-violet-200 hover:border-violet-500/40 hover:bg-[#150D2E] transition-all"
            >
              <Globe className="h-4 w-4 text-cyan-400" />
              <span>Topluluk Forumu</span>
              <ExternalLink className="h-3 w-3 opacity-60" />
            </a>
          </div>
        </section>

        {/* Quick Highlights Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="rounded-2xl border-2 border-violet-500/50 bg-gradient-to-b from-violet-950/30 to-[#0e091e] p-6 relative overflow-hidden shadow-xl shadow-violet-900/10">
            <div className="absolute top-3 right-3">
              <span className="rounded-md bg-violet-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-violet-300 border border-violet-500/40">
                ÖNERİLEN
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
              XIVIZLEY
            </h2>
            <p className="text-xs font-mono text-violet-300 mb-3">Görsel Mimarlık & 1-Click VDS</p>
            <p className="text-xs text-[#A19BAF] leading-relaxed">
              Sürükle-bırak tuval, deterministik port çakışma motoru, DIN 40719 vektörel paftası ve sıfır sunucu yükü (0 MB RAM).
            </p>
          </div>

          <div className="rounded-2xl border border-[#2B1A42] bg-[#0e091e] p-6">
            <h2 className="text-xl font-bold text-white mb-2">Coolify</h2>
            <p className="text-xs font-mono text-slate-400 mb-3">Self-Hosted PaaS</p>
            <p className="text-xs text-[#A19BAF] leading-relaxed">
              Kendi sunucunuzda Heroku/Render benzeri Git entegrasyonlu uygulama ve veritabanı yayınlama platformu.
            </p>
          </div>

          <div className="rounded-2xl border border-[#2B1A42] bg-[#0e091e] p-6">
            <h2 className="text-xl font-bold text-white mb-2">Portainer</h2>
            <p className="text-xs font-mono text-slate-400 mb-3">Konteyner Yönetim Paneli</p>
            <p className="text-xs text-[#A19BAF] leading-relaxed">
              Docker ve Kubernetes ortamları için çalışan konteynerleri denetleyen, log ve metrikleri gösteren web arayüzü.
            </p>
          </div>

          <div className="rounded-2xl border border-[#2B1A42] bg-[#0e091e] p-6">
            <h2 className="text-xl font-bold text-white mb-2">CasaOS</h2>
            <p className="text-xs font-mono text-slate-400 mb-3">Homelab Başlangıç Arayüzü</p>
            <p className="text-xs text-[#A19BAF] leading-relaxed">
              Ev sunucuları ve NAS cihazları için tek tıkla uygulama kurmaya yarayan şık ve basit masaüstü tarzı gösterge paneli.
            </p>
          </div>
        </section>

        {/* Detailed Comparison Table */}
        <section className="mb-20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Detaylı Özellik Karşılaştırma Matrisi</h2>
              <p className="text-xs font-mono text-[#A19BAF] mt-1">
                DIN 40719 STANDARTLARI DOĞRULANMIŞTIR // SÜRÜM 4.2
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-violet-300">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
              <span>Canlı Karşılaştırma Tablosu</span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#2B1A42] bg-[#0b0717]">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-[#2B1A42] bg-[#120a22]/80 font-mono text-xs uppercase tracking-wider text-violet-200">
                  <th scope="col" className="p-4 sm:p-5 w-2/5 min-w-[260px]">
                    Özellik & Fonksiyon
                  </th>
                  <th
                    scope="col"
                    className="p-4 sm:p-5 w-1/5 min-w-[200px] bg-violet-950/40 border-x border-violet-500/30 text-violet-200 font-bold"
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-violet-400" />
                      <span>XIVIZLEY</span>
                    </div>
                  </th>
                  <th scope="col" className="p-4 sm:p-5 w-1/5 min-w-[170px] text-slate-300">
                    Coolify
                  </th>
                  <th scope="col" className="p-4 sm:p-5 w-1/5 min-w-[170px] text-slate-300">
                    Portainer
                  </th>
                  <th scope="col" className="p-4 sm:p-5 w-1/5 min-w-[170px] text-slate-300">
                    CasaOS
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_SECTIONS.map((section) => (
                  <React.Fragment key={section.category}>
                    <tr className="border-y border-[#2B1A42] bg-[#180e2f]/50">
                      <td
                        colSpan={5}
                        className="py-3 px-5 font-mono text-xs font-bold uppercase tracking-wider text-violet-300"
                      >
                        {section.category}: {section.title}
                      </td>
                    </tr>
                    {section.rows.map((row, rowIdx) => (
                      <tr
                        key={row.feature}
                        className={`border-b border-[#2B1A42]/60 hover:bg-violet-950/10 transition-colors ${
                          rowIdx % 2 === 1 ? 'bg-[#0e081e]/30' : ''
                        }`}
                      >
                        <td className="p-4 sm:p-5 align-top">
                          <p className="font-semibold text-white">{row.feature}</p>
                          <p className="text-xs text-[#A19BAF] mt-1 leading-relaxed">
                            {row.description}
                          </p>
                        </td>

                        {/* XIVIZLEY Cell */}
                        <td className="p-4 sm:p-5 align-top bg-violet-950/20 border-x border-violet-500/30">
                          <div className="flex items-start gap-2">
                            <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                              <Check className="h-3 w-3" />
                            </span>
                            <div>
                              <span className="font-medium text-white">{String(row.xivizley)}</span>
                              {row.xivizleyBadge && (
                                <span className="block mt-1 inline-block rounded bg-violet-500/20 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-violet-300 border border-violet-500/30">
                                  {row.xivizleyBadge}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Coolify Cell */}
                        <td className="p-4 sm:p-5 align-top text-slate-300">
                          {typeof row.coolify === 'string' &&
                          (row.coolify.startsWith('Hayır') || row.coolify.includes('Hayır')) ? (
                            <div className="flex items-start gap-2 text-rose-300/80">
                              <X className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                              <span>{row.coolify}</span>
                            </div>
                          ) : typeof row.coolify === 'string' && row.coolify.startsWith('Kısmi') ? (
                            <div className="flex items-start gap-2 text-amber-300/80">
                              <Minus className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                              <span>{row.coolify}</span>
                            </div>
                          ) : (
                            <div className="flex items-start gap-2">
                              <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-700/50 text-slate-300">
                                <Check className="h-3 w-3" />
                              </span>
                              <span>{String(row.coolify)}</span>
                            </div>
                          )}
                        </td>

                        {/* Portainer Cell */}
                        <td className="p-4 sm:p-5 align-top text-slate-300">
                          {typeof row.portainer === 'string' &&
                          (row.portainer.startsWith('Hayır') || row.portainer.includes('Hayır')) ? (
                            <div className="flex items-start gap-2 text-rose-300/80">
                              <X className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                              <span>{row.portainer}</span>
                            </div>
                          ) : typeof row.portainer === 'string' && row.portainer.startsWith('Kısmi') ? (
                            <div className="flex items-start gap-2 text-amber-300/80">
                              <Minus className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                              <span>{row.portainer}</span>
                            </div>
                          ) : (
                            <div className="flex items-start gap-2">
                              <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-700/50 text-slate-300">
                                <Check className="h-3 w-3" />
                              </span>
                              <span>{String(row.portainer)}</span>
                            </div>
                          )}
                        </td>

                        {/* CasaOS Cell */}
                        <td className="p-4 sm:p-5 align-top text-slate-300">
                          {typeof row.casaos === 'string' &&
                          (row.casaos.startsWith('Hayır') || row.casaos.includes('Hayır')) ? (
                            <div className="flex items-start gap-2 text-rose-300/80">
                              <X className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                              <span>{row.casaos}</span>
                            </div>
                          ) : typeof row.casaos === 'string' && row.casaos.startsWith('Kısmi') ? (
                            <div className="flex items-start gap-2 text-amber-300/80">
                              <Minus className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                              <span>{row.casaos}</span>
                            </div>
                          ) : (
                            <div className="flex items-start gap-2">
                              <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-700/50 text-slate-300">
                                <Check className="h-3 w-3" />
                              </span>
                              <span>{String(row.casaos)}</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Deep-Dive Architectural Breakdown */}
        <section className="mb-20 space-y-12">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Platform Derinlemesine İnceleme & Kullanım Alanları
            </h2>
            <p className="text-sm text-[#A19BAF]">
              Her platform farklı bir ihtiyaca yanıt vermek üzere tasarlanmıştır. İşte mimari felsefeleri:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* XIVIZLEY Deep Dive */}
            <div className="rounded-2xl border border-violet-500/40 bg-gradient-to-b from-violet-950/20 via-[#0e091e] to-[#090514] p-8 relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20 text-violet-300 border border-violet-500/40">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">1. XIVIZLEY</h3>
                  <p className="text-xs font-mono text-violet-400">Görsel Docker & Self-Host Mimarı</p>
                </div>
              </div>
              <p className="text-sm text-[#A19BAF] leading-relaxed mb-4">
                XIVIZLEY, altyapı hazırlık aşamasındaki tüm karmaşıklığı ortadan kaldırır. 115 Docker servisini
                birbiriyle bağlayıp (örneğin Nextcloud ➔ PostgreSQL ➔ Redis ➔ Nginx Proxy Manager) port çakışmalarını
                ve ağ bağımlılıklarını önceden test etmenizi sağlar. Sunucunuzda hiçbir arka plan servisi çalıştırmaz;
                üretime hazır standart Docker Compose ve tek tıkla VDS dağıtım betiği sunar.
              </p>
              <ul className="text-xs space-y-2 text-slate-300 font-mono">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-violet-400 shrink-0" />
                  <span>React Flow tabanlı interaktif görsel tuval</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-violet-400 shrink-0" />
                  <span>DIN 40719 standartlarında vektörel PDF CAD çıktısı</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-violet-400 shrink-0" />
                  <span>OpsCenter v1.1 Web Terminal, AI Crash Doctor & SSL Radar</span>
                </li>
              </ul>
            </div>

            {/* Coolify Deep Dive */}
            <div className="rounded-2xl border border-[#2B1A42] bg-[#0e091e] p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  <GitBranch className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">2. Coolify</h3>
                  <p className="text-xs font-mono text-indigo-400">Self-Hosted PaaS Motoru</p>
                </div>
              </div>
              <p className="text-sm text-[#A19BAF] leading-relaxed mb-4">
                Coolify, Heroku veya Render benzeri bir PaaS arayan geliştiriciler için mükemmeldir. GitHub
                depolarınızı bağlayarak push ettiğiniz kodları otomatik olarak sunucunuzda derleyip yayınlar.
                Ancak sunucuda sürekli çalışan PostgreSQL ve daemon servisleri nedeniyle 500MB+ RAM tüketir ve
                görsel bir düğüm tuvali sunmaz.
              </p>
              <ul className="text-xs space-y-2 text-slate-300 font-mono">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                  <span>Git webhookları ile sürekli dağıtım (CI/CD)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                  <span>Traefik ile otomatik SSL sertifikasyonu</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                  <span>XIVIZLEY&apos;de tasarlanan Compose YAML&apos;ları destekler</span>
                </li>
              </ul>
            </div>

            {/* Portainer Deep Dive */}
            <div className="rounded-2xl border border-[#2B1A42] bg-[#0e091e] p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  <Server className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">3. Portainer</h3>
                  <p className="text-xs font-mono text-cyan-400">Konteyner Yönetim Paneli</p>
                </div>
              </div>
              <p className="text-sm text-[#A19BAF] leading-relaxed mb-4">
                Portainer, Linux sunucusunda halihazırda çalışan Docker konteynerlerini web üzerinden izlemek,
                duraklatmak, yeniden başlatmak ve günlük loglarını incelemek isteyen sysadminlerin vazgeçilmezidir.
                Yeni bir mimari tasarlarken görsel sürükle-bırak tuvali ya da port çakışması çözüm motoru sunmaz.
              </p>
              <ul className="text-xs space-y-2 text-slate-300 font-mono">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                  <span>Çalışan konteynerler için detaylı sağlık paneli</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                  <span>Docker Swarm ve Kubernetes desteği</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                  <span>Kullanıcı yetkilendirme ve rol yönetimi (RBAC)</span>
                </li>
              </ul>
            </div>

            {/* CasaOS Deep Dive */}
            <div className="rounded-2xl border border-[#2B1A42] bg-[#0e091e] p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <HardDrive className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">4. CasaOS</h3>
                  <p className="text-xs font-mono text-emerald-400">Ev Homelab & NAS Başlangıcı</p>
                </div>
              </div>
              <p className="text-sm text-[#A19BAF] leading-relaxed mb-4">
                CasaOS, teknik bilgisi az olan ev kullanıcıları ve hobi amaçlı homelab kuranlar için tasarlanmıştır.
                Tek tıkla Jellyfin, Plex, Transmission veya qBittorrent gibi uygulamaları indirip kullanmanızı sağlar.
                Ancak karmaşık çok servisli ağ mimarileri ve kurumsal VDS dağıtımları için sınırlıdır.
              </p>
              <ul className="text-xs space-y-2 text-slate-300 font-mono">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>Kişisel bulut ve şık masaüstü arayüzü</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>App Store üzerinden tek tıkla yükleme</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>Depolama sürücülerini kolay görüntüleme</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Decision Guide / Which tool should you choose? */}
        <section className="mb-20 rounded-3xl border border-[#2B1A42] bg-gradient-to-br from-[#120a22] to-[#090514] p-8 sm:p-12">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Hangi Aracı Ne Zaman Tercih Etmelisiniz?
            </h2>
            <p className="text-xs sm:text-sm text-[#A19BAF]">
              İhtiyaçlarınıza göre en doğru homelab ve Docker aracı kombinasyonunu seçin:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="rounded-xl border border-violet-500/30 bg-violet-950/20 p-5">
              <h3 className="font-bold text-violet-300 mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span>XIVIZLEY Tercih Edin Eğer:</span>
              </h3>
              <p className="text-xs text-[#A19BAF] leading-relaxed">
                VDS veya sunucunuzun RAM&apos;ini boşa harcamadan (0 MB ek yük) 115 popüler servisi görsel olarak
                birbirine bağlamak, port çakışmalarını önceden görüp çözmek ve tek bir SSH komutuyla tertemiz bir
                altyapı ayağa kaldırmak istiyorsanız.
              </p>
            </div>

            <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-5">
              <h3 className="font-bold text-indigo-300 mb-2 flex items-center gap-2">
                <GitBranch className="h-4 w-4" />
                <span>Coolify Tercih Edin Eğer:</span>
              </h3>
              <p className="text-xs text-[#A19BAF] leading-relaxed">
                Kendi yazdığınız web uygulamalarını (Next.js, Python, Go, Laravel) GitHub deponuzdan her commit
                ettiğinizde otomatik derleyip yayınlayacak bir PaaS ortamına ihtiyacınız varsa.
              </p>
            </div>

            <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-5">
              <h3 className="font-bold text-cyan-300 mb-2 flex items-center gap-2">
                <Server className="h-4 w-4" />
                <span>Portainer Tercih Edin Eğer:</span>
              </h3>
              <p className="text-xs text-[#A19BAF] leading-relaxed">
                Sunucunuzda hâlihazırda onlarca konteyner çalışıyorsa ve bunları görsel bir web panelinden yeniden
                başlatmak, logları kontrol etmek veya kaynak kullanımını izlemek istiyorsanız.
              </p>
            </div>

            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-5">
              <h3 className="font-bold text-emerald-300 mb-2 flex items-center gap-2">
                <HardDrive className="h-4 w-4" />
                <span>CasaOS Tercih Edin Eğer:</span>
              </h3>
              <p className="text-xs text-[#A19BAF] leading-relaxed">
                Evdeki eski bilgisayarınızı veya Raspberry Pi cihazınızı aile üyelerinin de kullanabileceği basit
                bir kişisel bulut ve medya oynatıcı haline getirmek istiyorsanız.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3.5 py-1 text-xs font-mono text-violet-300 mb-3">
              <HelpCircle className="h-3.5 w-3.5 text-violet-400" />
              <span>SIKÇA SORULAN SORULAR</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Merak Edilen Sorular & Cevaplar
            </h2>
            <p className="text-xs sm:text-sm text-[#A19BAF]">
              Search engine ve AI botlarının doğrudan indeksleyebildiği doğrulanmış teknik yanıtlar:
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            {FAQ_ITEMS.map((item, idx) => (
              <details
                key={idx}
                className="group rounded-2xl border border-[#2B1A42] bg-[#0e091e] p-5 sm:p-6 transition-all hover:border-violet-500/40 open:border-violet-500/60 open:bg-[#120a24]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between text-base font-semibold text-white">
                  <span>{item.question}</span>
                  <span className="ml-4 shrink-0 font-mono text-violet-400 group-open:rotate-45 transition-transform duration-200">
                    +
                  </span>
                </summary>
                <p className="mt-4 text-xs sm:text-sm text-[#A19BAF] leading-relaxed pt-2 border-t border-[#2B1A42]/60">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA Bottom Banner */}
        <section className="rounded-3xl border-2 border-violet-500/40 bg-gradient-to-r from-violet-950/40 via-[#130b28] to-indigo-950/40 p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.15),transparent_70%)]" />

          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-4">
            Kendi Docker Mimarini Görsel Olarak Çizmeye Başla
          </h2>
          <p className="text-xs sm:text-base text-violet-200/90 max-w-2xl mx-auto mb-8 leading-relaxed font-mono">
            Kayıt olmak veya sunucunuza kalıcı program kurmak zorunda değilsiniz. Tarayıcınızda 115 Docker
            servisini tuvalde bağlayın, tek SSH komutuyla VDS&apos;inize dağıtın.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-mono">
            <Link
              href="/architect"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 px-8 py-4 font-bold text-white shadow-xl shadow-violet-500/25 hover:opacity-95 transition-all active:scale-95"
            >
              <span>Görsel Mimarı Başlat</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/templates"
              className="inline-flex items-center gap-2 rounded-2xl border border-[#2B1A42] bg-[#090514] px-8 py-4 font-medium text-violet-200 hover:border-violet-500/50 hover:bg-[#120a22] transition-all"
            >
              <span>Küratörlü Şablonlar (31+)</span>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#2B1A42] bg-[#090514] py-8 text-center text-xs text-[#A19BAF] font-mono">
        <p>
          © {new Date().getFullYear()} XIVIZLEY — Alperen • Turkey • Açık Kaynak Görsel Homelab & Sunucu Mimarı
        </p>
      </footer>
    </div>
  );
}
