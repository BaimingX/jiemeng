import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { Menu, MoreHorizontal, Sparkles, Brain, Lock, User, LogOut, ChevronRight, ChevronLeft, MessageSquare, Plus, Image as ImageIcon, AlertCircle, X } from 'lucide-react';
import { Sender, Message, MessageType, AppStage, AnalysisStyleId, DreamSession, Language, StyleCategory } from '../types';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import LoginPopup from './LoginPopup';
import FeedbackPopup from './FeedbackPopup';
import MessageBubble from './MessageBubble';
import StyleSelector from './StyleSelector';
import PostAnalysisSelector, { PostAnalysisChoice } from './PostAnalysisSelector';
import { startNewChat, sendMessageToGemini } from '../services/geminiService';
import { generateDreamCard } from '../services/replicateService';
import {
    initDB,
    getTodayConversation,
    getMessages,
    addMessage as saveMessageToDB,
    updateConversationSummary,
    getTodayId,
    formatDateForDisplay,
    deleteConversation,
    checkAndSyncPreviousDays,
    syncDailyConversation,
    StoredMessage
} from '../services/dreamDB';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper for tailwind class merging
function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
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

const INITIAL_MESSAGE_EN = "Welcome to the realm of dreams. I am the Dream Whisperer. Share your dream, choose a lens, and let us unravel the threads of your subconscious.";
const INITIAL_MESSAGE_ZH = "欢迎来到梦境的疆域。我是梦语者。写下你的梦，选择一种视角，让我们一起解开潜意识的丝线。";

const POST_ANALYSIS_MESSAGE_EN = "The veil has been lifted slightly. Would you like to explore deeper, or crystallize this moment into an image?";
const POST_ANALYSIS_MESSAGE_ZH = "帷幕已稍稍揭开。你想继续深入探索，还是将这一刻凝结成画？";

interface LandingHomeProps {
    language: Language;
    onToggleLanguage: () => void;
}

const LandingHome: React.FC<LandingHomeProps> = ({ language, onToggleLanguage }) => {
    // --- State ---
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [dreamInput, setDreamInput] = useState('');
    const [selectedStyle, setSelectedStyle] = useState<AnalysisStyleId | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<StyleCategory | null>(null); // Lifted state
    const [isLoading, setIsLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);
    const [showResult, setShowResult] = useState(false); // To toggle between Hero and Result view
    const [dreamImageUrl, setDreamImageUrl] = useState<string | null>(null);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [chatInput, setChatInput] = useState(''); // New state for chat input
    const [showChatInput, setShowChatInput] = useState(false); // Toggle for manual input

    // Alert State
    const [alertMessage, setAlertMessage] = useState<string | null>(null);

    // Follow-up Questions Constants
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

    // Core Session State (kept for DB sync but UI is decoupled)
    const [currentConversationId, setCurrentConversationId] = useState<string>(getTodayId());
    const [showLoginModal, setShowLoginModal] = useState(false);

    const { user, profile, signOut } = useAuth();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Derived state for messages
    const [messages, setMessages] = useState<Message[]>([]);

    // --- Effects ---
    // 1. Init DB & Load (Silent)
    useEffect(() => {
        const init = async () => {
            await initDB();
            await getTodayConversation();
            // We DO NOT start a new chat with a greeting anymore.
            // Just load existing if any.
            await loadConversation(getTodayId());
        };
        init();
    }, []);

    // Load Conversation
    const loadConversation = async (dateId: string) => {
        setCurrentConversationId(dateId);
        const storedMessages = await getMessages(dateId);
        const uiMessages = storedMessages.map(m => ({
            id: m.id, sender: m.sender as Sender, text: m.text, type: m.type as MessageType, timestamp: new Date(m.timestamp), imageUrl: m.imageUrl
        }));
        setMessages(uiMessages);
    };

    // Helper for Alert
    const showAlert = (msg: string) => {
        setAlertMessage(msg);
    };

    // Start Analysis (Hero Button)
    const handleStartAnalysis = async () => {
        if (!user) {
            setShowLoginModal(true);
            return;
        }

        const usageCount = profile?.credits_balance || 0;
        if (usageCount >= 3) {
            showAlert(language === 'zh' ? "您今日的解析次数已用完（3次）。请明天再来。" : "You have reached your daily limit (3 analyses). Please come back tomorrow.");
            return;
        }

        if (!dreamInput.trim()) return;
        if (!selectedStyle) {
            showAlert(language === 'zh' ? "请先选择一种解析风格" : "Please select an analysis style first.");
            return;
        }

        setIsLoading(true);

        // --- NEW ISOLATION LOGIC ---
        // 1. Reset Global AI History so it doesn't remember previous dreams
        startNewChat();

        // 2. Generate a NEW Conversation ID for this specific analysis session
        // This ensures DB storage is separate from previous dreams today
        const newConversationId = Date.now().toString();
        setCurrentConversationId(newConversationId);

        // 3. Clear local messages state to show a fresh view (though we switch to Result view anyway)
        setMessages([]);

        // --- END ISOLATION LOGIC ---

        // 4. Save User Input to DB
        const userMsg: Message = { id: Date.now().toString(), sender: Sender.USER, text: dreamInput, type: MessageType.TEXT, timestamp: new Date() };
        await saveMessageToDB({ id: userMsg.id, conversationId: newConversationId, sender: 'user', text: dreamInput, type: 'text', timestamp: userMsg.timestamp });
        setMessages([userMsg]); // Set fresh state

        // 5. Increment Usage
        if (profile) {
            const newBalance = (profile.credits_balance || 0) + 1;
            await supabase.from('profiles').update({ credits_balance: newBalance }).eq('id', user.id);
        }

        // 6. Call AI
        try {
            // Use WAITING_STYLE stage to trigger the "Analyze THIS dream with THIS style" logic
            // We pass dreamInput as context.
            const response = await sendMessageToGemini(selectedStyle, AppStage.WAITING_STYLE, dreamInput, selectedStyle);

            setIsLoading(false);
            setAnalysisResult(response);
            setShowResult(true);

            // Save AI Response
            const aiMsg: Message = { id: Date.now().toString(), sender: Sender.AI, text: response, type: MessageType.TEXT, timestamp: new Date() };
            await saveMessageToDB({ id: aiMsg.id, conversationId: newConversationId, sender: 'ai', text: response, type: 'text', timestamp: aiMsg.timestamp });
            setMessages(prev => [...prev, aiMsg]);

        } catch (e) {
            console.error(e);
            setIsLoading(false);
            showAlert(language === 'zh' ? "分析失败，请重试。" : "Analysis failed, please try again.");
        }
    };

    // Handle Follow-up Chat
    const handleChatSend = async (text: string) => {
        if (!text.trim()) return;

        if (!user) {
            showAlert(language === 'zh' ? "请先登录以继续对话" : "Please login to continue the conversation.");
            // Optionally open login modal
            // setShowLoginModal(true);
            return;
        }

        // Close manual input if open
        setShowChatInput(false);

        // 1. Add User Message
        const userMsg: Message = { id: Date.now().toString(), sender: Sender.USER, text, type: MessageType.TEXT, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setChatInput('');

        // 2. Add Loading Message
        const loadingMsgId = "loading-" + Date.now();
        const loadingMsg: Message = { id: loadingMsgId, sender: Sender.AI, text: '', type: MessageType.LOADING, timestamp: new Date() };
        setMessages(prev => [...prev, loadingMsg]);

        try {
            const response = await sendMessageToGemini(text, AppStage.FOLLOW_UP, dreamInput, selectedStyle || AnalysisStyleId.RATIONAL);

            // 3. Remove Loading and Add Response
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

    // Generate Dream Image
    const handleGenerateImage = async () => {
        if (!dreamInput || !analysisResult) return;
        setIsGeneratingImage(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dream-image`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                    'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
                },
                body: JSON.stringify({
                    dreamContent: dreamInput,
                    analysisResult: analysisResult,
                    style: selectedStyle
                })
            });

            if (!response.ok) throw new Error('Failed to generate image');

            const data = await response.json();
            if (data.imageUrl) {
                setDreamImageUrl(data.imageUrl);
            }
        } catch (error) {
            console.error(error);
            showAlert(language === 'zh' ? "图片生成失败，请重试。" : "Failed to generate image.");
        } finally {
            setIsGeneratingImage(false);
        }
    };

    // ... handleReset ...
    const handleReset = () => {
        setDreamInput('');
        setSelectedStyle(null);
        setSelectedCategory(null);
        setAnalysisResult(null);
        setDreamImageUrl(null); // Reset image
        setShowResult(false);
        setMessages([]);
        const newId = Date.now().toString();
        setCurrentConversationId(newId);
    };

    return (
        <div className="h-full w-full bg-[#0B0F19] text-slate-200 flex flex-col font-sans selection:bg-indigo-500/30 overflow-hidden">
            <AlertPopup isOpen={!!alertMessage} message={alertMessage || ''} onClose={() => setAlertMessage(null)} language={language} />

            <header className="flex-none h-16 w-full px-6 flex items-center justify-between border-b border-white/5 bg-[#0B0F19]/80 backdrop-blur-md z-20 sticky top-0">
                <div className="flex items-center gap-3">
                    <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-colors">
                        <Menu size={20} />
                    </button>
                    <span onClick={handleReset} className="font-serif text-lg tracking-wide text-indigo-300 cursor-pointer hover:text-indigo-200 transition-colors">Dream Whisperer</span>
                </div>
                <div className="flex items-center gap-4">
                    {!user && (
                        <button
                            onClick={() => setShowLoginModal(true)}
                            className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
                        >
                            {language === 'zh' ? '登录' : 'Login'}
                        </button>
                    )}
                    {user && (
                        <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-400">
                            <Sparkles size={12} className="text-amber-400" />
                            <span>{(profile?.credits_balance || 0)} / 3</span>
                        </div>
                    )}
                </div>
            </header>

            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                language={language}
                onToggleLanguage={onToggleLanguage}
                onSelectConversation={loadConversation}
                currentConversationId={currentConversationId}
                user={user}
                profile={profile}
                onOpenLogin={() => setShowLoginModal(true)}
                onLogout={signOut}
            />

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto w-full relative">

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
                                    {language === 'zh' ? '解梦 · 洞见' : 'Dream Analysis'}
                                </h1>
                                <p className="text-slate-400 max-w-lg mx-auto leading-relaxed text-sm md:text-base font-light tracking-wide">
                                    {language === 'zh'
                                        ? '在理智与直觉交织的边缘，寻找潜意识的低语。'
                                        : 'Decrypt the whispers of your subconscious at the edge of reason and intuition.'}
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
                                                    <span>
                                                        {language === 'zh' ? `剩余次数: ${Math.max(0, 3 - (profile?.credits_balance || 0))}` : `Credits: ${Math.max(0, 3 - (profile?.credits_balance || 0))}`}
                                                    </span>
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

                                            {/* Moved Back Button */}
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
                            <div className="mb-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors cursor-pointer w-fit" onClick={() => setShowResult(false)}>
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
                                    <div className="whitespace-pre-wrap font-light text-slate-300">
                                        {analysisResult}
                                    </div>
                                </div>
                            </div>

                            {/* Dream Image Card */}
                            <div className="mb-12">
                                {dreamImageUrl ? (
                                    <div className="bg-[#131926]/60 border border-white/10 rounded-2xl p-4 backdrop-blur-xl shadow-2xl animate-fade-in-up">
                                        <div className="aspect-square w-full max-w-md mx-auto relative rounded-xl overflow-hidden group">
                                            <img src={dreamImageUrl} alt="Dream Visual" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-6">
                                                <a href={dreamImageUrl} target="_blank" rel="noreferrer" className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-lg text-white text-sm font-medium transition-colors">
                                                    {language === 'zh' ? '下载原图' : 'Download Original'}
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex justify-center">
                                        <button
                                            onClick={handleGenerateImage}
                                            disabled={isGeneratingImage}
                                            className="group relative flex items-center gap-3 px-6 py-3 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 transition-all overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/10 to-indigo-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                            {isGeneratingImage ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
                                                    <span>{language === 'zh' ? '正在绘制梦境...' : 'Painting your dream...'}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <ImageIcon size={18} />
                                                    <span>{language === 'zh' ? '生成梦境具象图' : 'Visualize Dream'}</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Follow up Chat */}
                            <div className="space-y-6">
                                <div className="text-sm text-slate-500 uppercase tracking-widest font-semibold flex items-center gap-2">
                                    <MessageSquare size={14} />
                                    {language === 'zh' ? '深入对话' : 'DEEP DIVE'}
                                </div>

                                {/* Chat History (Only follow ups) */}
                                <div className="space-y-4">
                                    {messages.filter(m => m.timestamp > new Date(Date.now() - 1000 * 60 * 60 * 24)).slice(2).map((msg) => (
                                        <MessageBubble key={msg.id} message={msg} />
                                    ))}
                                </div>

                                {/* Chat Input */}
                                {/* Chat Options Grid */}
                                {!showChatInput ? (
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
                                                onClick={() => setShowChatInput(true)}
                                                className="text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1"
                                            >
                                                <Plus size={12} />
                                                {language === 'zh' ? '输入其他问题' : 'Type custom question'}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
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
                                )}
                            </div>
                            <div ref={messagesEndRef} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            <LoginPopup isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} language={language} />
        </div>
    );
};

export default LandingHome;
