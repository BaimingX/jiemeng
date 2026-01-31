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
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const { signInWithEmail, signUp, signInWithGoogle } = useAuth();

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

    const handleGoogleLogin = async () => {
        setGoogleLoading(true);
        setError(null);
        try {
            const { error } = await signInWithGoogle();
            if (error) {
                setError(error.message);
            }
        } catch (err: any) {
            setError(err.message || (isEn ? 'An unexpected error occurred' : '发生未知错误'));
        } finally {
            setGoogleLoading(false);
        }
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
                                ? (isEn ? 'Join Oneiro AI to save your dreams' : '加入 Oneiro AI，保存你的梦境记录')
                                : (isEn ? 'Sign in to sync your dream journal' : '登录以同步你的梦境日记')}
                        </p>
                    </div>

                    {/* Google Login Button */}
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={googleLoading || loading}
                        className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {googleLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <>
                                <svg className="h-5 w-5" viewBox="0 0 24 24">
                                    <path
                                        fill="#4285F4"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="#EA4335"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                {isEn ? 'Continue with Google' : '使用 Google 登录'}
                            </>
                        )}
                    </button>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-slate-500">
                                {isEn ? 'or continue with email' : '或使用邮箱继续'}
                            </span>
                        </div>
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
