# GrantForge

**GrantForge** is an AI-powered funding companion that helps students, founders, and researchers find grants, track eligibility changes, and orchestrate their applications.

🚀 **Live Demo:** [https://grantforge.zeabur.app/](https://grantforge.zeabur.app/)

## Features

- **Policy Sentinel Sweep**: Automatically checks web sources for changing eligibility requirements on your saved grants.
- **AI Planning Chat**: Powered by OpenRouter, chat with an AI assistant to strategize your application for any specific grant.
- **Smart Profiles**: Enter your specific circumstances (like immigration status, major, or being a first-generation student) to get hyper-personalized matching.
- **Agentic Browser Automation**: Integrated with `@actionbookdev/sdk` to find verified DOM selectors and simulate form prefilling for grant portals.

## Tech Stack

- **Framework:** Next.js 14 App Router
- **Hosting:** Zeabur
- **LLM Routing:** OpenRouter API
- **Browser Automation SDK:** Actionbook
- **Styling:** Vanilla CSS (Glassmorphism design system)

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
