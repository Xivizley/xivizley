import { MetadataRoute } from 'next';
import { BLOG_POSTS } from '@/lib/data/blog';
import { FORUM_TOPICS } from '@/lib/data/forum';
import { STACK_TEMPLATES } from '@/lib/data/templates';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://xivizley.com.tr';
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/architect`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/compare`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/templates`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/guide`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/feed`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/forum`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/destek`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];

  const templatePages: MetadataRoute.Sitemap = STACK_TEMPLATES.map((tpl) => ({
    url: `${baseUrl}/templates#${tpl.id}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.95,
  }));

  const blogPages: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt || post.publishedAt || now),
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  const forumPages: MetadataRoute.Sitemap = FORUM_TOPICS.map((topic) => ({
    url: `${baseUrl}/forum/topic/${topic.id}`,
    lastModified: new Date(topic.updatedAt || topic.createdAt || now),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticPages, ...templatePages, ...blogPages, ...forumPages];
}
