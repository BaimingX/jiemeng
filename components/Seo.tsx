import { useEffect } from 'react';

interface SeoProps {
    title?: string;
    description?: string;
    path?: string;
    image?: string;
    keywords?: string;
    noIndex?: boolean;
    lang?: 'en' | 'zh';
    ogType?: string;
    structuredData?: Record<string, unknown> | Array<Record<string, unknown>>;
}

const BASE_URL = 'https://oneiroai.com';
const DEFAULT_TITLE = 'Oneiro AI | Dream Interpretation & Dream Meaning';
const DEFAULT_DESCRIPTION = 'Oneiro AI is an AI-powered dream interpretation and dream journal app for dream meaning, dream symbols, and lucid dreaming insights.';
const DEFAULT_IMAGE = `${BASE_URL}/og.png`;
const DEFAULT_KEYWORDS = 'dream interpretation, dream meaning, dream dictionary, dream analysis, dream symbols, dream interpretation app, dream journal app, AI dream analyzer, AI dream interpretation, dream interpretation AI, lucid dreaming, recurring dreams, teeth falling out dream meaning, snake dream meaning, dream about my ex';

function normalizePath(path?: string) {
    if (!path) return '/';
    return path.startsWith('/') ? path : `/${path}`;
}

function setMeta(attr: 'name' | 'property', key: string, content: string) {
    const selector = `meta[${attr}="${key}"]`;
    let element = document.head.querySelector(selector) as HTMLMetaElement | null;
    if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, key);
        document.head.appendChild(element);
    }
    element.setAttribute('content', content);
}

function removeSeoLinks() {
    document.head.querySelectorAll('link[data-seo="true"]').forEach((el) => el.remove());
}

function addLink(rel: string, href: string, attrs: Record<string, string> = {}) {
    const link = document.createElement('link');
    link.setAttribute('rel', rel);
    link.setAttribute('href', href);
    Object.entries(attrs).forEach(([key, value]) => link.setAttribute(key, value));
    link.setAttribute('data-seo', 'true');
    document.head.appendChild(link);
}

const Seo: React.FC<SeoProps> = ({
    title,
    description,
    path,
    image,
    keywords,
    noIndex,
    lang,
    ogType,
    structuredData
}) => {
    useEffect(() => {
        const finalTitle = title || DEFAULT_TITLE;
        const finalDescription = description || DEFAULT_DESCRIPTION;
        const finalImage = image || DEFAULT_IMAGE;
        const finalKeywords = keywords || DEFAULT_KEYWORDS;
        const finalPath = normalizePath(path);
        const finalUrl = `${BASE_URL}${finalPath}`;
        const finalOgType = ogType || 'website';

        document.title = finalTitle;
        if (lang) {
            document.documentElement.lang = lang;
        }

        setMeta('name', 'description', finalDescription);
        setMeta('name', 'keywords', finalKeywords);
        setMeta('name', 'robots', noIndex ? 'noindex,nofollow' : 'index,follow');
        setMeta('property', 'og:title', finalTitle);
        setMeta('property', 'og:description', finalDescription);
        setMeta('property', 'og:url', finalUrl);
        setMeta('property', 'og:image', finalImage);
        setMeta('property', 'og:site_name', 'Oneiro AI');
        setMeta('property', 'og:type', finalOgType);
        setMeta('name', 'twitter:title', finalTitle);
        setMeta('name', 'twitter:description', finalDescription);
        setMeta('name', 'twitter:image', finalImage);
        setMeta('name', 'twitter:card', 'summary_large_image');
        if (lang) {
            const ogLocale = lang === 'zh' ? 'zh_CN' : 'en_US';
            setMeta('property', 'og:locale', ogLocale);
        }

        removeSeoLinks();
        addLink('canonical', finalUrl);
        addLink('alternate', finalUrl, { hreflang: 'x-default' });
        addLink('alternate', finalUrl, { hreflang: 'en' });
        addLink('alternate', finalUrl, { hreflang: 'zh' });

        const jsonLd = {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: finalTitle,
            url: finalUrl,
            description: finalDescription,
            inLanguage: lang || 'en',
            isPartOf: {
                '@type': 'WebSite',
                name: 'Oneiro AI',
                url: BASE_URL
            }
        };

        const extraStructured = structuredData
            ? (Array.isArray(structuredData) ? structuredData : [structuredData])
            : [];
        const jsonLdPayload = extraStructured.length > 0 ? [jsonLd, ...extraStructured] : jsonLd;

        let script = document.head.querySelector('#seo-jsonld') as HTMLScriptElement | null;
        if (!script) {
            script = document.createElement('script');
            script.type = 'application/ld+json';
            script.id = 'seo-jsonld';
            document.head.appendChild(script);
        }
        script.textContent = JSON.stringify(jsonLdPayload);
    }, [title, description, path, image, keywords, noIndex, lang, ogType, structuredData]);

    return null;
};

export default Seo;
