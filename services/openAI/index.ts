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

  async processChat(messages: ChatMessage[], res: any) {
    // Add system prompt if not already present
    const messagesWithSystem = messages.some(message => message.role === ChatRole.SYSTEM) 
      ? messages 
      : [{ role: ChatRole.SYSTEM as const, content: getSystemPrompt }, ...messages];

    try {
      // First, check if we need to call tools (non-streaming)
      const response = await this.client.chat.completions.create({
        model: config.openai.model,
        messages: messagesWithSystem,
        max_tokens: config.openai.maxTokens,
        temperature: config.openai.temperature,
        tools: tools,
        tool_choice: 'auto'
      });
      
      const message = response.choices[0].message;

      // If tool calls are needed, execute them first
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

          // Now stream the final response
          const finalStream = await this.client.chat.completions.create({
            model: config.openai.model,
            messages: messagesWithTool,
            max_tokens: config.openai.maxTokens,
            temperature: config.openai.temperature,
            stream: true
          });

          // Stream the final response
          for await (const chunk of finalStream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              res.write(`data: ${JSON.stringify({ content })}\n\n`);
            }
          }
        }
      } else {
        // No tool calls needed, stream the response directly
        const stream = await this.client.chat.completions.create({
          model: config.openai.model,
          messages: messagesWithSystem,
          max_tokens: config.openai.maxTokens,
          temperature: config.openai.temperature,
          stream: true
        });

        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            res.write(`data: ${JSON.stringify({ content })}\n\n`);
          }
        }
      }

      res.write('data: [DONE]\n\n');
      res.end();

    } catch (error) {
      console.error('Streaming error:', error);
      res.write(`data: ${JSON.stringify({ error: 'Streaming failed' })}\n\n`);
      res.end();
    }
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
