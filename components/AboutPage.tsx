import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Compass, ShieldCheck, Sparkles } from 'lucide-react';
import { Language } from '../types';
import Seo from './Seo';
import { brandProfile } from '../data/brandProfile';

interface AboutPageProps {
    language: Language;
}

const AboutPage: React.FC<AboutPageProps> = ({ language }) => {
    const isZh = language === 'zh';
    const title = isZh
        ? '关于 Oneiro AI | Who / How / Why'
        : 'About Oneiro AI | Who / How / Why';
    const description = isZh
        ? '了解 Oneiro AI 的团队定位、内容方法与用户价值原则。'
        : 'Learn who builds Oneiro AI, how dream interpretations are produced, and why the product exists.';

    const organizationJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: brandProfile.name,
        url: brandProfile.url,
        logo: brandProfile.logo,
        email: brandProfile.email,
        sameAs: brandProfile.sameAs,
        contactPoint: [
            {
                '@type': 'ContactPoint',
                contactType: 'customer support',
                email: brandProfile.email,
                availableLanguage: ['English', 'Chinese']
            }
        ]
    };

    const websiteJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: brandProfile.name,
        url: brandProfile.url,
        inLanguage: ['en', 'zh']
    };

    const softwareJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: brandProfile.name,
        applicationCategory: brandProfile.appCategory,
        operatingSystem: 'Web',
        url: brandProfile.url,
        publisher: {
            '@type': 'Organization',
            name: brandProfile.name
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-[#0B0F19] relative overflow-hidden">
            <Seo
                title={title}
                description={description}
                path="/about"
                lang={language}
                structuredData={[organizationJsonLd, websiteJsonLd, softwareJsonLd]}
            />
            <div className="absolute top-0 left-0 w-full h-[420px] bg-gradient-to-b from-indigo-900/10 to-transparent pointer-events-none" />
            <div className="absolute top-[12%] left-[8%] w-64 h-64 bg-purple-500/10 rounded-full blur-[110px] pointer-events-none" />

            <div className="max-w-5xl mx-auto relative z-10">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-6 backdrop-blur-sm">
                        <Building2 className="w-6 h-6 text-indigo-400" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
                        {isZh ? '关于 Oneiro AI' : 'About Oneiro AI'}
                    </h1>
                    <p className="text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
                        {isZh
                            ? 'Oneiro AI 是一个面向普通用户的梦境解析与记录产品，目标是把“梦境反思”变成可持续、可执行、可回顾的日常实践。'
                            : 'Oneiro AI is a practical dream interpretation and journaling product designed to turn dream reflection into a repeatable daily workflow.'}
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <section className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl">
                        <div className="inline-flex p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 mb-3">
                            <Building2 className="w-5 h-5 text-indigo-300" />
                        </div>
                        <h2 className="text-lg font-semibold text-white mb-2">
                            {isZh ? 'Who: 谁在构建' : 'Who: Who Builds It'}
                        </h2>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            {isZh
                                ? '由 Oneiro AI 团队持续开发与迭代，聚焦梦境解析、记录体验和隐私保护。'
                                : 'Built and iterated by the Oneiro AI team with a focus on interpretation quality, journaling UX, and privacy.'}
                        </p>
                    </section>

                    <section className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl">
                        <div className="inline-flex p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 mb-3">
                            <Compass className="w-5 h-5 text-indigo-300" />
                        </div>
                        <h2 className="text-lg font-semibold text-white mb-2">
                            {isZh ? 'How: 如何产出' : 'How: How Content Is Produced'}
                        </h2>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            {isZh
                                ? '我们使用结构化模板（场景、情绪、心理学与文化视角）生成解读，再通过产品迭代不断优化可读性与行动性。'
                                : 'Interpretations use a structured framework (scenario, emotion, psychology, culture) and are continuously refined for clarity and actionability.'}
                        </p>
                    </section>

                    <section className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl">
                        <div className="inline-flex p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 mb-3">
                            <Sparkles className="w-5 h-5 text-indigo-300" />
                        </div>
                        <h2 className="text-lg font-semibold text-white mb-2">
                            {isZh ? 'Why: 为什么存在' : 'Why: Why It Exists'}
                        </h2>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            {isZh
                                ? '不是为了“算命式答案”，而是帮助用户更快识别压力模式、关系信号和成长议题。'
                                : 'Not to provide deterministic predictions, but to help users identify stress patterns, relationship signals, and growth themes.'}
                        </p>
                    </section>
                </div>

                <section className="mt-8 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl">
                    <div className="flex items-center gap-3 mb-3">
                        <ShieldCheck className="w-5 h-5 text-indigo-300" />
                        <h2 className="text-xl font-semibold text-white">
                            {isZh ? '编辑与质量原则' : 'Editorial and Quality Principles'}
                        </h2>
                    </div>
                    <ul className="space-y-2 text-sm text-slate-300 list-disc pl-5">
                        <li>
                            {isZh
                                ? '解释优先服务用户理解，不做夸张承诺和恐吓式表达。'
                                : 'Interpretations prioritize user understanding over sensational claims.'}
                        </li>
                        <li>
                            {isZh
                                ? '页面结构固定为“含义-情境-行动”，确保可复盘。'
                                : 'Pages follow a fixed meaning-scenario-action structure for practical review.'}
                        </li>
                        <li>
                            {isZh
                                ? '所有内容仅用于教育和反思，不替代医疗或心理治疗。'
                                : 'Content is for education and reflection only, not medical or therapy advice.'}
                        </li>
                    </ul>
                </section>

                <section className="mt-8 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl">
                    <h2 className="text-lg font-semibold text-white mb-3">
                        {isZh ? '品牌实体信息（Organization Entity）' : 'Organization Entity Signals'}
                    </h2>
                    <p className="text-sm text-slate-400 leading-relaxed mb-4">
                        {isZh
                            ? '我们在此页公开组织信息、联系邮箱与站点身份链接，帮助搜索引擎稳定识别 Oneiro AI 品牌实体。'
                            : 'This page publishes organization metadata, contact details, and identity links for stable brand entity recognition in search.'}
                    </p>
                    <div className="text-sm text-slate-300 space-y-2">
                        <p><span className="text-slate-500">URL:</span> {brandProfile.url}</p>
                        <p><span className="text-slate-500">Email:</span> {brandProfile.email}</p>
                        <p><span className="text-slate-500">sameAs:</span> {brandProfile.sameAs.join(' | ')}</p>
                    </div>
                </section>

                <div className="mt-10 flex flex-col sm:flex-row gap-3">
                    <Link
                        to="/dream-meaning"
                        className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
                    >
                        {isZh ? '进入梦境词典' : 'Open Dream Dictionary'}
                    </Link>
                    <Link
                        to="/privacy"
                        className="px-5 py-2.5 rounded-xl border border-indigo-500/30 text-indigo-200 text-sm font-semibold hover:bg-indigo-500/10 transition-colors"
                    >
                        {isZh ? '查看隐私政策' : 'Privacy Policy'}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;
