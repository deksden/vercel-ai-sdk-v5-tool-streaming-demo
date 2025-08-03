# Technical Stack Overview

## 🛠️ Technology Stack

### Core Framework
- **Next.js 15.4** - React framework with App Router
- **TypeScript 5.9.2** - Static type checking
- **React 19.1.0** - UI library

### AI & Streaming
- **Vercel AI SDK v5 beta** - AI streaming and tool calling
- **@ai-sdk/google 2.0.0** - Google Generative AI provider
- **@ai-sdk/react 2.0.0** - React hooks for AI streaming
- **Google Gemini 2.5 Flash** - AI model

### UI & Styling
- **Tailwind CSS 4.1.11** - Utility-first CSS framework
- **shadcn/ui** - React component library
- **Radix UI** - Headless UI primitives
- **next-themes 0.4.6** - Theme switching system
- **Lucide React 0.535.0** - Icon library

### Build & Development
- **Turbopack** - Fast bundler for development
- **ESLint 9.32.0** - Code linting
- **pnpm** - Package manager

### Additional Libraries
- **clsx 2.1.1** - Conditional className utility
- **tailwind-merge 3.3.1** - Tailwind class merging
- **class-variance-authority 0.7.1** - Component variants
- **zod 3.25.76** - Schema validation

---

## 📁 Project Structure

```
ai-sdk-new-chat/
├── .memory-bank/                           # Documentation
│   ├── real-time-streaming-implementation.md
│   └── tech.md
├── messages/                               # i18n translations (prepared)
│   ├── en.json
│   └── ru.json
├── src/
│   ├── app/                               # Next.js App Router
│   │   ├── api/
│   │   │   └── chat/
│   │   │       └── route.ts               # Chat API endpoint
│   │   ├── globals.css                    # Global styles
│   │   ├── layout.tsx                     # Root layout
│   │   └── page.tsx                       # Home page
│   ├── components/
│   │   ├── chat/                          # Chat components
│   │   │   ├── chat-interface.tsx         # Main chat interface
│   │   │   ├── message-list.tsx           # Message display
│   │   │   ├── progress-item.tsx          # Individual progress step
│   │   │   └── tool-progress.tsx          # Progress block component
│   │   ├── ui/                            # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── input.tsx
│   │   │   ├── spinner.tsx
│   │   │   └── theme-toggle.tsx
│   │   ├── language-switcher.tsx          # Language switching (prepared)
│   │   └── theme-provider.tsx             # Theme context provider
│   ├── i18n/                              # Internationalization (prepared)
│   │   └── request.ts
│   ├── lib/
│   │   ├── tools.ts                       # AI tools implementation
│   │   └── utils.ts                       # Utility functions
│   └── types/
│       └── chat.ts                        # TypeScript type definitions
├── .env.local                             # Environment variables
├── .gitignore
├── components.json                        # shadcn/ui config
├── eslint.config.js                       # ESLint configuration
├── next.config.ts                         # Next.js configuration
├── package.json                           # Dependencies
├── pnpm-lock.yaml                         # Lock file
├── postcss.config.js                      # PostCSS config
├── README.md
├── tailwind.config.ts                     # Tailwind configuration
└── tsconfig.json                          # TypeScript configuration
```

---

## 🏗️ Key Architecture Components

### 1. API Layer (`src/app/api/chat/route.ts`)
- **createUIMessageStream** - Creates streaming response with custom data parts
- **sampleCreateStreamingTool** - Tool with real-time progress updates
- **writer.write()** - Sends progress updates to client

### 2. UI Components (`src/components/chat/`)
- **ChatInterface** - Main chat with useChat hook and onData callback
- **ToolProgress** - Unified progress block with theme support
- **ProgressItem** - Individual step with status icons and timing

### 3. Type System (`src/types/chat.ts`)
- **MyUIMessage** - Extended UIMessage with custom data parts
- **ToolProgress** - Progress tracking interface
- **ProgressStep** - Individual step definition

### 4. Tools Implementation (`src/lib/tools.ts`)
- **sampleCreateStreamingTool** - Streaming version with writer parameter
- **Real-time updates** - Multiple writer.write() calls per execution
- **Progress simulation** - Complexity-based timing and steps

---

## 📦 Package Manager Commands

### Development
```bash
pnpm install          # Install dependencies
pnpm run dev          # Start development server
pnpm run build        # Build for production
pnpm run start        # Start production server
pnpm run lint         # Run ESLint
```

### Background Development
```bash
# Start dev server in background
nohup pnpm run dev > dev-server.log 2>&1 &

# Check server logs
tail -f dev-server.log

# Stop background server
pkill -f "next dev"
```

### Dependencies Management
```bash
pnpm add <package>          # Add dependency
pnpm add -D <package>       # Add dev dependency
pnpm remove <package>       # Remove dependency
pnpm update                 # Update dependencies
```

---

## 🌍 Environment Setup

### Required Environment Variables
```bash
# .env.local
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
```

### Optional Configuration
- **Theme System**: Automatic light/dark/system theme switching
- **Internationalization**: Ready for English/Russian (next-intl prepared)
- **Development**: Turbopack for fast builds
- **TypeScript**: Strict mode enabled

---

## 🚀 Production Deployment

### Build Requirements
- Node.js 18+
- pnpm package manager
- Google Generative AI API key

### Build Process
```bash
pnpm install
pnpm run build
pnpm run start
```

### Key Features
- **Server-Side Rendering** with Next.js App Router
- **Real-time Streaming** with AI SDK v5 transport layer
- **Type Safety** throughout the application
- **Responsive Design** with Tailwind CSS
- **Theme Persistence** with next-themes
- **Performance Optimized** with Turbopack and modern React