# Contributing to Promplify

First off, thank you for considering contributing to Promplify! It's people like you that make the open source community such a great place.

We welcome any type of contribution, not only code. You can help with:

- **Reporting a bug**
- **Discussing the current state of the code**
- **Submitting a fix**
- **Proposing new features**
- **Becoming a maintainer**

## Getting Started with Development

### Prerequisites

- Node.js (v18 or later)
- npm
- A Supabase account
- A Cloudflare account (optional, for API features)

### Setting up your development environment

1.  **Fork the repo and create your branch from `main`**.

2.  **Clone your fork and install dependencies**:

        ```bash
        git clone https://github.com/your-username/promplify-web.git

    cd promplify-web
    npm install

    ```

    ```

3.  **Set up environment variables**:

    ```bash
    cp .env.example .env
    # Edit .env and fill in your Supabase credentials
    ```

4.  **Set up Supabase**:

    ```bash
    npm install -g supabase
    supabase login
    supabase link --project-ref YOUR_PROJECT_ID
    supabase db push
    supabase functions deploy
    ```

5.  **Start the development server**:
    ```bash
    npm run dev
    ```

### Development Workflow

1.  Create a new branch for your feature or fix
2.  Make your changes
3.  If you've added code that should be tested, add tests
4.  If you've changed APIs, update the documentation
5.  Ensure the test suite passes (`npm test`)
6.  Make sure your code lints (`npm run lint`)
7.  Format your code (`npm run format`)
8.  Commit your changes with a clear commit message
9.  Push to your fork and submit a pull request

## Any contributions you make will be under the Apache License 2.0

In short, when you submit code changes, your submissions are understood to be under the same [Apache License 2.0](LICENSE) that covers the project. Feel free to contact the maintainers if that's a concern.

## Report bugs using GitHub's [issues](https://github.com/Promplify/promplify-web/issues)

We use GitHub Issues to track public bugs. Report a bug by opening a new issue; it's that easy!

## Write bug reports with detail, background, and sample code

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can.
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

People _love_ thorough bug reports. I'm not kidding.

## Use a Consistent Coding Style

We use [Prettier](https://prettier.io/) to format our code. Please run `npm run format` before committing your changes.

## License

By contributing, you agree that your contributions will be licensed under its Apache License 2.0.
