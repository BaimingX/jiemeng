import React from 'react';
import { Link } from 'react-router-dom';
import {
    Github,
    Twitter,
    Globe,
    Heart,
    MessageSquare
} from 'lucide-react';
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
                    {/* Brand Column */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <img src="/logo.svg" alt="Oneiro AI" className="w-8 h-8" />
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 to-indigo-400">
                                Oneiro AI
                            </span>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                            {isEn
                                ? "Oneiro AI unlocks dream meaning through AI-powered dream interpretation, dream symbols, and a personal dream journal for lucid dreaming insights."
                                : "Oneiro AI 通过 AI 驱动的梦境解析、梦境符号与个人梦境日记，帮助你理解梦境含义与清醒梦洞见。"}
                        </p>
                        <div className="flex space-x-4 pt-2">
                            <a href="#" className="text-slate-500 hover:text-indigo-400 transition-colors">
                                <Twitter size={20} />
                            </a>
                            <a href="#" className="text-slate-500 hover:text-indigo-400 transition-colors">
                                <Github size={20} />
                            </a>
                            <a href="https://oneiroai.com" className="text-slate-500 hover:text-indigo-400 transition-colors">
                                <Globe size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-slate-200 font-semibold mb-6 flex items-center">
                            {isEn ? "Explore" : "探索"}
                        </h3>
                        <ul className="space-y-3">
                            <li>
                                <Link to="/" className="text-slate-400 hover:text-indigo-400 text-sm transition-colors flex items-center">
                                    {isEn ? "Home" : "首页"}
                                </Link>
                            </li>
                            <li>
                                <Link to="/dream-meaning" className="text-slate-400 hover:text-indigo-400 text-sm transition-colors flex items-center">
                                    {isEn ? "Dream Meanings" : "梦境含义"}
                                </Link>
                            </li>
                            <li>
                                <Link to="/gallery" className="text-slate-400 hover:text-indigo-400 text-sm transition-colors flex items-center">
                                    {isEn ? "Dream Gallery" : "梦境画廊"}
                                </Link>
                            </li>
                            <li>
                                <Link to="/map" className="text-slate-400 hover:text-indigo-400 text-sm transition-colors flex items-center">
                                    {isEn ? "Dream Map" : "梦境地图"}
                                </Link>
                            </li>
                            <li>
                                <Link to="/journal" className="text-slate-400 hover:text-indigo-400 text-sm transition-colors flex items-center">
                                    {isEn ? "My Journal" : "我的日记"}
                                </Link>
                            </li>
                            <li>
                                <Link to="/markets" className="text-slate-400 hover:text-indigo-400 text-sm transition-colors flex items-center">
                                    {isEn ? "Markets" : "全球市场"}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Community & Support */}
                    <div>
                        <h3 className="text-slate-200 font-semibold mb-6">
                            {isEn ? "Community" : "社区"}
                        </h3>
                        <ul className="space-y-3">
                            <li>
                                <Link to="/subscribe" className="text-slate-400 hover:text-indigo-400 text-sm transition-colors flex items-center">
                                    {isEn ? "Pricing & Plans" : "订阅计划"}
                                </Link>
                            </li>
                            <li>
                                <Link to="/feedback" className="text-slate-400 hover:text-indigo-400 text-sm transition-colors flex items-center group">
                                    <MessageSquare size={14} className="mr-2 group-hover:text-indigo-400" />
                                    {isEn ? "Feedback & Proposals" : "反馈与建议"}
                                </Link>
                            </li>
                            <li>
                                <Link to="/faq" className="text-slate-400 hover:text-indigo-400 text-sm transition-colors flex items-center">
                                    {isEn ? "FAQ" : "常见问题"}
                                </Link>
                            </li>
                            <li>
                                <Link to="/profile" className="text-slate-400 hover:text-indigo-400 text-sm transition-colors flex items-center">
                                    {isEn ? "User Profile" : "用户资料"}
                                </Link>
                            </li>
                        </ul>
                    </div>

                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-slate-800/50 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-sm">
                    <div className="text-slate-500 flex flex-wrap justify-center md:justify-start gap-4">
                        <span>© {currentYear} Oneiro AI. All rights reserved.</span>
                        <span className="hidden md:inline text-slate-700">|</span>
                        <Link to="/privacy" className="hover:text-indigo-400 transition-colors">
                            {isEn ? "Privacy Policy" : "隐私政策"}
                        </Link>
                        <Link to="/terms" className="hover:text-indigo-400 transition-colors">
                            {isEn ? "Terms of Service" : "服务条款"}
                        </Link>
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
