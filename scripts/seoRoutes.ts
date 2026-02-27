import { dreamTopics } from '../data/dreamTopics';
import { markets } from '../data/markets';
import { dreamClusters } from '../data/dreamClusters';

export const SITE_URL = 'https://oneiroai.com';

export const indexableStaticRoutes = [
    '/',
    '/gallery',
    '/subscribe',
    '/about',
    '/privacy',
    '/terms',
    '/faq',
    '/dream-interpretation',
    '/dream-meaning'
];

export const dreamMeaningRoutes = dreamTopics.map((topic) => `/dream-meaning/${topic.slug}`);
export const dreamClusterRoutes = dreamClusters.map((cluster) => `/dream-meaning/cluster/${cluster.slug}`);
export const marketRoutes = markets.map((market) => `/markets/${market.slug}`);

export const indexableRoutes = Array.from(new Set([
    ...indexableStaticRoutes,
    ...dreamClusterRoutes,
    ...dreamMeaningRoutes
]));

export const nonIndexableStaticRoutes = [
    '/feedback',
    '/journal',
    '/map',
    '/profile',
    '/auth/callback',
    '/markets'
];

export const nonIndexableRoutes = Array.from(new Set([
    ...nonIndexableStaticRoutes,
    ...marketRoutes
]));

export const allPrerenderRoutes = Array.from(new Set([
    ...indexableRoutes,
    ...nonIndexableRoutes
]));
