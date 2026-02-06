import { allSeoRoutes, SITE_URL } from './seoRoutes';

const DEFAULT_KEY = 'd29b7c2308fd4a8db450332016f35cd1';
const key = process.env.INDEXNOW_KEY || DEFAULT_KEY;
const host = new URL(SITE_URL).host;
const keyLocation = `${SITE_URL}/${key}.txt`;

const urlList = allSeoRoutes.map((route) =>
    route === '/' ? `${SITE_URL}/` : `${SITE_URL}${route}`
);

const payload = {
    host,
    key,
    keyLocation,
    urlList
};

const response = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify(payload)
});

if (!response.ok) {
    const text = await response.text();
    throw new Error(`IndexNow submit failed: ${response.status} ${response.statusText} ${text}`);
}

console.log(`IndexNow submitted ${urlList.length} URLs for ${host}`);
