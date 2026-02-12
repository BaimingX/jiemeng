import path from 'node:path';
import fs from 'node:fs/promises';
import express from 'express';
import puppeteer from 'puppeteer';
import { execFileSync } from 'node:child_process';
import { allSeoRoutes } from './seoRoutes';

const distDir = path.resolve('dist');
const port = 4173;
const canonicalSelector = 'link[rel="canonical"][data-seo="true"]';

const app = express();
app.use(express.static(distDir));
app.use((_req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
});

const server = await new Promise<import('node:http').Server>((resolve) => {
    const srv = app.listen(port, () => resolve(srv));
});

const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
}).catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes('Could not find Chrome')) {
        throw error;
    }

    console.warn('Chrome not found for Puppeteer, attempting to install...');
    const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
    execFileSync(npxCmd, ['puppeteer', 'browsers', 'install', 'chrome'], { stdio: 'inherit' });

    return puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
});

try {
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(60000);

    for (const route of allSeoRoutes) {
        const url = `http://localhost:${port}${route}`;
        console.log(`Prerendering ${url}`);

        await page.goto(url, { waitUntil: 'networkidle0' });
        await page.waitForSelector(canonicalSelector, { timeout: 10000 }).catch(() => {});

        const html = await page.content();
        const routePath = route === '/' ? '' : route.replace(/^\//, '');
        const outputPath = route === '/'
            ? path.join(distDir, 'index.html')
            : path.join(distDir, routePath, 'index.html');

        await fs.mkdir(path.dirname(outputPath), { recursive: true });
        await fs.writeFile(outputPath, html, 'utf8');
    }
} finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
}

console.log(`Prerender complete: ${allSeoRoutes.length} routes`);
