import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Brain, Lock, ChevronRight, ChevronLeft, MessageSquare, Plus, Image as ImageIcon, AlertCircle, X } from 'lucide-react';
import { Sender, Message, MessageType, AppStage, AnalysisStyleId, StyleCategory, Language } from '../types';
import { useAuth } from '../context/AuthContext';
import LoginPopup from './LoginPopup';
import MessageBubble from './MessageBubble';
import StyleSelector from './StyleSelector';
import DreamCardPopup from './DreamCardPopup';
import Seo from './Seo';
import { startNewChat, sendMessageToGemini } from '../services/geminiService';
import {
    initDB,
    getConversation,
    getMessages,
    addMessage as saveMessageToDB,
    getTodayId,
    getNextConversationIdForToday,
    updateConversationSummary,
    syncDailyConversation,
    fetchConversationFromSupabase,
} from '../services/dreamDB';
import { generateDreamCard } from '../services/replicateService';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useSearchParams, useNavigate } from 'react-router-dom';

// Helper for tailwind class merging
function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

function formatAnalysisHtml(text: string) {
    const escaped = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    return escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

function getBaseDateId(dateId: string) {
    const parts = dateId.split('-');
    if (parts.length >= 3) {
        return `${parts[0]}-${parts[1]}-${parts[2]}`;
    }
    return dateId;
}

// Custom Alert Popup Component
interface AlertPopupProps {
    isOpen: boolean;
    message: string;
    onClose: () => void;
    language: Language;
}

const AlertPopup: React.FC<AlertPopupProps> = ({ isOpen, message, onClose, language }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#1A2133] border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl scale-100 animate-scale-in">
                <div className="p-6 text-center space-y-4">
                    <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
                        <AlertCircle className="text-amber-500" size={24} />
                    </div>
                    <p className="text-slate-200 font-medium leading-relaxed">
                        {message}
                    </p>
                </div>
                <div className="border-t border-white/5 p-4">
                    <button
                        onClick={onClose}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-medium transition-colors"
                    >
                        {language === 'zh' ? '知道了' : 'OK'}
                    </button>
                </div>
            </div>
        </div>
    );
};

interface MemberGatePopupProps {
    isOpen: boolean;
    onClose: () => void;
    onSubscribe: () => void;
    language: Language;
}

const MemberGatePopup: React.FC<MemberGatePopupProps> = ({ isOpen, onClose, onSubscribe, language }) => {
    if (!isOpen) return null;

    const isZh = language === 'zh';
    const title = isZh ? '会员专属功能' : 'Members Only';
    const message = isZh
        ? '梦境卡生成与深入对话仅对会员开放。成为会员后可无限制解析并记录梦境。'
        : 'Dream Card creation and Deep Dive chat are for members only. Members can analyze and save dreams without limits.';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#1A2133] border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl scale-100 animate-scale-in">
                <div className="p-6 text-center space-y-3">
                    <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto">
                        <Lock className="text-indigo-300" size={22} />
                    </div>
                    <h3 className="text-lg font-semibold text-white">{title}</h3>
                    <p className="text-slate-300 text-sm leading-relaxed">{message}</p>
                </div>
                <div className="border-t border-white/5 p-4 space-y-3">
                    <button
                        onClick={onSubscribe}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-medium transition-colors"
                    >
                        {isZh ? '去订阅' : 'View Plans'}
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full bg-white/5 hover:bg-white/10 text-slate-300 py-3 rounded-xl font-medium transition-colors"
                    >
                        {isZh ? '稍后再说' : 'Maybe later'}
                    </button>
                </div>
            </div>
        </div>
    );
};

interface LandingHomeProps {
    language: Language;
    onToggleLanguage: () => void;
}

const LandingHome: React.FC<LandingHomeProps> = ({ language }) => {
    // --- State ---
    const [dreamInput, setDreamInput] = useState('');
    const [selectedStyle, setSelectedStyle] = useState<AnalysisStyleId | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<StyleCategory | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [cardStatus, setCardStatus] = useState<'idle' | 'generating' | 'ready'>('idle');
    const [cardProgress, setCardProgress] = useState(0);
    const [cardImageUrl, setCardImageUrl] = useState<string | null>(null);
    const [isCardPopupOpen, setIsCardPopupOpen] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [showChatInput, setShowChatInput] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    // Alert State
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [showMemberGate, setShowMemberGate] = useState(false);

    const FOLLOW_UP_QUESTIONS_ZH = [
        "对应现实哪件事？",
        "我应该怎么做？",
        "它在预示未来吗？",
        "为什么会反复？",
        "我为什么会做这个梦？",
        "怎么记住更多梦？"
    ];
    const FOLLOW_UP_QUESTIONS_EN = [
        "Connection to reality?",
        "What should I action?",
        "Predicting future?",
        "Why does it recur?",
        "Why this dream?",
        "Recall techniques?"
    ];

    const isZh = language === 'zh';
    const seoTitle = isZh ? 'Oneiro AI 梦境解析与梦境含义' : 'Oneiro AI | Dream Interpretation & Dream Meaning';
    const seoDescription = isZh
        ? 'Oneiro AI 是 AI 驱动的梦境解析与梦境日记应用，提供梦境含义、梦境符号与清醒梦洞见。'
        : 'Oneiro AI is an AI-powered dream interpretation and dream journal app for dream meaning, dream symbols, and lucid dreaming insights.';
    const seoKeywords = isZh
        ? '梦境解析, 梦境含义, 梦境词典, 梦境符号, 梦境日记, 梦境解析应用, AI 梦境解析, 清醒梦, 反复梦境'
        : 'dream interpretation, dream meaning, dream dictionary, dream symbols, dream interpretation app, dream journal app, AI dream interpretation, lucid dreaming, recurring dreams';

    const [currentConversationId, setCurrentConversationId] = useState<string>(getTodayId());
    const [showLoginModal, setShowLoginModal] = useState(false);

    const { user, profile, billingStatus, refreshBillingStatus } = useAuth();
    const isMember = billingStatus?.access === 'lifetime' ||
        (billingStatus?.access === 'subscription' && billingStatus?.isActive);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const cardProgressTimerRef = useRef<number | null>(null);
    const syncTimeoutRef = useRef<any>(null);

    const [messages, setMessages] = useState<Message[]>([]);

    const formattedAnalysisHtml = analysisResult ? formatAnalysisHtml(analysisResult) : '';
    const dateParam = searchParams.get('date');
    const isHistoryView = !!dateParam && getBaseDateId(dateParam) !== getTodayId();
    const followUpMessages = (isHistoryView ? messages : messages.filter(m => m.timestamp > new Date(Date.now() - 1000 * 60 * 60 * 24)))
        .slice(2);

    // --- Effects ---
    useEffect(() => {
        const init = async () => {
            await initDB();
            const dateId = searchParams.get('date');

            if (dateId) {
                await loadConversation(dateId);
                setShowResult(true);
            } else {
                // If no date, maybe we come from a "New Dream" action or just home
                // If we want to show today's drafts, we can.
                // For now, let's keep the "Input" view default.
                // We could reset state to ensure input view.
                handleReset();
            }
        };
        init();
        return () => {
            if (cardProgressTimerRef.current !== null) {
                window.clearInterval(cardProgressTimerRef.current);
            }
        };
    }, [searchParams]);

    // Auto-sync current conversation to cloud (Debounced)
    // Mirrors logic from Home.tsx to ensure first analysis is saved to history
    useEffect(() => {
        if (!user || messages.length === 0) return;

        if (syncTimeoutRef.current) {
            clearTimeout(syncTimeoutRef.current);
        }

        syncTimeoutRef.current = setTimeout(() => {
            console.log("Auto-syncing conversation to cloud (LandingHome)...");
            syncDailyConversation(currentConversationId);
        }, 5000);

        return () => {
            if (syncTimeoutRef.current) {
                clearTimeout(syncTimeoutRef.current);
            }
        };
    }, [messages, user, currentConversationId]);

    const loadConversation = async (dateId: string) => {
        setCurrentConversationId(dateId);
        setShowChatInput(false);
        let storedMessages = await getMessages(dateId);

        // If no local messages, try to restore from cloud
        if (!storedMessages || storedMessages.length === 0) {
            storedMessages = await fetchConversationFromSupabase(dateId);
        }

        if (storedMessages && storedMessages.length > 0) {
            const uiMessages = storedMessages.map(m => ({
                id: m.id, sender: m.sender as Sender, text: m.text, type: m.type as MessageType, timestamp: new Date(m.timestamp), imageUrl: m.imageUrl
            }));
            setMessages(uiMessages);

            const firstUser = storedMessages.find(m => m.sender === 'user' && m.text?.trim());
            if (firstUser) {
                setDreamInput(firstUser.text);
            }

            // Try to find the analysis result and image in messages to restore state
            const aiOne = uiMessages.find(m => m.sender === 'ai');
            if (aiOne) setAnalysisResult(aiOne.text);

            const imgMsg = uiMessages.find(m => m.imageUrl); // Or check conversation summary/image
            if (imgMsg?.imageUrl) {
                setCardImageUrl(imgMsg.imageUrl);
                setCardStatus('ready');
                setCardProgress(100);
            }
            // We might need to fetch conversation details for image
            // But DreamMap/Journal pass ID.
            // Let's rely on messages or re-fetch logic if needed. 
            // Better: Load conversation metadata too?
            // For now, minimal restoration.
            // Actually getMessages doesn't return the conversation image URL directly usually, it's on conversation object.
            // Note: In handleStartAnalysis we reset card image state. We need to restore it.
            const conversation = await getConversation(dateId);
            if (conversation?.imageUrl) {
                setCardImageUrl(conversation.imageUrl);
                setCardStatus('ready');
                setCardProgress(100);
            }
        }
    };

    const showAlert = (msg: string) => {
        setAlertMessage(msg);
    };

    const ensureMemberAccess = () => {
        if (isMember) return true;
        setShowMemberGate(true);
        return false;
    };

    const handleMemberSubscribe = () => {
        setShowMemberGate(false);
        navigate('/subscribe');
    };

    const handleStartAnalysis = async () => {
        if (!user) {
            setShowLoginModal(true);
            return;
        }

        // Check billing status - members should never be blocked by trial limits
        const isMember = billingStatus?.access === 'lifetime' ||
            (billingStatus?.access === 'subscription' && billingStatus?.isActive);
        const canUse = billingStatus?.canUse ?? true;
        const trialRemaining = billingStatus?.trialRemaining ?? 5;

        if (!isMember && (!canUse || (billingStatus?.access === 'free' && trialRemaining <= 0))) {
            showAlert(language === 'zh' ? "您的免费试用次数已用完。请订阅以继续使用。" : "You have used all your free trials. Please subscribe to continue.");
            return;
        }

        if (!dreamInput.trim()) return;
        if (!selectedStyle) {
            showAlert(language === 'zh' ? "请先选择一种解析风格" : "Please select an analysis style first.");
            return;
        }

        const nextConversation = await getNextConversationIdForToday(5);
        if (!nextConversation) {
            showAlert(language === 'zh'
                ? '今天已经解析了 5 个梦境啦，别太沉迷哦，明天再来吧。'
                : 'You have already interpreted 5 dreams today. Take a breather and come back tomorrow.');
            return;
        }

        setIsLoading(true);
        setCardStatus('idle');
        setCardProgress(0);
        setCardImageUrl(null);
        setIsCardPopupOpen(false);

        startNewChat();
        const newConversationId = nextConversation.id;
        setCurrentConversationId(newConversationId);
        setMessages([]);

        const userMsg: Message = { id: Date.now().toString(), sender: Sender.USER, text: dreamInput, type: MessageType.TEXT, timestamp: new Date() };
        await saveMessageToDB({ id: userMsg.id, conversationId: newConversationId, sender: 'user', text: dreamInput, type: 'text', timestamp: userMsg.timestamp });
        setMessages([userMsg]);

        // Note: Trial usage is now tracked in billing_trials table via Edge Function
        // No need to manually update profile.credits_balance

        try {
            const response = await sendMessageToGemini(selectedStyle, AppStage.WAITING_STYLE, dreamInput, selectedStyle, language);

            setIsLoading(false);
            setAnalysisResult(response);
            setShowResult(true);

            const aiMsg: Message = { id: Date.now().toString(), sender: Sender.AI, text: response, type: MessageType.TEXT, timestamp: new Date() };
            await saveMessageToDB({ id: aiMsg.id, conversationId: newConversationId, sender: 'ai', text: response, type: 'text', timestamp: aiMsg.timestamp });
            setMessages(prev => [...prev, aiMsg]);

            try {
                const summaryText = dreamInput.trim().slice(0, 120) || response.slice(0, 120);
                await updateConversationSummary(newConversationId, summaryText);
            } catch (summaryError) {
                console.error('Failed to update dream summary', summaryError);
            }

            // Refresh billing status to show updated trial count
            await refreshBillingStatus();

        } catch (e: any) {
            console.error(e);
            setIsLoading(false);

            // Handle billing-specific errors
            if (e.message?.includes('Subscription required') || e.message?.includes('订阅')) {
                showAlert(language === 'zh' ? "您的免费试用次数已用完。请订阅以继续使用。" : "You have used all your free trials. Please subscribe to continue.");
            } else {
                showAlert(language === 'zh' ? "分析失败，请重试。" : "Analysis failed, please try again.");
            }
        }
    };

    const handleChatSend = async (text: string) => {
        if (!text.trim()) return;

        if (!user) {
            showAlert(language === 'zh' ? "请先登录以继续对话" : "Please login to continue the conversation.");
            return;
        }

        if (!ensureMemberAccess()) return;

        setShowChatInput(false);

        const userMsg: Message = { id: Date.now().toString(), sender: Sender.USER, text, type: MessageType.TEXT, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setChatInput('');

        const loadingMsgId = "loading-" + Date.now();
        const loadingMsg: Message = { id: loadingMsgId, sender: Sender.AI, text: '', type: MessageType.LOADING, timestamp: new Date() };
        setMessages(prev => [...prev, loadingMsg]);

        try {
            const response = await sendMessageToGemini(text, AppStage.FOLLOW_UP, dreamInput, selectedStyle || AnalysisStyleId.RATIONAL, language);

            setMessages(prev => prev.filter(m => m.id !== loadingMsgId));

            const aiMsg: Message = { id: Date.now().toString(), sender: Sender.AI, text: response, type: MessageType.TEXT, timestamp: new Date() };
            setMessages(prev => [...prev, aiMsg]);

            await saveMessageToDB({ id: aiMsg.id, conversationId: currentConversationId, sender: 'ai', text: response, type: 'text', timestamp: aiMsg.timestamp });
        } catch (e) {
            console.error(e);
            setMessages(prev => prev.filter(m => m.id !== loadingMsgId));
            showAlert(language === 'zh' ? "发送失败，请重试" : "Failed to send message");
        }
    };

    const handleGenerateImage = async () => {
        if (!ensureMemberAccess()) return;
        if (!dreamInput || !analysisResult || cardStatus === 'generating') return;

        setCardStatus('generating');
        setCardProgress(0);
        setCardImageUrl(null);

        if (cardProgressTimerRef.current !== null) {
            window.clearInterval(cardProgressTimerRef.current);
        }

        cardProgressTimerRef.current = window.setInterval(() => {
            setCardProgress((prev) => {
                const next = prev + Math.random() * 8 + 6;
                return next >= 88 ? 88 : next;
            });
        }, 420);

        try {
            const imageUrl = await generateDreamCard(dreamInput, analysisResult, selectedStyle || undefined);
            setCardImageUrl(imageUrl);
            setCardProgress(100);
            setCardStatus('ready');

            if (cardProgressTimerRef.current !== null) {
                window.clearInterval(cardProgressTimerRef.current);
                cardProgressTimerRef.current = null;
            }

            try {
                const summaryText = dreamInput.trim().slice(0, 100) || analysisResult.slice(0, 100);
                await updateConversationSummary(currentConversationId, summaryText, imageUrl);
            } catch (updateError) {
                console.error('Failed to update dream summary', updateError);
            }
        } catch (error) {
            console.error(error);
            showAlert(language === 'zh' ? "图片生成失败，请重试。" : "Failed to generate image.");
            setCardStatus('idle');
        } finally {
            if (cardProgressTimerRef.current !== null) {
                window.clearInterval(cardProgressTimerRef.current);
                cardProgressTimerRef.current = null;
            }
        }
    };

    const handleReset = () => {
        setDreamInput('');
        setSelectedStyle(null);
        setSelectedCategory(null);
        setAnalysisResult(null);
        setCardImageUrl(null);
        setCardProgress(0);
        setCardStatus('idle');
        setIsCardPopupOpen(false);
        setShowResult(false);
        setMessages([]);
        const newId = getTodayId();
        setCurrentConversationId(newId);
        // Clean URL param if present
        setSearchParams({});
    };

    return (
        <div className="min-h-screen w-full bg-[#0B0F19] text-slate-200 flex flex-col font-sans selection:bg-indigo-500/30 overflow-x-hidden">
            <Seo
                title={seoTitle}
                description={seoDescription}
                path="/"
                lang={language}
                keywords={seoKeywords}
            />
            <AlertPopup isOpen={!!alertMessage} message={alertMessage || ''} onClose={() => setAlertMessage(null)} language={language} />
            <MemberGatePopup
                isOpen={showMemberGate}
                onClose={() => setShowMemberGate(false)}
                onSubscribe={handleMemberSubscribe}
                language={language}
            />

            {/* Removed Local Header */}

            <main className="flex-1 w-full relative">

                <AnimatePresence mode="wait">
                    {!showResult ? (
                        /* HERO / INPUT FORM MODE */
                        <motion.div
                            key="hero"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 md:p-8 max-w-4xl mx-auto"
                        >
                            {/* Decorative Elements */}
                            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none" />
                            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-900/20 rounded-full blur-[100px] pointer-events-none" />

                            <div className="text-center mb-10 space-y-4 relative z-10">
                                <h1 className="text-4xl md:text-6xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-purple-200 to-indigo-200 tracking-tight pb-2">
                                    {isZh ? 'Oneiro AI 梦境解析' : 'Oneiro AI Dream Interpretation'}
                                </h1>
                                <p className="text-slate-400 max-w-lg mx-auto leading-relaxed text-sm md:text-base font-light tracking-wide">
                                    {isZh
                                        ? 'AI 驱动的梦境含义、梦境符号与清醒梦洞见。'
                                        : 'AI-powered dream meaning, dream symbols, and lucid dreaming insights.'}
                                </p>
                            </div>

                            {/* Input Card */}
                            <div className="w-full bg-[#131926]/80 border border-white/5 rounded-2xl shadow-2xl backdrop-blur-xl relative overflow-hidden group transition-all duration-500 hover:shadow-indigo-500/10 hover:border-white/10">
                                {/* Text Area */}
                                <div className="p-6 md:p-8">
                                    <textarea
                                        value={dreamInput}
                                        onChange={(e) => setDreamInput(e.target.value)}
                                        placeholder={language === 'zh' ? "描述你的梦境，越详细越好..." : "Describe your dream in detail..."}
                                        className="w-full bg-transparent border-none outline-none text-slate-200 placeholder-slate-600 text-lg resize-none min-h-[160px] font-light leading-relaxed scrollbar-thin scrollbar-thumb-white/10"
                                    />
                                </div>

                                {/* Style Selector Area */}
                                <div className="bg-[#0f131f]/50 border-t border-white/5 p-6 md:p-8">
                                    <div className="flex flex-col md:flex-row md:items-start gap-6">
                                        <div className="flex-1">
                                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                <Brain size={12} />
                                                {language === 'zh' ? '解析视角' : 'PERSPECTIVE'}
                                            </div>
                                            <StyleSelector
                                                language={language}
                                                onSelect={(s) => setSelectedStyle(s)}
                                                darkMode={true}
                                                selectedStyleId={selectedStyle}
                                                selectedCategory={selectedCategory}
                                                onSelectCategory={setSelectedCategory}
                                            />
                                        </div>

                                        {/* Action Button Area */}
                                        <div className="w-full md:w-auto flex flex-col justify-end gap-3 min-w-[200px]">
                                            <div className="text-right text-xs text-slate-500 h-6">
                                                {user ? (
                                                    isMember ? null : (
                                                        <span>
                                                            {language === 'zh'
                                                                ? `剩余次数: ${billingStatus?.trialRemaining ?? 5}`
                                                                : `Credits: ${billingStatus?.trialRemaining ?? 5}`}
                                                        </span>
                                                    )
                                                ) : (
                                                    <span className="flex items-center justify-end gap-1.5 text-amber-500/80">
                                                        <Lock size={12} />
                                                        {language === 'zh' ? '需登录' : 'Login Req.'}
                                                    </span>
                                                )}
                                            </div>

                                            <button
                                                onClick={handleStartAnalysis}
                                                disabled={isLoading || !dreamInput.trim() || !selectedStyle}
                                                className={cn(
                                                    "w-full flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-medium transition-all duration-500 relative overflow-hidden",
                                                    (isLoading || !dreamInput.trim() || !selectedStyle)
                                                        ? "bg-white/5 text-slate-600 cursor-not-allowed border border-white/5"
                                                        : "bg-indigo-600/90 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/50 hover:shadow-indigo-500/30 ring-1 ring-white/10 hover:ring-white/20"
                                                )}
                                            >
                                                {isLoading ? (
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                        <span className="animate-pulse">{language === 'zh' ? '解析中...' : 'Analyzing...'}</span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <span className="tracking-wide">{language === 'zh' ? '开始解梦' : 'Interpret Dream'}</span>
                                                        <Sparkles size={18} className="text-indigo-200" />
                                                    </>
                                                )}
                                            </button>

                                            {selectedCategory && (
                                                <button
                                                    onClick={() => setSelectedCategory(null)}
                                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-white/5 hover:bg-white/5 text-slate-400 hover:text-slate-300 transition-colors text-sm"
                                                >
                                                    <ChevronLeft size={16} />
                                                    <span>{language === 'zh' ? '返回视角选择' : 'Back to Perspectives'}</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        /* RESULT MODE */
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="max-w-4xl mx-auto min-h-full py-12 px-4"
                        >
                            <div className="mb-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors cursor-pointer w-fit" onClick={handleReset}>
                                <ChevronLeft size={20} />
                                <span>{language === 'zh' ? '返回输入' : 'Back to Input'}</span>
                            </div>

                            {/* The Analysis Result Card */}
                            <div className="bg-[#131926]/60 border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl relative mb-8">
                                <div className="absolute -top-1 -left-1 w-20 h-20 bg-gradient-to-br from-indigo-500/20 to-transparent rounded-tl-2xl pointer-events-none" />

                                <h2 className="text-xl md:text-2xl font-serif text-indigo-100 mb-6 flex items-center gap-3">
                                    <Sparkles className="text-amber-400" size={24} />
                                    {language === 'zh' ? '梦境解析' : 'Dream Interpretation'}
                                </h2>

                                <div className="prose prose-invert prose-indigo max-w-none prose-p:leading-relaxed prose-headings:font-serif prose-headings:text-indigo-200">
                                    <div
                                        className="whitespace-pre-wrap font-light text-slate-300"
                                        dangerouslySetInnerHTML={{ __html: formattedAnalysisHtml }}
                                    />
                                </div>
                            </div>

                            {/* Dream Card Generation */}
                            <div className="mb-12">
                                <div className="bg-[#131926]/60 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-xl shadow-2xl">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                                        <div>
                                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                                <ImageIcon size={18} className="text-indigo-300" />
                                                {language === 'zh' ? '梦境具象图' : 'Dream Card'}
                                            </h3>
                                            <p className="text-xs text-slate-400 mt-1">
                                                {language === 'zh'
                                                    ? '生成一张可分享的梦境卡片（临时链接仅 7 天有效）'
                                                    : 'Generate a shareable dream card (fal.ai links expire in 7 days).'}
                                            </p>
                                        </div>

                                        {cardStatus === 'ready' && cardImageUrl && (
                                            <button
                                                onClick={() => setIsCardPopupOpen(true)}
                                                className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-medium shadow-lg shadow-indigo-500/25 transition-all"
                                            >
                                                {language === 'zh' ? '查看梦境卡' : 'View Dream Card'}
                                            </button>
                                        )}
                                    </div>

                                    {cardStatus === 'generating' ? (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between text-xs text-slate-400">
                                                <span>{language === 'zh' ? '正在生成中...' : 'Generating...'}</span>
                                                <span>{Math.round(cardProgress)}%</span>
                                            </div>
                                            <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 transition-all duration-300"
                                                    style={{ width: `${cardProgress}%` }}
                                                />
                                            </div>
                                            <p className="text-[11px] text-slate-500">
                                                {language === 'zh'
                                                    ? '提示：图片为临时链接，建议生成后立即保存到云端。'
                                                    : 'Tip: The image is temporary. Save it to your library once it is ready.'}
                                            </p>
                                        </div>
                                    ) : (
                                        cardStatus === 'ready' ? (
                                            <span className="text-[11px] text-slate-500">
                                                {language === 'zh'
                                                    ? '该图片 7 天后可能失效，建议永久保存。'
                                                    : 'This image may expire in 7 days. Save it to keep it forever.'}
                                            </span>
                                        ) : (
                                            <button
                                                onClick={handleGenerateImage}
                                                className="group relative flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 transition-all overflow-hidden"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/10 to-indigo-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                                <ImageIcon size={18} />
                                                <span>
                                                    {language === 'zh' ? '生成梦境具象图' : 'Visualize Dream'}
                                                </span>
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>
                            {/* Follow up Chat */}
                            <div className="space-y-6">
                                <div className="text-sm text-slate-500 uppercase tracking-widest font-semibold flex items-center gap-2">
                                    <MessageSquare size={14} />
                                    {language === 'zh' ? '深入对话' : 'DEEP DIVE'}
                                </div>

                                {/* Chat History (Only follow ups) */}
                                <div className="space-y-4">
                                    {followUpMessages.map((msg) => (
                                        <MessageBubble key={msg.id} message={msg} />
                                    ))}
                                </div>

                                {/* Chat Input */}
                                {/* Chat Options Grid */}
                                {!isHistoryView && !showChatInput ? (
                                    <div className="space-y-4 mt-6">
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {(language === 'zh' ? FOLLOW_UP_QUESTIONS_ZH : FOLLOW_UP_QUESTIONS_EN).map((q, idx) => (
                                                <button
                                                    key={idx}
                                                    disabled={isLoading}
                                                    onClick={() => handleChatSend(q)}
                                                    className="px-4 py-3 bg-[#1A2133] hover:bg-indigo-600/20 border border-white/5 hover:border-indigo-500/30 rounded-xl text-sm text-indigo-300 hover:text-indigo-200 transition-all text-left truncate relative group"
                                                >
                                                    <span className="relative z-10">{q}</span>
                                                    <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                                                </button>
                                            ))}
                                        </div>
                                        <div className="flex justify-center">
                                            <button
                                                onClick={() => {
                                                    if (!ensureMemberAccess()) return;
                                                    setShowChatInput(true);
                                                }}
                                                className="text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1"
                                            >
                                                <Plus size={12} />
                                                {language === 'zh' ? '输入其他问题' : 'Type custom question'}
                                            </button>
                                        </div>
                                    </div>
                                ) : !isHistoryView && showChatInput ? (
                                    /* Manual Input Mode */
                                    <div className="relative mt-4 animate-fade-in-up">
                                        <input
                                            autoFocus
                                            disabled={isLoading}
                                            value={chatInput}
                                            onChange={(e) => setChatInput(e.target.value)}
                                            className="w-full bg-[#131926] border border-white/10 rounded-xl px-5 py-4 text-slate-200 placeholder-slate-600 focus:bg-[#1A2133] focus:border-indigo-500/50 transition-all outline-none pr-12 shadow-lg"
                                            placeholder={language === 'zh' ? "关于这个梦，通过对话探索更多..." : "Ask questions to explore deeper..."}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    handleChatSend(chatInput);
                                                }
                                            }}
                                        />
                                        <button
                                            onClick={() => handleChatSend(chatInput)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-indigo-600/20 text-indigo-400 rounded-lg hover:bg-indigo-600 hover:text-white transition-all"
                                        >
                                            <ChevronRight size={20} />
                                        </button>
                                        <button
                                            onClick={() => setShowChatInput(false)}
                                            className="absolute right-14 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-slate-300 transition-colors"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : null}
                            </div>
                            <div ref={messagesEndRef} />
                        </motion.div>
                    )}
                </AnimatePresence>

            </main>

            <LoginPopup isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} language={language} />
            {cardImageUrl && (
                <DreamCardPopup
                    isOpen={isCardPopupOpen}
                    onClose={() => setIsCardPopupOpen(false)}
                    imageUrl={cardImageUrl}
                    conversationId={currentConversationId}
                    language={language}
                    onSaved={async (url) => {
                        setCardImageUrl(url);
                        try {
                            const summaryText = dreamInput.trim().slice(0, 100) || analysisResult?.slice(0, 100) || 'Dream';
                            await updateConversationSummary(currentConversationId, summaryText, url);
                        } catch (error) {
                            console.error('Failed to update dream summary', error);
                        }
                    }}
                />
            )}
        </div>
    );
};

export default LandingHome;


