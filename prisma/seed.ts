import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // Create mock user (NextAuth uses OAuth; no password or hash is stored)
  const adminEmail = process.env.ADMIN_SEED_EMAIL || 'admin@xivizley.com.tr';
  const user = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Admin XIVIZLEY',
      bio: 'Server Architect and Homelab Enthusiast.',
      role: 'ADMIN'
    },
  });

  console.log(`User created: ${user.name}`);

  // Create 3 architectures
  const architectures = [
    {
      title: 'Ultimate Media Stack',
      description: 'Plex, Sonarr, Radarr, Overseerr, qBittorrent stack with automated VPN and proxy.',
      canvasJson: JSON.stringify({
        nodes: [],
        edges: [],
        moduleIds: ['plex', 'sonarr', 'radarr', 'qbittorrent', 'nginx-proxy-manager']
      }),
      userId: user.id,
      isPublic: true,
      viewCount: 1520,
    },
    {
      title: 'Oyun ve Topluluk Sunucusu',
      description: 'Minecraft PaperMC (EssentialsX + AuthMe) ve Pterodactyl Panel entegrasyonu.',
      canvasJson: JSON.stringify({
        nodes: [],
        edges: [],
        moduleIds: ['minecraft-papermc', 'pterodactyl', 'nginx-proxy-manager']
      }),
      userId: user.id,
      isPublic: true,
      viewCount: 890,
    },
    {
      title: 'Güvenli Ağ ve Reverse Proxy',
      description: 'Pi-hole, Tailscale ve Nginx Proxy Manager (Cloudflare Tunnels ile) kombinasyonu.',
      canvasJson: JSON.stringify({
        nodes: [],
        edges: [],
        moduleIds: ['pi-hole', 'tailscale', 'nginx-proxy-manager', 'cloudflared']
      }),
      userId: user.id,
      isPublic: true,
      viewCount: 3400,
    }
  ];

  for (const arch of architectures) {
    await prisma.architecture.create({
      data: arch
    });
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
