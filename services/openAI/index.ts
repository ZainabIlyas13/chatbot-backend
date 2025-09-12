import OpenAI from 'openai';
import { config } from '@/config/index.ts';
import { ChatRole, type ChatMessage } from '@/types/index.ts';
import { executeToolCall, getSystemPrompt, tools } from './utils.ts';

class OpenAIService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({ 
      apiKey: config.openai.apiKey 
    });
  }

  async processChat(messages: ChatMessage[]) {
    // Add system prompt if not already present
    const messagesWithSystem = messages.some(message => message.role === ChatRole.SYSTEM) 
      ? messages 
      : [{ role: ChatRole.SYSTEM as const, content: getSystemPrompt() }, ...messages];

    const response = await this.client.chat.completions.create({
      model: config.openai.model,
      messages: messagesWithSystem,
      max_tokens: config.openai.maxTokens,
      temperature: config.openai.temperature,
      tools: tools,
      tool_choice: 'auto'
    });
    
    const message = response.choices[0].message;

    // Check if the model wants to call a tool
    if (message.tool_calls && message.tool_calls.length > 0) {
      const toolCall = message.tool_calls[0];
      
      if (toolCall.type === 'function') {        
        // Execute the tool call
        const toolResult = await executeToolCall(toolCall);
        
        // Add the tool result to the conversation
        const messagesWithTool = [
          ...messagesWithSystem,
          message,
          {
            role: 'tool' as const,
            content: JSON.stringify(toolResult),
            tool_call_id: toolCall.id
          }
        ];

        // Get the final response after tool execution
        const finalResponse = await this.client.chat.completions.create({
          model: config.openai.model,
          messages: messagesWithTool,
          max_tokens: config.openai.maxTokens,
          temperature: config.openai.temperature
        });

        return {
          choices: finalResponse.choices as Array<{ message: { role: string; content: string } }>
        };
      }
    }
    
    // No tool call needed, return the response directly
    return {
      choices: response.choices as Array<{ message: { role: string; content: string } }>
    };
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.client.models.list();
      return true;
    } catch (error) {
      console.error('OpenAI connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const openaiService = new OpenAIService();
