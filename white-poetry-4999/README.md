# Chat Assistant - Cloudflare Workers AI

A modern, AI-powered chat interface built with Next.js and Cloudflare Workers. This application features a polished chat UI with streaming responses, designed to work with Cloudflare Workers AI (Llama 3.3).

## Features

- 🎨 **Modern UI**: Beautiful, responsive chat interface with dark mode support
- 💬 **Real-time Streaming**: Messages stream in real-time for a natural conversation experience
- 🤖 **AI Integration Ready**: Prepared for Cloudflare Workers AI integration
- 📱 **Mobile Friendly**: Fully responsive design that works on all devices
- ⚡ **Fast**: Built with Next.js 15 and optimized for Cloudflare Workers

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # Chat API endpoint
│   ├── layout.tsx                # Root layout with metadata
│   ├── page.tsx                  # Main page (Chat UI)
│   └── globals.css               # Global styles
├── components/
│   └── chat/
│       ├── Chat.tsx              # Main chat orchestrator
│       ├── MessageList.tsx       # Message display component
│       └── MessageInput.tsx      # Input form component
└── types/
    └── chat.ts                   # TypeScript types for messages
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Cloudflare account (for deployment)

### Installation

1. Install dependencies:

```bash
npm install
```

2. Run the development server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser to see the chat interface.

## Development

### Running Locally

```bash
npm run dev
```

The chat UI will be available at `http://localhost:3000`. The current implementation uses a mock AI response for testing. To use real Cloudflare Workers AI, see the "Backend - Cloudflare Workers AI Integration" section below.

### Preview on Cloudflare Runtime

Preview the application locally on the Cloudflare runtime with real Cloudflare Workers AI:

```bash
npm run preview
```

This will:
- Build the application for Cloudflare Workers
- Start a local Cloudflare Workers environment
- Connect to real Cloudflare Workers AI (requires Cloudflare account)
- Make the app available at a local URL (usually shown in terminal)

**Note**: For `npm run preview` to work with real AI, you need to:
1. Have a Cloudflare account
2. Be logged in via `wrangler login`
3. Have Workers AI enabled in your account

## Backend - Cloudflare Workers AI Integration

The application is fully integrated with Cloudflare Workers AI using Llama 3.3. The backend API endpoint is located at `/api/chat` and handles all chat interactions.

### API Endpoint: `/api/chat`

**Method**: `POST`

**Request Body**:
```json
{
  "messages": [
    { "role": "user", "content": "Hello!" },
    { "role": "assistant", "content": "Hi there!" },
    { "role": "user", "content": "How are you?" }
  ]
}
```

**Response**: Streaming text response (Server-Sent Events format)

### Configuration

The AI Gateway binding is configured in `wrangler.jsonc`:

```json
{
  "ai": {
    "binding": "AI",
    "type": "gateway"
  }
}
```

### Model Used

- **Model**: `@cf/meta/llama-3.3-70b-instruct-fp8-fast`
- **Max Tokens**: 2048
- **Temperature**: 0.7

### How It Works

1. **Local Development**: Uses a mock model for testing (no Cloudflare account needed)
2. **Cloudflare Preview**: Run `npm run preview` to test with real Cloudflare Workers AI locally
3. **Production**: Automatically uses Llama 3.3 when deployed to Cloudflare Workers

The API route (`src/app/api/chat/route.ts`) automatically detects if Cloudflare Workers AI is available and switches between mock and real AI accordingly.

### Error Handling

The API includes comprehensive error handling for:
- **400 Bad Request**: Invalid input (empty messages, missing content)
- **429 Too Many Requests**: Rate limiting
- **504 Gateway Timeout**: Request timeout
- **500 Internal Server Error**: General errors

Error messages are returned in JSON format:
```json
{
  "error": "Error message here",
  "details": "Additional details in development mode"
}
```

## Components

### Chat Component
The main orchestrator that manages chat state using `@ai-sdk/react`'s `useChat` hook. Handles message sending, receiving, and error states.

### MessageList Component
Displays the conversation history with:
- User messages (right-aligned, blue background)
- Assistant messages (left-aligned, gray background)
- Loading indicators with animated dots
- Empty state when no messages exist

### MessageInput Component
Text input area with:
- Auto-resizing textarea
- Send button with icon
- Keyboard shortcuts (Enter to send, Shift+Enter for new line)
- Disabled state during loading

## Styling

The UI uses Tailwind CSS v4 with:
- Dark mode support (automatic based on system preference)
- Responsive design
- Modern color scheme
- Smooth animations and transitions

## Deployment

### Deploy to Cloudflare

```bash
npm run deploy
```

This will:
- Build the application for Cloudflare Workers
- Deploy to Cloudflare's global network
- Make your chat app available worldwide

**Prerequisites**:
- Cloudflare account
- Logged in via `wrangler login`
- Workers AI enabled in your account

### Build Only

```bash
npm run build
```

Builds the application without deploying.

### Upload to Cloudflare (without deploying)

```bash
npm run upload
```

Uploads the build to Cloudflare without making it live.

## Testing

### Frontend Testing

1. **Send Messages**: Type a message and press Enter or click Send
2. **Streaming**: Watch messages stream in real-time
3. **Error Handling**: Test error states by temporarily breaking the API
4. **Mobile**: Test on mobile devices or resize browser window
5. **Long Messages**: Test with very long messages to ensure proper wrapping

### Backend Testing

#### Test API Endpoint Directly

You can test the API endpoint using curl:

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Hello, how are you?"}
    ]
  }'
```

#### Test with Real Cloudflare Workers AI

1. **Login to Cloudflare**:
   ```bash
   npx wrangler login
   ```

2. **Preview with Real AI**:
   ```bash
   npm run preview
   ```

3. **Test the API**: The preview will show a local URL where you can test with real Llama 3.3 responses

#### Verify AI Binding

Check that the AI binding is properly configured:

```bash
npm run cf-typegen
```

This regenerates TypeScript types and will show if the AI binding is detected.

## Customization

### Changing Colors

Edit `src/app/globals.css` to customize the color scheme:

```css
:root {
  --background: #ffffff;
  --foreground: #171717;
}
```

### Modifying Chat Behavior

Edit `src/components/chat/Chat.tsx` to customize:
- Initial messages
- System prompts
- Message formatting
- Error handling

### Adding Features

- **Voice Input**: Add voice recording capability to `MessageInput.tsx`
- **Message History**: Persist messages to localStorage or a database
- **User Profiles**: Add user authentication and profiles
- **File Uploads**: Add file attachment support

## Troubleshooting

### Messages Not Streaming

- Check that the API route is returning the correct streaming format
- Verify `@ai-sdk/react` is properly installed
- Check browser console for errors

### Styling Issues

- Ensure Tailwind CSS is properly configured
- Check that `globals.css` is imported in `layout.tsx`
- Verify dark mode classes are working

### API Errors

- Check the API route logs
- Verify the request format matches what `useChat` expects
- Ensure error handling is properly implemented

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

## License

This project is open source and available under the MIT License.
