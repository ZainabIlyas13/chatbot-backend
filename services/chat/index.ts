import { prisma } from '@/lib/prisma.ts';
import { ChatRole } from '@/types/index.ts';

export interface CreateChatRequest {
  title?: string;
  userId?: string;
}

export interface AddMessageRequest {
  chatId: string;
  role: ChatRole;
  content: string;
}

export interface ChatWithMessages {
  id: string;
  title: string | null;
  userId: string | null;
  createdAt: Date;
  updatedAt: Date;
  messages: {
    id: string;
    role: string;
    content: string;
    createdAt: Date;
  }[];
}

class ChatService {
  // Create a new chat
  async createChat(data: CreateChatRequest) {
    return await prisma.chat.create({
      data: {
        title: data.title || 'New Chat',
        userId: data.userId
      }
    });
  }

  // Get all chats for a user
  async getChats(userId?: string) {
    return await prisma.chat.findMany({
      where: userId ? { userId } : {},
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            role: true,
            content: true,
          }
        }
      }
    });
  }

  // Get a specific chat with messages
  async getChat(chatId: string): Promise<ChatWithMessages | null> {
    return await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            role: true,
            content: true,
          }
        }
      }
    });
  }

  // Add a message to a chat
  async addMessage(data: AddMessageRequest) {
    return await prisma.message.create({
      data: {
        chatId: data.chatId,
        role: data.role,
        content: data.content
      }
    });
  }

  // Update chat title
  async updateChatTitle(chatId: string, title: string) {
    return await prisma.chat.update({
      where: { id: chatId },
      data: { title }
    });
  }

  // Delete a chat
  async deleteChat(chatId: string) {
    return await prisma.chat.delete({
      where: { id: chatId }
    });
  }

  // Get chat history (last N messages)
  async getChatHistory(chatId: string, limit: number = 50) {
    return await prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        role: true,
        content: true,
      }
    });
  }
}

export const chatService = new ChatService();
