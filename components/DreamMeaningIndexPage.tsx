import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight } from 'lucide-react';
import { Language } from '../types';
import Seo from './Seo';
import { dreamTopics } from '../data/dreamTopics';

interface DreamMeaningIndexPageProps {
    language: Language;
}

const DreamMeaningIndexPage: React.FC<DreamMeaningIndexPageProps> = ({ language }) => {
    const isZh = language === 'zh';

    const title = isZh
        ? 'Oneiro AI 梦境含义词典 | 梦境符号与梦境解析'
        : 'Dream Meaning Dictionary | Dream Symbols by Oneiro AI';
    const description = isZh
        ? '浏览常见梦境含义与梦境符号词典，包括牙齿脱落、蛇梦、飞行梦、坠落梦等。'
        : 'Explore a modern dream meaning dictionary of dream symbols like teeth falling out, snakes, flying, and falling.';
    const seoKeywords = isZh
        ? '梦境含义, 梦境词典, 梦境符号, 梦境解析, 牙齿脱落, 蛇之梦, 飞行梦, 坠落梦, 被追逐, 梦到前任'
        : 'dream meaning, dream dictionary, dream symbols, dream interpretation, teeth falling out dream meaning, snake dream meaning, flying dream symbolism, falling dream meaning, being chased dream, dream about my ex';

    return (
        <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-[#0B0F19] relative overflow-hidden">
            <Seo
                title={title}
                description={description}
                path="/dream-meaning"
                lang={language}
                keywords={seoKeywords}
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
                            ? '系统化浏览常见梦境符号与解析，帮助你建立个人梦境词典。'
                            : 'Browse common dream symbols and meanings to build your personal dream dictionary.'}
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {dreamTopics.map((topic) => (
                        <Link
                            key={topic.slug}
                            to={`/dream-meaning/${topic.slug}`}
                            className="group bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl hover:border-indigo-500/40 transition-colors"
                        >
                            <h2 className="text-lg font-semibold text-white mb-2">
                                {isZh ? topic.titleZh : topic.titleEn}
                            </h2>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                {isZh ? topic.summaryZh : topic.summaryEn}
                            </p>
                            <div className="mt-4 flex items-center gap-2 text-xs text-indigo-300">
                                <span>{isZh ? '查看解析' : 'View meaning'}</span>
                                <ArrowRight className="w-4 h-4" />
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="mt-10 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl">
                    <h2 className="text-lg font-semibold text-white mb-3">
                        {isZh ? '梦境解析指南' : 'Dream interpretation guide'}
                    </h2>
                    <p className="text-sm text-slate-400 leading-relaxed">
                        {isZh
                            ? '了解如何从情绪、符号和现实情境出发解读梦境，并建立持续的梦境记录习惯。'
                            : 'Learn a simple framework for interpreting dreams through emotion, symbols, and real-life context.'}
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
                </div>

                <div className="mt-12 flex flex-col md:flex-row items-center justify-center gap-4">
                    <Link
                        to="/faq"
                        className="px-6 py-3 rounded-xl border border-indigo-500/30 text-indigo-200 text-sm font-semibold hover:bg-indigo-500/10 transition-colors"
                    >
                        {isZh ? '查看梦境 FAQ' : 'Open Dream FAQ'}
                    </Link>
                    <Link
                        to="/"
                        className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
                    >
                        {isZh ? '开始解梦' : 'Start Interpreting'}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default DreamMeaningIndexPage;
