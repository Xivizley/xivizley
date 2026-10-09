// ============================================================
// XIVIZLEY — Canvas High-Resolution Image Exporter (.PNG)
// lib/utils/exportCanvasImage.ts
// ============================================================

import { toPng } from 'html-to-image';

export async function exportCanvasAsPng(filename = 'xivizley-architecture.png'): Promise<void> {
  const canvasElement = document.querySelector('.react-flow') as HTMLElement | null;
  if (!canvasElement) {
    throw new Error('Canvas öğesi bulunamadı.');
  }

  // Save current transform or style if needed
  const dataUrl = await toPng(canvasElement, {
    backgroundColor: '#08090E',
    pixelRatio: 2, // High-res retina output
    filter: (node: HTMLElement) => {
      // Exclude panel overlays, toast containers, controls if desired
      if (node.classList?.contains('react-flow__controls') || node.classList?.contains('react-flow__attribution')) {
        return false;
      }
      return true;
    },
  });

  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
