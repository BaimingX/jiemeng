import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight, Layers } from 'lucide-react';
import { Language } from '../types';
import Seo from './Seo';
import { dreamTopics } from '../data/dreamTopics';
import { dreamClusters } from '../data/dreamClusters';

interface DreamMeaningIndexPageProps {
    language: Language;
}

const DreamMeaningIndexPage: React.FC<DreamMeaningIndexPageProps> = ({ language }) => {
    const isZh = language === 'zh';

    const title = isZh
        ? 'Oneiro AI 梦境含义词典 | 梦境符号与主题集合'
        : 'Dream Meaning Dictionary | Symbols and Topic Clusters - Oneiro AI';
    const description = isZh
        ? '浏览梦境词典与主题集合：焦虑、关系、噩梦、成长。按结构化路径理解梦境。'
        : 'Explore dream meanings by symbol and by cluster: anxiety, relationship, nightmare, and growth patterns.';

    return (
        <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-[#0B0F19] relative overflow-hidden">
            <Seo
                title={title}
                description={description}
                path="/dream-meaning"
                lang={language}
            />
            <div className="absolute top-0 left-0 w-full h-[420px] bg-gradient-to-b from-indigo-900/10 to-transparent pointer-events-none" />
            <div className="absolute top-[10%] left-[6%] w-64 h-64 bg-purple-500/10 rounded-full blur-[110px] pointer-events-none" />
            <div className="absolute bottom-[10%] right-[6%] w-80 h-80 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-4 backdrop-blur-sm">
                        <BookOpen className="w-6 h-6 text-indigo-400" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
                        {isZh ? '梦境含义词典' : 'Dream Meaning Dictionary'}
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        {isZh
                            ? '先按主题集合筛选，再进入单个词条深读，建立长期可复用的梦境解读体系。'
                            : 'Start from cluster pages, then drill into symbol pages to build a practical long-term interpretation workflow.'}
                    </p>
                    <p className="text-sm text-slate-500 mt-3">
                        {isZh
                            ? `${dreamTopics.length} 个词条，按焦虑 / 关系 / 噩梦 / 成长分组。`
                            : `${dreamTopics.length} topics grouped by anxiety, relationship, nightmare, and growth intent.`}
                    </p>
                </div>

                <section className="mb-10">
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <Layers className="w-5 h-5 text-indigo-300" />
                        {isZh ? '主题集合（Cluster Pages）' : 'Cluster Pages'}
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {dreamClusters.map((cluster) => (
                            <Link
                                key={cluster.slug}
                                to={`/dream-meaning/cluster/${cluster.slug}`}
                                className="group bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-5 shadow-2xl hover:border-indigo-500/40 transition-colors"
                            >
                                <h3 className="text-base font-semibold text-white mb-2">
                                    {isZh ? cluster.titleZh : cluster.titleEn}
                                </h3>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    {isZh ? cluster.descriptionZh : cluster.descriptionEn}
                                </p>
                                <div className="mt-3 inline-flex items-center gap-2 text-xs text-indigo-300">
                                    <span>{isZh ? '查看集合' : 'Open cluster'}</span>
                                    <ArrowRight className="w-4 h-4" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-white mb-4">
                        {isZh ? '梦境词条（A-Z）' : 'Symbol Pages (A-Z)'}
                    </h2>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {dreamTopics.map((topic) => (
                            <Link
                                key={topic.slug}
                                to={`/dream-meaning/${topic.slug}`}
                                className="group bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl hover:border-indigo-500/40 transition-colors"
                            >
                                <h3 className="text-lg font-semibold text-white mb-2">
                                    {isZh ? topic.titleZh : topic.titleEn}
                                </h3>
                                <p className="text-sm text-slate-400 leading-relaxed line-clamp-3">
                                    {isZh ? topic.summaryZh : topic.summaryEn}
                                </p>
                                <div className="mt-4 flex items-center gap-2 text-xs text-indigo-300">
                                    <span>{isZh ? '查看解析' : 'View meaning'}</span>
                                    <ArrowRight className="w-4 h-4" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                <section className="mt-10 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl">
                    <h2 className="text-lg font-semibold text-white mb-3">
                        {isZh ? '下一步阅读建议' : 'Suggested Next Reading'}
                    </h2>
                    <p className="text-sm text-slate-400 leading-relaxed">
                        {isZh
                            ? '先读梦境解读指南，再进入词条页做“场景-情绪-行动”三步记录。'
                            : 'Read the interpretation guide first, then use symbol pages with a scenario-emotion-action journaling loop.'}
                    </p>
                    <div className="mt-4 flex flex-col sm:flex-row gap-3">
                        <Link
                            to="/dream-interpretation"
                            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
                        >
                            {isZh ? '阅读指南' : 'Read the guide'}
                        </Link>
                        <Link
                            to="/faq"
                            className="px-5 py-2.5 rounded-xl border border-indigo-500/30 text-indigo-200 text-sm font-semibold hover:bg-indigo-500/10 transition-colors"
                        >
                            {isZh ? '梦境 FAQ' : 'Dream FAQ'}
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default DreamMeaningIndexPage;
