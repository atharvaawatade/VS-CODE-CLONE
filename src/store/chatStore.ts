import { create } from 'zustand';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: number;
}

interface ChatStore {
  messages: Message[];
  addMessage: (content: string, role: 'user' | 'assistant') => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  addMessage: (content, role) => set((state) => ({
    messages: [...state.messages, {
      id: Date.now().toString(),
      content,
      role,
      timestamp: Date.now(),
    }],
  })),
  clearMessages: () => set({ messages: [] }),
}));