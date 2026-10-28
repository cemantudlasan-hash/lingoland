import { MetadataRoute } from 'next';
import { getAllBlogPosts } from '@/data/blog-posts';
import { getAllApps } from '@/data/apps-directory';
import { articles } from '@/lib/articles';
import { allGames } from '@/lib/games';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.lingolandverse.com';

  // Static Core Pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/apps`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/games`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/reader`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/language-modules`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    {
      url: `${baseUrl}/editorial-policy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    {
      url: `${baseUrl}/support`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Dynamic Blog Articles
  const blogRoutes: MetadataRoute.Sitemap = getAllBlogPosts().map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.published_date),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  // Dynamic App Landing Pages (All 26 Menus)
  const appRoutes: MetadataRoute.Sitemap = getAllApps().map((app) => ({
    url: `${baseUrl}/apps/${app.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  // Graded ESL Reader Passages
  const allReaderArticles = [
    ...articles.beginner,
    ...articles.intermediate,
    ...articles.advanced,
  ];
  const readerRoutes: MetadataRoute.Sitemap = allReaderArticles.map((article) => ({
    url: `${baseUrl}/reader/${article.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  // All 79+ Interactive Educational Games & Classroom Guides
  const gameRoutes: MetadataRoute.Sitemap = allGames.map((game) => ({
    url: `${baseUrl}/games/${game.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.75,
  }));

  return [...staticRoutes, ...appRoutes, ...blogRoutes, ...readerRoutes, ...gameRoutes];
}
