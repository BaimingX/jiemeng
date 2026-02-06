import fs from 'node:fs/promises';
import path from 'node:path';
import { allSeoRoutes, SITE_URL } from './seoRoutes';

type SitemapMeta = {
    changefreq: 'daily' | 'weekly' | 'monthly';
    priority: number;
};

const routeMeta: Record<string, SitemapMeta> = {
    '/': { changefreq: 'weekly', priority: 1.0 },
    '/gallery': { changefreq: 'weekly', priority: 0.8 },
    '/dream-meaning': { changefreq: 'weekly', priority: 0.7 },
    '/markets': { changefreq: 'monthly', priority: 0.6 },
    '/subscribe': { changefreq: 'monthly', priority: 0.6 },
    '/privacy': { changefreq: 'monthly', priority: 0.5 },
    '/terms': { changefreq: 'monthly', priority: 0.5 },
    '/faq': { changefreq: 'monthly', priority: 0.5 },
    '/feedback': { changefreq: 'monthly', priority: 0.5 }
};

const defaultMeta: SitemapMeta = { changefreq: 'monthly', priority: 0.6 };
const marketMeta: SitemapMeta = { changefreq: 'monthly', priority: 0.5 };

const lastmod = new Date().toISOString().slice(0, 10);

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    allSeoRoutes
        .map((route) => {
            const meta = routeMeta[route]
                ?? (route.startsWith('/markets/') ? marketMeta : defaultMeta);
            const loc = route === '/' ? `${SITE_URL}/` : `${SITE_URL}${route}`;
            return `  <url>\n` +
                `    <loc>${loc}</loc>\n` +
                `    <lastmod>${lastmod}</lastmod>\n` +
                `    <changefreq>${meta.changefreq}</changefreq>\n` +
                `    <priority>${meta.priority.toFixed(1)}</priority>\n` +
                `  </url>`;
        })
        .join('\n') +
    `\n</urlset>\n`;

const outputPath = path.resolve('public', 'sitemap.xml');
await fs.writeFile(outputPath, xml, 'utf8');

console.log(`Sitemap generated with ${allSeoRoutes.length} URLs at ${outputPath}`);
