import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, Heart, MessageSquare, Mail } from 'lucide-react';
import { Language } from '../types';

interface FooterProps {
    language: Language;
}

const Footer: React.FC<FooterProps> = ({ language }) => {
    const isEn = language === 'en';
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full bg-[#05080F] border-t border-slate-800/50 pt-16 pb-8 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-12">
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <img
                                src="/logo.svg"
                                alt="Oneiro AI"
                                className="w-8 h-8"
                                width={32}
                                height={32}
                                decoding="async"
                            />
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 to-indigo-400">
                                Oneiro AI
                            </span>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                            {isEn
                                ? 'Oneiro AI helps you interpret dreams, track patterns, and build a long-term reflection practice.'
                                : 'Oneiro AI 帮助你解读梦境、追踪长期模式，并建立持续的梦境反思习惯。'}
                        </p>
                        <div className="flex space-x-4 pt-2">
                            <a href="mailto:hello@oneiroai.com" className="text-slate-500 hover:text-indigo-400 transition-colors" aria-label="Email">
                                <Mail size={20} />
                            </a>
                            <a href="https://oneiroai.com" className="text-slate-500 hover:text-indigo-400 transition-colors" aria-label="Website">
                                <Globe size={20} />
                            </a>
                            <Link to="/about" className="text-slate-500 hover:text-indigo-400 transition-colors" aria-label="About">
                                <MessageSquare size={20} />
                            </Link>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-slate-200 font-semibold mb-6">
                            {isEn ? 'Explore' : '探索'}
                        </h3>
                        <ul className="space-y-3">
                            <li>
                                <Link to="/" className="text-slate-400 hover:text-indigo-400 text-sm transition-colors">
                                    {isEn ? 'Home' : '首页'}
                                </Link>
                            </li>
                            <li>
                                <Link to="/dream-meaning" className="text-slate-400 hover:text-indigo-400 text-sm transition-colors">
                                    {isEn ? 'Dream Meanings' : '梦境含义'}
                                </Link>
                            </li>
                            <li>
                                <Link to="/dream-interpretation" className="text-slate-400 hover:text-indigo-400 text-sm transition-colors">
                                    {isEn ? 'Dream Guide' : '梦境指南'}
                                </Link>
                            </li>
                            <li>
                                <Link to="/gallery" className="text-slate-400 hover:text-indigo-400 text-sm transition-colors">
                                    {isEn ? 'Dream Gallery' : '梦境画廊'}
                                </Link>
                            </li>
                            <li>
                                <Link to="/faq" className="text-slate-400 hover:text-indigo-400 text-sm transition-colors">
                                    {isEn ? 'Dream FAQ' : '梦境 FAQ'}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-slate-200 font-semibold mb-6">
                            {isEn ? 'Support' : '支持'}
                        </h3>
                        <ul className="space-y-3">
                            <li>
                                <Link to="/about" className="text-slate-400 hover:text-indigo-400 text-sm transition-colors">
                                    {isEn ? 'About Oneiro AI' : '关于 Oneiro AI'}
                                </Link>
                            </li>
                            <li>
                                <Link to="/subscribe" className="text-slate-400 hover:text-indigo-400 text-sm transition-colors">
                                    {isEn ? 'Pricing & Plans' : '订阅计划'}
                                </Link>
                            </li>
                            <li>
                                <Link to="/feedback" className="text-slate-400 hover:text-indigo-400 text-sm transition-colors flex items-center gap-2">
                                    <MessageSquare size={14} />
                                    {isEn ? 'Feedback' : '反馈建议'}
                                </Link>
                            </li>
                            <li>
                                <Link to="/privacy" className="text-slate-400 hover:text-indigo-400 text-sm transition-colors">
                                    {isEn ? 'Privacy Policy' : '隐私政策'}
                                </Link>
                            </li>
                            <li>
                                <Link to="/terms" className="text-slate-400 hover:text-indigo-400 text-sm transition-colors">
                                    {isEn ? 'Terms of Service' : '服务条款'}
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-800/50 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-sm">
                    <div className="text-slate-500">
                        <span>&copy; {currentYear} Oneiro AI. All rights reserved.</span>
                    </div>

                    <div className="flex items-center text-slate-500 text-sm">
                        <span>Made with</span>
                        <Heart className="w-4 h-4 mx-1.5 text-red-500/80 fill-red-500/20" />
                        <span>for Dreamers</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
