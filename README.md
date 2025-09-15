# Chatbot Backend

A simple and clean Node.js backend for an OpenAI-powered chatbot.

## ✨ Features

- 🤖 **OpenAI Integration**: Powered by GPT-4o-mini
- 🏥 **Health Checks**: Simple health monitoring endpoint
- 🌐 **CORS Support**: Basic CORS for frontend integration
- ⚡ **Simple & Clean**: Minimal code, easy to understand

## Frontend Integration

This backend is designed to work seamlessly with your frontend `chatService`. The API endpoints match exactly what your frontend expects:

- `POST /chat` - For sending messages
- `GET /health` - For health checks

## Development

The server runs on `http://localhost:5000` by default. All endpoints are logged to the console for easy debugging.

## License

ISC