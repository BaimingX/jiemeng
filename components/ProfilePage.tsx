import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    User, Mail, Crown, Calendar, Sparkles,
    Settings, LogOut, CloudDownload, ChevronRight,
    Shield, BarChart3, CreditCard, Loader2, Edit
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Language } from '../types';
import { getConversationDates, restoreFromSupabase } from '../services/dreamDB';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from './ConfirmModal';
import EditProfileModal from './EditProfileModal';
import Seo from './Seo';

interface ProfilePageProps {
    language: Language;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ language }) => {
    const { user, profile, billingStatus, signOut } = useAuth();
    // Force refresh profile logic could be here, or rely on AuthContext auto-refresh if mapped.
    // Ideally update auth context profile data after edit. For now we might just reload page or trust props update.

    const navigate = useNavigate();
    const isEn = language === 'en';
    const seoTitle = isEn ? 'User Profile | Oneiro AI' : '用户资料 | Oneiro AI';
    const seoDescription = isEn
        ? 'Manage your Oneiro AI profile, subscription, and sync settings.'
        : '管理你的 Oneiro AI 账户、订阅与同步设置。';
    const seo = (
        <Seo
            title={seoTitle}
            description={seoDescription}
            path="/profile"
            lang={language}
            noIndex={true}
        />
    );

    const [stats, setStats] = useState({
        totalDreams: 0,
    });
    const [isSyncing, setIsSyncing] = useState(false);
    const [showSyncConfirm, setShowSyncConfirm] = useState(false);
    const [showEditProfile, setShowEditProfile] = useState(false);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const dates = await getConversationDates();
                setStats({
                    totalDreams: dates.length
                });
            } catch (e) {
                console.error(e);
            }
        };
        loadStats();
    }, []);

    const handleSyncConfirm = async () => {
        setShowSyncConfirm(false);
        setIsSyncing(true);
        try {
            await restoreFromSupabase();
            const dates = await getConversationDates();
            setStats({ totalDreams: dates.length });
            alert(isEn ? 'Sync complete' : '同步完成');
        } catch (e) {
            alert(isEn ? 'Sync failed' : '同步失败');
        } finally {
            setIsSyncing(false);
        }
    };

    const handleLogout = async () => {
        await signOut();
        navigate('/');
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center text-slate-400">
                {seo}
                {isEn ? 'Please login to view profile.' : '请先登录查看个人资料。'}
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-[#0B0F19] text-slate-200 p-6 md:p-12 relative overflow-hidden">
            {seo}
            <ConfirmModal
                isOpen={showSyncConfirm}
                onClose={() => setShowSyncConfirm(false)}
                onConfirm={handleSyncConfirm}
                title={isEn ? 'Sync Records' : '同步数据'}
                message={isEn ? 'Sync data from cloud? This handles conflict resolution by overwriting local with cloud.' : '确定从云端同步吗？这将覆盖本地记录。'}
                confirmText={isEn ? 'Sync' : '同步'}
                cancelText={isEn ? 'Cancel' : '取消'}
            />

            <EditProfileModal
                isOpen={showEditProfile}
                onClose={() => setShowEditProfile(false)}
                language={language}
                currentName={profile?.display_name || ''}
                currentAvatarUrl={profile?.avatar_url}
                onUpdateSuccess={() => {
                    // Ideally trigger a refresh in context, but for now a simple reload or state visual update
                    // We will rely on window reload to be safe and simple to refetch context
                    window.location.reload();
                }}
            />

            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-900/10 rounded-full blur-[100px] pointer-events-none" />

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="max-w-4xl mx-auto relative z-10 space-y-8"
            >
                {/* Header Section */}
                <motion.div variants={item} className="flex flex-col md:flex-row items-center gap-6 md:gap-8 pb-8 border-b border-white/5">
                    <div className="relative group">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full p-1 bg-gradient-to-br from-indigo-500 to-purple-500 shadow-2xl shadow-indigo-500/20 overflow-hidden">
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt="Profile" className="w-full h-full rounded-full object-cover bg-[#131926]" />
                            ) : (
                                <div className="w-full h-full rounded-full bg-[#131926] flex items-center justify-center text-4xl font-bold text-indigo-300">
                                    {(profile?.display_name || user.email || 'U').charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => setShowEditProfile(true)}
                            className="absolute bottom-0 right-0 p-2 bg-indigo-500 hover:bg-indigo-600 rounded-full text-white shadow-lg transition-colors"
                        >
                            <Edit size={16} />
                        </button>
                    </div>

                    <div className="text-center md:text-left space-y-2 flex-1">
                        <div className="flex items-center justify-center md:justify-start gap-3">
                            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                                {profile?.display_name || (isEn ? 'Dreamer' : '造梦者')}
                            </h1>
                        </div>

                        <div className="flex items-center justify-center md:justify-start gap-2 text-slate-400 text-sm">
                            <Mail size={14} />
                            <span>{user.email}</span>
                        </div>
                        <div className="flex items-center justify-center md:justify-start gap-3 mt-3">
                            {billingStatus?.access === 'lifetime' ? (
                                <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-medium border border-amber-500/20 flex items-center gap-1.5">
                                    <Crown size={12} />
                                    {isEn ? 'Lifetime Member' : '终身会员'}
                                </span>
                            ) : billingStatus?.isActive ? (
                                <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-medium border border-indigo-500/20 flex items-center gap-1.5">
                                    <Sparkles size={12} />
                                    {isEn ? 'Pro Member' : '专业版会员'}
                                </span>
                            ) : (
                                <span className="px-3 py-1 rounded-full bg-slate-700/30 text-slate-400 text-xs font-medium border border-slate-600/30">
                                    {isEn ? 'Free Plan' : '免费版'}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowSyncConfirm(true)}
                            disabled={isSyncing}
                            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 transition-all text-sm font-medium flex items-center gap-2"
                        >
                            {isSyncing ? <Loader2 size={16} className="animate-spin" /> : <CloudDownload size={16} />}
                            {isEn ? 'Sync' : '同步数据'}
                        </button>
                    </div>
                </motion.div>

                {/* Stats Grid - Reduced to 2 columns */}
                <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#1A2133]/60 backdrop-blur-md rounded-2xl p-6 border border-white/5 hover:border-indigo-500/30 transition-colors group">
                        <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
                            <BarChart3 size={20} />
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">{stats.totalDreams}</div>
                        <div className="text-xs text-slate-500 uppercase tracking-widest">{isEn ? 'Total Dreams' : '梦境总数'}</div>
                    </div>

                    <div className="bg-[#1A2133]/60 backdrop-blur-md rounded-2xl p-6 border border-white/5 hover:border-purple-500/30 transition-colors group">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform">
                            <Calendar size={20} />
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">{profile?.created_at ? new Date(profile.created_at).getFullYear() : 2024}</div>
                        <div className="text-xs text-slate-500 uppercase tracking-widest">{isEn ? 'Member Since' : '加入年份'}</div>
                    </div>
                </motion.div>

                {/* Settings / Menu */}
                <motion.div variants={item} className="space-y-4">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">
                        {isEn ? 'Management' : '账号管理'}
                    </h3>

                    <div className="bg-[#1A2133]/40 rounded-2xl border border-white/5 divide-y divide-white/5 overflow-hidden">
                        <button
                            onClick={() => navigate('/subscribe')}
                            className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors group text-left"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
                                    <CreditCard size={18} />
                                </div>
                                <div>
                                    <div className="text-slate-200 font-medium">{isEn ? 'Subscription & Billing' : '订阅与账单'}</div>
                                    <div className="text-xs text-slate-500">{isEn ? 'Manage your plan and payment methods' : '管理您的会员计划和支付方式'}</div>
                                </div>
                            </div>
                            <ChevronRight size={16} className="text-slate-600 group-hover:text-slate-300" />
                        </button>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full mt-8 p-4 rounded-2xl border border-red-500/10 text-red-400 hover:bg-red-500/5 hover:border-red-500/20 transition-all flex items-center justify-center gap-2 font-medium"
                    >
                        <LogOut size={18} />
                        {isEn ? 'Sign Out' : '退出登录'}
                    </button>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default ProfilePage;
