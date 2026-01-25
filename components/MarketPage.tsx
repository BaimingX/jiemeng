import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Target } from 'lucide-react';
import { Language } from '../types';
import Seo from './Seo';
import { marketBySlug } from '../data/markets';

interface MarketPageProps {
    language: Language;
}

const MarketPage: React.FC<MarketPageProps> = ({ language }) => {
    const { slug } = useParams();
    const isZh = language === 'zh';
    const market = marketBySlug(slug);

    if (!market) {
        return (
            <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-[#0B0F19]">
                <Seo
                    title={isZh ? '未找到市场信息' : 'Market Not Found'}
                    description={isZh ? '该市场页面暂未提供。' : 'This market page is not available.'}
                    path={`/markets/${slug || ''}`}
                    noIndex={true}
                    lang={language}
                />
                <div className="max-w-3xl mx-auto text-center text-slate-300">
                    <h1 className="text-2xl font-semibold mb-4">
                        {isZh ? '没有找到该市场' : 'Market not found'}
                    </h1>
                    <Link to="/markets" className="text-indigo-300 hover:text-indigo-200">
                        {isZh ? '返回市场列表' : 'Back to markets'}
                    </Link>
                </div>
            </div>
        );
    }

    const title = isZh
        ? `Oneiro AI ${market.nameZh} 市场策略`
        : `Oneiro AI ${market.nameEn} Market Strategy`;
    const description = isZh ? market.summaryZh : market.summaryEn;
    const seoKeywords = isZh
        ? `GEO, 市场策略, ${market.nameZh}, 英语市场, 梦境解析, 梦境含义`
        : `GEO, market strategy, ${market.nameEn}, English-speaking market, dream interpretation, dream meaning`;

    return (
        <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-[#0B0F19] relative overflow-hidden">
            <Seo
                title={title}
                description={description}
                path={`/markets/${market.slug}`}
                lang={language}
                keywords={seoKeywords}
            />
            <div className="absolute top-0 left-0 w-full h-[420px] bg-gradient-to-b from-indigo-900/10 to-transparent pointer-events-none" />
            <div className="absolute top-[10%] left-[6%] w-64 h-64 bg-purple-500/10 rounded-full blur-[110px] pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10">
                <Link to="/markets" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 mb-6">
                    <ArrowLeft className="w-4 h-4" />
                    {isZh ? '返回市场列表' : 'Back to markets'}
                </Link>

                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl">
                    <div className="flex items-center gap-3 mb-4">
                        <Target className="w-6 h-6 text-indigo-400" />
                        <h1 className="text-2xl md:text-3xl font-semibold text-white">
                            {isZh ? market.nameZh : market.nameEn}
                        </h1>
                    </div>
                    <p className="text-slate-400 text-sm md:text-base leading-relaxed">
                        {isZh ? market.summaryZh : market.summaryEn}
                    </p>

                    <div className="mt-8 grid gap-6 md:grid-cols-2">
                        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5">
                            <h2 className="text-lg font-semibold text-white mb-3">
                                {isZh ? '受众画像' : 'Audience profile'}
                            </h2>
                            <ul className="space-y-2 text-sm text-slate-400 list-disc pl-5">
                                {(isZh ? market.audienceZh : market.audienceEn).map((item) => (
                                    <li key={item}>{item}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5">
                            <h2 className="text-lg font-semibold text-white mb-3">
                                {isZh ? '平台策略' : 'Platform strategy'}
                            </h2>
                            <ul className="space-y-2 text-sm text-slate-400 list-disc pl-5">
                                {(isZh ? market.platformsZh : market.platformsEn).map((item) => (
                                    <li key={item}>{item}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5">
                            <h2 className="text-lg font-semibold text-white mb-3">
                                {isZh ? '营销角度' : 'Marketing angles'}
                            </h2>
                            <ul className="space-y-2 text-sm text-slate-400 list-disc pl-5">
                                {(isZh ? market.anglesZh : market.anglesEn).map((item) => (
                                    <li key={item}>{item}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5">
                            <h2 className="text-lg font-semibold text-white mb-3">
                                {isZh ? '内容方向' : 'Content themes'}
                            </h2>
                            <ul className="space-y-2 text-sm text-slate-400 list-disc pl-5">
                                {(isZh ? market.contentZh : market.contentEn).map((item) => (
                                    <li key={item}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MarketPage;
