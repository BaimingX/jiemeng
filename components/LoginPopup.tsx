import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, AlertCircle, Loader2, UserPlus, Eye, EyeOff, X } from 'lucide-react';
import { Language } from '../types';

interface LoginPopupProps {
    isOpen: boolean;
    onClose: () => void;
    language: Language;
}

const LoginPopup: React.FC<LoginPopupProps> = ({ isOpen, onClose, language }) => {
    const isEn = language === 'en';
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const { signInWithEmail, signUp } = useAuth();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            if (isSignUp) {
                if (password !== confirmPassword) {
                    setError(isEn ? "Passwords do not match" : "两次输入的密码不一致");
                    setLoading(false);
                    return;
                }
                const { error } = await signUp(email, password, displayName);
                if (error) {
                    setError(error.message);
                } else {
                    setMessage(isEn ? 'Account created! Please check your email.' : '账号创建成功！请查收邮件确认。');
                    setTimeout(() => {
                        setIsSignUp(false);
                        setMessage(null);
                    }, 3000);
                }
            } else {
                const { error } = await signInWithEmail(email, password);
                if (error) {
                    setError(error.message);
                } else {
                    onClose();
                }
            }
        } catch (err: any) {
            setError(err.message || (isEn ? 'An unexpected error occurred' : '发生未知错误'));
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsSignUp(!isSignUp);
        setError(null);
        setMessage(null);
        setConfirmPassword('');
        setPassword('');
        setDisplayName('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl transform transition-all overflow-hidden flex flex-col max-h-[90vh]">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors z-10"
                >
                    <X size={20} />
                </button>

                <div className="p-8 overflow-y-auto">
                    <div className="text-center mb-8">
                        <div className="mx-auto h-12 w-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mb-4">
                            {isSignUp ? <UserPlus size={24} /> : <LogIn size={24} />}
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                            {isSignUp
                                ? (isEn ? 'Create account' : '创建新账号')
                                : (isEn ? 'Welcome back' : '欢迎回来')}
                        </h2>
                        <p className="mt-2 text-sm text-slate-600">
                            {isSignUp
                                ? (isEn ? 'Join Dream Decoder to save your dreams' : '加入梦境解码，保存你的梦境记录')
                                : (isEn ? 'Sign in to sync your dream journal' : '登录以同步你的梦境日记')}
                        </p>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {isSignUp && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    {isEn ? 'Display Name' : '昵称'}
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <UserPlus className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        type="text"
                                        required={isSignUp}
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 sm:text-sm transition-colors"
                                        placeholder={isEn ? "Your Name" : "你的昵称"}
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                {isEn ? 'Email' : '邮箱'}
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 sm:text-sm transition-colors"
                                    placeholder="name@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                {isEn ? 'Password' : '密码'}
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 sm:text-sm transition-colors"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {isSignUp && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    {isEn ? 'Confirm Password' : '确认密码'}
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="block w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 sm:text-sm transition-colors"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="rounded-lg bg-red-50 p-3 border border-red-100 flex items-start gap-2">
                                <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        {message && (
                            <div className="rounded-lg bg-green-50 p-3 border border-green-100 flex items-start gap-2">
                                <div className="h-5 w-5 text-green-500 shrink-0 flex items-center justify-center font-bold">✓</div>
                                <p className="text-sm text-green-700">{message}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                isSignUp
                                    ? (isEn ? 'Sign Up' : '注册账号')
                                    : (isEn ? 'Sign In' : '登录')
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-slate-600">
                            {isSignUp
                                ? (isEn ? "Already have an account?" : "已有账号？")
                                : (isEn ? "Don't have an account yet?" : "还没有账号？")}{' '}
                            <button
                                type="button"
                                onClick={toggleMode}
                                className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                            >
                                {isSignUp
                                    ? (isEn ? 'Sign in' : '去登录')
                                    : (isEn ? 'Sign up' : '去注册')}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPopup;
