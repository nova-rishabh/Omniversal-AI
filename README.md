# Omniversal AI

Enterprise-grade neural workflow platform with persona-driven AI responses and ElevenLabs text-to-speech.

## 🚀 Features

- **Cognitive Chat Engine** — Real-time AI interaction with animated "Inference Trace" visualization
- **Persona System** — Configurable character personas (currently featuring Shakespeare)
- **Audio Synthesis** — Integrated ElevenLabs TTS for spoken AI responses
- **Design System** — Dark-first "Precise Void" palette with tonal surface hierarchy

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| AI Engine | [Google Gemini 2.0 Flash](https://aistudio.google.com/) |
| Voice | [ElevenLabs](https://elevenlabs.io/) |
| Styling | Tailwind CSS 4 + custom design tokens |
| Animation | Framer Motion |
| Icons | Lucide React |

## 📦 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
# Then edit .env.local with your API keys

# 3. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 📂 Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/                # Route Handlers (Gemini, ElevenLabs)
│   │   ├── roast/          # AI text generation endpoint
│   │   └── roast-audio/    # TTS audio endpoint
│   ├── chat/               # Chat interface page
│   ├── layout.tsx          # Root layout (Inter + Geist Mono fonts)
│   ├── globals.css         # Design system tokens & utilities
│   └── page.tsx            # Landing / main page
├── components/             # Reusable UI components
│   ├── ui/                 # Shared (OmniLogo, Buttons, MetricCard)
│   ├── chat/               # Chat-specific (ThinkingPanel, StreamingText)
│   └── landing/            # Landing-specific (NeuralCanvas, FeatureCard)
├── lib/                    # Business logic
│   └── personas/           # AI persona configurations
└── public/                 # Static assets
```

## 🔑 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | ✅ | Google Gemini API key |
| `ELEVENLABS_API_KEY` | ❌ | ElevenLabs TTS key (enables audio) |
| `ELEVENLABS_VOICE_ID` | ❌ | Custom voice ID (defaults to Rachel) |

See `.env.example` for details.
