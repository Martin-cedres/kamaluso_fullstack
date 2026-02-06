# Kamaluso Full Stack - Project Context Dump

This file contains a snapshot of the current project state, structure, and configuration to serve as a knowledge base for NotebookLM.

## 1. Project Overview
- **Name:** Kamaluso
- **Type:** Full Stack Web Application (Next.js)
- **Primary Stack:** 
    - **Frontend:** Next.js (React), Tailwind CSS
    - **Backend:** Next.js API Routes
    - **Database:** MongoDB (via Mongoose)
    - **AI Integration:** Google Gemini (Custom Rotation Client)
    - **Deployment:** Vercel (likely, based on `vercel.json`)

## 2. File Structure Highlights
```text
/
├── .agent/                 # Agentic workflows and skills
├── components/             # React components
├── lib/                    # Shared utilities and logic
│   ├── gemini-client.ts    # Core AI client logic
│   ├── gemini-agent.ts     # Wrapper for AI calls
│   └── pdf/                # PDF generation logic (Quote/Order templates)
├── models/                 # Mongoose Data Models
├── pages/                  # Next.js Pages and API Routes
│   ├── api/                # Backend endpoints
│   └── admin/              # Admin dashboard pages
├── public/                 # Static assets
├── styles/                 # Global styles
├── AI_README.md            # AI Integration Documentation
├── package.json            # Dependencies and scripts
├── tailwind.config.js      # Styling configuration
└── session_summary.txt     # Recent development context
```

## 3. Key Dependencies (package.json)
```json
{
  "dependencies": {
    "next": "^16.0.10",
    "react": "^19.2.3",
    "mongoose": "^8.18.1",
    "mongodb": "^6.18.0",
    "tailwindcss": "3.4",
    "framer-motion": "^12.23.12",
    "next-auth": "^4.24.13",
    "@google/generative-ai": "^0.24.1",
    "@react-pdf/renderer": "^4.3.1",
    "mercadopago": "^2.9.0"
    // ... complete list in actual file
  }
}
```

## 4. Database Models (Mongoose)
The project uses MongoDB with Mongoose. Key models include:
- **Product:** E-commerce products.
- **Category:** Product categories.
- **Quote:** Presupuestos/Orders logic.
- **PillarPage:** Content marketing / SEO pillars.
- **EventPage:** Specific landing pages for events.
- **Subscriber:** Email/Marketing subscribers.
- **ChatConversation:** Storing AI/User chat history.

## 5. AI Integration (Gemini)
The project features a robust AI client (`lib/gemini-client.ts`) that:
- Prioritizes `gemini-2.5-flash` for speed and cost.
- Falls back to `gemini-2.5-pro` if Flash fails.
- Implements automatic API key rotation for reliability.
- Used for: SEO content generation, pattern analysis, and potentially dynamic UI elements.

## 6. Recent Development Context (Session Summary)
*Most recent updates as of Feb 2026:*
- **Optimization:** "Nota de Pedido" (Order Note) optimized with classic design and anchored footer.
- **PDF Fixes:** Fixed a bug in `quoteTemplate.tsx` where percentage discounts were displaying as currency currency. Now correctly detects `discountType` and formats as "%".
- **Visuals:** Unified iconography and print button colors.
- **Features:** Enabled manual editing of shipping methods and order deletion from the main list.

## 7. Configuration Notes
- **Tailwind:** Standard configuration with `typography` plugin.
- **TypeScript:** Fully typed codebase (`tsconfig.json` present).
- **Environment:** Relies on `.env.local` for keys (Reference `AI_README.md` for specific key structure: `GEMINI_FLASH_API_KEYS`, etc.).
