import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000'),
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    maxTokens: parseInt(process.env.MAX_TOKENS || '1000'),
    temperature: parseFloat(process.env.TEMPERATURE || '0.7')
  },
  openWeatherMap: {
    apiKey: process.env.OPENWEATHERMAP_API_KEY || ''
  },
  database: {
    url: process.env.DATABASE_URL || ''
  }
};
