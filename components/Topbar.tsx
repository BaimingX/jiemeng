import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Globe, LogIn, User as UserIcon, BookOpen, Map as MapIcon, Image as ImageIcon, Home, FileText, Download, LogOut, ChevronDown, User, Crown, CreditCard, CloudDownload, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Language } from '../types';
import { restoreFromSupabase } from '../services/dreamDB';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmModal from './ConfirmModal';
import Toast, { ToastType } from './Toast';

interface TopbarProps {
    language: Language;
    onToggleLanguage: () => void;
    onOpenLogin: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ language, onToggleLanguage, onOpenLogin }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, profile, billingStatus, signOut, openCheckout } = useAuth();
    const isEn = language === 'en';
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [showSyncConfirm, setShowSyncConfirm] = useState(false);
    const [toast, setToast] = useState<{ show: boolean; message: string; type: ToastType }>({
        show: false,
        message: '',
        type: 'info'
    });

    // Public Navigation (Center)
    const navItems = [
        { label: isEn ? 'Home' : '首页', path: '/', icon: <Home size={16} /> },
        { label: isEn ? 'Gallery' : '梦境图廊', path: '/gallery', icon: <ImageIcon size={16} /> },
        { label: isEn ? 'Blog' : '博客', path: '#', icon: <FileText size={16} />, isDisabled: true },
        { label: isEn ? 'App' : 'App', path: '#', icon: <Download size={16} />, isDisabled: true },
    ];

    // User Menu Items (Dropdown)
    const userMenuItems = [
        { label: isEn ? 'Dream Journal' : '梦境日记', path: '/journal', icon: <BookOpen size={16} /> },
        { label: isEn ? 'Dream Map' : '梦境地图', path: '/map', icon: <MapIcon size={16} /> },
    ];

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNavClick = (path: string, isDisabled?: boolean) => {
        if (isDisabled) return;
        navigate(path);
    };

    const handleLogout = async () => {
        await signOut();
        setIsDropdownOpen(false);
        navigate('/');
    };

    const showToast = (message: string, type: ToastType = 'info') => {
        setToast({ show: true, message, type });
    };

    const handleSyncConfirm = async () => {
        setShowSyncConfirm(false);
        setIsSyncing(true);
        try {
            await restoreFromSupabase();
            showToast(isEn ? 'Sync complete' : '同步完成', 'success');
        } catch (e) {
            showToast(isEn ? 'Sync failed' : '同步失败', 'error');
        } finally {
            setIsSyncing(false);
        }
    };

    const statusLabel = (() => {
        if (!billingStatus) return null;
        if (billingStatus.access === 'lifetime') {
            return isEn ? 'Status: Lifetime' : '状态：终身会员';
        }
        if (billingStatus.access === 'subscription') {
            return billingStatus.isActive
                ? (isEn ? 'Status: Subscription active' : '状态：订阅中')
                : (isEn ? 'Status: Subscription inactive' : '状态：订阅已停用');
        }
        return isEn ? 'Status: Free' : '状态：免费';
    })();

    const statusExpiry = billingStatus?.access === 'subscription' && billingStatus?.isActive && billingStatus?.expiresAt
        ? (isEn
            ? `Renews on ${new Date(billingStatus.expiresAt).toLocaleDateString('en-US')}`
            : `有效期至 ${new Date(billingStatus.expiresAt).toLocaleDateString('zh-CN')}`)
        : null;

    return (
        <>
            <Toast
                isVisible={toast.show}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast(prev => ({ ...prev, show: false }))}
            />
            <ConfirmModal
                isOpen={showSyncConfirm}
                onClose={() => setShowSyncConfirm(false)}
                onConfirm={handleSyncConfirm}
                title={isEn ? 'Sync Records' : '同步数据'}
                message={isEn ? 'Sync data from cloud? This will overwrite local records.' : '确定从云端同步吗？这将覆盖本地记录。'}
                confirmText={isEn ? 'Sync' : '同步'}
                cancelText={isEn ? 'Cancel' : '取消'}
            />
            <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4">
                <div className="w-full max-w-6xl bg-[#0B0F19]/80 backdrop-blur-xl border border-white/5 rounded-full px-6 h-16 flex items-center justify-between shadow-2xl shadow-black/50">
                    {/* Logo Section */}
                    <div
                        className="flex items-center gap-3 cursor-pointer group"
                        onClick={() => navigate('/')}
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
                            <img
                                src="/logo.svg"
                                alt="Oneiro AI"
                                className="relative w-9 h-9"
                            />
                        </div>
                        <span className="font-serif text-lg tracking-wide text-indigo-50 group-hover:text-white transition-colors hidden sm:block">
                            Oneiro AI
                        </span>
                    </div>

                    {/* Center Navigation - Public */}
                    <nav className="hidden md:flex items-center gap-1 absolute left-1/2 transform -translate-x-1/2">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <button
                                    key={item.label}
                                    onClick={() => handleNavClick(item.path, item.isDisabled)}
                                    disabled={item.isDisabled}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 relative group
                                        ${isActive
                                            ? 'text-white'
                                            : item.isDisabled
                                                ? 'text-slate-600 cursor-not-allowed'
                                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {item.icon}
                                    <span>{item.label}</span>
                                    {isActive && (
                                        <motion.div
                                            layoutId="nav-pill"
                                            className="absolute inset-0 bg-white/10 rounded-full border border-white/5"
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                    {item.isDisabled && (
                                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-slate-700/50 rounded-full" />
                                    )}
                                </button>
                            );
                        })}

                        {/* Subscribe Button - Visible to all except lifetime users */}
                        {(!user || billingStatus?.access !== 'lifetime') && (
                            <button
                                onClick={() => navigate('/subscribe')}
                                className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/30 transition-all ml-2"
                            >
                                <Crown size={14} />
                                <span>{isEn ? 'Subscribe' : '订阅'}</span>
                            </button>
                        )}
                    </nav>

                    {/* Right Actions - User & Language */}
                    <div className="flex items-center gap-3">
                        {/* Language Toggle - Compact */}
                        <button
                            onClick={onToggleLanguage}
                            className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-colors font-medium text-sm"
                            title={isEn ? "Switch to Chinese" : "切换到中文"}
                        >
                            {isEn ? "EN" : "中"}
                        </button>

                        {/* Authentication State */}
                        {user ? (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className={`flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border transition-all duration-300 ${isDropdownOpen ? 'bg-white/10 border-indigo-500/50' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                                >
                                    <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300 text-xs font-bold border border-indigo-500/30 overflow-hidden">
                                        {profile?.avatar_url ? (
                                            <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            (profile?.display_name || user.email || 'U').charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <span className="text-xs text-slate-300 max-w-[80px] truncate hidden md:block">
                                        {profile?.display_name || 'User'}
                                    </span>
                                    <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Dropdown Menu */}
                                <AnimatePresence>
                                    {isDropdownOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute right-0 top-full mt-3 w-56 bg-[#131926] border border-white/10 rounded-2xl shadow-xl overflow-hidden backdrop-blur-3xl z-50"
                                        >
                                            {/* Billing Status Section */}
                                            <div className="p-4 border-b border-white/5 bg-white/5">
                                                {billingStatus?.access === 'lifetime' ? (
                                                    <div className="flex items-center gap-2">
                                                        <Crown size={16} className="text-amber-400" />
                                                        <span className="text-xs font-medium text-amber-400">
                                                            {isEn ? 'Lifetime Access' : '终身会员'}
                                                        </span>
                                                    </div>
                                                ) : billingStatus?.access === 'subscription' && billingStatus?.isActive ? (
                                                    <div className="flex items-center gap-2">
                                                        <Crown size={16} className="text-indigo-400" />
                                                        <span className="text-xs font-medium text-indigo-400">
                                                            {isEn ? 'Premium Subscriber' : '订阅会员'}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-xs text-slate-400 uppercase tracking-wider">
                                                                {isEn ? 'Free Trials' : '剩余解梦'}
                                                            </span>
                                                            <span className="text-xs font-medium text-amber-400">
                                                                {billingStatus?.trialRemaining ?? 5} / {billingStatus?.trialLimit ?? 5}
                                                            </span>
                                                        </div>
                                                        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-amber-400 rounded-full transition-all duration-300"
                                                                style={{ width: `${((billingStatus?.trialRemaining ?? 5) / (billingStatus?.trialLimit ?? 5)) * 100}%` }}
                                                            />
                                                        </div>
                                                    </>
                                                )}
                                                {statusLabel && (
                                                    <div className="mt-2 text-[11px] text-slate-400">
                                                        {statusLabel}
                                                    </div>
                                                )}
                                                {statusExpiry && (
                                                    <div className="text-[11px] text-slate-500">
                                                        {statusExpiry}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="p-1.5">
                                                {/* Subscribe/Upgrade Button */}
                                                {billingStatus?.access !== 'lifetime' && (
                                                    <button
                                                        onClick={() => {
                                                            setIsDropdownOpen(false);
                                                            navigate('/subscribe');
                                                        }}
                                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 hover:from-indigo-500/30 hover:to-purple-500/30 border border-indigo-500/20 transition-all mb-1"
                                                    >
                                                        <CreditCard size={16} />
                                                        {billingStatus?.access === 'subscription'
                                                            ? (isEn ? 'Manage Subscription' : '管理订阅')
                                                            : (isEn ? 'Upgrade to Premium' : '升级会员')
                                                        }
                                                    </button>
                                                )}

                                                {userMenuItems.map((item) => (
                                                    <button
                                                        key={item.path}
                                                        onClick={() => {
                                                            navigate(item.path);
                                                            setIsDropdownOpen(false);
                                                        }}
                                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${location.pathname === item.path ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
                                                    >
                                                        {item.icon}
                                                        {item.label}
                                                    </button>
                                                ))}
                                                <div className="h-px bg-white/5 my-1.5" />

                                                <button
                                                    onClick={() => {
                                                        navigate('/profile');
                                                        setIsDropdownOpen(false);
                                                    }}
                                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                                                >
                                                    <User size={16} />
                                                    {isEn ? 'Personal Management' : '个人管理'}
                                                </button>

                                                <button
                                                    onClick={() => setShowSyncConfirm(true)}
                                                    disabled={isSyncing}
                                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                                                >
                                                    {isSyncing ? <Loader2 size={16} className="animate-spin" /> : <CloudDownload size={16} />}
                                                    {isEn ? 'Sync Records' : '同步记录'}
                                                </button>

                                                <div className="h-px bg-white/5 my-1.5" />
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                                                >
                                                    <LogOut size={16} />
                                                    {isEn ? 'Logout' : '退出登录'}
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <button
                                onClick={onOpenLogin}
                                className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40"
                            >
                                <LogIn size={14} />
                                <span>{isEn ? 'Login' : '登录'}</span>
                            </button>
                        )}
                    </div>
                </div >
            </header >
        </>
    );
};

export default Topbar;
