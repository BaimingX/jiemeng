import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, MessageSquare, Sparkles } from 'lucide-react';
import { Language } from '../types';
import Seo from './Seo';

interface DreamInterpretationGuidePageProps {
    language: Language;
}

const DreamInterpretationGuidePage: React.FC<DreamInterpretationGuidePageProps> = ({ language }) => {
    const isZh = language === 'zh';

    const title = isZh
        ? '梦境解析指南 | 梦境含义与梦境符号 - Oneiro AI'
        : 'Dream Interpretation Guide | Dream Meaning & Symbols - Oneiro AI';
    const description = isZh
        ? '学习如何解析梦境、理解梦境符号与梦境含义，并结合梦境日记与清醒梦技巧提升梦境洞察。'
        : 'Learn how to interpret dreams, understand dream symbols and dream meaning, and use a dream journal to improve insight.';
    const seoKeywords = isZh
        ? '梦境解析, 梦境含义, 梦境符号, 梦境词典, 反复梦境, 清醒梦, 梦境日记, 梦境分析'
        : 'dream interpretation, dream meaning, dream symbols, dream dictionary, recurring dreams, lucid dreaming, dream journal, dream analysis';

    const steps = isZh
        ? [
            {
                title: '1. 记录情境',
                body: '用当下视角写下场景、人物与关键动作，细节越清晰，越容易找到关联。'
            },
            {
                title: '2. 捕捉情绪',
                body: '先从情绪入手：焦虑、兴奋、羞耻或自由感，往往比符号更接近真正的主题。'
            },
            {
                title: '3. 连接现实',
                body: '把梦境符号当作隐喻，关联到近期压力、关系变化或未完成的决定。'
            }
        ]
        : [
            {
                title: '1. Capture the context',
                body: 'Write the scene, people, and key actions in present tense. Detail helps you spot patterns.'
            },
            {
                title: '2. Name the emotion',
                body: 'Start with how it felt: anxiety, relief, shame, or freedom. Emotion is often the core signal.'
            },
            {
                title: '3. Link to real life',
                body: 'Treat symbols as metaphors and connect them to current stress, relationships, or decisions.'
            }
        ];

    const insights = isZh
        ? [
            '梦境符号常因文化与个人经历而不同，关键是你与它的关系。',
            '反复梦境通常提示未被处理的压力或长期模式。',
            '清醒梦和梦境日记能提升梦境记忆与自我觉察。'
        ]
        : [
            'Dream symbols vary by culture and personal history; your relationship to the symbol matters most.',
            'Recurring dreams often signal unresolved stress or patterns you are avoiding.',
            'Lucid dreaming and dream journaling improve recall and self-awareness over time.'
        ];

    const popularTopics = [
        { slug: 'teeth-falling-out', labelZh: '牙齿脱落', labelEn: 'Teeth Falling Out' },
        { slug: 'snakes', labelZh: '蛇之梦', labelEn: 'Snakes' },
        { slug: 'flying', labelZh: '飞行梦', labelEn: 'Flying' },
        { slug: 'falling', labelZh: '坠落梦', labelEn: 'Falling' },
        { slug: 'being-chased', labelZh: '被追逐', labelEn: 'Being Chased' },
        { slug: 'ex-partner', labelZh: '梦到前任', labelEn: 'Ex Partner' },
        { slug: 'pregnancy', labelZh: '怀孕之梦', labelEn: 'Pregnancy' },
        { slug: 'water', labelZh: '梦到水', labelEn: 'Water' },
        { slug: 'death', labelZh: '梦到死亡', labelEn: 'Death' },
        { slug: 'spiders', labelZh: '蜘蛛之梦', labelEn: 'Spiders' },
        { slug: 'house', labelZh: '房屋之梦', labelEn: 'Houses' },
        { slug: 'naked-in-public', labelZh: '当众裸露', labelEn: 'Naked in Public' }
    ];

    return (
        <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-[#0B0F19] relative overflow-hidden">
            <Seo
                title={title}
                description={description}
                path="/dream-interpretation"
                lang={language}
                keywords={seoKeywords}
            />
            <div className="absolute top-0 left-0 w-full h-[420px] bg-gradient-to-b from-indigo-900/10 to-transparent pointer-events-none" />
            <div className="absolute top-[10%] left-[6%] w-64 h-64 bg-purple-500/10 rounded-full blur-[110px] pointer-events-none" />
            <div className="absolute bottom-[10%] right-[6%] w-80 h-80 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-5xl mx-auto relative z-10">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-4 backdrop-blur-sm">
                        <BookOpen className="w-6 h-6 text-indigo-400" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
                        {isZh ? '梦境解析指南' : 'Dream Interpretation Guide'}
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        {isZh
                            ? '从梦境情绪、梦境符号到现实关联，帮助你建立清晰、可执行的梦境解读方法。'
                            : 'A practical framework for turning dream symbols and emotions into clear, actionable meaning.'}
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {steps.map((step) => (
                        <div
                            key={step.title}
                            className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl"
                        >
                            <h2 className="text-lg font-semibold text-white mb-3">{step.title}</h2>
                            <p className="text-sm text-slate-400 leading-relaxed">{step.body}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-10 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl">
                    <div className="flex items-center gap-3 mb-4">
                        <Sparkles className="w-5 h-5 text-indigo-400" />
                        <h2 className="text-xl font-semibold text-white">
                            {isZh ? '梦境解析的关键提醒' : 'Key insights for dream interpretation'}
                        </h2>
                    </div>
                    <ul className="space-y-2 text-sm text-slate-400 list-disc pl-5">
                        {insights.map((item) => (
                            <li key={item}>{item}</li>
                        ))}
                    </ul>
                </div>

                <div className="mt-10 grid gap-6 md:grid-cols-2">
                    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl">
                        <h2 className="text-lg font-semibold text-white mb-3">
                            {isZh ? '反复梦境如何处理？' : 'What to do about recurring dreams'}
                        </h2>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            {isZh
                                ? '反复梦境往往与长期压力或未完成的议题相关。建议记录触发点、调整行动策略，并追踪频率变化。'
                                : 'Recurring dreams often reflect ongoing stress or unresolved themes. Track triggers, adjust one behavior, and watch for frequency changes.'}
                        </p>
                        <div className="mt-4">
                            <Link
                                to="/faq"
                                className="inline-flex items-center gap-2 text-sm text-indigo-300 hover:text-indigo-200"
                            >
                                {isZh ? '查看梦境 FAQ' : 'Explore the Dream FAQ'}
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <MessageSquare className="w-5 h-5 text-indigo-400" />
                            <h2 className="text-lg font-semibold text-white">
                                {isZh ? '清醒梦与梦境日记' : 'Lucid dreaming & dream journaling'}
                            </h2>
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            {isZh
                                ? '坚持记录梦境能提升记忆力与觉察力，也更容易进入清醒梦状态。'
                                : 'Consistent journaling improves recall and increases the chance of lucid dreaming over time.'}
                        </p>
                        <div className="mt-4">
                            <Link
                                to="/"
                                className="inline-flex items-center gap-2 text-sm text-indigo-300 hover:text-indigo-200"
                            >
                                {isZh ? '开始解梦记录' : 'Start interpreting now'}
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="mt-10 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl">
                    <h2 className="text-lg font-semibold text-white mb-4">
                        {isZh ? '热门梦境含义' : 'Popular dream meanings'}
                    </h2>
                    <div className="flex flex-wrap gap-3">
                        {popularTopics.map((topic) => (
                            <Link
                                key={topic.slug}
                                to={`/dream-meaning/${topic.slug}`}
                                className="px-4 py-2 rounded-full bg-indigo-500/10 text-indigo-200 border border-indigo-500/20 text-xs hover:bg-indigo-500/20 transition-colors"
                            >
                                {isZh ? topic.labelZh : topic.labelEn}
                            </Link>
                        ))}
                    </div>
                    <div className="mt-6 flex flex-col sm:flex-row gap-3">
                        <Link
                            to="/dream-meaning"
                            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
                        >
                            {isZh ? '梦境词典' : 'Dream meaning dictionary'}
                        </Link>
                        <Link
                            to="/subscribe"
                            className="px-5 py-2.5 rounded-xl border border-indigo-500/30 text-indigo-200 text-sm font-semibold hover:bg-indigo-500/10 transition-colors"
                        >
                            {isZh ? '查看订阅方案' : 'View plans'}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DreamInterpretationGuidePage;
