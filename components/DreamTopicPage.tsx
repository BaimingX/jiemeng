import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Language } from '../types';
import Seo from './Seo';
import { dreamTopicBySlug, dreamTopics } from '../data/dreamTopics';

interface DreamTopicPageProps {
    language: Language;
}

const DreamTopicPage: React.FC<DreamTopicPageProps> = ({ language }) => {
    const { slug } = useParams();
    const isZh = language === 'zh';
    const topic = dreamTopicBySlug(slug);

    if (!topic) {
        return (
            <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-[#0B0F19]">
                <Seo
                    title={isZh ? '未找到梦境解析' : 'Dream Meaning Not Found'}
                    description={isZh ? '该梦境主题尚未收录。' : 'This dream meaning page is not available.'}
                    path={`/dream-meaning/${slug || ''}`}
                    noIndex={true}
                    lang={language}
                />
                <div className="max-w-3xl mx-auto text-center text-slate-300">
                    <h1 className="text-2xl font-semibold mb-4">
                        {isZh ? '没有找到该梦境主题' : 'Dream meaning not found'}
                    </h1>
                    <Link to="/dream-meaning" className="text-indigo-300 hover:text-indigo-200">
                        {isZh ? '返回梦境词典' : 'Back to dream dictionary'}
                    </Link>
                </div>
            </div>
        );
    }

    const title = isZh
        ? `${topic.titleZh} 梦境解析 | Oneiro AI`
        : `${topic.titleEn} Dream Meaning | Oneiro AI`;
    const description = isZh
        ? topic.summaryZh
        : topic.summaryEn;
    const keywordList = isZh
        ? [
            `${topic.titleZh} 梦境解析`,
            `${topic.titleZh} 梦境含义`,
            '梦境解析',
            '梦境含义',
            '梦境词典',
            '梦境符号',
            'AI 梦境解析',
            '梦境日记'
        ]
        : [
            `${topic.titleEn} dream meaning`,
            topic.questionEn.replace('?', ''),
            'dream interpretation',
            'dream dictionary',
            'dream symbols',
            'dream analysis',
            'AI dream interpretation',
            'dream journal app'
        ];
    const seoKeywords = keywordList.join(', ');
    const baseUrl = 'https://oneiroai.com';
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
                name: isZh ? topic.titleZh : topic.titleEn,
                item: `${baseUrl}/dream-meaning/${topic.slug}`
            }
        ]
    };

    const relatedTopics = topic.related
        .map((slugValue) => dreamTopics.find((item) => item.slug === slugValue))
        .filter(Boolean);

    return (
        <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-[#0B0F19] relative overflow-hidden">
            <Seo
                title={title}
                description={description}
                path={`/dream-meaning/${topic.slug}`}
                lang={language}
                keywords={seoKeywords}
                ogType="article"
                structuredData={breadcrumbJsonLd}
            />
            <div className="absolute top-0 left-0 w-full h-[420px] bg-gradient-to-b from-indigo-900/10 to-transparent pointer-events-none" />
            <div className="absolute top-[10%] left-[6%] w-64 h-64 bg-purple-500/10 rounded-full blur-[110px] pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10">
                <Link to="/dream-meaning" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 mb-6">
                    <ArrowLeft className="w-4 h-4" />
                    {isZh ? '返回梦境词典' : 'Back to dream dictionary'}
                </Link>

                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl">
                    <div className="flex items-center gap-3 mb-4">
                        <Sparkles className="w-6 h-6 text-indigo-400" />
                        <h1 className="text-2xl md:text-3xl font-semibold text-white">
                            {isZh ? topic.questionZh : topic.questionEn}
                        </h1>
                    </div>
                    <p className="text-slate-400 text-sm md:text-base leading-relaxed">
                        {isZh ? topic.summaryZh : topic.summaryEn}
                    </p>

                    <div className="mt-8 grid gap-6 md:grid-cols-2">
                        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5">
                            <h2 className="text-lg font-semibold text-white mb-3">
                                {isZh ? '可能的含义' : 'Possible meanings'}
                            </h2>
                            <ul className="space-y-2 text-sm text-slate-400 list-disc pl-5">
                                {(isZh ? topic.meaningsZh : topic.meaningsEn).map((item) => (
                                    <li key={item}>{item}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5">
                            <h2 className="text-lg font-semibold text-white mb-3">
                                {isZh ? '自我提问' : 'Reflection prompts'}
                            </h2>
                            <ul className="space-y-2 text-sm text-slate-400 list-disc pl-5">
                                {(isZh ? topic.reflectionsZh : topic.reflectionsEn).map((item) => (
                                    <li key={item}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {relatedTopics.length > 0 && (
                    <div className="mt-8 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl">
                        <h2 className="text-lg font-semibold text-white mb-4">
                            {isZh ? '相关主题' : 'Related topics'}
                        </h2>
                        <div className="flex flex-wrap gap-3">
                            {relatedTopics.map((item) => (
                                <Link
                                    key={item!.slug}
                                    to={`/dream-meaning/${item!.slug}`}
                                    className="px-4 py-2 rounded-full bg-indigo-500/10 text-indigo-200 border border-indigo-500/20 text-xs hover:bg-indigo-500/20 transition-colors"
                                >
                                    {isZh ? item!.titleZh : item!.titleEn}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DreamTopicPage;
