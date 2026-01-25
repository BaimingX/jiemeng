import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, ArrowRight } from 'lucide-react';
import { Language } from '../types';
import Seo from './Seo';
import { markets } from '../data/markets';

interface MarketsIndexPageProps {
    language: Language;
}

const MarketsIndexPage: React.FC<MarketsIndexPageProps> = ({ language }) => {
    const isZh = language === 'zh';

    const title = isZh
        ? 'Oneiro AI 全球市场 | GEO 与地区策略'
        : 'Oneiro AI Markets | GEO Strategy Overview';
    const description = isZh
        ? '覆盖美国、英国、加拿大、澳大利亚、印度及新兴英语市场的 GEO 说明与增长策略。'
        : 'GEO-focused market summaries for primary and emerging English-speaking markets.';
    const seoKeywords = isZh
        ? 'GEO, 全球市场, 英语市场, 美国, 英国, 加拿大, 澳大利亚, 印度, 菲律宾, 新加坡, 尼日利亚, 南非'
        : 'GEO, global markets, United States, United Kingdom, Canada, Australia, India, Philippines, Singapore, Nigeria, South Africa';

    return (
        <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-[#0B0F19] relative overflow-hidden">
            <Seo
                title={title}
                description={description}
                path="/markets"
                lang={language}
                keywords={seoKeywords}
            />
            <div className="absolute top-0 left-0 w-full h-[420px] bg-gradient-to-b from-indigo-900/10 to-transparent pointer-events-none" />
            <div className="absolute top-[10%] left-[6%] w-64 h-64 bg-purple-500/10 rounded-full blur-[110px] pointer-events-none" />
            <div className="absolute bottom-[10%] right-[6%] w-80 h-80 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-5xl mx-auto relative z-10">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-4 backdrop-blur-sm">
                        <Globe className="w-6 h-6 text-indigo-400" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
                        {isZh ? '全球市场策略' : 'Global market strategy'}
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        {isZh
                            ? '根据 GEO 策略整理重点与新兴英语市场的受众、平台与内容方向。'
                            : 'GEO-aligned summaries of audiences, platforms, and content angles for primary and emerging English-speaking markets.'}
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {markets.map((market) => (
                        <Link
                            key={market.slug}
                            to={`/markets/${market.slug}`}
                            className="group bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl hover:border-indigo-500/40 transition-colors"
                        >
                            <h2 className="text-lg font-semibold text-white mb-2">
                                {isZh ? market.nameZh : market.nameEn}
                            </h2>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                {isZh ? market.summaryZh : market.summaryEn}
                            </p>
                            <div className="mt-4 flex items-center gap-2 text-xs text-indigo-300">
                                <span>{isZh ? '查看策略' : 'View strategy'}</span>
                                <ArrowRight className="w-4 h-4" />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MarketsIndexPage;
