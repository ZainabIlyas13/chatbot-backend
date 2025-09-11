// Type definitions for the chatbot backend
export enum ChatRole {
    USER = 'user',
    ASSISTANT = 'assistant',
    SYSTEM = 'system',
  }
  
export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
  }>;
}

export interface ChatRequest {
  messages: ChatMessage[];
}
