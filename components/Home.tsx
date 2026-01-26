import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Menu, MoreHorizontal, Smartphone, Trash2, X, MessageSquare } from 'lucide-react';
import { Sender, Message, MessageType, AppStage, AnalysisStyleId, DreamSession, Language } from '../types';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import LoginPopup from './LoginPopup';
import FeedbackPopup from './FeedbackPopup';
import MessageBubble from './MessageBubble';
import InputArea from './InputArea';
import StyleSelector from './StyleSelector';
import PostAnalysisSelector, { PostAnalysisChoice } from './PostAnalysisSelector';
import StartAnalysisButton from './StartAnalysisButton';
import { startNewChat, sendMessageToGemini } from '../services/geminiService';
import { generateDreamCard } from '../services/replicateService';
import DreamCardPopup from './DreamCardPopup';
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

const INITIAL_MESSAGE_EN = "Good morning. The boundary between reality and dreams is often blurred. Did you dream of anything vivid last night? Tell me about it while the memory is still fresh.";
const INITIAL_MESSAGE_ZH = "早安。现实与梦境的界限往往模糊不清。昨晚做了什么清晰的梦吗？趁着记忆还新鲜，告诉我吧。";

const POST_ANALYSIS_MESSAGE_EN = "That was a fascinating dream. Would you like to explore another dream, or shall I create a Dream Card to capture this one?";
const POST_ANALYSIS_MESSAGE_ZH = "这是一个很有意思的梦。你想继续解析另一个梦，还是让我为这个梦生成一张梦境卡？";

const CONTINUE_MESSAGE_EN = "Of course. Tell me about the next dream...";
const CONTINUE_MESSAGE_ZH = "好的。告诉我你的下一个梦吧...";

const GENERATING_CARD_MESSAGE_EN = "Let me paint your dream... This may take a moment.";
const GENERATING_CARD_MESSAGE_ZH = "让我为你描绘这个梦境...请稍等片刻。";

const CARD_COMPLETE_MESSAGE_EN = "Here is your Dream Card. A little piece of your subconscious, captured forever.";
const CARD_COMPLETE_MESSAGE_ZH = "这是你的梦境卡。你潜意识的一小片，被永远留存。";

interface HomeProps {
    language: Language;
    onToggleLanguage: () => void;
}

const Home: React.FC<HomeProps> = ({ language, onToggleLanguage }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [mobilePreview, setMobilePreview] = useState(false);

    // Current conversation ID (date format: yyyy-mm-dd)
    const [currentConversationId, setCurrentConversationId] = useState<string>(getTodayId());
    const [isViewingHistory, setIsViewingHistory] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);

    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [cardPopupOpen, setCardPopupOpen] = useState(false);
    const [cardPopupUrl, setCardPopupUrl] = useState<string>('');

    // Conversation State
    const [session, setSession] = useState<DreamSession>({
        dreamContent: '',
        style: AnalysisStyleId.UNSELECTED,
        stage: AppStage.GREETING
    });

    // Track dream segments for multi-message input
    const [dreamSegments, setDreamSegments] = useState<string[]>([]);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const initialized = useRef(false);
    const syncTimeoutRef = useRef<any>(null);

    // Auth context
    const { user, profile, signOut } = useAuth();
    const navigate = useNavigate();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading, session.stage]);

    // Handle language change side-effects (updating Initial Message if needed)
    useEffect(() => {
        setMessages(msgs => {
            if (msgs.length === 1 && msgs[0].sender === Sender.AI && (msgs[0].text === INITIAL_MESSAGE_ZH || msgs[0].text === INITIAL_MESSAGE_EN)) {
                return [{ ...msgs[0], text: language === 'zh' ? INITIAL_MESSAGE_ZH : INITIAL_MESSAGE_EN }];
            }
            return msgs;
        });
    }, [language]);

    // Auto-sync current conversation to cloud (Debounced)
    useEffect(() => {
        if (!user || messages.length === 0) return;

        if (syncTimeoutRef.current) {
            clearTimeout(syncTimeoutRef.current);
        }

        syncTimeoutRef.current = setTimeout(() => {
            console.log("Auto-syncing conversation to cloud...");
            syncDailyConversation(currentConversationId);
        }, 5000);

        return () => {
            if (syncTimeoutRef.current) {
                clearTimeout(syncTimeoutRef.current);
            }
        };
    }, [messages, user, currentConversationId]);

    // Convert Message to StoredMessage for DB
    const toStoredMessage = useCallback((msg: Message, conversationId: string): StoredMessage => ({
        id: msg.id,
        conversationId,
        sender: msg.sender as 'user' | 'ai' | 'system',
        text: msg.text,
        type: msg.type as 'text' | 'loading' | 'image',
        timestamp: msg.timestamp,
        imageUrl: msg.imageUrl
    }), []);

    // Convert StoredMessage to Message for UI
    const toUIMessage = useCallback((stored: StoredMessage): Message => ({
        id: stored.id,
        sender: stored.sender as Sender,
        text: stored.text,
        type: stored.type as MessageType,
        timestamp: new Date(stored.timestamp),
        imageUrl: stored.imageUrl
    }), []);

    // Load conversation by date
    const loadConversation = useCallback(async (dateId: string) => {
        const todayId = getTodayId();
        const isToday = dateId === todayId;

        setCurrentConversationId(dateId);
        setIsViewingHistory(!isToday);

        // Load messages from IndexedDB
        const storedMessages = await getMessages(dateId);

        if (storedMessages.length > 0) {
            setMessages(storedMessages.map(toUIMessage));

            // Intelligently restore session state based on message history
            const lastAiMsg = [...storedMessages].reverse().find(m => m.sender === 'ai');

            if (lastAiMsg) {
                if (lastAiMsg.text === POST_ANALYSIS_MESSAGE_EN || lastAiMsg.text === POST_ANALYSIS_MESSAGE_ZH) {
                    setSession(prev => ({ ...prev, stage: AppStage.WAITING_POST_CHOICE }));
                } else if (lastAiMsg.text === CONTINUE_MESSAGE_EN || lastAiMsg.text === CONTINUE_MESSAGE_ZH) {
                    // User started a new dream flow
                    setSession({
                        dreamContent: '',
                        style: AnalysisStyleId.UNSELECTED,
                        stage: AppStage.COLLECTING_DREAM
                    });
                    // Restore segments typed after the "Continue" prompt
                    const lastAiIndex = storedMessages.findIndex(m => m.id === lastAiMsg.id);
                    const subsequentUserMsgs = storedMessages.slice(lastAiIndex + 1).filter(m => m.sender === 'user');
                    setDreamSegments(subsequentUserMsgs.map(m => m.text));

                } else if (lastAiMsg.text === INITIAL_MESSAGE_EN || lastAiMsg.text === INITIAL_MESSAGE_ZH) {
                    // Initial greeting
                    setSession({
                        dreamContent: '',
                        style: AnalysisStyleId.UNSELECTED,
                        stage: AppStage.COLLECTING_DREAM
                    });
                    const lastAiIndex = storedMessages.findIndex(m => m.id === lastAiMsg.id);
                    const subsequentUserMsgs = storedMessages.slice(lastAiIndex + 1).filter(m => m.sender === 'user');
                    setDreamSegments(subsequentUserMsgs.map(m => m.text));

                } else if (lastAiMsg.text === CARD_COMPLETE_MESSAGE_EN || lastAiMsg.text === CARD_COMPLETE_MESSAGE_ZH) {
                    setSession(prev => ({ ...prev, stage: AppStage.SHOWING_CARD }));
                } else if (lastAiMsg.text.includes("Thank you for your support") || lastAiMsg.text.includes("谢谢支持")) {
                    // Handle case where Thank You message is last
                    setSession(prev => ({ ...prev, stage: AppStage.SHOWING_CARD }));
                } else {
                    // Default to conversation for other interactions (analysis, follow-ups)
                    // If we want to be smarter about WAITING_STYLE, we would need to check if the last AI msg was the "Which style?" prompt.
                    // But that prompt is generated by LLM now.
                    // For now, defaulting to CONVERSATION means we might miss the explicit "Start Analysis" button if user refreshed at WAITING_STYLE,
                    // but they can just type the style name or click the buttons if they are rendered (buttons depend on stage).
                    // Actually, if we are in CONVERSATION, StyleSelector is NOT rendered.
                    // This is a minor edge case: Refreshing exactly at "Waiting Style".
                    // The AI prompt usually ends with "Which style...?"
                    // If we really want to fix that, we could look for that question mark or specific keyword.
                    // But the critical fix is the "Continue" flow.
                    setSession(prev => ({ ...prev, stage: AppStage.CONVERSATION }));
                }
            } else {
                // No AI message? Weird. Default to collecting.
                setSession({
                    dreamContent: '',
                    style: AnalysisStyleId.UNSELECTED,
                    stage: AppStage.COLLECTING_DREAM
                });
            }
        } else if (isToday) {
            // New conversation for today - show greeting
            const greetingText = language === 'zh' ? INITIAL_MESSAGE_ZH : INITIAL_MESSAGE_EN;

            const greetingMsg: Message = {
                id: Date.now().toString() + Math.random().toString(),
                sender: Sender.AI,
                text: greetingText,
                type: MessageType.TEXT,
                timestamp: new Date()
            };

            setMessages([greetingMsg]);
            setSession({
                dreamContent: '',
                style: AnalysisStyleId.UNSELECTED,
                stage: AppStage.COLLECTING_DREAM
            });
            setDreamSegments([]);

            await saveMessageToDB(toStoredMessage(greetingMsg, dateId));
        } else {
            setMessages([]);
        }
    }, [language, toStoredMessage, toUIMessage]);

    // Initial Load
    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        const initApp = async () => {
            await initDB();
            await getTodayConversation();
            checkAndSyncPreviousDays(); // Background sync of past history
            startNewChat();
            await loadConversation(getTodayId());
        };
        initApp();
    }, [loadConversation]);

    const addMessage = async (sender: Sender, text: string, imageUrl?: string) => {
        const newMessage: Message = {
            id: Date.now().toString() + Math.random().toString(),
            sender,
            text,
            type: imageUrl ? MessageType.IMAGE : MessageType.TEXT,
            timestamp: new Date(),
            imageUrl
        };
        setMessages(prev => [...prev, newMessage]);

        await saveMessageToDB(toStoredMessage(newMessage, currentConversationId));

        return newMessage;
    };

    const handleUserSend = async (text: string) => {
        await addMessage(Sender.USER, text);

        const currentStage = session.stage;

        if (currentStage === AppStage.COLLECTING_DREAM) {
            setDreamSegments(prev => [...prev, text]);
            return;
        }

        if (currentStage === AppStage.FOLLOW_UP) {
            setIsLoading(true);
            try {
                const responseText = await sendMessageToGemini(text, currentStage, session.dreamContent, session.style, language);
                setIsLoading(false);
                await addMessage(Sender.AI, responseText);

                const isQuestion = responseText.trim().endsWith('?') || responseText.trim().endsWith('？');
                const isShort = responseText.length < 150; // Follow-ups are usually short
                const isFollowUp = isQuestion && isShort;
                if (isFollowUp) {
                    setSession(prev => ({ ...prev, stage: AppStage.FOLLOW_UP }));
                } else {
                    setTimeout(async () => {
                        await addMessage(Sender.AI, language === 'en' ? POST_ANALYSIS_MESSAGE_EN : POST_ANALYSIS_MESSAGE_ZH);
                        setSession(prev => ({ ...prev, stage: AppStage.WAITING_POST_CHOICE }));
                    }, 1000);
                }
            } catch (error) {
                console.error("Chat Error", error);
                setIsLoading(false);
                await addMessage(Sender.AI, language === 'en' ? "I apologize, but my connection to the ether is disrupted. Please try again." : "很抱歉，我与梦境的连接暂时中断了。请重试。");
            }
            return;
        }

        setIsLoading(true);
        let nextStage = currentStage;
        let dreamContext = session.dreamContent;
        let style = session.style;

        try {
            if (currentStage === AppStage.WAITING_DREAM) {
                dreamContext = text;
                setSession(prev => ({ ...prev, dreamContent: text, stage: AppStage.ASKING_STYLE }));
                nextStage = AppStage.WAITING_STYLE;
            } else if (currentStage === AppStage.WAITING_STYLE) {
                style = text in AnalysisStyleId ? text as AnalysisStyleId : AnalysisStyleId.UNSELECTED;
                setSession(prev => ({ ...prev, style, stage: AppStage.ANALYZING }));
                nextStage = AppStage.CONVERSATION;
            }

            const responseText = await sendMessageToGemini(text, currentStage, dreamContext, style, language);
            setIsLoading(false);
            await addMessage(Sender.AI, responseText);
            setSession(prev => ({ ...prev, stage: nextStage }));
        } catch (error) {
            console.error("Chat Error", error);
            setIsLoading(false);
            await addMessage(Sender.AI, language === 'en' ? "Connection disrupted. Please try again." : "连接中断，请重试。");
        }
    };

    const handleStartAnalysis = async () => {
        const combinedDream = dreamSegments.join('\n');
        if (!combinedDream.trim()) return;

        // If this is the FIRST dream analysis of the day (and not already counted), count it now.
        // Simple heuristic: if we are in COLLECTING_DREAM and we are about to start, this is a new dream engagement.
        // We only increment if dailyUsage.dreams is 0? Or always?
        // Wait, if I reload page for the 1st dream, usage is 0. If I start analysis, it should be 1.
        // If I reload page for the 2nd dream, this button won't be clicked (I'm already in conversation).
        // So yes, clicking this button implies starting a new dream analysis flow.
        if (dailyUsage.dreams === 0) {
            updateDailyUsage('dreams');
        } else if (session.stage === AppStage.COLLECTING_DREAM && dailyUsage.dreams > 0) {
            // If we are collecting a dream but usage > 0, does it mean we are on dream #2?
            // Yes. But we rely on "New Dream" click to increment to 2.
            // If user refreshed while on Dream #2 Collecting, we are here.
            // We shouldn't double count.
            // But detecting "re-entry" vs "continuation" is hard without session IDs.
            // For now, let's assume if usage > 0, we already counted `new_dream`.
            // EXCEPT: The very first dream of usage 0 must be counted.
        }

        await updateConversationSummary(currentConversationId, combinedDream.slice(0, 100));
        setSession(prev => ({ ...prev, dreamContent: combinedDream, stage: AppStage.ASKING_STYLE }));
        setIsLoading(true);

        try {
            const responseText = await sendMessageToGemini(combinedDream, AppStage.WAITING_DREAM, combinedDream, AnalysisStyleId.UNSELECTED, language);
            setIsLoading(false);
            await addMessage(Sender.AI, responseText);
            setSession(prev => ({ ...prev, stage: AppStage.WAITING_STYLE }));
        } catch (error) {
            console.error("Chat Error", error);
            setIsLoading(false);
            await addMessage(Sender.AI, language === 'en' ? "Connection disrupted." : "连接中断。");
        }
    };

    const handleStyleSelect = (selectedStyleId: AnalysisStyleId) => {
        setSession(prev => ({ ...prev, style: selectedStyleId }));

        const labelMap: Record<AnalysisStyleId, { en: string; zh: string }> = {
            [AnalysisStyleId.RATIONAL]: { en: "Rational Analysis (Cognitive Science)", zh: "理性分析（认知科学）" },
            [AnalysisStyleId.PSY_INTEGRATIVE]: { en: "Modern Counseling (Integrative)", zh: "现代咨询整合（CBT/情绪聚焦）" },
            [AnalysisStyleId.PSY_FREUD]: { en: "Psychoanalysis (Freud)", zh: "精神分析（弗洛伊德）" },
            [AnalysisStyleId.PSY_JUNG]: { en: "Analytical Psychology (Jung)", zh: "分析心理学（荣格）" },
            [AnalysisStyleId.FOLK_CN]: { en: "Chinese Folk (Zhou Gong)", zh: "中国民俗（周公解梦）" },
            [AnalysisStyleId.FOLK_GREEK]: { en: "Greek-Roman Divination", zh: "古希腊罗马占卜" },
            [AnalysisStyleId.FOLK_JUDEO]: { en: "Judeo-Christian Tradition", zh: "犹太-基督教传统" },
            [AnalysisStyleId.FOLK_ISLAM]: { en: "Islamic Dream Interpretation", zh: "伊斯兰解梦传统" },
            [AnalysisStyleId.FOLK_DHARMA]: { en: "Buddhist Perspective", zh: "佛教视角（如梦如幻）" },
            [AnalysisStyleId.CREATIVE]: { en: "Creative/Artistic", zh: "灵感创作（艺术/文学）" },
            [AnalysisStyleId.PSYCHOLOGY]: { en: "Psychological Perspective", zh: "心理视角（温暖咨询）" },
            [AnalysisStyleId.FOLK]: { en: "Folk/Metaphysical", zh: "玄学民俗（传统智慧）" },
            [AnalysisStyleId.UNSELECTED]: { en: "Default", zh: "默认" }
        };

        const label = language === 'zh' ? labelMap[selectedStyleId].zh : labelMap[selectedStyleId].en;
        handleUserSendWithStyle(label, selectedStyleId);
    };

    // Daily quotas
    const [dailyUsage, setDailyUsage] = useState({ dreams: 0, cards: 0 });

    // Load daily usage on mount
    useEffect(() => {
        const today = getTodayId();
        const stored = localStorage.getItem(`dream_quota_${today}`);
        if (stored) {
            setDailyUsage(JSON.parse(stored));
        } else {
            // First time today?
            setDailyUsage({ dreams: 0, cards: 0 });
        }
    }, []);

    const updateDailyUsage = (type: 'dreams' | 'cards') => {
        const today = getTodayId();
        setDailyUsage(prev => {
            const next = { ...prev, [type]: prev[type] + 1 };
            localStorage.setItem(`dream_quota_${today}`, JSON.stringify(next));
            return next;
        });
    };

    // Increment dream count on first substantive interaction of a session?
    // Actually, simpler to track when we "Complete" a dream analysis or "Start" one.
    // Let's increment when user successfully starts analysis (inputs dream).
    const incrementDreamCountIfNew = () => {
        // Logic: If we haven't counted this "session" yet.
        // But session state is ephemeral.
        // Let's just trust "Start Analysis" click or "Tell Another Dream" click implies intent.
        // Actually, better: When we enter WAITING_STYLE (meaning dream collected), we count it?
        // Issue: Page reload.
        // Let's keep it simple: "Tell Another Dream" increments.
        // Initial "Start Analysis" (from empty state) increments.
    };


    const handleUserSendWithStyle = async (text: string, explicitStyle?: AnalysisStyleId) => {
        await addMessage(Sender.USER, text);
        setIsLoading(true);

        const style = explicitStyle || session.style;
        if (session.stage === AppStage.WAITING_STYLE) {
            setSession(prev => ({ ...prev, style, stage: AppStage.ANALYZING }));
        }

        try {
            const responseText = await sendMessageToGemini(text, session.stage, session.dreamContent, style, language);
            setIsLoading(false);
            await addMessage(Sender.AI, responseText);

            const isQuestion = responseText.trim().endsWith('?') || responseText.trim().endsWith('？');
            // const isShort = responseText.length < 150; // DeepSeek R1 output can be long even for questions? No, usually follows instruction.
            // Simplification: if stage was Analyzing, we likely move to conversation or done.
            // Logic update: DeepSeek logic in backend might behave differently.
            // Let's stick to existing "Guess if follow-up" logic for now.
            const isFollowUp = isQuestion; // Relax length check for safety

            if (isFollowUp) {
                setSession(prev => ({ ...prev, stage: AppStage.FOLLOW_UP }));
            } else {
                setTimeout(async () => {
                    await addMessage(Sender.AI, language === 'en' ? POST_ANALYSIS_MESSAGE_EN : POST_ANALYSIS_MESSAGE_ZH);
                    setSession(prev => ({ ...prev, stage: AppStage.WAITING_POST_CHOICE }));
                }, 1000);
            }
        } catch (error) {
            console.error("Chat Error", error);
            setIsLoading(false);
            await addMessage(Sender.AI, language === 'en' ? "Connection disrupted." : "连接中断。");
        }
    };

    const handlePostAnalysisChoice = async (choice: PostAnalysisChoice) => {
        console.log("handlePostAnalysisChoice called with:", choice);

        if (choice === 'reanalyze') {
            // Change Analysis Style
            // Reset to Waiting Style stage
            setSession(prev => ({ ...prev, stage: AppStage.WAITING_STYLE }));
            // We do NOT increment daily dream count here, as it's the same dream.
            // Prompt AI to ask for style again? Or just show selector?
            // "Home" renders StyleSelector when stage is WAITING_STYLE.
            // We might want to clear the last AI message if it was "What do you want to do next?"
            // But preserving history is fine.
            await addMessage(Sender.AI, language === 'zh' ? "没问题，通过哪种视角来重新审视这个梦？" : "Sure, which perspective should we use to re-examine this dream?");

        } else if (choice === 'new_dream') {
            // Tell Another Dream
            if (dailyUsage.dreams >= 2) {
                // Should be disabled in UI, but double check
                return;
            }
            updateDailyUsage('dreams');

            console.log("Choice is new_dream");
            await addMessage(Sender.AI, language === 'en' ? CONTINUE_MESSAGE_EN : CONTINUE_MESSAGE_ZH);
            startNewChat(); // Clear AI history
            setDreamSegments([]);
            setSession({ dreamContent: '', style: AnalysisStyleId.UNSELECTED, stage: AppStage.COLLECTING_DREAM });

        } else if (choice === 'card') {
            // Generate Card
            if (dailyUsage.cards >= 2) {
                return;
            }
            updateDailyUsage('cards');

            console.log("Choice is generate_card");
            // Set stage to GENERATING_CARD to disable input, but use messages for UI feedback
            setSession(prev => ({ ...prev, stage: AppStage.GENERATING_CARD }));

            try {
                // 1. Add "Generating..." message with Progress Bar
                const generatingId = Date.now().toString() + Math.random().toString();
                const generatingMsg = toStoredMessage({
                    id: generatingId,
                    sender: Sender.AI,
                    text: language === 'zh' ? '正在编织梦境...' : 'Weaving your dream...',
                    type: MessageType.CARD_GENERATING,
                    timestamp: new Date()
                }, currentConversationId!);

                await saveMessageToDB(generatingMsg);
                setMessages(prev => [...prev, toUIMessage(generatingMsg)]);

                // 2. Generate image
                const imageUrl = await generateDreamCard(session.dreamContent, undefined, session.style);
                console.log('Generated image URL:', imageUrl);
                await updateConversationSummary(currentConversationId, session.dreamContent.slice(0, 100), imageUrl);

                // 3. Update the generating message to "Card Ready"
                // Actually, we can just add a new message or replace the last one. 
                // Replacing is better to remove the progress bar.

                const cardReadyMsg = toStoredMessage({
                    id: generatingId, // Reuse ID to replace? Or new ID?
                    // Ideally we replace the "Generating" bubble with "Ready" bubble.
                    // But in strict append-only log, we might just append.
                    // However, for UI polish, replacement is nicer.
                    // Let's UPDATE the local message state and DB.
                    sender: Sender.AI,
                    text: language === 'zh' ? '梦境卡已生成。' : 'Your Dream Card is ready.',
                    type: MessageType.CARD_READY,
                    timestamp: new Date(),
                    imageUrl: imageUrl
                }, currentConversationId!);

                // Update in DB (overwrite) - saveMessageToDB uses 'put', so same ID overwrites
                await saveMessageToDB(cardReadyMsg);

                // Update in UI
                setMessages(prev => prev.map(m => m.id === generatingId ? toUIMessage(cardReadyMsg) : m));

                // 4. Thank You Message (Append)
                const thankYouText = language === 'zh'
                    ? "谢谢支持！本App还在测试阶段，数据采集和收集评价是为了更好地优化体验，最终上线iOS和安卓各大应用商店。\n\n如果有任何想法或建议，欢迎点击下方的反馈按钮提交，邀请大家一起参与开发这个App！"
                    : "Thank you for your support! This app is still in beta.\n\nIf you have any ideas or suggestions, please click the feedback button below.";

                const thankYouId = Date.now().toString() + Math.random().toString();
                const thankYouMsg = toStoredMessage({
                    id: thankYouId,
                    sender: Sender.AI,
                    text: thankYouText,
                    type: MessageType.TEXT,
                    timestamp: new Date()
                }, currentConversationId!);

                await saveMessageToDB(thankYouMsg);
                setMessages(prev => [...prev, toUIMessage(thankYouMsg)]);

                setSession(prev => ({ ...prev, stage: AppStage.SHOWING_CARD }));
            } catch (err) {
                console.error("Failed to generate card:", err);
                const errorId = Date.now().toString() + Math.random().toString();
                const errorMsg = toStoredMessage({
                    id: errorId,
                    sender: Sender.AI,
                    text: language === 'zh' ? '抱歉，生成梦境卡时遇到了一点问题。请稍后再试。' : 'Sorry, I encountered an issue generating the dream card. Please try again later.',
                    type: MessageType.TEXT,
                    timestamp: new Date()
                }, currentConversationId!);
                await saveMessageToDB(errorMsg);
                setMessages(prev => [...prev, toUIMessage(errorMsg)]);
                setSession(prev => ({ ...prev, stage: AppStage.WAITING_POST_CHOICE }));
            }
        }
    };

    const handleSelectConversation = (dateId: string) => {
        if (dateId !== currentConversationId) {
            loadConversation(dateId);
        }
    };

    const conversationTitle = formatDateForDisplay(currentConversationId, language);

    const handleClearClick = () => {
        setIsMenuOpen(false);
        setShowConfirmModal(true);
    };

    const confirmClear = async () => {
        await deleteConversation(currentConversationId);
        startNewChat(); // Reset AI context history

        // Reset local state if we are clearing the current view
        setMessages([]);
        setSession({
            dreamContent: '',
            style: AnalysisStyleId.UNSELECTED,
            stage: AppStage.COLLECTING_DREAM
        });
        setDreamSegments([]);
        setShowConfirmModal(false);

        // Re-initialize conversation for today (add greeting)
        if (currentConversationId === getTodayId()) {
            const greetingText = language === 'zh' ? INITIAL_MESSAGE_ZH : INITIAL_MESSAGE_EN;
            const greetingMsg: Message = {
                id: Date.now().toString() + Math.random().toString(),
                sender: Sender.AI,
                text: greetingText,
                type: MessageType.TEXT,
                timestamp: new Date()
            };
            setMessages([greetingMsg]);
            await saveMessageToDB(toStoredMessage(greetingMsg, currentConversationId));
        }
    };

    const confirmModal = showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowConfirmModal(false)}></div>
            <div className="bg-white rounded-2xl w-full max-w-xs p-6 relative z-10 shadow-xl transform transition-all scale-100">
                <div className="text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
                        <Trash2 className="h-6 w-6 text-red-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {language === 'zh' ? '清空今日记录？' : 'Clear Today\'s Record?'}
                    </h3>
                    <p className="text-sm text-gray-500 mb-6">
                        {language === 'zh' ? '这将永久删除今天的对话内容，无法恢复。' : 'This will permanently delete today\'s conversation. This action cannot be undone.'}
                    </p>
                    {session.stage === AppStage.SHOWING_CARD && !isViewingHistory && (
                        (() => {
                            console.log("Rendering Feedback Button");
                            return (
                                <div className="flex justify-center mt-4 mb-8 border-4 border-red-500 bg-yellow-100 p-4">
                                    <button
                                        onClick={() => setShowFeedbackModal(true)}
                                        className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 transition-all font-medium text-sm flex items-center gap-2"
                                    >
                                        <MessageSquare size={16} />
                                        {language === 'zh' ? '提交反馈 / 共建App' : 'Give Feedback / Join Us'}
                                    </button>
                                </div>
                            );
                        })()
                    )}
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowConfirmModal(false)}
                            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                        >
                            {language === 'zh' ? '取消' : 'Cancel'}
                        </button>
                        <button
                            onClick={confirmClear}
                            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors shadow-sm"
                        >
                            {language === 'zh' ? '清空' : 'Clear'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const appContent = (
        <div className={`h-full flex flex-col bg-[#F2F2F7] relative overflow-hidden ${mobilePreview ? 'rounded-[2rem]' : ''}`}>
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                language={language}
                onToggleLanguage={onToggleLanguage}
                onSelectConversation={loadConversation}
                currentConversationId={currentConversationId || undefined}
                user={user}
                profile={profile}
                onOpenLogin={() => setShowLoginModal(true)}
                onLogout={signOut}
            />

            <header className={`flex-none h-14 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-4 z-20 sticky top-0 shadow-sm ${mobilePreview ? 'rounded-t-[2rem]' : ''}`}>
                <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-gray-800 hover:bg-gray-100 rounded-full transition-colors">
                    <Menu size={24} />
                </button>
                <div className="flex flex-col items-center">
                    <h1 className="text-base font-semibold text-black">Oneiro AI</h1>
                    <span className="text-[10px] text-gray-500 font-medium">
                        {isLoading ? (language === 'en' ? 'Connecting...' : '连接中...') : isViewingHistory ? conversationTitle : (language === 'en' ? 'Online' : '在线')}
                    </span>
                </div>
                <div className="relative">
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 -mr-2 text-gray-800 hover:bg-gray-100 rounded-full transition-colors">
                        <MoreHorizontal size={24} />
                    </button>
                    {isMenuOpen && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                            <button
                                onClick={handleClearClick}
                                className="w-full px-4 py-3 text-left hover:bg-red-50 text-red-600 flex items-center gap-2 transition-colors"
                            >
                                <Trash2 size={16} />
                                <span className="text-sm font-medium">{language === 'zh' ? '清空今日记录' : 'Clear Today\'s Record'}</span>
                            </button>
                        </div>
                    )}
                </div>
            </header>

            <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 no-scrollbar">
                <div className="max-w-4xl mx-auto min-h-full flex flex-col justify-start pb-32">
                    <div className="flex justify-center mb-6 mt-4">
                        <span className="bg-gray-200 text-gray-500 text-xs px-2 py-1 rounded">{conversationTitle}</span>
                    </div>

                    {messages.map((msg) => (
                        <MessageBubble
                            key={msg.id}
                            message={msg}
                            onViewCard={(url) => {
                                setCardPopupUrl(url);
                                setCardPopupOpen(true);
                            }}
                        />
                    ))}

                    {session.stage === AppStage.WAITING_STYLE && !isLoading && !isViewingHistory && (
                        <StyleSelector onSelect={handleStyleSelect} language={language} />
                    )}
                    {session.stage === AppStage.COLLECTING_DREAM && dreamSegments.length > 0 && !isLoading && !isViewingHistory && (
                        <StartAnalysisButton onClick={handleStartAnalysis} language={language} />
                    )}
                    {session.stage === AppStage.WAITING_POST_CHOICE && !isLoading && !isViewingHistory && (
                        <PostAnalysisSelector
                            onSelect={handlePostAnalysisChoice}
                            language={language}
                            disableNewDream={dailyUsage.dreams >= 2}
                            disableCard={dailyUsage.cards >= 2}
                        />
                    )}
                    {session.stage === AppStage.SHOWING_CARD && !isViewingHistory && (
                        <div className="flex justify-center mt-4 mb-8">
                            <button
                                onClick={() => setShowFeedbackModal(true)}
                                className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 transition-all font-medium text-sm flex items-center gap-2"
                            >
                                <MessageSquare size={16} />
                                {language === 'zh' ? '提交反馈 / 共建App' : 'Give Feedback / Join Us'}
                            </button>
                        </div>
                    )}
                    {isLoading && (
                        <MessageBubble message={{ id: 'loading', sender: Sender.AI, text: '', type: MessageType.LOADING, timestamp: new Date() }} />
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </main>

            {!isViewingHistory ? (
                <InputArea onSend={handleUserSend} disabled={isLoading || session.stage === AppStage.WAITING_STYLE || session.stage === AppStage.WAITING_POST_CHOICE || session.stage === AppStage.GENERATING_CARD} language={language} isLoggedIn={!!user} onOpenLogin={() => setShowLoginModal(true)} />
            ) : (
                <div className="flex-none p-4 bg-white border-t border-gray-200">
                    <button onClick={() => loadConversation(getTodayId())} className="w-full py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors">
                        {language === 'zh' ? '返回今日对话' : 'Back to Today'}
                    </button>
                </div>
            )}
            {confirmModal}
            <LoginPopup
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                language={language}
            />
            <FeedbackPopup
                isOpen={showFeedbackModal}
                onClose={() => setShowFeedbackModal(false)}
                language={language}
            />
            <DreamCardPopup
                isOpen={cardPopupOpen}
                onClose={() => setCardPopupOpen(false)}
                imageUrl={cardPopupUrl}
                conversationId={currentConversationId}
                language={language}
                onSaved={async (permanentUrl) => {
                    // Update UI State for Popup to use new URL
                    setCardPopupUrl(permanentUrl);

                    // Update Message in Chat
                    const targetMsg = messages.find(m => (m.type === MessageType.CARD_READY || m.type === MessageType.IMAGE) && m.imageUrl === cardPopupUrl);

                    if (targetMsg) {
                        const updatedMsg = { ...targetMsg, imageUrl: permanentUrl };

                        // Update UI
                        setMessages(prev => prev.map(m => m.id === targetMsg.id ? updatedMsg : m));

                        // Update IDB
                        await saveMessageToDB(toStoredMessage(updatedMsg, currentConversationId));
                    }

                    // Update Conversation Summary (for history list)
                    await updateConversationSummary(currentConversationId, session.dreamContent.slice(0, 100), permanentUrl);
                }}
            />
        </div>
    );

    if (mobilePreview) {
        return (
            <div className="h-full w-full bg-gray-900 flex items-center justify-center p-8">
                <div className="absolute top-4 left-4 z-50">
                    <button onClick={() => setMobilePreview(false)} className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors backdrop-blur-sm">
                        <Smartphone size={18} />
                        <span className="text-sm">{language === 'en' ? 'Exit Preview' : '退出预览'}</span>
                    </button>
                </div>
                <div className="relative">
                    <div className="w-[430px] h-[764px] bg-black rounded-[3rem] p-3 shadow-2xl">
                        <div className="w-full h-full bg-black rounded-[2.5rem] overflow-hidden relative">
                            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-30"></div>
                            <div className="w-full h-full overflow-hidden">{appContent}</div>
                        </div>
                    </div>
                    <div className="absolute top-24 -left-1 w-1 h-8 bg-gray-700 rounded-l"></div>
                    <div className="absolute top-36 -left-1 w-1 h-12 bg-gray-700 rounded-l"></div>
                    <div className="absolute top-52 -left-1 w-1 h-12 bg-gray-700 rounded-l"></div>
                    <div className="absolute top-32 -right-1 w-1 h-16 bg-gray-700 rounded-r"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-[#F2F2F7] relative overflow-hidden">
            <div className="flex-none h-10 bg-gray-800 flex items-center justify-between px-4">
                <span className="text-white text-sm font-medium">Oneiro AI</span>
                <button onClick={() => setMobilePreview(true)} className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm">
                    <Smartphone size={16} />
                    <span>9:16</span>
                </button>
            </div>

            {appContent}
        </div>
    );
};

export default Home;
