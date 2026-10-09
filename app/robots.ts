import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const privateRoutes = ['/api/', '/login', '/durum'];

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: privateRoutes,
      },
      {
        userAgent: [
          'GPTBot',
          'OAI-SearchBot',
          'ChatGPT-User',
          'ClaudeBot',
          'Claude-User',
          'anthropic-ai',
          'PerplexityBot',
          'Google-Extended',
          'Applebot-Extended',
          'CCBot',
          'Bytespider',
          'Amazonbot',
          'DuckAssistBot',
        ],
        allow: ['/', '/llms.txt', '/compare', '/architect', '/templates', '/blog', '/forum', '/guide'],
        disallow: privateRoutes,
      },
    ],
    sitemap: 'https://xivizley.com.tr/sitemap.xml',
  };
}
