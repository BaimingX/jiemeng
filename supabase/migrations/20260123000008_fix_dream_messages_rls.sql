-- Fix dream_messages RLS policy
-- 1. Restrict users to only insert messages with sender='user'
-- 2. Verify conversation_date_id belongs to the user (prevents dirty data)
-- AI messages must be inserted via Edge Function with service role

-- Drop the existing permissive policy
DROP POLICY IF EXISTS "Users can insert their own messages" ON public.dream_messages;

-- Create new restrictive policy: 
-- - Users can only insert their own USER messages
-- - conversation_date_id must exist in dream_conversations for this user
CREATE POLICY "Users can insert only own user messages in own conversation date"
ON public.dream_messages FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND sender = 'user'
  AND message_type IN ('text', 'image')
  AND EXISTS (
    SELECT 1 FROM public.dream_conversations c
    WHERE c.user_id = auth.uid()
      AND c.date_id = conversation_date_id
  )
);

COMMENT ON POLICY "Users can insert only own user messages in own conversation date" ON public.dream_messages 
IS 'Security: Users can only insert sender=user messages into their own conversations. AI/system messages are inserted by Edge Functions via service role.';
