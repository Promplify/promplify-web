# Promplify

<div align="center">

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://github.com/Promplify/promplify-web/blob/main/LICENSE)
[![Issues](https://img.shields.io/github/issues/Promplify/promplify-web)](https://github.com/Promplify/promplify-web/issues)
[![Forks](https://img.shields.io/github/forks/Promplify/promplify-web)](https://github.com/Promplify/promplify-web/network/members)
[![Stars](https://img.shields.io/github/stars/Promplify/promplify-web)](https://github.com/Promplify/promplify-web/stargazers)

**Your AI prompt management platform.**
Create, organize, test, and optimize your prompts with ease.

**[View Live Demo »](https://promplify.com)**

[Live Demo](https://promplify.com) · [Report Bug](https://github.com/Promplify/promplify-web/issues) · [Request Feature](https://github.com/Promplify/promplify-web/issues)

</div>

---

## About The Project

Promplify is a powerful, open-source platform designed to streamline your entire AI prompt engineering workflow. Whether you're a developer building AI-powered applications, a researcher experimenting with different models, or a writer crafting creative content, Promplify provides the tools you need to manage your prompts efficiently.

With Promplify, you can move beyond simple text files and spreadsheets. Our platform offers a structured environment for creating, versioning, testing, and collaborating on prompts, ensuring you get the best possible results from your AI models.

### Key Features

- 📝 **Advanced Prompt Editor**: A purpose-built editor that separates system and user prompts, complete with token counting.
- 🔄 **Versioning**: Automatically track changes to your prompts with semantic versioning.
- 🧠 **AI Optimization**: Use AI to refine and improve your system prompts with a single click.
- 🔗 **Share & Collaborate**: Share your prompts with anyone via a unique link.
- 🌐 **Discover**: Share your prompts with the community and explore what others are building.
- 🔐 **API Access**: Integrate your prompts into your applications with secure API access.
- ☁️ **Cloud-Native**: Built with a modern stack including React, Cloudflare Workers, and Supabase.
- 🏷️ **Smart Tagging**: Organize your prompts with customizable tags and categories.
- 📊 **Analytics**: Track prompt performance and usage statistics.
- 🎨 **Beautiful UI**: Modern, responsive design built with Tailwind CSS and shadcn/ui.

## Tech Stack

This project is built with modern, scalable technologies:

- **Frontend**: [React](https://reactjs.org/), [Vite](https://vitejs.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/)
- **Backend**: [Cloudflare Workers](https://workers.cloudflare.com/)
- **Database & Auth**: [Supabase](https://supabase.io/)

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or later recommended)
- [npm](https://www.npmjs.com/)
- A [Cloudflare account](https://dash.cloudflare.com/sign-up)
- A [Supabase account](https://supabase.com/dashboard)

### Installation

1.  **Clone the repository**

    ```sh
    git clone https://github.com/Promplify/promplify-web.git
    cd promplify-web
    ```

2.  **Install dependencies**

    ```sh
    npm install
    ```

3.  **Set up Environment Variables**

    - Create your environment file from the example:

      ```sh
      cp .env.example .env
      ```

    - **Set up Supabase project**:

      1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
      2. Create a new project or use an existing one
      3. Go to Settings > API
      4. Copy your Project URL and anon/public key

    - **Fill in your `.env` file**:

      ```env
      # Required: Supabase Configuration
      VITE_SUPABASE_URL=https://your-project-id.supabase.co
      VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-anon-key

      # Optional: Sentry Configuration (for error tracking)
      SENTRY_AUTH_TOKEN=your_sentry_auth_token_here
      VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
      ```

4.  **Set up Database**

    - Install Supabase CLI:
      ```sh
      npm install -g supabase
      ```
    - Apply database migrations:
      ```sh
      supabase login
      supabase link --project-ref YOUR_PROJECT_ID
      supabase db push
      ```
    - Deploy Edge Functions:
      ```sh
      supabase functions deploy
      supabase secrets set DEEPSEEK_API_KEY=your_deepseek_api_key
      ```

5.  **Set up Cloudflare Worker (Optional)**

    - For API functionality, navigate to the Cloudflare Worker directory:
      ```sh
      cd cloudflare-worker
      ```
    - Follow the instructions in the `cloudflare-worker/README.md` to deploy the worker

6.  **Run the Development Server**
    - Navigate back to the root directory and start the Vite development server:
      ```sh
      cd ..
      npm run dev
      ```
    - Open [http://localhost:8080](http://localhost:8080) to view the app in your browser.

## Deployment

### Frontend Deployment (Cloudflare Pages)

1. **Connect your GitHub repository** to Cloudflare Pages
2. **Set build settings**:
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Node.js version: `18` or later
3. **Configure environment variables** in Cloudflare Pages dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SENTRY_AUTH_TOKEN` (optional)
   - `VITE_SENTRY_DSN` (optional)

### Backend Deployment (Cloudflare Workers)

1. **Navigate to the worker directory**:
   ```sh
   cd cloudflare-worker
   ```
2. **Configure wrangler.toml** with your account details
3. **Deploy the worker**:
   ```sh
   npm run deploy
   ```
4. **Set environment variables** using Wrangler:
   ```sh
   npx wrangler secret put SUPABASE_URL
   npx wrangler secret put SUPABASE_ANON_KEY
   ```

### Database Setup (Supabase)

The database migrations and Edge Functions are automatically applied when you follow the installation steps above. For production:

1. Create a production Supabase project
2. Apply migrations: `supabase db push`
3. Deploy Edge Functions: `supabase functions deploy`
4. Set production secrets: `supabase secrets set DEEPSEEK_API_KEY=your_key`

## Environment Variables Reference

### Required Variables

| Variable                 | Description                 | Example                      |
| ------------------------ | --------------------------- | ---------------------------- |
| `VITE_SUPABASE_URL`      | Your Supabase project URL   | `https://abc123.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key | `eyJhbGciOiJIUzI1NiIs...`    |

### Optional Variables

| Variable            | Description                 | Example                     |
| ------------------- | --------------------------- | --------------------------- |
| `SENTRY_AUTH_TOKEN` | Sentry authentication token | `your_token_here`           |
| `VITE_SENTRY_DSN`   | Sentry project DSN          | `https://...@sentry.io/...` |

### Edge Function Secrets

These need to be set in your Supabase project:

| Secret             | Description                                 | Command                                          |
| ------------------ | ------------------------------------------- | ------------------------------------------------ |
| `DEEPSEEK_API_KEY` | DeepSeek AI API key for prompt optimization | `supabase secrets set DEEPSEEK_API_KEY=your_key` |

## Project Structure

```
promplify-web/
├── src/                          # React frontend source code
│   ├── components/              # Reusable UI components
│   ├── pages/                   # Page components
│   ├── services/                # API service functions
│   ├── lib/                     # Utility libraries
│   └── types/                   # TypeScript type definitions
├── cloudflare-worker/           # Cloudflare Worker API
├── supabase/                    # Database migrations and functions
│   ├── migrations/              # Database schema migrations
│   ├── functions/               # Edge functions
│   └── README.md               # Supabase setup guide
├── public/                      # Static assets
└── .env.example                # Environment variables template
```

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

Please see our [Contributing Guide](CONTRIBUTING.md) for more details on our code of conduct and the process for submitting pull requests to us.

### Quick Start for Contributors

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/promplify-web.git`
3. Install dependencies: `npm install`
4. Set up environment: `cp .env.example .env` and fill in your values
5. Start development: `npm run dev`
6. Make your changes and test thoroughly
7. Run linting: `npm run lint:fix`
8. Submit a pull request

For detailed setup instructions, see the [Installation](#installation) section above.

## License

Distributed under the Apache License 2.0. See `LICENSE` for more information.

## Contact

Project Link: [https://github.com/Promplify/promplify-web](https://github.com/Promplify/promplify-web)

Live Demo: [https://promplify.com](https://promplify.com)

## Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Supabase](https://supabase.io/) for the backend infrastructure
- [Cloudflare](https://cloudflare.com/) for hosting and edge computing
- All contributors who help make this project better
