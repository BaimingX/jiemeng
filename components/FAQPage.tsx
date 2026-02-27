import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { Language } from '../types';
import Seo from './Seo';

interface FAQPageProps {
    language: Language;
}

const FAQPage: React.FC<FAQPageProps> = ({ language }) => {
    const isZh = language === 'zh';
    const seoTitle = isZh ? '梦境 FAQ | Oneiro AI' : 'Dream FAQ | Oneiro AI';
    const seoDescription = isZh
        ? '关于梦境解析、梦境记录与隐私设置的常见问题。'
        : 'Common questions about dream interpretation, journaling, and privacy settings.';

    const faqSections = isZh
        ? [
            {
                title: '梦境解析',
                items: [
                    {
                        question: 'Oneiro AI 是什么？',
                        answer: 'Oneiro AI 是一个 AI 梦境解析与记录工具，帮助你从多个视角理解梦境。'
                    },
                    {
                        question: '为什么会反复梦到同一个主题？',
                        answer: '反复梦通常与持续压力、未解决的问题或强烈情绪有关。记录触发场景有助于识别模式。'
                    },
                    {
                        question: '解析结果是“准确答案”吗？',
                        answer: '不是。解析结果用于启发自我反思，不应替代医疗、心理或法律建议。'
                    }
                ]
            },
            {
                title: '使用与记录',
                items: [
                    {
                        question: '怎么提高记梦能力？',
                        answer: '保持稳定作息，醒来后尽快记录关键词，持续几周通常会明显提升回忆率。'
                    },
                    {
                        question: '如何开始清醒梦练习？',
                        answer: '先建立梦境记录习惯，再加入现实检验和睡前意图设置，逐步提高梦中觉察。'
                    },
                    {
                        question: '能否长期追踪自己的梦境变化？',
                        answer: '可以。你可以通过梦境记录查看主题变化、情绪波动和常见符号。'
                    }
                ]
            },
            {
                title: '隐私与账号',
                items: [
                    {
                        question: '我的梦境记录会公开吗？',
                        answer: '默认不会。除非你主动分享，否则梦境内容仅对你可见。'
                    },
                    {
                        question: '可以删除我的数据吗？',
                        answer: '可以。你可以在账号设置中管理内容；如需完整删除可联系支持邮箱。'
                    },
                    {
                        question: '订阅后会自动续费吗？',
                        answer: '会。你可以在对应支付平台中随时管理或取消续费。'
                    }
                ]
            }
        ]
        : [
            {
                title: 'Dream Interpretation',
                items: [
                    {
                        question: 'What is Oneiro AI?',
                        answer: 'Oneiro AI is an AI dream interpretation and journaling tool that helps you reflect on dreams from multiple perspectives.'
                    },
                    {
                        question: 'Why do recurring dreams happen?',
                        answer: 'Recurring dreams are often linked to ongoing stress, unresolved issues, or strong emotional themes. Tracking context helps reveal patterns.'
                    },
                    {
                        question: 'Are interpretations definitive answers?',
                        answer: 'No. Interpretations are for personal reflection and should not replace medical, psychological, or legal advice.'
                    }
                ]
            },
            {
                title: 'Usage and Journaling',
                items: [
                    {
                        question: 'How can I improve dream recall?',
                        answer: 'Keep a stable sleep routine and capture notes right after waking. Most people see recall improve with consistency.'
                    },
                    {
                        question: 'How do I begin lucid dreaming practice?',
                        answer: 'Start with journaling, then add reality checks and bedtime intention-setting to build dream awareness gradually.'
                    },
                    {
                        question: 'Can I track dream patterns over time?',
                        answer: 'Yes. Journaling helps you monitor shifts in themes, emotions, and recurring symbols.'
                    }
                ]
            },
            {
                title: 'Privacy and Account',
                items: [
                    {
                        question: 'Are my dream entries public?',
                        answer: 'No. Entries are private by default unless you explicitly share them.'
                    },
                    {
                        question: 'Can I delete my data?',
                        answer: 'Yes. You can manage content in account settings, and contact support for full data removal requests.'
                    },
                    {
                        question: 'Do subscriptions auto-renew?',
                        answer: 'Yes. You can manage or cancel renewal in your payment platform at any time.'
                    }
                ]
            }
        ];

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
                structuredData={faqJsonLd}
            />
            <div className="absolute top-0 left-0 w-full h-[420px] bg-gradient-to-b from-indigo-900/10 to-transparent pointer-events-none" />
            <div className="absolute top-[12%] left-[8%] w-64 h-64 bg-purple-500/10 rounded-full blur-[110px] pointer-events-none" />
            <div className="absolute bottom-[10%] right-[6%] w-80 h-80 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-5xl mx-auto relative z-10">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-6 backdrop-blur-sm">
                        <HelpCircle className="w-6 h-6 text-indigo-400" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
                        {isZh ? '梦境 FAQ' : 'Dream FAQ'}
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        {isZh
                            ? '围绕梦境解析、记录方法和数据隐私的常见问题。'
                            : 'Common questions about interpretation, journaling workflow, and data privacy.'}
                    </p>
                </div>

                <div className="grid gap-6">
                    {faqSections.map((section) => (
                        <section
                            key={section.title}
                            className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl"
                        >
                            <h2 className="text-xl font-semibold text-white mb-4">{section.title}</h2>
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
                        </section>
                    ))}
                </div>

                <section className="mt-10 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl">
                    <h2 className="text-lg font-semibold text-white mb-3">
                        {isZh ? '继续探索' : 'Continue Exploring'}
                    </h2>
                    <p className="text-sm text-slate-400 mb-4">
                        {isZh
                            ? '阅读梦境词典与解读指南，建立你自己的长期梦境记录体系。'
                            : 'Use the dream dictionary and guide to build a consistent long-term reflection workflow.'}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Link
                            to="/dream-meaning"
                            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
                        >
                            {isZh ? '梦境含义词典' : 'Dream meaning dictionary'}
                        </Link>
                        <Link
                            to="/dream-interpretation"
                            className="px-5 py-2.5 rounded-xl border border-indigo-500/30 text-indigo-200 text-sm font-semibold hover:bg-indigo-500/10 transition-colors"
                        >
                            {isZh ? '梦境解读指南' : 'Dream interpretation guide'}
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default FAQPage;
