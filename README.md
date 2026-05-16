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
- **TokenRouter:** Orchestrates AI reasoning and LLM model routing for application strategy and planning.
- **Bright Data:** Handles the web browsing and discovery to constantly monitor financial aid portals and eligibility rules.
- **Actionbook:** Works in combination with Bright Data to provide agentic browser automation, finding verified DOM selectors to execute tasks like form pre-filling.

### Storage & Infrastructure
- **Evermind:** Handles long-term memory retention so users can seamlessly transition from researching, to applying, to acquiring without losing context.
- **Hosting:** Deployed serverlessly on **Zeabur** (`grantforge.zeabur.app`) with automatic GitHub integrations.
- **Development Environment:** **Qoder** is used as the primary coding and agentic development interface.

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
