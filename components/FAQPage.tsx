import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, HelpCircle, Sparkles } from 'lucide-react';
import { Language } from '../types';
import Seo from './Seo';

interface FAQPageProps {
    language: Language;
}

const FAQPage: React.FC<FAQPageProps> = ({ language }) => {
    const isZh = language === 'zh';
    const seoTitle = isZh ? '梦境 FAQ | Oneiro AI' : 'Dream FAQ | Oneiro AI';
    const seoDescription = isZh
        ? '梦境含义、梦境符号与清醒梦的常见问题解答。'
        : 'Answers to common questions about dream meaning, dream symbols, and lucid dreaming.';
    const seoKeywords = isZh
        ? '梦境解析, 梦境含义, 梦境词典, 梦境符号, 清醒梦, 梦境日记, 梦境解析应用, AI 梦境解析, 牙齿脱落 梦境含义, 梦到蛇, 梦到前任, 反复梦境'
        : 'dream interpretation, dream meaning, dream dictionary, dream symbols, dream interpretation app, lucid dreaming, dream journal app, AI dream analyzer, teeth falling out dream meaning, snake dream meaning, dream about my ex, recurring dreams';

    const seoHighlights = isZh
        ? [
            {
                title: 'AI 梦境解析与梦境含义',
                body: 'AI 驱动的梦境解析，帮助理解梦境含义与梦境分析。'
            },
            {
                title: '梦境词典与梦境符号',
                body: '覆盖牙齿脱落、蛇、飞行、坠落、被追逐等常见梦境符号。'
            },
            {
                title: '梦境日记与清醒梦',
                body: '用梦境日记追踪反复梦境，获取清醒梦与梦境模式洞见。'
            }
        ]
        : [
            {
                title: 'Dream interpretation & dream meaning',
                body: 'AI-powered dream interpretation that helps decode dream meaning and dream analysis in minutes.'
            },
            {
                title: 'Dream dictionary & dream symbols',
                body: 'Explore a modern dream dictionary of dream symbols like teeth falling out, snakes, flying, falling, and being chased.'
            },
            {
                title: 'Dream journal app & lucid dreaming',
                body: 'Track recurring dreams with a private dream journal app and AI dream analyzer, plus lucid dreaming insights.'
            }
        ];

    const seoSymbolTags = isZh
        ? ['牙齿脱落', '蛇之梦', '梦到前任', '飞行梦', '坠落梦', '被追逐', '反复噩梦', '怀孕之梦', '梦到水', '梦到死亡']
        : ['teeth falling out', 'snake dream meaning', 'dream about my ex', 'flying dream symbolism', 'falling dream meaning', 'being chased', 'recurring dreams', 'pregnancy dream meaning', 'water dream meaning', 'death dream meaning'];

    const geoDescription = isZh
        ? '不同地区的搜索偏好不同：英美常见"牙齿脱落"之梦，很多国家则高频搜索蛇之梦。Oneiro AI 覆盖这些主题，并提供文化视角。'
        : 'Regional search trends differ: "teeth falling out" leads in the US/UK, while snake dream meaning is a top query across many countries. Oneiro AI covers these themes with cultural context.';

    const geoMarkets = isZh
        ? {
            primaryTitle: '重点英语市场',
            primary: '美国、英国、加拿大、澳大利亚、印度',
            secondaryTitle: '新兴英语地区',
            secondary: '菲律宾、新加坡、尼日利亚、南非'
        }
        : {
            primaryTitle: 'Primary English-speaking markets',
            primary: 'United States, United Kingdom, Canada, Australia, India',
            secondaryTitle: 'Emerging English-speaking markets',
            secondary: 'Philippines, Singapore, Nigeria, South Africa'
        };

    const faqSections = isZh
        ? [
            {
                title: '梦境解析与梦境含义',
                items: [
                    {
                        question: 'Oneiro AI 是什么？',
                        answer: 'Oneiro AI 是 AI 驱动的梦境解析与梦境日记工具，帮助你理解梦境含义与梦境符号。'
                    },
                    {
                        question: '梦到蛇是什么意思？',
                        answer: '蛇梦常与转变、恐惧或疗愈有关，具体含义与当下情绪和情境相关。'
                    },
                    {
                        question: '梦到牙齿掉落意味着什么？',
                        answer: '常见解释与压力、自我形象变化或生活转折有关。'
                    },
                    {
                        question: '为什么总梦到前任？',
                        answer: '可能是情绪未消化、记忆触发或关系模式的映射。'
                    }
                ]
            },
            {
                title: '梦境词典与梦境符号',
                items: [
                    {
                        question: '飞行梦象征什么？',
                        answer: '飞行梦通常与自由、掌控感和目标感相关。'
                    },
                    {
                        question: '坠落梦代表什么？',
                        answer: '常与不安、失控感或压力释放有关。'
                    },
                    {
                        question: '反复噩梦的原因？',
                        answer: '可能来自持续压力或焦虑，记录梦境有助于发现模式。'
                    }
                ]
            },
            {
                title: '使用方式与隐私',
                items: [
                    {
                        question: '如何提高记梦能力？',
                        answer: '规律作息、醒来立即记录、减少夜间干扰能提高梦境回忆。'
                    },
                    {
                        question: '清醒梦是什么？',
                        answer: '清醒梦是指在梦中意识到自己正在做梦，适合探索创造力与自我觉察。'
                    },
                    {
                        question: '我的梦境记录是否公开？',
                        answer: '梦境记录默认仅限你自己可见，除非你主动选择分享。'
                    }
                ]
            }
        ]
        : [
            {
                title: 'Dream interpretation & meaning',
                items: [
                    {
                        question: 'What is Oneiro AI?',
                        answer: 'Oneiro AI is an AI-powered dream interpretation and dream journal tool for dream meaning and dream symbols.'
                    },
                    {
                        question: 'What does it mean to dream about snakes?',
                        answer: 'A snake dream meaning often points to transformation, fear, or healing depending on the context.'
                    },
                    {
                        question: 'Dream about teeth falling out meaning?',
                        answer: 'Teeth falling out dream meaning is commonly linked to stress, change, or shifts in self-image.'
                    },
                    {
                        question: 'Why do I dream about my ex?',
                        answer: 'A dream about my ex can reflect unresolved feelings, memories, or current relationship patterns.'
                    }
                ]
            },
            {
                title: 'Dream dictionary & symbols',
                items: [
                    {
                        question: 'Flying dream symbolism?',
                        answer: 'Flying dream symbolism often relates to freedom, control, and ambition.'
                    },
                    {
                        question: 'Falling dream meaning?',
                        answer: 'Falling dreams are often linked to anxiety, instability, or a sense of losing control.'
                    },
                    {
                        question: 'Recurring nightmare causes?',
                        answer: 'Recurring nightmare causes include unresolved stress or anxiety; tracking patterns helps.'
                    }
                ]
            },
            {
                title: 'Usage & privacy',
                items: [
                    {
                        question: 'How can I improve dream recall?',
                        answer: 'Keep a consistent sleep schedule and jot down dreams immediately after waking.'
                    },
                    {
                        question: 'What is lucid dreaming?',
                        answer: 'Lucid dreaming is recognizing you are dreaming while the dream is happening, helping with self-awareness.'
                    },
                    {
                        question: 'Are my dream entries public?',
                        answer: 'Dream entries are private by default unless you choose to share them.'
                    }
                ]
            }
        ];

    const faqPreviewItems = faqSections.flatMap((section) => section.items).slice(0, 5);
    const faqJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqSections.flatMap((section) =>
            section.items.map((item) => ({
                '@type': 'Question',
                name: item.question,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: item.answer
                }
            }))
        )
    };

    return (
        <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-[#0B0F19] relative overflow-hidden">
            <Seo
                title={seoTitle}
                description={seoDescription}
                path="/faq"
                lang={language}
                keywords={seoKeywords}
                structuredData={faqJsonLd}
            />
            <div className="absolute top-0 left-0 w-full h-[480px] bg-gradient-to-b from-indigo-900/10 to-transparent pointer-events-none" />
            <div className="absolute top-[12%] left-[8%] w-64 h-64 bg-purple-500/10 rounded-full blur-[110px] pointer-events-none" />
            <div className="absolute bottom-[10%] right-[6%] w-80 h-80 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-5xl mx-auto relative z-10">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-6 backdrop-blur-sm">
                        <HelpCircle className="w-6 h-6 text-indigo-400" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
                        {isZh ? '梦境解析 FAQ' : 'Dream Interpretation FAQ'}
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        {isZh
                            ? '围绕梦境含义、梦境词典与清醒梦的常见问题，帮助你更快理解梦境主题。'
                            : 'Common questions about dream meaning, dream dictionary symbols, and lucid dreaming insights.'}
                    </p>
                </div>

                <div className="grid gap-6">
                    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <Sparkles className="w-5 h-5 text-indigo-400" />
                            <h2 className="text-xl font-semibold text-white">
                                {isZh ? '梦境解析、梦境含义与梦境词典' : 'Dream interpretation, dream meaning, and dream dictionary'}
                            </h2>
                        </div>
                        <p className="text-slate-400 text-sm md:text-base leading-relaxed">
                            {isZh
                                ? 'Oneiro AI 是 AI 驱动的梦境解析 App 与梦境日记，聚焦梦境含义、梦境符号与清醒梦洞见。借助 AI 梦境分析探索反复梦境与预示性梦境，同时建立个人梦境词典。'
                                : 'Oneiro AI is an AI-powered dream interpretation app and dream journal app for dream meaning, dream symbols, and lucid dreaming insights. Use the AI dream analyzer to explore recurring dreams and premonitory dreams while you build a personal dream dictionary.'}
                        </p>
                        <div className="mt-6 grid md:grid-cols-3 gap-4">
                            {seoHighlights.map((item) => (
                                <div key={item.title} className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-4">
                                    <h3 className="text-sm font-semibold text-indigo-100">{item.title}</h3>
                                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">{item.body}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-6">
                        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl">
                            <h3 className="text-lg font-semibold text-indigo-100 mb-3">
                                {isZh ? '热门梦境符号' : 'Dream dictionary highlights'}
                            </h3>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                {isZh
                                    ? '像"梦到牙齿掉落意味着什么"与"梦到蛇是什么意思"是高频问题，同时也涵盖飞行梦、反复噩梦、梦到前任等主题。'
                                    : 'Searches like "dream about teeth falling out meaning" and "what does it mean to dream about snakes" are among the most common. We also cover flying dream symbolism, recurring nightmare causes, and dream about my ex themes.'}
                            </p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                {seoSymbolTags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="px-3 py-1 text-xs rounded-full bg-indigo-500/10 text-indigo-200 border border-indigo-500/20"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl">
                            <h3 className="text-lg font-semibold text-indigo-100 mb-3">
                                {isZh ? '梦境含义 FAQ' : 'Dream meaning FAQ'}
                            </h3>
                            <dl className="space-y-4">
                                {faqPreviewItems.map((item) => (
                                    <div key={item.question}>
                                        <dt className="text-sm font-semibold text-indigo-100">{item.question}</dt>
                                        <dd className="text-xs text-slate-400 leading-relaxed mt-1">{item.answer}</dd>
                                    </div>
                                ))}
                            </dl>
                        </div>
                    </div>

                    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl">
                        <h3 className="text-lg font-semibold text-indigo-100 mb-3">
                            {isZh ? '全球梦境主题' : 'Global dream themes'}
                        </h3>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            {geoDescription}
                        </p>
                        <div className="mt-4 grid md:grid-cols-2 gap-4">
                            <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-4">
                                <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
                                    {geoMarkets.primaryTitle}
                                </div>
                                <p className="text-sm text-slate-300">{geoMarkets.primary}</p>
                            </div>
                            <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-4">
                                <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
                                    {geoMarkets.secondaryTitle}
                                </div>
                                <p className="text-sm text-slate-300">{geoMarkets.secondary}</p>
                            </div>
                        </div>
                    </div>
                    {faqSections.map((section) => (
                        <div key={section.title} className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl">
                            <h2 className="text-xl font-semibold text-white mb-4">
                                {section.title}
                            </h2>
                            <div className="space-y-3">
                                {section.items.map((item) => (
                                    <details
                                        key={item.question}
                                        className="group rounded-2xl border border-slate-800/80 bg-slate-950/60 px-5 py-4 transition-all"
                                    >
                                        <summary className="flex items-center justify-between cursor-pointer list-none text-slate-200 font-medium">
                                            <span>{item.question}</span>
                                            <ChevronDown className="w-4 h-4 text-slate-500 transition-transform group-open:rotate-180" />
                                        </summary>
                                        <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                                            {item.answer}
                                        </p>
                                    </details>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-10 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl">
                    <h2 className="text-lg font-semibold text-white mb-3">
                        {isZh ? '继续探索' : 'Explore more'} 
                    </h2>
                    <p className="text-sm text-slate-400 mb-4">
                        {isZh
                            ? '浏览梦境词典或查看不同地区的梦境主题与增长策略。'
                            : 'Browse the dream meaning dictionary or review GEO market priorities.'}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Link
                            to="/dream-meaning"
                            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
                        >
                            {isZh ? '梦境含义词典' : 'Dream meaning dictionary'}
                        </Link>
                        <Link
                            to="/markets"
                            className="px-5 py-2.5 rounded-xl border border-indigo-500/30 text-indigo-200 text-sm font-semibold hover:bg-indigo-500/10 transition-colors"
                        >
                            {isZh ? '全球市场策略' : 'Global market strategy'}
                        </Link>
                    </div>
                </div>

                <div className="mt-8 flex flex-col md:flex-row items-center justify-center gap-4">
                    <Link
                        to="/"
                        className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
                    >
                        {isZh ? '开始解梦' : 'Start Dream Interpretation'}
                    </Link>
                    <Link
                        to="/subscribe"
                        className="px-6 py-3 rounded-xl border border-indigo-500/30 text-indigo-200 text-sm font-semibold hover:bg-indigo-500/10 transition-colors"
                    >
                        {isZh ? '查看订阅方案' : 'View Plans'}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default FAQPage;
