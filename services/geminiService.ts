// Frontend service that calls Supabase Edge Function for dream analysis
import { AppStage, AnalysisStyleId } from "../types";

// Get Supabase URL from environment or use default
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Conversation history for multi-turn chat
let conversationHistory: Array<{ role: 'user' | 'model', text: string }> = [];

export const initializeGemini = () => {
  // No-op for compatibility - initialization happens on the server
};

export const startNewChat = () => {
  // Clear conversation history for a new chat
  conversationHistory = [];
};

export const sendMessageToGemini = async (
  message: string,
  stage: AppStage,
  dreamContext: string,
  style: AnalysisStyleId
): Promise<string> => {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/dream-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify({
        message,
        stage,
        dreamContext,
        style,
        history: conversationHistory
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Dream chat API error:', errorData);
      throw new Error(errorData.error || 'Failed to get AI response');
    }

    const data = await response.json();
    const aiResponse = data.text;

    // Update conversation history
    conversationHistory.push({ role: 'user', text: message });
    conversationHistory.push({ role: 'model', text: aiResponse });

    return aiResponse;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The connection is weak. I could not interpret that.";
  }
};