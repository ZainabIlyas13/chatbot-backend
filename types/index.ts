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

// Appointment types
export interface Appointment {
  id: string;
  title: string;
  description: string | null;
  date: Date;
  duration: number;
  clientName: string;
  clientEmail: string;
  clientPhone: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAppointmentArgs {
  title: string;
  description?: string;
  date: string; // ISO date string
  duration?: number;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
}

export interface UpdateAppointmentArgs {
  clientEmail: string;
  date?: string;
  title?: string;
  description?: string;
  newDate?: string;
  duration?: number;
  clientName?: string;
  clientPhone?: string;
  status?: string;
}
