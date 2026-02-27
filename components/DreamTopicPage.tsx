import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Sparkles, CalendarClock } from 'lucide-react';
import { Language } from '../types';
import Seo from './Seo';
import {
    dreamTopicBySlug,
    getRecommendedRelatedTopics
} from '../data/dreamTopics';

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
        ? `${topic.titleZh} 梦境解析 | 常见场景、心理视角与行动建议 - Oneiro AI`
        : `${topic.titleEn} Dream Meaning | Scenarios, Psychology, and Action Steps - Oneiro AI`;
    const description = isZh
        ? `${topic.summaryZh} 了解常见情境变化、心理学视角、文化解读与可执行行动建议。`
        : `${topic.summaryEn} Explore scenario-based interpretation, psychology lens, cultural context, and practical action steps.`;

    const baseUrl = 'https://oneiroai.com';
    const canonicalPath = `/dream-meaning/${topic.slug}`;
    const canonicalUrl = `${baseUrl}${canonicalPath}`;
    const relatedTopics = getRecommendedRelatedTopics(topic, 10);
    const clusterName = isZh
        ? (
            topic.cluster === 'anxiety'
                ? '焦虑类梦境'
                : topic.cluster === 'relationship'
                    ? '关系类梦境'
                    : topic.cluster === 'nightmare'
                        ? '噩梦模式'
                        : '成长类梦境'
        )
        : (
            topic.cluster === 'anxiety'
                ? 'Anxiety Dreams'
                : topic.cluster === 'relationship'
                    ? 'Relationship Dreams'
                    : topic.cluster === 'nightmare'
                        ? 'Nightmare Patterns'
                        : 'Growth Dreams'
        );

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
                item: canonicalUrl
            }
        ]
    };

    const faqJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: (isZh ? topic.faqZh : topic.faqEn).map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: item.answer
            }
        }))
    };

    const articleJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: isZh ? `${topic.titleZh} 梦境解析` : `${topic.titleEn} Dream Meaning`,
        description,
        dateModified: topic.updatedAt,
        datePublished: topic.updatedAt,
        mainEntityOfPage: canonicalUrl,
        author: {
            '@type': 'Organization',
            name: 'Oneiro AI'
        },
        publisher: {
            '@type': 'Organization',
            name: 'Oneiro AI',
            logo: {
                '@type': 'ImageObject',
                url: `${baseUrl}/logo.svg`
            }
        }
    };

    const sectionCardClass = 'bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl';

    return (
        <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-[#0B0F19] relative overflow-hidden">
            <Seo
                title={title}
                description={description}
                path={canonicalPath}
                lang={language}
                ogType="article"
                structuredData={[breadcrumbJsonLd, faqJsonLd, articleJsonLd]}
            />
            <div className="absolute top-0 left-0 w-full h-[420px] bg-gradient-to-b from-indigo-900/10 to-transparent pointer-events-none" />
            <div className="absolute top-[10%] left-[6%] w-64 h-64 bg-purple-500/10 rounded-full blur-[110px] pointer-events-none" />

            <div className="max-w-5xl mx-auto relative z-10">
                <Link to="/dream-meaning" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 mb-6">
                    <ArrowLeft className="w-4 h-4" />
                    {isZh ? '返回梦境词典' : 'Back to dream dictionary'}
                </Link>

                <article className={sectionCardClass}>
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                        <span className="px-3 py-1 rounded-full text-xs bg-indigo-500/10 text-indigo-200 border border-indigo-500/20">
                            {clusterName}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                            <CalendarClock className="w-3.5 h-3.5" />
                            {isZh ? `更新于 ${topic.updatedAt}` : `Updated ${topic.updatedAt}`}
                        </span>
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                        <Sparkles className="w-6 h-6 text-indigo-400" />
                        <h1 className="text-2xl md:text-3xl font-semibold text-white">
                            {isZh ? topic.questionZh : topic.questionEn}
                        </h1>
                    </div>

                    <p className="text-slate-300 text-base leading-relaxed">
                        {isZh ? topic.summaryZh : topic.summaryEn}
                    </p>
                    <p className="text-slate-400 text-sm leading-relaxed mt-4">
                        {isZh
                            ? '这是一份以“场景 + 情绪 +现实连接”为核心的解读模板。把梦境当成心理信号，而不是绝对预言，你会更容易获得可执行的洞见。'
                            : 'This guide uses a scenario + emotion + real-life context framework. Treat dream meaning as a reflection signal, not a deterministic prediction.'}
                    </p>
                </article>

                <section className={`${sectionCardClass} mt-8`}>
                    <h2 className="text-xl font-semibold text-white mb-3">
                        {isZh ? '深度解读框架' : 'Deep Interpretation Framework'}
                    </h2>
                    <div className="space-y-3">
                        {(isZh ? topic.deepDiveZh : topic.deepDiveEn).map((item) => (
                            <p key={item} className="text-sm text-slate-300 leading-relaxed">
                                {item}
                            </p>
                        ))}
                    </div>
                </section>

                <section className={`${sectionCardClass} mt-8`}>
                    <h2 className="text-xl font-semibold text-white mb-3">
                        {isZh ? '常见含义（TL;DR）' : 'Common Meanings (TL;DR)'}
                    </h2>
                    <p className="text-slate-400 text-sm leading-relaxed mb-4">
                        {isZh
                            ? '先看高概率方向，再结合你的具体情境微调。'
                            : 'Start with high-probability interpretations, then refine with your exact context.'}
                    </p>
                    <ul className="space-y-2 text-sm text-slate-300 list-disc pl-5">
                        {(isZh ? topic.meaningsZh : topic.meaningsEn).map((item) => (
                            <li key={item}>{item}</li>
                        ))}
                    </ul>
                </section>

                <section className={`${sectionCardClass} mt-8`}>
                    <h2 className="text-xl font-semibold text-white mb-3">
                        {isZh ? '情境如何改变含义' : 'How Context Changes Meaning'}
                    </h2>
                    <p className="text-slate-400 text-sm leading-relaxed mb-4">
                        {isZh
                            ? '同一个符号在不同场景里可能完全不同，关键在于“你在梦里如何体验它”。'
                            : 'The same symbol can mean very different things across scenarios. Your in-dream experience is the key variable.'}
                    </p>
                    <ul className="space-y-2 text-sm text-slate-300 list-disc pl-5">
                        {(isZh ? topic.scenariosZh : topic.scenariosEn).map((item) => (
                            <li key={item}>{item}</li>
                        ))}
                    </ul>
                </section>

                <section className={`${sectionCardClass} mt-8`}>
                    <h2 className="text-xl font-semibold text-white mb-3">
                        {isZh ? '心理学视角' : 'Psychology Lens'}
                    </h2>
                    <p className="text-slate-400 text-sm leading-relaxed mb-4">
                        {isZh
                            ? '心理学解读关注的是情绪加工与认知模式，不是“对错判定”。'
                            : 'A psychology-based reading focuses on emotional processing and cognitive patterns, not right-or-wrong judgment.'}
                    </p>
                    <ul className="space-y-2 text-sm text-slate-300 list-disc pl-5">
                        {(isZh ? topic.psychologyZh : topic.psychologyEn).map((item) => (
                            <li key={item}>{item}</li>
                        ))}
                    </ul>
                </section>

                <section className={`${sectionCardClass} mt-8`}>
                    <h2 className="text-xl font-semibold text-white mb-3">
                        {isZh ? '情境矩阵（同主题不同结论）' : 'Scenario Matrix (Same Theme, Different Outcomes)'}
                    </h2>
                    <p className="text-slate-400 text-sm leading-relaxed mb-4">
                        {isZh
                            ? '同一符号在不同角色和场景中会产生不同解释，先识别你处于哪一种情境。'
                            : 'The same symbol can map to different meanings depending on role and context. Identify your scenario first.'}
                    </p>
                    <ul className="space-y-2 text-sm text-slate-300 list-disc pl-5">
                        {(isZh ? topic.scenarioMatrixZh : topic.scenarioMatrixEn).map((item) => (
                            <li key={item}>{item}</li>
                        ))}
                    </ul>
                </section>

                <div className="grid gap-6 md:grid-cols-2 mt-8">
                    <section className={sectionCardClass}>
                        <h2 className="text-lg font-semibold text-white mb-3">
                            {isZh ? '文化与象征视角' : 'Cultural and Symbolic Lens'}
                        </h2>
                        <ul className="space-y-2 text-sm text-slate-300 list-disc pl-5">
                            {(isZh ? topic.cultureZh : topic.cultureEn).map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    </section>

                    <section className={sectionCardClass}>
                        <h2 className="text-lg font-semibold text-white mb-3">
                            {isZh ? '细节变化规则' : 'Detail Shift Rules'}
                        </h2>
                        <ul className="space-y-2 text-sm text-slate-300 list-disc pl-5">
                            {(isZh ? topic.detailShiftsZh : topic.detailShiftsEn).map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    </section>
                </div>

                <section className={`${sectionCardClass} mt-8`}>
                    <h2 className="text-xl font-semibold text-white mb-3">
                        {isZh ? '映射到现实：一周诊断步骤' : 'Map to Waking Life: One-Week Diagnostic Steps'}
                    </h2>
                    <ul className="space-y-2 text-sm text-slate-300 list-disc pl-5">
                        {(isZh ? topic.wakingLifeZh : topic.wakingLifeEn).map((item) => (
                            <li key={item}>{item}</li>
                        ))}
                    </ul>
                </section>

                <div className="grid gap-6 md:grid-cols-2 mt-8">
                    <section className={sectionCardClass}>
                        <h2 className="text-lg font-semibold text-white mb-3">
                            {isZh ? '自我提问（用于梦境记录）' : 'Reflection Prompts (For Journaling)'}
                        </h2>
                        <ul className="space-y-2 text-sm text-slate-300 list-disc pl-5">
                            {(isZh ? topic.reflectionsZh : topic.reflectionsEn).map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    </section>

                    <section className={sectionCardClass}>
                        <h2 className="text-lg font-semibold text-white mb-3">
                            {isZh ? '现实行动建议（7天）' : '7-Day Action Checklist'}
                        </h2>
                        <ul className="space-y-2 text-sm text-slate-300 list-disc pl-5">
                            {(isZh ? topic.actionPlanZh : topic.actionPlanEn).map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    </section>
                </div>

                <section className={`${sectionCardClass} mt-8`}>
                    <h2 className="text-xl font-semibold text-white mb-4">
                        {isZh ? '相关梦境（系统推荐）' : 'Related Dreams (System Recommendations)'}
                    </h2>
                    <p className="text-slate-400 text-sm leading-relaxed mb-4">
                        {isZh
                            ? '以下链接按“同类主题 + 标签重叠 + 历史关联”综合排序，适合继续阅读。'
                            : 'These links are ranked by cluster similarity, shared tags, and historical relation signals.'}
                    </p>
                    <div className="flex flex-wrap gap-3">
                        {relatedTopics.map((item) => (
                            <Link
                                key={item.slug}
                                to={`/dream-meaning/${item.slug}`}
                                className="px-4 py-2 rounded-full bg-indigo-500/10 text-indigo-200 border border-indigo-500/20 text-xs hover:bg-indigo-500/20 transition-colors"
                            >
                                {isZh ? item.titleZh : item.titleEn}
                            </Link>
                        ))}
                    </div>
                </section>

                <section className={`${sectionCardClass} mt-8`}>
                    <h2 className="text-xl font-semibold text-white mb-4">
                        {isZh ? '常见问题' : 'Frequently Asked Questions'}
                    </h2>
                    <div className="space-y-4">
                        {(isZh ? topic.faqZh : topic.faqEn).map((item) => (
                            <div key={item.question} className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-4">
                                <h3 className="text-sm font-semibold text-indigo-100">{item.question}</h3>
                                <p className="text-sm text-slate-400 mt-2 leading-relaxed">{item.answer}</p>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-5">
                        {isZh
                            ? '免责声明：本页仅用于教育和自我反思，不构成医疗、心理或法律建议。'
                            : 'Disclaimer: This page is for education and reflection only, not medical, psychological, or legal advice.'}
                    </p>
                </section>

                <div className="mt-10 flex flex-col sm:flex-row gap-3">
                    <Link
                        to={`/dream-meaning/cluster/${topic.cluster}`}
                        className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
                    >
                        {isZh ? '查看同类主题集合' : 'Open Cluster Page'}
                    </Link>
                    <Link
                        to="/dream-meaning"
                        className="px-5 py-2.5 rounded-xl border border-indigo-500/30 text-indigo-200 text-sm font-semibold hover:bg-indigo-500/10 transition-colors"
                    >
                        {isZh ? '返回梦境词典' : 'Back to Dictionary'}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default DreamTopicPage;
