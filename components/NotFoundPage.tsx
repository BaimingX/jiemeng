import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { Language } from '../types';
import Seo from './Seo';

interface NotFoundPageProps {
    language: Language;
}

const NotFoundPage: React.FC<NotFoundPageProps> = ({ language }) => {
    const location = useLocation();
    const isZh = language === 'zh';

    return (
        <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-[#0B0F19] relative overflow-hidden">
            <Seo
                title={isZh ? '页面未找到 | Oneiro AI' : 'Page Not Found | Oneiro AI'}
                description={isZh ? '请求的页面不存在。' : 'The requested page does not exist.'}
                path={location.pathname || '/404'}
                lang={language}
                noIndex={true}
            />
            <div className="max-w-3xl mx-auto relative z-10 text-center">
                <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-6 backdrop-blur-sm">
                    <AlertTriangle className="w-6 h-6 text-amber-400" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
                    {isZh ? '页面不存在' : 'Page not found'}
                </h1>
                <p className="text-slate-400 mb-8">
                    {isZh
                        ? '这个链接可能已失效，或者地址输入有误。'
                        : 'This link may be broken, or the address may be incorrect.'}
                </p>
                <Link
                    to="/"
                    className="inline-flex items-center px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
                >
                    {isZh ? '返回首页' : 'Back to Home'}
                </Link>
            </div>
        </div>
    );
};

export default NotFoundPage;
