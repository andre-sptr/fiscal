-- Create chat_sessions table
CREATE TABLE public.chat_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT DEFAULT 'New Chat',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on chat_sessions
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies for chat_sessions
CREATE POLICY "Users can view their own chat sessions" 
ON public.chat_sessions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chat sessions" 
ON public.chat_sessions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat sessions" 
ON public.chat_sessions FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat sessions" 
ON public.chat_sessions FOR DELETE 
USING (auth.uid() = user_id);

-- Create messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  transaction_data JSONB,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'pending_confirmation', 'confirmed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for messages
CREATE POLICY "Users can view their own messages" 
ON public.messages FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own messages" 
ON public.messages FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own messages" 
ON public.messages FOR UPDATE 
USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_chat_sessions_updated_at
BEFORE UPDATE ON public.chat_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();