import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Layers } from 'lucide-react';
import { Language } from '../types';
import Seo from './Seo';
import { dreamClusterBySlug, getClusterTopics } from '../data/dreamClusters';

interface DreamClusterPageProps {
    language: Language;
}

const DreamClusterPage: React.FC<DreamClusterPageProps> = ({ language }) => {
    const { clusterSlug } = useParams();
    const isZh = language === 'zh';
    const cluster = dreamClusterBySlug(clusterSlug);

    if (!cluster) {
        return (
            <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-[#0B0F19]">
                <Seo
                    title={isZh ? '未找到主题集合' : 'Cluster Not Found'}
                    description={isZh ? '该梦境主题集合暂未提供。' : 'This dream cluster is not available.'}
                    path={`/dream-meaning/cluster/${clusterSlug || ''}`}
                    noIndex={true}
                    lang={language}
                />
                <div className="max-w-3xl mx-auto text-center text-slate-300">
                    <h1 className="text-2xl font-semibold mb-4">
                        {isZh ? '没有找到该主题集合' : 'Cluster not found'}
                    </h1>
                    <Link to="/dream-meaning" className="text-indigo-300 hover:text-indigo-200">
                        {isZh ? '返回梦境词典' : 'Back to dream dictionary'}
                    </Link>
                </div>
            </div>
        );
    }

    const topics = getClusterTopics(cluster.slug);
    const title = isZh
        ? `${cluster.titleZh} | 梦境主题集合 - Oneiro AI`
        : `${cluster.titleEn} | Dream Meaning Cluster - Oneiro AI`;
    const description = isZh ? cluster.descriptionZh : cluster.descriptionEn;
    const baseUrl = 'https://oneiroai.com';
    const path = `/dream-meaning/cluster/${cluster.slug}`;
    const breadcrumbJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: isZh ? '首页' : 'Home',
                item: `${baseUrl}/`
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: isZh ? '梦境含义词典' : 'Dream Meaning Dictionary',
                item: `${baseUrl}/dream-meaning`
            },
            {
                '@type': 'ListItem',
                position: 3,
                name: isZh ? cluster.titleZh : cluster.titleEn,
                item: `${baseUrl}${path}`
            }
        ]
    };

    return (
        <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-[#0B0F19] relative overflow-hidden">
            <Seo
                title={title}
                description={description}
                path={path}
                lang={language}
                structuredData={breadcrumbJsonLd}
            />
            <div className="absolute top-0 left-0 w-full h-[420px] bg-gradient-to-b from-indigo-900/10 to-transparent pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10">
                <Link to="/dream-meaning" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 mb-6">
                    <ArrowLeft className="w-4 h-4" />
                    {isZh ? '返回梦境词典' : 'Back to dream dictionary'}
                </Link>

                <section className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs bg-indigo-500/10 text-indigo-200 border border-indigo-500/20 mb-4">
                        <Layers className="w-3.5 h-3.5" />
                        {isZh ? '主题聚类页' : 'Cluster Page'}
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
                        {isZh ? cluster.titleZh : cluster.titleEn}
                    </h1>
                    <p className="text-slate-300 leading-relaxed">
                        {description}
                    </p>
                    <div className="mt-5 space-y-2 text-sm text-slate-400">
                        {(isZh ? cluster.introZh : cluster.introEn).map((item) => (
                            <p key={item}>{item}</p>
                        ))}
                    </div>
                </section>

                <div className="grid gap-6 md:grid-cols-2 mt-8">
                    <section className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl">
                        <h2 className="text-lg font-semibold text-white mb-3">
                            {isZh ? '高频信号' : 'High-Frequency Signals'}
                        </h2>
                        <ul className="space-y-2 text-sm text-slate-300 list-disc pl-5">
                            {(isZh ? cluster.signalsZh : cluster.signalsEn).map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    </section>

                    <section className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl">
                        <h2 className="text-lg font-semibold text-white mb-3">
                            {isZh ? '一周行动清单' : 'One-Week Recovery Checklist'}
                        </h2>
                        <ul className="space-y-2 text-sm text-slate-300 list-disc pl-5">
                            {(isZh ? cluster.checklistZh : cluster.checklistEn).map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    </section>
                </div>

                <section className="mt-8 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl">
                    <h2 className="text-xl font-semibold text-white mb-2">
                        {isZh ? '推荐阅读词条' : 'Recommended Topic Pages'}
                    </h2>
                    <p className="text-sm text-slate-400 mb-6">
                        {isZh
                            ? '这些词条属于同一主题簇，适合按顺序阅读以建立完整认知。'
                            : 'These pages belong to the same cluster and are designed for sequential reading.'}
                    </p>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {topics.map((topic) => (
                            <Link
                                key={topic.slug}
                                to={`/dream-meaning/${topic.slug}`}
                                className="group rounded-2xl border border-slate-800 bg-slate-950/60 p-4 hover:border-indigo-500/40 transition-colors"
                            >
                                <h3 className="text-sm font-semibold text-white mb-1">
                                    {isZh ? topic.titleZh : topic.titleEn}
                                </h3>
                                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                                    {isZh ? topic.summaryZh : topic.summaryEn}
                                </p>
                            </Link>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default DreamClusterPage;
