import React, { useState, useEffect, useRef } from 'react';
import { Menu, MoreHorizontal, Smartphone } from 'lucide-react';
import { Sender, Message, MessageType, AppStage, AnalysisStyleId, DreamSession, Language } from './types';
import Sidebar from './components/Sidebar';
import MessageBubble from './components/MessageBubble';
import InputArea from './components/InputArea';
import StyleSelector from './components/StyleSelector';
import PostAnalysisSelector, { PostAnalysisChoice } from './components/PostAnalysisSelector';
import StartAnalysisButton from './components/StartAnalysisButton';
import { startNewChat, sendMessageToGemini, generateImagePrompt } from './services/geminiService';
import { generateDreamCard } from './services/replicateService';

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

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mobilePreview, setMobilePreview] = useState(false);

  // Conversation State
  const [session, setSession] = useState<DreamSession>({
    dreamContent: '',
    style: AnalysisStyleId.UNSELECTED,
    stage: AppStage.GREETING
  });

  // Track dream segments for multi-message input
  const [dreamSegments, setDreamSegments] = useState<string[]>([]);

  const initialized = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, session.stage]); // Trigger scroll when stage changes (showing selector)

  // Initial Load
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const initChat = async () => {
      startNewChat();
      // Add initial greeting with a slight delay for realism
      setTimeout(() => {
        addMessage(Sender.AI, language === 'en' ? INITIAL_MESSAGE_EN : INITIAL_MESSAGE_ZH);
        setSession(prev => ({ ...prev, stage: AppStage.COLLECTING_DREAM }));
      }, 500);
    };
    initChat();
  }, []);

  const addMessage = (sender: Sender, text: string, imageUrl?: string) => {
    const newMessage: Message = {
      id: Date.now().toString() + Math.random().toString(),
      sender,
      text,
      type: imageUrl ? MessageType.IMAGE : MessageType.TEXT,
      timestamp: new Date(),
      imageUrl
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleUserSend = async (text: string) => {
    // 1. Add User Message
    addMessage(Sender.USER, text);

    const currentStage = session.stage;

    // Handle COLLECTING_DREAM stage - just add to segments, no AI call
    if (currentStage === AppStage.COLLECTING_DREAM) {
      setDreamSegments(prev => [...prev, text]);
      // Stay in COLLECTING_DREAM stage, don't call AI
      return;
    }

    // Handle FOLLOW_UP stage - user is answering a follow-up question
    if (currentStage === AppStage.FOLLOW_UP) {
      setIsLoading(true);
      try {
        const responseText = await sendMessageToGemini(
          text,
          currentStage,
          session.dreamContent,
          session.style
        );

        setIsLoading(false);
        addMessage(Sender.AI, responseText);

        // Check if this response is still asking for more info or is a complete analysis
        // Simple heuristic: if response ends with "?" it's likely a follow-up
        const isFollowUp = responseText.trim().endsWith('?') || responseText.trim().endsWith('？');

        if (isFollowUp) {
          // Still need more info, stay in FOLLOW_UP
          setSession(prev => ({ ...prev, stage: AppStage.FOLLOW_UP }));
        } else {
          // Analysis complete, show post-analysis choice
          setTimeout(() => {
            addMessage(Sender.AI, language === 'en' ? POST_ANALYSIS_MESSAGE_EN : POST_ANALYSIS_MESSAGE_ZH);
            setSession(prev => ({ ...prev, stage: AppStage.WAITING_POST_CHOICE }));
          }, 1000);
        }
      } catch (error) {
        console.error("Chat Error", error);
        setIsLoading(false);
        addMessage(Sender.AI, language === 'en' ? "I apologize, but my connection to the ether is disrupted. Please try again." : "很抱歉，我与梦境的连接暂时中断了。请重试。");
      }
      return;
    }

    // Legacy handling for other stages (shouldn't normally reach here with new flow)
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
        if (text in AnalysisStyleId) {
          style = text as AnalysisStyleId;
        } else {
          style = AnalysisStyleId.UNSELECTED;
        }
        setSession(prev => ({ ...prev, style, stage: AppStage.ANALYZING }));
        nextStage = AppStage.CONVERSATION;
      }

      const responseText = await sendMessageToGemini(
        text,
        currentStage,
        dreamContext,
        style
      );

      setIsLoading(false);
      addMessage(Sender.AI, responseText);
      setSession(prev => ({ ...prev, stage: nextStage }));

    } catch (error) {
      console.error("Chat Error", error);
      setIsLoading(false);
      addMessage(Sender.AI, language === 'en' ? "I apologize, but my connection to the ether is disrupted. Please try again." : "很抱歉，我与梦境的连接暂时中断了。请重试。");
    }
  };

  // Handler for "Start Analysis" button click
  const handleStartAnalysis = async () => {
    // Combine all dream segments into one dream content
    const combinedDream = dreamSegments.join('\n');

    if (!combinedDream.trim()) {
      // No dream content, ignore
      return;
    }

    setSession(prev => ({ ...prev, dreamContent: combinedDream, stage: AppStage.ASKING_STYLE }));
    setIsLoading(true);

    try {
      const responseText = await sendMessageToGemini(
        combinedDream,
        AppStage.WAITING_DREAM,
        combinedDream,
        AnalysisStyleId.UNSELECTED
      );

      setIsLoading(false);
      addMessage(Sender.AI, responseText);
      setSession(prev => ({ ...prev, stage: AppStage.WAITING_STYLE }));
    } catch (error) {
      console.error("Chat Error", error);
      setIsLoading(false);
      addMessage(Sender.AI, language === 'en' ? "I apologize, but my connection to the ether is disrupted. Please try again." : "很抱歉，我与梦境的连接暂时中断了。请重试。");
    }
  };

  const handleStyleSelect = (selectedStyleId: AnalysisStyleId) => {
    // We update session immediately to reflect choice internally
    setSession(prev => ({ ...prev, style: selectedStyleId }));

    // Visual feedback for the chat: show what they picked
    const labelMap: Record<AnalysisStyleId, { en: string; zh: string }> = {
      [AnalysisStyleId.RATIONAL]: { en: "Rational Analysis", zh: "理性分析" },
      [AnalysisStyleId.PSY_INTEGRATIVE]: { en: "Modern Counseling", zh: "现代咨询整合" },
      [AnalysisStyleId.PSY_FREUD]: { en: "Freudian Analysis", zh: "精神分析（弗洛伊德）" },
      [AnalysisStyleId.PSY_JUNG]: { en: "Jungian Analysis", zh: "分析心理学（荣格）" },
      [AnalysisStyleId.FOLK_CN]: { en: "Chinese Folk", zh: "中国民俗/术数" },
      [AnalysisStyleId.FOLK_GREEK]: { en: "Greek-Roman", zh: "古希腊罗马" },
      [AnalysisStyleId.FOLK_JUDEO]: { en: "Judeo-Christian", zh: "犹太-基督教" },
      [AnalysisStyleId.FOLK_ISLAM]: { en: "Islamic Tradition", zh: "伊斯兰传统" },
      [AnalysisStyleId.FOLK_DHARMA]: { en: "Buddhist/Hindu", zh: "印度/佛教" },
      [AnalysisStyleId.CREATIVE]: { en: "Creative Inspiration", zh: "灵感创作" },
      [AnalysisStyleId.PSYCHOLOGY]: { en: "Psychological", zh: "心理视角" },
      [AnalysisStyleId.FOLK]: { en: "Folk & Metaphor", zh: "玄学民俗" },
      [AnalysisStyleId.UNSELECTED]: { en: "Default", zh: "默认" }
    };

    const labels = labelMap[selectedStyleId] || { en: selectedStyleId, zh: selectedStyleId };
    const label = language === 'zh' ? labels.zh : labels.en;

    // Call custom handler to ensure ID is passed correctly to backend
    handleUserSendWithStyle(label, selectedStyleId);
  };

  const handleUserSendWithStyle = async (text: string, explicitStyle?: AnalysisStyleId) => {
    addMessage(Sender.USER, text);
    setIsLoading(true);

    let currentStage = session.stage;
    let dreamContext = session.dreamContent;
    let style = explicitStyle || session.style;

    try {
      if (currentStage === AppStage.WAITING_STYLE) {
        setSession(prev => ({ ...prev, style, stage: AppStage.ANALYZING }));
      }

      const responseText = await sendMessageToGemini(
        text, // The user's visual message
        currentStage,
        dreamContext,
        style // The strictly typed ID
      );

      setIsLoading(false);
      addMessage(Sender.AI, responseText);

      // Check if this response is a follow-up question or complete analysis
      // Simple heuristic: if response ends with "?" it's likely a follow-up
      const isFollowUp = responseText.trim().endsWith('?') || responseText.trim().endsWith('？');

      if (isFollowUp) {
        // AI is asking for more info, go to FOLLOW_UP stage (no post-analysis yet)
        setSession(prev => ({ ...prev, stage: AppStage.FOLLOW_UP }));
      } else {
        // Analysis is complete, show post-analysis choice
        setTimeout(() => {
          addMessage(Sender.AI, language === 'en' ? POST_ANALYSIS_MESSAGE_EN : POST_ANALYSIS_MESSAGE_ZH);
          setSession(prev => ({ ...prev, stage: AppStage.WAITING_POST_CHOICE }));
        }, 1000);
      }

    } catch (error) {
      console.error("Chat Error", error);
      setIsLoading(false);
      addMessage(Sender.AI, language === 'en' ? "I apologize, but my connection to the ether is disrupted. Please try again." : "很抱歉，我与梦境的连接暂时中断了。请重试。");
    }
  };

  const handlePostAnalysisChoice = async (choice: PostAnalysisChoice) => {
    // Add visual feedback for what user picked
    const choiceLabel = choice === 'continue'
      ? (language === 'en' ? 'Continue Analyzing' : '继续解梦')
      : (language === 'en' ? 'Generate Dream Card' : '生成梦境卡');
    addMessage(Sender.USER, choiceLabel);

    if (choice === 'continue') {
      // Reset for new dream
      addMessage(Sender.AI, language === 'en' ? CONTINUE_MESSAGE_EN : CONTINUE_MESSAGE_ZH);
      startNewChat();
      setDreamSegments([]);
      setSession({
        dreamContent: '',
        style: AnalysisStyleId.UNSELECTED,
        stage: AppStage.COLLECTING_DREAM
      });
    } else {
      // Generate dream card
      addMessage(Sender.AI, language === 'en' ? GENERATING_CARD_MESSAGE_EN : GENERATING_CARD_MESSAGE_ZH);
      setSession(prev => ({ ...prev, stage: AppStage.GENERATING_CARD }));
      setIsLoading(true);

      try {
        // 1. Get image prompt from Gemini
        const imagePrompt = await generateImagePrompt(session.dreamContent);
        console.log('Generated image prompt:', imagePrompt);

        // 2. Generate image from Replicate
        const imageUrl = await generateDreamCard(imagePrompt);
        console.log('Generated image URL:', imageUrl);

        setIsLoading(false);

        // 3. Display the dream card
        addMessage(
          Sender.AI,
          language === 'en' ? CARD_COMPLETE_MESSAGE_EN : CARD_COMPLETE_MESSAGE_ZH,
          imageUrl
        );

        // 4. After showing card, offer to continue
        setTimeout(() => {
          addMessage(Sender.AI, language === 'en' ? POST_ANALYSIS_MESSAGE_EN : POST_ANALYSIS_MESSAGE_ZH);
          setSession(prev => ({ ...prev, stage: AppStage.WAITING_POST_CHOICE }));
        }, 1500);

        setSession(prev => ({ ...prev, stage: AppStage.SHOWING_CARD }));
      } catch (error) {
        console.error('Dream card generation error:', error);
        setIsLoading(false);
        addMessage(
          Sender.AI,
          language === 'en'
            ? "I'm sorry, I couldn't capture your dream this time. Would you like to try again or explore another dream?"
            : "抱歉，这次无法捕捉你的梦境。你想重试还是探索另一个梦？"
        );
        setSession(prev => ({ ...prev, stage: AppStage.WAITING_POST_CHOICE }));
      }
    }
  };

  const toggleLanguage = () => {
    setLanguage(prev => {
      const newLang = prev === 'en' ? 'zh' : 'en';

      // Update greeting if it's the initial state (only 1 message from AI)
      setMessages(msgs => {
        if (msgs.length === 1 && msgs[0].sender === Sender.AI) {
          return [{
            ...msgs[0],
            text: newLang === 'zh' ? INITIAL_MESSAGE_ZH : INITIAL_MESSAGE_EN
          }];
        }
        return msgs;
      });

      return newLang;
    });
  };

  // The main app content - used both in normal and mobile preview mode
  const appContent = (
    <div className={`h-full flex flex-col bg-[#F2F2F7] relative overflow-hidden ${mobilePreview ? 'rounded-[2rem]' : ''}`}>

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        language={language}
        onToggleLanguage={toggleLanguage}
      />

      {/* Header */}
      <header className={`flex-none h-14 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-4 z-20 sticky top-0 shadow-sm ${mobilePreview ? 'rounded-t-[2rem]' : ''}`}>
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 -ml-2 text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
        >
          <Menu size={24} />
        </button>

        <div className="flex flex-col items-center">
          <h1 className="text-base font-semibold text-black">Dream Whisperer</h1>
          {isLoading ? (
            <span className="text-[10px] text-gray-500 font-medium">{language === 'en' ? 'Connecting...' : '连接中...'}</span>
          ) : (
            <span className="text-[10px] text-gray-500 font-medium">{language === 'en' ? 'Online' : '在线'}</span>
          )}
        </div>

        <button className="p-2 -mr-2 text-gray-800 hover:bg-gray-100 rounded-full transition-colors">
          <MoreHorizontal size={24} />
        </button>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 no-scrollbar">
        <div className="max-w-4xl mx-auto min-h-full flex flex-col justify-start">
          {/* Date Divider */}
          <div className="flex justify-center mb-6 mt-4">
            <span className="bg-gray-200 text-gray-500 text-xs px-2 py-1 rounded">
              {language === 'en' ? 'Today' : '今天'}
            </span>
          </div>

          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {/* Style Selector rendered only when waiting for style and not loading */}
          {session.stage === AppStage.WAITING_STYLE && !isLoading && (
            <StyleSelector onSelect={handleStyleSelect} language={language} />
          )}

          {/* Start Analysis Button - shows when user has entered dream segments */}
          {session.stage === AppStage.COLLECTING_DREAM && dreamSegments.length > 0 && !isLoading && (
            <StartAnalysisButton onClick={handleStartAnalysis} language={language} />
          )}

          {/* Post Analysis Selector */}
          {session.stage === AppStage.WAITING_POST_CHOICE && !isLoading && (
            <PostAnalysisSelector onSelect={handlePostAnalysisChoice} language={language} />
          )}

          {isLoading && (
            <MessageBubble
              message={{
                id: 'loading',
                sender: Sender.AI,
                text: '',
                type: MessageType.LOADING,
                timestamp: new Date()
              }}
            />
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <InputArea
        onSend={handleUserSend}
        disabled={isLoading || session.stage === AppStage.WAITING_STYLE || session.stage === AppStage.WAITING_POST_CHOICE || session.stage === AppStage.GENERATING_CARD}
        language={language}
      />

    </div>
  );

  // When mobile preview is active, wrap in phone frame
  if (mobilePreview) {
    return (
      <div className="h-full w-full bg-gray-900 flex items-center justify-center p-8">
        {/* Top bar with toggle button */}
        <div className="absolute top-4 left-4 z-50">
          <button
            onClick={() => setMobilePreview(false)}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors backdrop-blur-sm"
          >
            <Smartphone size={18} />
            <span className="text-sm">{language === 'en' ? 'Exit Preview' : '退出预览'}</span>
          </button>
        </div>

        {/* Phone Frame */}
        <div className="relative">
          {/* Phone outer frame */}
          <div className="w-[430px] h-[764px] bg-black rounded-[3rem] p-3 shadow-2xl">
            {/* Phone inner bezel */}
            <div className="w-full h-full bg-black rounded-[2.5rem] overflow-hidden relative">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-30"></div>

              {/* Screen content */}
              <div className="w-full h-full overflow-hidden">
                {appContent}
              </div>
            </div>
          </div>

          {/* Side buttons decoration */}
          <div className="absolute top-24 -left-1 w-1 h-8 bg-gray-700 rounded-l"></div>
          <div className="absolute top-36 -left-1 w-1 h-12 bg-gray-700 rounded-l"></div>
          <div className="absolute top-52 -left-1 w-1 h-12 bg-gray-700 rounded-l"></div>
          <div className="absolute top-32 -right-1 w-1 h-16 bg-gray-700 rounded-r"></div>
        </div>
      </div>
    );
  }

  // Normal desktop view with mobile preview toggle in header
  return (
    <div className="h-full flex flex-col bg-[#F2F2F7] relative overflow-hidden">

      {/* Top toolbar for mobile preview toggle */}
      <div className="flex-none h-10 bg-gray-800 flex items-center justify-between px-4">
        <span className="text-white text-sm font-medium">Dream Whisperer</span>
        <button
          onClick={() => setMobilePreview(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm"
        >
          <Smartphone size={16} />
          <span>9:16</span>
        </button>
      </div>

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        language={language}
        onToggleLanguage={toggleLanguage}
      />

      {/* Header */}
      <header className="flex-none h-14 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-4 z-20 sticky top-0 shadow-sm">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 -ml-2 text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
        >
          <Menu size={24} />
        </button>

        <div className="flex flex-col items-center">
          <h1 className="text-base font-semibold text-black">Dream Whisperer</h1>
          {isLoading ? (
            <span className="text-[10px] text-gray-500 font-medium">{language === 'en' ? 'Connecting...' : '连接中...'}</span>
          ) : (
            <span className="text-[10px] text-gray-500 font-medium">{language === 'en' ? 'Online' : '在线'}</span>
          )}
        </div>

        <button className="p-2 -mr-2 text-gray-800 hover:bg-gray-100 rounded-full transition-colors">
          <MoreHorizontal size={24} />
        </button>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 no-scrollbar">
        <div className="max-w-4xl mx-auto min-h-full flex flex-col justify-start">
          {/* Date Divider */}
          <div className="flex justify-center mb-6 mt-4">
            <span className="bg-gray-200 text-gray-500 text-xs px-2 py-1 rounded">
              {language === 'en' ? 'Today' : '今天'}
            </span>
          </div>

          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {/* Style Selector rendered only when waiting for style and not loading */}
          {session.stage === AppStage.WAITING_STYLE && !isLoading && (
            <StyleSelector onSelect={handleStyleSelect} language={language} />
          )}

          {/* Start Analysis Button - shows when user has entered dream segments */}
          {session.stage === AppStage.COLLECTING_DREAM && dreamSegments.length > 0 && !isLoading && (
            <StartAnalysisButton onClick={handleStartAnalysis} language={language} />
          )}

          {/* Post Analysis Selector */}
          {session.stage === AppStage.WAITING_POST_CHOICE && !isLoading && (
            <PostAnalysisSelector onSelect={handlePostAnalysisChoice} language={language} />
          )}

          {isLoading && (
            <MessageBubble
              message={{
                id: 'loading',
                sender: Sender.AI,
                text: '',
                type: MessageType.LOADING,
                timestamp: new Date()
              }}
            />
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <InputArea
        onSend={handleUserSend}
        disabled={isLoading || session.stage === AppStage.WAITING_STYLE || session.stage === AppStage.WAITING_POST_CHOICE || session.stage === AppStage.GENERATING_CARD}
        language={language}
      />

    </div>
  );
}

export default App;