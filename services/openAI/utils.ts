import OpenAI from "openai";
import { getLocation, getWeather } from "@/functions/index.ts";
import { appointmentService } from "@/services/appointments/index.ts";

export const getSystemPrompt = `You are a helpful AI assistant with access to weather, location, and appointment booking functions.

You are going to make appointments for 2025

CRITICAL INSTRUCTION: You have access to these functions and MUST use them when appropriate:
- getWeather: For ANY weather questions (temperature, conditions, etc.)
- getLocation: For ANY location questions (coordinates, addresses, etc.)
- createAppointment: For booking new appointments
- getAppointments: For viewing existing appointments
- updateAppointment: For modifying appointment details
- deleteAppointment: For cancelling appointments

When a user asks about weather, location, or appointments, you MUST call the appropriate function. Do not say you don't have access to real-time data or appointment management - you do have access through these functions.

APPOINTMENT BOOKING GUIDELINES:
- For appointments, ONLY use dates in 2025 that are current or future. Never suggest dates from previous years, previous months in 2025.
- When creating appointments, use reasonable defaults for optional fields:
  - If no duration is specified, use 60 minutes
  - If no description is provided, use a simple description like "Appointment with [client name]"
  - If no phone number is provided, that's fine - it's optional
- Be proactive and create appointments with the information provided. Don't ask for optional details unless absolutely necessary.
- If you have the minimum required information (title, date, client name, client email), proceed with creating the appointment.

You can also answer general questions, provide explanations, help with coding, writing, analysis, and much more.

FORMATTING: Always respond in Markdown format.

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
    },
    {
      type: 'function',
      function: {
        name: 'createAppointment',
        description: 'Create a new appointment booking. Use defaults for optional fields if not provided.',
        parameters: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Title of the appointment'
            },
            description: {
              type: 'string',
              description: 'Description of the appointment (optional - will use default if not provided)'
            },
            date: {
              type: 'string',
              description: 'Date and time of the appointment in ISO format (e.g., 2025-01-15T14:30:00Z)'
            },
            duration: {
              type: 'number',
              description: 'Duration of the appointment in minutes (optional - defaults to 60)'
            },
            clientName: {
              type: 'string',
              description: 'Name of the client'
            },
            clientEmail: {
              type: 'string',
              description: 'Email address of the client'
            },
            clientPhone: {
              type: 'string',
              description: 'Phone number of the client (optional)'
            }
          },
          required: ['title', 'date', 'clientName', 'clientEmail']
        }
      }
    },
    {
      type: 'function',
      function: {
        name: 'getAppointments',
        description: 'Get all appointments or filter by status/email',
        parameters: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              description: 'Filter by appointment status (scheduled, confirmed, cancelled, completed)'
            },
            clientEmail: {
              type: 'string',
              description: 'Filter by client email address'
            }
          },
          required: []
        }
      }
    },
    {
      type: 'function',
      function: {
        name: 'updateAppointment',
        description: 'Update an existing appointment by client email and date',
        parameters: {
          type: 'object',
          properties: {
            clientEmail: {
              type: 'string',
              description: 'Email address of the client whose appointment to update'
            },
            date: {
              type: 'string',
              description: 'Current date of the appointment to update (optional - if not provided, updates most recent)'
            },
            title: {
              type: 'string',
              description: 'New title for the appointment'
            },
            description: {
              type: 'string',
              description: 'New description for the appointment'
            },
            newDate: {
              type: 'string',
              description: 'New date and time in ISO format (for rescheduling)'
            },
            duration: {
              type: 'number',
              description: 'New duration in minutes'
            },
            clientName: {
              type: 'string',
              description: 'New client name'
            },
            clientPhone: {
              type: 'string',
              description: 'New client phone'
            },
            status: {
              type: 'string',
              description: 'New status (scheduled, confirmed, cancelled, completed)'
            }
          },
          required: ['clientEmail']
        }
      }
    },
    {
      type: 'function',
      function: {
        name: 'deleteAppointment',
        description: 'Delete/cancel an appointment by client email and date',
        parameters: {
          type: 'object',
          properties: {
            clientEmail: {
              type: 'string',
              description: 'Email address of the client whose appointment to delete'
            },
            date: {
              type: 'string',
              description: 'Date of the appointment to delete (optional - if not provided, deletes most recent)'
            }
          },
          required: ['clientEmail']
        }
      }
    },
  ];

const functionImplementations = {
  getWeather: (args: { location: string; unit?: string }) => getWeather(args.location, args.unit),
  getLocation: (args: { query: string }) => getLocation(args.query),
  createAppointment: appointmentService.createAppointment,
  getAppointments: appointmentService.getAppointments,
  updateAppointment: appointmentService.updateAppointment,
  deleteAppointment: appointmentService.deleteAppointment,
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
