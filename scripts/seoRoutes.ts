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

/** Per-route lastmod dates derived from content data. */
export const routeLastmod: Record<string, string> = {};
for (const topic of dreamTopics) {
    routeLastmod[`/dream-meaning/${topic.slug}`] = topic.updatedAt;
}
for (const cluster of dreamClusters) {
    // Cluster pages derive their date from latest topic in the cluster
    const clusterTopics = dreamTopics.filter((t) => t.cluster === cluster.slug);
    const latest = clusterTopics.reduce((max, t) => (t.updatedAt > max ? t.updatedAt : max), '');
    if (latest) routeLastmod[`/dream-meaning/cluster/${cluster.slug}`] = latest;
}

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
