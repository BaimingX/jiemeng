export enum Sender {
  USER = 'user',
  AI = 'ai',
  SYSTEM = 'system'
}

export enum MessageType {
  TEXT = 'text',
  LOADING = 'loading',
  IMAGE = 'image'
}

export interface Message {
  id: string;
  sender: Sender;
  text: string;
  type: MessageType;
  timestamp: Date;
  imageUrl?: string;
}

export enum AnalysisStyleId {
  // Rational (no sub-styles)
  RATIONAL = 'RATIONAL',

  // Psychology sub-styles
  PSY_INTEGRATIVE = 'PSY_INTEGRATIVE',  // 现代咨询整合
  PSY_FREUD = 'PSY_FREUD',              // 精神分析
  PSY_JUNG = 'PSY_JUNG',                // 分析心理学

  // Folk/Cultural sub-styles
  FOLK_CN = 'FOLK_CN',                  // 中国民俗/术数
  FOLK_GREEK = 'FOLK_GREEK',            // 古希腊罗马
  FOLK_JUDEO = 'FOLK_JUDEO',            // 犹太基督教
  FOLK_ISLAM = 'FOLK_ISLAM',            // 伊斯兰传统
  FOLK_DHARMA = 'FOLK_DHARMA',          // 印度/佛教

  // Creative (no sub-styles)
  CREATIVE = 'CREATIVE',

  // Legacy/Default
  PSYCHOLOGY = 'PSYCHOLOGY',  // Legacy, maps to PSY_INTEGRATIVE
  FOLK = 'FOLK',              // Legacy, maps to FOLK_CN
  UNSELECTED = 'UNSELECTED'
}

// Category type for first-level selection
export type StyleCategory = 'RATIONAL' | 'PSYCHOLOGY' | 'FOLK' | 'CREATIVE';

export enum AppStage {
  GREETING = 'greeting',       // AI initiates
  COLLECTING_DREAM = 'collecting_dream', // User is typing dream segments
  WAITING_DREAM = 'waiting_dream', // Waiting for user dream input (legacy, kept for compatibility)
  ASKING_STYLE = 'asking_style',   // AI has dream, asking for style
  WAITING_STYLE = 'waiting_style', // Waiting for user to pick style
  ANALYZING = 'analyzing',         // AI is thinking or asking follow-up
  FOLLOW_UP = 'follow_up',         // AI asked a follow-up question, waiting for user answer
  CONVERSATION = 'conversation',   // Free flowing
  POST_ANALYSIS = 'post_analysis', // AI asks what to do next
  WAITING_POST_CHOICE = 'waiting_post_choice', // Waiting for user choice
  GENERATING_CARD = 'generating_card', // Generating dream card image
  SHOWING_CARD = 'showing_card'    // Displaying the generated card
}

export interface DreamSession {
  dreamContent: string;
  style: AnalysisStyleId;
  stage: AppStage;
}

export type Language = 'en' | 'zh';