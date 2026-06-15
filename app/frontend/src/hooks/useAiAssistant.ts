import { useMutation } from '@tanstack/react-query';
import { chatWithAssistant } from '../api/ai.api';

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

/**
 * Hook for chatting with the built-in AI assistant.
 * Manages the mutation state — message history is kept in component state.
 */
export const useAiAssistant = () => {
  return useMutation({
    mutationFn: (data: { message: string; conversationId?: string }) =>
      chatWithAssistant(data),
  });
};
