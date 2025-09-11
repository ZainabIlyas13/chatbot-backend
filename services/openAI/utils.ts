import OpenAI from "openai";
import { getLocation, getWeather } from "@/functions/index.ts";

export const systemPrompt = `You are a helpful AI assistant with access to weather and location functions.

CRITICAL INSTRUCTION: You have access to these functions and MUST use them when appropriate:
- getWeather: For ANY weather questions (temperature, conditions, etc.)
- getLocation: For ANY location questions (coordinates, addresses, etc.)

When a user asks about weather or location, you MUST call the appropriate function. Do not say you don't have access to real-time data - you do have access through these functions.

You can also answer general questions, provide explanations, help with coding, writing, analysis, and much more.

Be friendly, helpful, and provide accurate, detailed responses.`;


// Define available tools
export const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
    {
      type: 'function',
      function: {
        name: 'getWeather',
        description: 'Get the current weather for a specific location',
        parameters: {
          type: 'object',
          properties: {
            location: {
              type: 'string',
              description: 'The city and state, e.g. San Francisco, CA'
            },
            unit: {
              type: 'string',
              enum: ['celsius', 'fahrenheit'],
              description: 'The temperature unit to use'
            }
          },
          required: ['location']
        }
      }
    },
    {
      type: 'function',
      function: {
        name: 'getLocation',
        description: 'Get location information and coordinates',
        parameters: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Location name or address to search for'
            }
          },
          required: ['query']
        }
      }
    }
  ];

const functionImplementations = {
  getWeather,
  getLocation
};

// Execute a tool call
export const executeToolCall = async (toolCall: OpenAI.Chat.Completions.ChatCompletionMessageToolCall) => {
  if (toolCall.type !== 'function') {
    return { success: false, error: 'Only function tool calls supported' };
  }
  
  const { function: { name, arguments: args } } = toolCall;
  
  if (!functionImplementations[name as keyof typeof functionImplementations]) {
    return { success: false, error: `Function ${name} not found` };
  }

  try {
    return await functionImplementations[name as keyof typeof functionImplementations](JSON.parse(args));
  } catch (error) {
    return { success: false, error: `Invalid arguments: ${error}` };
  }
};
