import { toPng, toSvg } from 'html-to-image';

export async function exportCanvasAsImage(format: 'png' | 'svg' = 'png', filename = 'xivizley-architecture') {
  const element = document.querySelector('.react-flow__viewport') as HTMLElement;
  if (!element) {
    throw new Error('Canvas viewport öğesi bulunamadı.');
  }

  // Options for high-resolution render
  const options = {
    backgroundColor: '#090d16',
    quality: 0.95,
    pixelRatio: 2, // 2x Retina sharpness
    filter: (node: HTMLElement) => {
      // Exclude controls, minimap, or helper panels from export
      const exclusionClasses = ['react-flow__controls', 'react-flow__minimap', 'react-flow__panel'];
      return !exclusionClasses.some((cls) => node.classList?.contains(cls));
    },
  };

  let dataUrl: string;
  if (format === 'svg') {
    dataUrl = await toSvg(element, options);
  } else {
    dataUrl = await toPng(element, options);
  }

  const link = document.createElement('a');
  link.download = `${filename}.${format}`;
  link.href = dataUrl;
  link.click();
}
