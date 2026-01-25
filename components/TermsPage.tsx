import React from 'react';
import { FileText, Shield, CreditCard, AlertTriangle } from 'lucide-react';
import { Language } from '../types';
import Seo from './Seo';

interface TermsPageProps {
    language: Language;
}

const TermsPage: React.FC<TermsPageProps> = ({ language }) => {
    const isZh = language === 'zh';
    const updatedDate = '2026-01-26';
    const seoTitle = isZh ? '服务条款 | Oneiro AI' : 'Terms of Service | Oneiro AI';
    const seoDescription = isZh
        ? '查看 Oneiro AI 服务条款、订阅说明与使用规范。'
        : 'Review Oneiro AI terms, subscriptions, and usage policies.';

    const sections = isZh
        ? [
            {
                title: '接受条款',
                paragraphs: [
                    '访问或使用 Oneiro AI 即表示你同意本服务条款。如不同意，请勿使用本服务。'
                ]
            },
            {
                title: '服务说明',
                paragraphs: [
                    'Oneiro AI 提供 AI 驱动的梦境解析与梦境日记功能，仅供个人理解与自我反思使用，并非医疗或专业诊断服务。'
                ]
            },
            {
                title: '账号与资格',
                paragraphs: [
                    '你需提供准确的账号信息并妥善保管登录凭据。你确认自己已达到使用本服务的最低年龄要求。'
                ]
            },
            {
                title: '订阅与付款',
                paragraphs: [
                    '订阅由第三方平台处理（如 Apple/Google 应用商店）。订阅会自动续订，除非你在下一计费周期前取消。',
                    '取消订阅需在对应平台完成，删除应用不会取消订阅。',
                    '我们不直接保存支付信息。如价格或方案变更，我们会提前通知。'
                ]
            },
            {
                title: '免费试用与取消',
                paragraphs: [
                    '如提供免费试用，试用期结束后会自动转为付费订阅，除非提前取消。'
                ]
            },
            {
                title: '用户内容与授权',
                paragraphs: [
                    '你保留对梦境内容的所有权。你授权我们在提供服务所需范围内存储、处理和分析该内容。'
                ]
            },
            {
                title: '禁止行为',
                bullets: [
                    '上传违法、侵权或有害内容。',
                    '干扰服务运行、爬取、反向工程或滥用平台。',
                    '冒充他人或未经授权使用他人账号。'
                ]
            },
            {
                title: '知识产权',
                paragraphs: [
                    '除你提交的内容外，应用、算法、界面与解析内容归 Oneiro AI 或其许可方所有，未经许可不得复制或分发。'
                ]
            },
            {
                title: '免责声明与责任限制',
                paragraphs: [
                    '服务按"现状"提供，解析内容仅供参考与自我反思。我们不保证结果的准确性或服务持续可用。',
                    '在法律允许范围内，我们对间接、附带或后果性损失不承担责任。'
                ]
            },
            {
                title: '终止与暂停',
                paragraphs: [
                    '如你违反条款或滥用服务，我们可暂停或终止访问权限。你可以随时停止使用并删除账户。'
                ]
            },
            {
                title: '应用商店条款',
                paragraphs: [
                    '本条款由你与 Oneiro AI 达成，Apple/Google 并非条款当事方，但可作为第三方受益人执行相关条款。'
                ]
            },
            {
                title: '赔偿',
                paragraphs: [
                    '若你因违反条款或不当使用造成损失或索赔，你同意赔偿 Oneiro AI 的相关损失与费用。'
                ]
            },
            {
                title: '适用法律',
                paragraphs: [
                    '本条款适用 Oneiro AI 主要运营地的法律，并在法律允许范围内解决争议。'
                ]
            },
            {
                title: '条款更新',
                paragraphs: [
                    '我们可能更新本条款。重大变更将通过站内通知或邮件告知。'
                ]
            },
            {
                title: '联系我们',
                paragraphs: ['如有问题，请联系 hello@oneiroai.com']
            }
        ]
        : [
            {
                title: 'Acceptance',
                paragraphs: [
                    'By accessing or using Oneiro AI, you agree to these Terms of Service. If you do not agree, do not use the service.'
                ]
            },
            {
                title: 'Service Description',
                paragraphs: [
                    'Oneiro AI provides AI-powered dream interpretation and journaling for personal reflection only. It is not medical or professional advice.'
                ]
            },
            {
                title: 'Account & Eligibility',
                paragraphs: [
                    'You must provide accurate account details and safeguard your credentials. You confirm that you meet the minimum age requirements to use the service.'
                ]
            },
            {
                title: 'Subscriptions & Payments',
                paragraphs: [
                    'Subscriptions are processed by third-party platforms (Apple/Google app stores). Subscriptions automatically renew unless canceled before the next billing cycle.',
                    'You must manage cancellations through the respective platform. Deleting the app does not cancel a subscription.',
                    'We do not store payment details. We may update pricing with advance notice.'
                ]
            },
            {
                title: 'Trials & Cancellation',
                paragraphs: [
                    'If a free trial is offered, it converts to a paid subscription unless canceled before the trial ends.'
                ]
            },
            {
                title: 'User Content & License',
                paragraphs: [
                    'You retain ownership of content you submit. You grant us a license to store, process, and analyze it to provide the service.'
                ]
            },
            {
                title: 'Prohibited Use',
                bullets: [
                    'Upload unlawful, infringing, or harmful content.',
                    'Interfere with the service, scrape, reverse engineer, or abuse the platform.',
                    'Impersonate others or use another person\'s account.'
                ]
            },
            {
                title: 'Intellectual Property',
                paragraphs: [
                    'Except for your content, the app, algorithms, UI, and interpretations are owned by Oneiro AI or its licensors and may not be reused without permission.'
                ]
            },
            {
                title: 'Disclaimer & Limitation of Liability',
                paragraphs: [
                    'The service is provided \"as is\" and interpretations are informational only. We do not guarantee accuracy or uninterrupted availability.',
                    'To the fullest extent permitted by law, we are not liable for indirect, incidental, or consequential damages.'
                ]
            },
            {
                title: 'Termination',
                paragraphs: [
                    'We may suspend or terminate access if you violate these terms or misuse the service. You may stop using the service at any time.'
                ]
            },
            {
                title: 'App Store Terms',
                paragraphs: [
                    'These terms are between you and Oneiro AI. Apple/Google are not parties to this agreement but may enforce it as third-party beneficiaries.'
                ]
            },
            {
                title: 'Indemnification',
                paragraphs: [
                    'You agree to indemnify Oneiro AI from claims arising out of your misuse of the service or violation of these terms.'
                ]
            },
            {
                title: 'Governing Law',
                paragraphs: [
                    'These terms are governed by the laws of Oneiro AI\'s primary place of business, subject to mandatory local consumer protections.'
                ]
            },
            {
                title: 'Updates',
                paragraphs: [
                    'We may update these terms from time to time. Material changes will be communicated via the app or email.'
                ]
            },
            {
                title: 'Contact',
                paragraphs: ['Questions? Email hello@oneiroai.com']
            }
        ];

    return (
        <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-[#0B0F19] relative overflow-hidden">
            <Seo
                title={seoTitle}
                description={seoDescription}
                path="/terms"
                lang={language}
            />
            <div className="absolute top-0 left-0 w-full h-[420px] bg-gradient-to-b from-indigo-900/10 to-transparent pointer-events-none" />
            <div className="absolute top-[10%] left-[6%] w-64 h-64 bg-purple-500/10 rounded-full blur-[110px] pointer-events-none" />
            <div className="absolute bottom-[10%] right-[6%] w-80 h-80 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-4 backdrop-blur-sm">
                        <FileText className="w-6 h-6 text-indigo-400" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">
                        {isZh ? '服务条款' : 'Terms of Service'}
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
                                    {section.title === (isZh ? '服务说明' : 'Service Description') && <Shield className="w-5 h-5" />}
                                    {section.title === (isZh ? '订阅与付款' : 'Subscriptions & Payments') && <CreditCard className="w-5 h-5" />}
                                    {section.title === (isZh ? '免责声明与责任限制' : 'Disclaimer & Limitation of Liability') && <AlertTriangle className="w-5 h-5" />}
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

export default TermsPage;
