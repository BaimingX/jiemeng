import fs from 'node:fs/promises';
import path from 'node:path';
import { indexableRoutes, routeLastmod, SITE_URL } from './seoRoutes';

type SitemapMeta = {
    changefreq: 'daily' | 'weekly' | 'monthly';
    priority: number;
};

const routeMeta: Record<string, SitemapMeta> = {
    '/': { changefreq: 'weekly', priority: 1.0 },
    '/gallery': { changefreq: 'weekly', priority: 0.8 },
    '/about': { changefreq: 'monthly', priority: 0.6 },
    '/dream-interpretation': { changefreq: 'weekly', priority: 0.7 },
    '/dream-meaning': { changefreq: 'weekly', priority: 0.7 },
    '/subscribe': { changefreq: 'monthly', priority: 0.6 },
    '/privacy': { changefreq: 'monthly', priority: 0.5 },
    '/terms': { changefreq: 'monthly', priority: 0.5 },
    '/faq': { changefreq: 'monthly', priority: 0.5 }
};

const defaultMeta: SitemapMeta = { changefreq: 'monthly', priority: 0.6 };

const lastmod = new Date().toISOString().slice(0, 10);
const withTrailingSlash = (route: string) => {
    if (route === '/') return '/';
    return `${route.replace(/\/$/, '')}/`;
};

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    indexableRoutes
        .map((route) => {
            const meta = route.startsWith('/dream-meaning/cluster/')
                ? { changefreq: 'weekly', priority: 0.7 as const }
                : (routeMeta[route] ?? defaultMeta);
            const loc = `${SITE_URL}${withTrailingSlash(route)}`;
            const routeDate = routeLastmod[route] ?? lastmod;
            return `  <url>\n` +
                `    <loc>${loc}</loc>\n` +
                `    <lastmod>${routeDate}</lastmod>\n` +
                `    <changefreq>${meta.changefreq}</changefreq>\n` +
                `    <priority>${meta.priority.toFixed(1)}</priority>\n` +
                `  </url>`;
        })
        .join('\n') +
    `\n</urlset>\n`;

const outputPath = path.resolve('public', 'sitemap.xml');
await fs.writeFile(outputPath, xml, 'utf8');

console.log(`Sitemap generated with ${indexableRoutes.length} URLs at ${outputPath}`);
