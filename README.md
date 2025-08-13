# Developer Digital Twin (MVP Demo)

A demonstration of **Agent-Responsive Design** principles through an interactive web application. This project showcases how digital interfaces can be designed to be "bilingual" - speaking clearly to both humans and AI agents.

## 🌟 Key Concepts

- **Semantic Front Door**: UIs visually appealing to humans but semantically clear to machines
- **AI-First Back Door**: APIs returning structured, actionable responses enabling agent self-correction
- **Dual-Audience Architecture**: Interface elements serving both human usability and machine readability

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Suryaa-dsgn/agent-responsive-digital-twin.git
   cd agent-responsive-digital-twin
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (choose one method):

   #### Option A: Automated Setup (Recommended)
   ```bash
   npm run setup
   ```
   This will guide you through creating and configuring all required environment files.
   
   > Note: The `setup` script needs to be run manually after installation. 
   > For CI/CD pipelines, you can skip this step by setting `SKIP_POSTINSTALL=true` in your environment.

   #### Option B: Manual Setup
   - Copy template files to create environment files:
     ```bash
     cp packages/frontend/env.template packages/frontend/.env.local
     cp packages/backend/env.template packages/backend/.env
     ```
   - Edit the files with your API keys and settings
   - Validate your setup:
     ```bash
     npm run validate-env
     ```

   For detailed setup instructions, see [SETUP.md](SETUP.md)

### Development

Run both frontend and backend in development mode:
```bash
npm run dev
```

Or run them individually:
```bash
npm run dev:frontend
npm run dev:backend
```

#### Frontend-Backend Communication

The frontend communicates with the backend using:

- **Next.js API Proxy**: Requests to `/api/backend/*` are proxied to the backend service
- **Health Checks**: The frontend monitors backend availability
- **Fallback Behavior**: Graceful degradation when backend is unavailable
- **Retry Mechanism**: Automatic retries for transient failures

### Production Build

Build both packages:
```bash
npm run build
```

Start in production mode:
```bash
npm run start
```

## 📐 Project Architecture

The project follows a three-tier architecture:

1. **Presentation Tier** (Next.js Frontend)
   - React components with semantic markup
   - Tailwind CSS styling
   - Developer command interface

2. **Orchestration Tier** (Next.js API Routes)
   - Claude AI integration
   - Response streaming
   - Context management

3. **Services Tier** (Express.js Backend)
   - API simulator with dual response modes
   - Traditional vs AI-first response patterns

## 🧩 Core Features

- **Developer Command Interface**: Interactive AI agent command center
- **Semantic Layer Demo**: Comparison of agent-friendly vs agent-hostile UI patterns
- **API Evolution Demo**: Traditional vs AI-first API response patterns
- **API Simulator**: Backend providing realistic examples of both API response paradigms

## 📦 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js, TypeScript
- **AI Integration**: Anthropic Claude API
- **Deployment**: Vercel

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Built as a portfolio demonstration project showcasing the principles of Agent-Responsive Design.

