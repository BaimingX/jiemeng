import React from 'react';
import { ShieldCheck, Lock, Database, Globe, UserCheck } from 'lucide-react';
import { Language } from '../types';
import Seo from './Seo';

interface PrivacyPolicyPageProps {
    language: Language;
}

const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ language }) => {
    const isZh = language === 'zh';
    const updatedDate = '2026-01-26';
    const seoTitle = isZh ? '隐私政策 | Oneiro AI' : 'Privacy Policy | Oneiro AI';
    const seoDescription = isZh
        ? '了解 Oneiro AI 如何收集、使用并保护你的个人信息。'
        : 'Learn how Oneiro AI collects, uses, and protects your information.';

    const sections = isZh
        ? [
            {
                title: '概览',
                paragraphs: [
                    '本隐私政策说明 Oneiro AI 如何收集、使用和保护你的信息。使用本服务即表示你理解并同意本政策。'
                ]
            },
            {
                title: '我们收集的信息',
                paragraphs: ['为提供服务与保障安全，我们可能收集以下信息：'],
                bullets: [
                    '用户提供的信息：邮箱、昵称、头像与梦境记录、反馈内容等。',
                    '自动收集的信息：设备型号、系统版本、日志、基础使用数据与分析数据。',
                    '敏感信息：梦境内容可能包含敏感信息，仅在你主动输入时收集。',
                    '订阅信息：付款由第三方服务处理（如应用商店/支付平台），我们不会保存完整支付卡信息。'
                ]
            },
            {
                title: '我们如何使用信息',
                bullets: [
                    '提供与维护服务（同步、保存、生成梦境解析与清醒梦洞见）。',
                    '进行 AI 自动化处理以生成解析结果并改进模型表现。',
                    '分析使用数据以优化体验与稳定性。',
                    '发送必要的服务通知或经同意后的营销信息。',
                    '管理订阅状态与客户支持。'
                ]
            },
            {
                title: '信息共享与披露',
                paragraphs: ['我们不会出售你的个人信息。以下情况可能共享：'],
                bullets: [
                    '与可信服务提供商合作（托管、存储、分析、AI 处理、支付与客服）。',
                    '依法配合监管、司法或合规要求。',
                    '发生并购或资产转移时的必要披露。',
                    '你主动选择公开分享内容（如公开梦境展示）。'
                ]
            },
            {
                title: '国际数据传输',
                paragraphs: [
                    '我们可能在不同国家/地区处理数据，并采取适当保护措施（如合规协议）以符合适用法律。'
                ]
            },
            {
                title: '数据安全',
                paragraphs: [
                    '我们采用加密传输、访问控制等措施保护数据安全，但任何系统都无法保证绝对安全。'
                ]
            },
            {
                title: '数据保留',
                paragraphs: [
                    '我们会在提供服务所必需的期限内保留你的信息。你删除账户或内容后，我们将按合理期限删除或匿名化处理。'
                ]
            },
            {
                title: '你的权利',
                bullets: [
                    '访问、更正或删除你的信息。',
                    '撤回同意、退订营销信息或关闭账户。',
                    '在适用法律下申请数据导出。',
                    '我们不会出售个人信息，并不会因行使权利而区别对待用户。'
                ]
            },
            {
                title: '未成年人',
                paragraphs: [
                    '本服务不面向 13 岁以下儿童。如你认为我们无意收集了儿童信息，请联系我们删除。'
                ]
            },
            {
                title: '第三方链接',
                paragraphs: [
                    '我们可能链接到第三方服务或内容，其隐私政策由其自行负责，请你自行查阅。'
                ]
            },
            {
                title: '政策更新',
                paragraphs: [
                    '我们可能不时更新本政策。重大变更将通过站内通知或邮件告知。'
                ]
            },
            {
                title: '联系我们',
                paragraphs: ['如有任何隐私问题，请联系：hello@oneiroai.com']
            }
        ]
        : [
            {
                title: 'Overview',
                paragraphs: [
                    'This Privacy Policy explains how Oneiro AI collects, uses, and protects your information. By using the service, you agree to this policy.'
                ]
            },
            {
                title: 'Information We Collect',
                paragraphs: ['We may collect the following to provide and secure the service:'],
                bullets: [
                    'User-provided data: email, display name, profile details, dream entries, and feedback.',
                    'Automatically collected data: device info, logs, usage analytics, and cookies where applicable.',
                    'Sensitive data: dream content may include sensitive details that you choose to provide.',
                    'Subscription data: payments are handled by third-party processors (app stores or payment providers). We do not store full card details.'
                ]
            },
            {
                title: 'How We Use Information',
                bullets: [
                    'Provide and maintain the service (syncing, saving, and generating interpretations).',
                    'Run AI processing to generate insights and improve model quality.',
                    'Analyze usage data to improve reliability and features.',
                    'Send service communications or marketing messages if you opt in.',
                    'Manage subscriptions and customer support.'
                ]
            },
            {
                title: 'Sharing and Disclosure',
                paragraphs: ['We do not sell your personal information. We may share data:'],
                bullets: [
                    'With trusted providers for hosting, storage, analytics, AI processing, payments, or support.',
                    'To comply with legal or regulatory requirements.',
                    'During a merger, acquisition, or asset transfer.',
                    'When you choose to share content publicly.'
                ]
            },
            {
                title: 'International Transfers',
                paragraphs: [
                    'We may process data in different countries and apply appropriate safeguards as required by law.'
                ]
            },
            {
                title: 'Data Security',
                paragraphs: [
                    'We use reasonable safeguards such as encryption in transit and access controls, but no method is 100% secure.'
                ]
            },
            {
                title: 'Data Retention',
                paragraphs: [
                    'We keep data as long as needed to provide the service. If you delete your account or content, we delete or anonymize it within a reasonable period.'
                ]
            },
            {
                title: 'Your Rights',
                bullets: [
                    'Access, update, or delete your information.',
                    'Withdraw consent, opt out of marketing, or close your account.',
                    'Request a data export where required by law.',
                    'We do not sell personal data and do not discriminate for exercising privacy rights.'
                ]
            },
            {
                title: 'Children\'s Privacy',
                paragraphs: [
                    'The service is not intended for children under 13. Contact us if you believe a child\'s data was collected.'
                ]
            },
            {
                title: 'Third-Party Links',
                paragraphs: [
                    'We may link to third-party services or content. Their privacy practices are governed by their own policies.'
                ]
            },
            {
                title: 'Policy Updates',
                paragraphs: [
                    'We may update this policy from time to time. Material changes will be communicated via the app or email.'
                ]
            },
            {
                title: 'Contact Us',
                paragraphs: ['Questions? Email us at hello@oneiroai.com']
            }
        ];

    return (
        <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-[#0B0F19] relative overflow-hidden">
            <Seo
                title={seoTitle}
                description={seoDescription}
                path="/privacy"
                lang={language}
            />
            <div className="absolute top-0 left-0 w-full h-[420px] bg-gradient-to-b from-indigo-900/10 to-transparent pointer-events-none" />
            <div className="absolute top-[10%] left-[6%] w-64 h-64 bg-purple-500/10 rounded-full blur-[110px] pointer-events-none" />
            <div className="absolute bottom-[10%] right-[6%] w-80 h-80 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-4 backdrop-blur-sm">
                        <ShieldCheck className="w-6 h-6 text-indigo-400" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">
                        {isZh ? '隐私政策' : 'Privacy Policy'}
                    </h1>
                    <p className="text-sm text-slate-500">
                        {isZh ? '更新日期' : 'Last updated'}: {updatedDate}
                    </p>
                </div>

                <div className="grid gap-6">
                    {sections.map((section) => (
                        <section key={section.title} className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl">
                            <div className="flex items-start gap-3">
                                <div className="mt-1 text-indigo-400">
                                    {section.title === (isZh ? '概览' : 'Overview') && <Lock className="w-5 h-5" />}
                                    {section.title === (isZh ? '我们收集的信息' : 'Information We Collect') && <Database className="w-5 h-5" />}
                                    {section.title === (isZh ? '信息共享与披露' : 'Sharing and Disclosure') && <UserCheck className="w-5 h-5" />}
                                    {section.title === (isZh ? '国际数据传输' : 'International Transfers') && <Globe className="w-5 h-5" />}
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-lg font-semibold text-white mb-2">
                                        {section.title}
                                    </h2>
                                    {section.paragraphs?.map((text) => (
                                        <p key={text} className="text-sm text-slate-400 leading-relaxed mb-3">
                                            {text}
                                        </p>
                                    ))}
                                    {section.bullets && (
                                        <ul className="space-y-2 text-sm text-slate-400 leading-relaxed list-disc pl-5">
                                            {section.bullets.map((item) => (
                                                <li key={item}>{item}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicyPage;
