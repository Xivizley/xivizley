import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'XIVIZLEY Interactive Architecture Embed',
  description: 'Interactive live Docker & Self-Host architecture canvas embedded with XIVIZLEY.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function EmbedLayout({ children }: { children: React.ReactNode }) {
  return <div className="h-screen w-screen overflow-hidden bg-[#08090e]">{children}</div>;
}
