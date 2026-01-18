-- Add conversation_history column to dream_conversations for JSON storage
ALTER TABLE public.dream_conversations
ADD COLUMN conversation_history JSONB;

-- Comment for clarity
COMMENT ON COLUMN public.dream_conversations.conversation_history IS 'Full conversation history stored as a single JSON object for archival';
