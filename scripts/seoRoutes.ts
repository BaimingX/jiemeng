import { dreamTopics } from '../data/dreamTopics';
import { markets } from '../data/markets';

export const SITE_URL = 'https://oneiroai.com';

export const staticRoutes = [
    '/',
    '/gallery',
    '/subscribe',
    '/privacy',
    '/terms',
    '/faq',
    '/dream-meaning',
    '/markets',
    '/feedback'
];

export const dreamMeaningRoutes = dreamTopics.map((topic) => `/dream-meaning/${topic.slug}`);
export const marketRoutes = markets.map((market) => `/markets/${market.slug}`);

export const allSeoRoutes = Array.from(new Set([
    ...staticRoutes,
    ...dreamMeaningRoutes,
    ...marketRoutes
]));
