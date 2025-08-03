# AI Chat with Multi-Step Tool Progress

**📚 Languages:** [English](README.md) | [Русский](README_ru.md)

A Next.js application demonstrating Vercel AI SDK v5 (beta) capabilities with Google Generative AI, featuring real-time progress tracking for multi-step tool operations.

## 🎬 Demo

<video src="https://github.com/user-attachments/assets/f3e5f2a0-92a9-4bc5-b8df-e73da69bc6fd" width="800" controls></video>

*See the AI tool streaming in action with real-time progress updates*

### 📖 Want to understand how this works?

**[📋 Complete Technical Implementation Guide](.memory-bank/real-time-streaming-implementation.md)** - Step-by-step guide showing exactly how to implement real-time tool progress streaming with Vercel AI SDK v5. Includes full code examples, data flow diagrams, and debugging tips.

## Features

- **AI Chat Interface**: Modern chat UI built with shadcn/ui components
- **Multi-Step Tool Execution**: `sampleCreateTool` that simulates project creation with multiple stages
- **Real-Time Progress Updates**: Visual progress indicators with spinners and checkmarks
- **Streaming Data**: Real-time UI updates as tasks progress
- **Internationalization**: Support for English and Russian languages with automatic detection
- **Theme System**: Light/dark/system theme support with user preferences
- **Environment Configuration**: Customizable defaults for language and theme
- **TypeScript**: Full type safety throughout the application
- **Tailwind CSS 4**: Modern styling with the latest Tailwind features

## Technology Stack

- **Next.js 15.4** with App Router
- **Vercel AI SDK v5 (beta)** for AI integration
- **Google Generative AI** (Gemini 2.5 Flash)
- **TypeScript** for type safety
- **Tailwind CSS 4** for styling
- **shadcn/ui** for UI components
- **Lucide React** for icons

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Google AI API Key (from [Google AI Studio](https://aistudio.google.com/))

## Setup Instructions

1. **Clone and Install Dependencies**
   ```bash
   git clone <repository-url>
   cd ai-sdk-new-chat
   npm install
   ```

2. **Configure Environment Variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Required: Google AI API Key
   GOOGLE_GENERATIVE_AI_API_KEY=your-google-ai-api-key-here
   
   # Optional: Default language (en | ru)
   # NEXT_PUBLIC_DEFAULT_LANGUAGE=en
   
   # Optional: Default theme (light | dark | system)
   # NEXT_PUBLIC_DEFAULT_THEME=system
   ```

   Get your API key from [Google AI Studio](https://aistudio.google.com/).

3. **Run the Development Server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Configuration Options

### Language Settings

The application supports automatic language detection and manual configuration:

- **Automatic Detection**: Detects browser language and uses Russian for Slavic languages (ru, be, uk)
- **Environment Override**: Set `NEXT_PUBLIC_DEFAULT_LANGUAGE=en` or `NEXT_PUBLIC_DEFAULT_LANGUAGE=ru`
- **User Preference**: Users can switch language manually using the language switcher in the UI

### Theme Settings

The application includes a comprehensive theme system:

- **System Theme**: Automatically follows user's OS theme preference (default)
- **Environment Override**: Force specific theme with `NEXT_PUBLIC_DEFAULT_THEME`:
  - `light`: Always use light theme
  - `dark`: Always use dark theme  
  - `system`: Follow OS preference (default)
- **User Preference**: Users can override theme using the theme switcher in the UI
- **Persistence**: User choices are saved to localStorage

**Priority Order:**
1. User manual selection (highest priority)
2. Environment variable setting
3. System/OS preference (fallback)

### Example Configurations

**For Russian-language dark theme environment:**
```env
NEXT_PUBLIC_DEFAULT_LANGUAGE=ru
NEXT_PUBLIC_DEFAULT_THEME=dark
```

**For English-language light theme environment:**
```env
NEXT_PUBLIC_DEFAULT_LANGUAGE=en
NEXT_PUBLIC_DEFAULT_THEME=light
```

**For system preferences (default behavior):**
```env
# Comment out or omit both variables to use auto-detection
# NEXT_PUBLIC_DEFAULT_LANGUAGE=en
# NEXT_PUBLIC_DEFAULT_THEME=system
```

## Usage

1. **Start a Conversation**: Type a message requesting project creation, such as:
   - "Create a new React project called MyApp"
   - "Build a complex web application"
   - "Set up a simple project for me"

2. **Watch Progress**: The AI will use the `sampleCreateTool` to simulate multi-step project creation with:
   - Real-time progress indicators
   - Spinning loaders for active tasks
   - Green checkmarks for completed tasks
   - Time tracking for each step and total execution

3. **Project Complexity**: The tool supports three complexity levels:
   - **Simple**: 3 basic steps (6-9 seconds)
   - **Medium**: 5 steps with build tools (12-20 seconds) 
   - **Complex**: 7 steps with CI/CD and monitoring (21-35 seconds)

## Project Structure

```
src/
├── app/
│   ├── api/chat/route.ts          # AI Chat API endpoint
│   ├── globals.css                # Global styles with Tailwind CSS 4
│   ├── layout.tsx                 # Root layout with theme initialization
│   └── page.tsx                   # Main chat page
├── components/
│   ├── ui/                        # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── spinner.tsx
│   │   ├── language-switcher.tsx  # Language selection dropdown
│   │   └── theme-switcher.tsx     # Theme selection dropdown
│   ├── chat/
│   │   ├── chat-interface.tsx     # Main chat component
│   │   ├── message-list.tsx       # Messages display
│   │   ├── tool-progress.tsx      # Progress indicator UI
│   │   └── progress-item.tsx      # Individual progress item
│   ├── language-provider.tsx      # i18n context and logic
│   └── theme-provider.tsx         # Theme context with env support
├── lib/
│   ├── tools.ts                   # sampleCreateTool implementation
│   └── utils.ts                   # Utility functions
├── types/
│   └── chat.ts                    # TypeScript type definitions
└── public/
    └── messages/                  # Translation files
        ├── en.json                # English translations
        └── ru.json                # Russian translations
```

## Key Features Demonstration

### Real-Time Progress Updates
The application demonstrates how to create engaging user experiences with long-running AI tool operations:

- **Visual Feedback**: Each step shows a spinner while in progress
- **Status Updates**: Real-time transitions from pending → in-progress → completed
- **Time Tracking**: Individual step duration and total execution time
- **Responsive UI**: Smooth animations and state transitions

### AI SDK v5 Beta Features
This project showcases several AI SDK v5 capabilities:

- **Tool Calling**: Structured tool definitions with Zod schemas
- **Streaming Responses**: Real-time message and tool result streaming
- **Message Metadata**: Enhanced message structure for tool invocations
- **Error Handling**: Proper error boundaries and loading states

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Technical Documentation

- **Real-Time Streaming Implementation**: [Technical Guide](.memory-bank/real-time-streaming-implementation.md) - Complete implementation guide for AI tool progress streaming
- **Product Specifications**: [Product Documentation](.memory-bank/product.md) - Detailed technical specifications and reference documentation

## Troubleshooting

1. **API Key Issues**: Ensure your Google AI API key is correctly set in `.env.local`
2. **Build Errors**: Make sure all dependencies are installed with `npm install`
3. **Port Conflicts**: The default port is 3000; set `PORT` environment variable to change it
4. **Streaming Issues**: Check browser developer tools for WebSocket or SSE connection errors

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is for demonstration purposes. Please check individual package licenses for production use.

---

Built with ❤️ using Vercel AI SDK v5 (beta) and Next.js 15
