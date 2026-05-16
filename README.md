# GrantForge

**GrantForge** is an AI-powered funding companion that helps students, founders, and researchers find grants, track eligibility changes, and orchestrate their applications.

🚀 **Live Demo:** [https://grantforge.zeabur.app/](https://grantforge.zeabur.app/)

## Features

- **Policy Sentinel Sweep**: Automatically checks web sources for changing eligibility requirements on your saved grants.
- **AI Planning Chat**: Powered by OpenRouter, chat with an AI assistant to strategize your application for any specific grant.
- **Smart Profiles**: Enter your specific circumstances (like immigration status, major, or being a first-generation student) to get hyper-personalized matching.
- **Agentic Browser Automation**: Integrated with `@actionbookdev/sdk` to find verified DOM selectors and simulate form prefilling for grant portals.

## Comprehensive Tech Stack

### Core Framework & UI
- **Next.js 14 (App Router):** Full-stack React framework serving both frontend pages and backend API routes.
- **React 18:** Component library for the UI.
- **Vanilla CSS:** Bespoke design system utilizing CSS variables for premium dark-mode aesthetics and glassmorphic UI patterns.
- **Lucide React:** Icon library for consistent, scalable SVG icons (`lucide-react`).

### AI & Automation
- **OpenRouter API:** Orchestrates AI conversations and reasoning tasks using advanced models (e.g., `openai/gpt-4o-mini`, `openai/gpt-4o`). Interfaced via the official `openai` Node SDK.
- **Actionbook SDK (`@actionbookdev/sdk`):** Native integration for agentic browser automation. Powers the LLM's ability to search action manuals and extract verified DOM selectors for navigating funding portals.
- **Policy Sentinel Agents:** Custom prompt-driven AI routines that analyze deltas in eligibility criteria and generate plain-English alerts.

### Storage & Infrastructure
- **Hosting:** Deployed serverlessly on **Zeabur** (`grantforge.zeabur.app`) with automatic GitHub integrations.
- **Evermind (State Management):** Custom module (`lib/evermind.ts`) for persisting user profiles, tracking grant snapshots, and running diff/delta comparisons (currently mocked).
- **Bright Data:** Web crawling abstraction (`lib/brightdata.ts`) designed to scrape financial aid policy pages (currently mocked for demo resilience).
- **Client Persistence:** Native browser `localStorage` to securely save user profile data and pinned grants on the frontend without requiring a database for the demo.

## Getting Started Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/ARP-source/granted.git
   cd granted
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file with the following variables:
   ```env
   OPENROUTER_API_KEY=your_openrouter_key
   ACTIONBOOK_API_KEY=your_actionbook_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.
