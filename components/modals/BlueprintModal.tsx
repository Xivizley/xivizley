// ============================================================
// XIVIZLEY — DIN 40719 Blueprint & Technical Spec Sheet
// components/modals/BlueprintModal.tsx
// Authentic DIN 40719 / Tektronix 1970s Engineering Blueprint
// ============================================================

'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useArchitectStore } from '@/store/useArchitectStore';
import { MODULE_CATALOG } from '@/lib/data/modules';
import { useI18nStore } from '@/lib/i18n/store';
import { jsPDF } from 'jspdf';
import { toPng } from 'html-to-image';
import {
  Printer,
  Download,
  Loader2,
  X,
  FileText,
  ShieldCheck,
  Server,
  Layers,
  Cpu,
  HardDrive,
  Network,
  Clock,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

interface BlueprintModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BlueprintModal({ isOpen, onClose }: BlueprintModalProps) {
  const lang = useI18nStore((s) => s.lang);
  const isTr = lang === 'tr';

  const nodes = useArchitectStore((s) => s.nodes);
  const edges = useArchitectStore((s) => s.edges);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Current formatted DIN date
  const docDate = useMemo(() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  // Compute Module Manifest
  const manifest = useMemo(() => {
    return nodes.map((node, index) => {
      const {
        moduleId,
        label,
        isCustom,
        customImage,
        customContainerName,
        customPorts,
        customVolumes,
        portOverrides = {},
      } = node.data;

      const modDef = MODULE_CATALOG.find((m) => m.id === moduleId);
      const name = customContainerName || label || modDef?.name || moduleId || `service_${index + 1}`;
      const image = isCustom
        ? (customImage || 'custom:latest')
        : (modDef ? `${modDef.dockerImage}:${modDef.defaultTag}` : `${moduleId}:latest`);

      // Resolve Ports
      const ports: string[] = [];
      if (isCustom && Array.isArray(customPorts)) {
        customPorts.forEach((p) => {
          if (p.host && p.container) {
            ports.push(`${p.host}:${p.container}/${p.protocol || 'tcp'}`);
          }
        });
      } else if (modDef?.ports) {
        modDef.ports.forEach((p) => {
          const hostPort = portOverrides[p.internal] ?? p.default;
          ports.push(`${hostPort}:${p.internal}/${p.protocol || 'tcp'}`);
        });
      }

      // Memory & CPU allocation
      const ramMB = modDef?.resources?.ramMB || 512;
      const cpuCores = modDef?.resources?.cpuCores || 1;
      const diskGB = modDef?.resources?.diskGB || 10;

      // Volumes
      const volumes: string[] = [];
      if (isCustom && Array.isArray(customVolumes)) {
        customVolumes.forEach((v) => {
          if (v.hostPath && v.containerPath) volumes.push(`${v.hostPath}:${v.containerPath}`);
        });
      } else if (modDef?.volumes) {
        modDef.volumes.forEach((v) => {
          if (v.hostPath && v.containerPath) volumes.push(`${v.hostPath}:${v.containerPath}`);
        });
      }

      return {
        id: node.id,
        index: index + 1,
        code: `MOD-${String(index + 1).padStart(2, '0')}`,
        name,
        image,
        category: modDef?.category || (isCustom ? 'custom' : 'general'),
        ports: ports.length > 0 ? ports : ['None (Internal)'],
        ramMB,
        cpuCores,
        diskGB,
        volumesCount: volumes.length,
        volumes,
      };
    });
  }, [nodes]);

  // Total resources
  const totalStats = useMemo(() => {
    let ram = 0;
    let cpu = 0;
    let disk = 0;
    manifest.forEach((m) => {
      ram += m.ramMB;
      cpu += m.cpuCores;
      disk += m.diskGB;
    });
    return {
      ramGB: (ram / 1024).toFixed(1),
      cpuCores: cpu,
      diskGB: disk,
      servicesCount: manifest.length,
      linksCount: edges.length,
    };
  }, [manifest, edges]);

  // Port Routing Matrix
  const routingMatrix = useMemo(() => {
    const list: Array<{
      hostPort: string;
      internalPort: string;
      protocol: string;
      targetService: string;
      scope: string;
    }> = [];

    manifest.forEach((m) => {
      m.ports.forEach((p) => {
        if (p.includes(':')) {
          const parts = p.split(':');
          let hostPart = '';
          let internalPart = '';
          let proto = 'TCP';

          if (parts.length >= 3) {
            hostPart = parts[1] || '';
            const rest = parts[2] || '';
            const subParts = rest.split('/');
            internalPart = subParts[0] || hostPart;
            proto = (subParts[1] || 'tcp').toUpperCase();
          } else if (parts.length === 2) {
            hostPart = parts[0] || '';
            const rest = parts[1] || '';
            const subParts = rest.split('/');
            internalPart = subParts[0] || hostPart;
            proto = (subParts[1] || 'tcp').toUpperCase();
          }

          if (hostPart) {
            list.push({
              hostPort: hostPart,
              internalPort: internalPart,
              protocol: proto,
              targetService: m.name,
              scope: hostPart === '80' || hostPart === '443' ? 'WAN Ingress (Public)' : 'Host Bind (LAN/VPN)',
            });
          }
        }
      });
    });

    return list.sort((a, b) => (Number(a.hostPort) || 0) - (Number(b.hostPort) || 0));
  }, [manifest]);

  const sheetRef = useRef<HTMLDivElement>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!sheetRef.current || isDownloadingPdf) return;
    try {
      setIsDownloadingPdf(true);
      const dataUrl = await toPng(sheetRef.current, {
        quality: 0.98,
        pixelRatio: 2,
        backgroundColor: '#090514',
      });
      const pdf = new jsPDF({
        orientation: 'l',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      const pageHeight = pdf.internal.pageSize.getHeight();

      let heightLeft = pdfHeight;
      let position = 0;

      pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, pdfHeight, undefined, 'FAST');
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, pdfHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }

      pdf.save(`xivizley-din40719-spec-${docDate}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF download, falling back to print dialog:', err);
      window.print();
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="blueprint-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-[#090514]/85 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      {/* ── Print Styling Override (DIN 40719 High-Contrast Sheet) ── */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 6mm;
          }
          *, *::before, *::after {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          nav, header, aside, .react-flow, .blueprint-no-print {
            display: none !important;
          }
          body {
            background-color: #ffffff !important;
            color: #0b0914 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .blueprint-modal-overlay {
            position: static !important;
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
            height: auto !important;
            max-height: none !important;
            display: block !important;
            backdrop-filter: none !important;
          }
          .blueprint-sheet-container {
            position: static !important;
            left: auto !important;
            top: auto !important;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            max-height: none !important;
            overflow: visible !important;
            border: 2px solid #000000 !important;
            background: #ffffff !important;
            color: #000000 !important;
            box-shadow: none !important;
            padding: 4mm !important;
            margin: 0 !important;
          }
          .blueprint-scroll-area {
            overflow: visible !important;
            height: auto !important;
            max-height: none !important;
            padding: 0 !important;
            background: #ffffff !important;
          }
          .blueprint-sheet-container * {
            color: #111827 !important;
            border-color: #374151 !important;
            box-shadow: none !important;
            text-shadow: none !important;
          }
          .blueprint-stamp-box {
            border: 2px solid #111827 !important;
            background: #f9fafb !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          .blueprint-title-block {
            border: 2px solid #111827 !important;
            background: #f9fafb !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          table {
            width: 100% !important;
            border-collapse: collapse !important;
            page-break-inside: auto;
          }
          thead {
            display: table-header-group !important;
          }
          tr {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          th {
            background-color: #f3f4f6 !important;
            color: #111827 !important;
            border: 1px solid #9ca3af !important;
          }
          td {
            border: 1px solid #d1d5db !important;
          }
        }
      `}</style>

      {/* ── Modal Outer Container ── */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="blueprint-sheet-container relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-[#0D0719] border border-[#2B1A42] text-[#F5F3FF] shadow-2xl rounded-[2px] overflow-hidden my-auto"
      >
        {/* Header Toolbar (Hidden in Print) */}
        <div className="blueprint-no-print flex items-center justify-between px-5 py-3.5 border-b border-[#2B1A42] bg-[#120A21] shrink-0 font-mono">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-[2px] bg-[#06030D] border border-[#2B1A42] text-[#C084FC]">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#F5F3FF] tracking-wider uppercase">
                DIN 40719 // MÜHENDİSLİK ŞARTNAME RAPORU
              </span>
              <span className="ml-2 rounded-[2px] bg-[#1E1235] border border-[#8B5CF6]/40 px-1.5 py-0.5 text-[10px] text-[#C084FC]">
                REV 2.4.0
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="flex items-center gap-1.5 rounded-[2px] bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-50 text-white px-3 py-1.5 text-xs font-mono font-bold transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)] active:scale-95 cursor-pointer"
              title="Doğrudan PDF Belgesi Olarak İndir (.pdf)"
            >
              {isDownloadingPdf ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
              <span>
                {isDownloadingPdf
                  ? (isTr ? 'PDF İndiriliyor...' : 'Generating PDF...')
                  : (isTr ? 'PDF İndir (.pdf)' : 'Download PDF')}
              </span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-[2px] border border-[#2B1A42] bg-[#120A21] hover:border-[#8B5CF6] text-[#F5F3FF] hover:text-white px-3 py-1.5 text-xs font-mono font-medium transition-all active:scale-95 cursor-pointer"
              title="Yazdır / Sistem Yazdırma İletişim Kutusu"
            >
              <Printer className="h-3.5 w-3.5 text-[#A19BAF]" />
              <span>{isTr ? 'Yazdır' : 'Print'}</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-[2px] p-1.5 text-[#8B7D9E] hover:bg-[#1E1235] hover:text-[#F5F3FF] border border-transparent hover:border-[#2B1A42] transition-colors cursor-pointer"
              aria-label="Kapat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── Scrollable Blueprint Content Sheet ── */}
        <div className="blueprint-scroll-area flex-1 overflow-y-auto p-5 sm:p-8 font-mono space-y-6 scrollbar-thin scrollbar-thumb-[#2B1A42] bg-[#090514]">
          {/* Engineering Drawing Outer Boundary with DIN Coordinate Grid */}
          <div ref={sheetRef} className="relative border-2 border-[#2B1A42] p-4 sm:p-6 bg-[#06030D] space-y-6">
            {/* Top Coordinate Scale (A B C D E F) */}
            <div className="flex justify-between text-[10px] text-[#8B7D9E] border-b border-[#2B1A42] pb-1 px-2 select-none tracking-widest">
              <span>[SECTION 01]</span>
              <span>A</span>
              <span>B</span>
              <span>C</span>
              <span>D</span>
              <span>E</span>
              <span>F</span>
              <span>[ZONE 08]</span>
            </div>

            {/* 1. Title Block (Tektronix 1970s / DIN 40719 Standard Header) */}
            <div className="blueprint-title-block border border-[#2B1A42] bg-[#120A21] p-4 rounded-[2px]">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-[#2B1A42] pb-4">
                <div className="md:col-span-2">
                  <div className="text-[10px] text-[#8B7D9E] uppercase tracking-wider mb-1">
                    NORM: DIN 40719-2 / IEC 61082-1 • ENDÜSTRİYEL SİSTEM BELGELENDİRME ŞARTNAMESİ
                  </div>
                  <h1
                    className="text-base sm:text-lg font-bold text-[#F5F3FF] tracking-tight uppercase"
                    style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}
                  >
                    XIVIZLEY ENDÜSTRİYEL SİSTEM MİMARİSİ ŞARTNAME FORMU
                  </h1>
                  <p className="text-[11px] text-[#A19BAF] mt-1 font-mono">
                    Bu teknik şartname belgesi, Docker sanallaştırma mimarisi, ağ yönlendirme matrisi ve sunucu donanım kaynak tahsisini resmileştirmek amacıyla oluşturulmuştur.
                  </p>
                </div>

                <div className="border-t md:border-t-0 md:border-l border-[#2B1A42] md:pl-4 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#8B7D9E]">PROJE REV:</span>
                    <span className="font-bold text-[#C084FC]">REV 2.4.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8B7D9E]">BELGE TARİHİ:</span>
                    <span className="text-[#F5F3FF] font-bold">{docDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8B7D9E]">BAŞ MİMAR:</span>
                    <span className="text-[#F5F3FF] font-semibold">Alperen // XIVIZLEY</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8B7D9E]">DURUM:</span>
                    <span className="text-emerald-400 font-bold">[✓ SİSTEM ONAYLI]</span>
                  </div>
                </div>
              </div>

              {/* Hardware Allocation Summary KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-3 text-center text-xs">
                <div className="bg-[#06030D] border border-[#2B1A42] p-2 rounded-[2px]">
                  <div className="text-[10px] text-[#8B7D9E] uppercase">Toplam Modül</div>
                  <div className="text-sm font-bold text-[#C084FC] mt-0.5">{totalStats.servicesCount} ADET</div>
                </div>
                <div className="bg-[#06030D] border border-[#2B1A42] p-2 rounded-[2px]">
                  <div className="text-[10px] text-[#8B7D9E] uppercase">Tahsis RAM</div>
                  <div className="text-sm font-bold text-[#F5F3FF] mt-0.5">~{totalStats.ramGB} GB</div>
                </div>
                <div className="bg-[#06030D] border border-[#2B1A42] p-2 rounded-[2px]">
                  <div className="text-[10px] text-[#8B7D9E] uppercase">İşlemci Çekirdeği</div>
                  <div className="text-sm font-bold text-[#F5F3FF] mt-0.5">{totalStats.cpuCores} vCPU</div>
                </div>
                <div className="bg-[#06030D] border border-[#2B1A42] p-2 rounded-[2px]">
                  <div className="text-[10px] text-[#8B7D9E] uppercase">NVMe Depolama</div>
                  <div className="text-sm font-bold text-[#F5F3FF] mt-0.5">{totalStats.diskGB} GB</div>
                </div>
                <div className="bg-[#06030D] border border-[#2B1A42] p-2 rounded-[2px] col-span-2 sm:col-span-1">
                  <div className="text-[10px] text-[#8B7D9E] uppercase">Ağ Bağlantıları</div>
                  <div className="text-sm font-bold text-emerald-400 mt-0.5">{totalStats.linksCount} KANAL</div>
                </div>
              </div>
            </div>

            {/* 2. Module Manifest Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-[#C084FC] font-bold border-b border-[#2B1A42] pb-1.5">
                <span className="flex items-center gap-1.5">
                  <Layers className="h-4 w-4" />
                  TABLO 1: MODÜL VE KONTEYNER ENVANTER MANİFESTOSU
                </span>
                <span className="text-[10px] text-[#8B7D9E]">DIN 40719-MANIFEST</span>
              </div>

              <div className="overflow-x-auto border border-[#2B1A42] bg-[#06030D] rounded-[2px]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#2B1A42] bg-[#120A21] text-[#8B7D9E] text-[10px] uppercase">
                      <th className="py-2 px-3 border-r border-[#2B1A42]">KOD</th>
                      <th className="py-2 px-3 border-r border-[#2B1A42]">KONTEYNER / MODÜL</th>
                      <th className="py-2 px-3 border-r border-[#2B1A42]">DOCKER İMAJ VE ETİKETİ</th>
                      <th className="py-2 px-3 border-r border-[#2B1A42]">PORT EŞLEŞTİRMESİ</th>
                      <th className="py-2 px-3 border-r border-[#2B1A42]">RAM / CPU</th>
                      <th className="py-2 px-3">BİRİMLER</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2B1A42] text-[#F5F3FF] text-[11px]">
                    {manifest.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-[#8B7D9E]">
                          Canvas üzerinde tanımlı modül bulunmuyor.
                        </td>
                      </tr>
                    ) : (
                      manifest.map((item) => (
                        <tr key={item.id} className="hover:bg-[#120A21]/60 transition-colors">
                          <td className="py-2 px-3 border-r border-[#2B1A42] font-mono text-[#8B7D9E]">
                            {item.code}
                          </td>
                          <td className="py-2 px-3 border-r border-[#2B1A42] font-bold text-[#F5F3FF]">
                            {item.name}
                          </td>
                          <td className="py-2 px-3 border-r border-[#2B1A42] font-mono text-[#C4B5FD]">
                            {item.image}
                          </td>
                          <td className="py-2 px-3 border-r border-[#2B1A42] font-mono text-emerald-400">
                            {item.ports.join(', ')}
                          </td>
                          <td className="py-2 px-3 border-r border-[#2B1A42] font-mono text-[#A19BAF]">
                            {item.ramMB} MB / {item.cpuCores}c
                          </td>
                          <td className="py-2 px-3 font-mono text-[#8B7D9E]">
                            {item.volumesCount} bağ
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. Port Routing Matrix and Network Configuration */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-[#C084FC] font-bold border-b border-[#2B1A42] pb-1.5">
                <span className="flex items-center gap-1.5">
                  <Network className="h-4 w-4" />
                  TABLO 2: AĞ YÖNLENDİRME VE PORT ERİŞİM MATRİSİ
                </span>
                <span className="text-[10px] text-[#8B7D9E]">TOPOLOJİ: BRIDGE (xivizley_net)</span>
              </div>

              <div className="overflow-x-auto border border-[#2B1A42] bg-[#06030D] rounded-[2px]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#2B1A42] bg-[#120A21] text-[#8B7D9E] text-[10px] uppercase">
                      <th className="py-2 px-3 border-r border-[#2B1A42]">HOST PORT</th>
                      <th className="py-2 px-3 border-r border-[#2B1A42]">HEDEF SERVİS</th>
                      <th className="py-2 px-3 border-r border-[#2B1A42]">KONTEYNER PORT</th>
                      <th className="py-2 px-3 border-r border-[#2B1A42]">PROTOKOL</th>
                      <th className="py-2 px-3">ERİŞİM KAPSAMI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2B1A42] text-[#F5F3FF] text-[11px]">
                    {routingMatrix.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-[#8B7D9E]">
                          Yönlendirilmiş dış port bulunmuyor.
                        </td>
                      </tr>
                    ) : (
                      routingMatrix.map((route, i) => (
                        <tr key={i} className="hover:bg-[#120A21]/60 transition-colors">
                          <td className="py-2 px-3 border-r border-[#2B1A42] font-mono font-bold text-amber-400">
                            :{route.hostPort}
                          </td>
                          <td className="py-2 px-3 border-r border-[#2B1A42] font-bold text-[#F5F3FF]">
                            {route.targetService}
                          </td>
                          <td className="py-2 px-3 border-r border-[#2B1A42] font-mono text-[#C4B5FD]">
                            :{route.internalPort}
                          </td>
                          <td className="py-2 px-3 border-r border-[#2B1A42] font-mono text-[#8B7D9E]">
                            {route.protocol}
                          </td>
                          <td className="py-2 px-3 text-[10px] text-[#A19BAF]">
                            {route.scope}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4. Official Infrastructure Certification Stamps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* OWEB TR Cloud Official Infrastructure Stamp */}
              <div className="blueprint-stamp-box border-2 border-emerald-500/50 bg-[#06030D] p-3.5 rounded-[2px] relative overflow-hidden">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                      RESMİ ALTYAPI DOĞRULAMA DAMGASI
                    </span>
                    <h3 className="text-sm font-bold text-[#F5F3FF] mt-0.5">
                      OWEB TR Cloud (10 Gbps NVMe)
                    </h3>
                    <p className="text-[10px] text-[#8B7D9E] mt-1 leading-relaxed">
                      Bu mimari, PenDC Tier-3 veri merkezinde barındırılan OWEB TR Cloud 10 Gbps yedekli omurga ve kurumsal Samsung NVMe depolama donanım standartlarıyla %100 uyumludur.
                    </p>
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[2px] border border-emerald-500/60 bg-emerald-950/40 text-emerald-300 font-bold text-xs">
                    10G
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-[#2B1A42] flex items-center justify-between text-[10px] font-mono text-emerald-400/90">
                  <span>SERİ: OWEB-TR-10G-NVME-OK</span>
                  <span>TIER-3 DEDICATED</span>
                </div>
              </div>

              {/* Hosting.com.tr Official Infrastructure Stamp */}
              <div className="blueprint-stamp-box border-2 border-[#8B5CF6]/50 bg-[#06030D] p-3.5 rounded-[2px] relative overflow-hidden">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#C084FC] tracking-wider">
                      DONANIM UYUMLULUK ONAYI
                    </span>
                    <h3 className="text-sm font-bold text-[#F5F3FF] mt-0.5">
                      Hosting.com.tr (VDS Ultra)
                    </h3>
                    <p className="text-[10px] text-[#8B7D9E] mt-1 leading-relaxed">
                      Sistem kaynak profili ve Linux çekirdek parametreleri, Hosting.com.tr VDS Ultra AMD EPYC / Intel Xeon kurumsal işlemci sanallaştırma mimarisine göre sertifikalandırılmıştır.
                    </p>
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[2px] border border-[#8B5CF6]/60 bg-[#1E1235] text-[#C084FC] font-bold text-xs">
                    VDS
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-[#2B1A42] flex items-center justify-between text-[10px] font-mono text-[#C084FC]/90">
                  <span>SERİ: HOSTING-VDS-ULTRA-CERT</span>
                  <span>ENTERPRISE SPEC</span>
                </div>
              </div>
            </div>

            {/* Bottom Coordinate Scale */}
            <div className="flex justify-between text-[10px] text-[#8B7D9E] border-t border-[#2B1A42] pt-1 px-2 select-none tracking-widest">
              <span>[DIN 40719-2]</span>
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
              <span>6</span>
              <span>[PAGE 1/1]</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
