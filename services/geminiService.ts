// Frontend service that calls Supabase Edge Function for dream analysis
import { AppStage, AnalysisStyleId } from "../types";
import { supabase } from "../lib/supabaseClient";

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
    // Use supabase.functions.invoke which properly handles JWT authentication
    const { data, error } = await supabase.functions.invoke('dream-chat', {
      body: {
        message,
        stage,
        dreamContext,
        style,
        history: conversationHistory
      }
    });

    if (error) {
      console.error('Dream chat API error:', error);

      // Handle billing-specific errors (FunctionsHttpError with 402 status)
      if (error.message?.includes('402') || error.message?.includes('subscription')) {
        throw new Error('Subscription required');
      }

      throw new Error(error.message || 'Failed to get AI response');
    }

    if (!data || !data.text) {
      console.error('Invalid response from server:', data);
      throw new Error('Invalid response from server');
    }

    const aiResponse = data.text;

    // Update conversation history
    conversationHistory.push({ role: 'user', text: message });
    conversationHistory.push({ role: 'model', text: aiResponse });

    return aiResponse;
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;  // Re-throw to let caller handle the error properly
  }
};