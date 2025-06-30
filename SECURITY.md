# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Which versions are eligible for receiving such patches depends on the CVSS v3.0 Rating:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

The Promplify team takes security bugs seriously. We appreciate your efforts to responsibly disclose your findings, and will make every effort to acknowledge your contributions.

### How to Report a Security Vulnerability?

If you believe you have found a security vulnerability in Promplify, we encourage you to let us know right away. We will investigate all legitimate reports and do our best to quickly fix the problem.

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via:

1. **GitHub Security Advisories**: [Report a vulnerability](https://github.com/Promplify/promplify-web/security/advisories/new)
2. **Email**: Send details to security@promplify.com

### What to Include in Your Report

Please include the following information in your report:

- Type of issue (e.g. buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit the issue

### Response Timeline

- **Initial Response**: We'll acknowledge receipt of your vulnerability report within 48 hours
- **Investigation**: We'll investigate and validate the vulnerability within 5 business days
- **Fix Development**: Critical vulnerabilities will be addressed within 30 days
- **Disclosure**: Once a fix is available, we'll coordinate disclosure with you

### Bug Bounty

We don't currently offer a paid bug bounty program, but we deeply appreciate security research and will:

- Acknowledge your contribution in our security advisories (if desired)
- Include you in our Hall of Fame
- Provide Promplify swag/merchandise

### Safe Harbor

We support safe harbor for security researchers who:

- Make a good faith effort to avoid privacy violations, destruction of data, and interruption or degradation of our services
- Only interact with accounts you own or with explicit permission of the account holder
- Do not access, modify, or delete data belonging to others
- Contact us immediately if you encounter any user data during research

## Security Best Practices for Users

### Environment Variables

- Never commit your `.env` file to version control
- Rotate your Supabase keys regularly
- Use different credentials for development and production

### Deployment Security

- Enable Cloudflare security features (DDoS protection, WAF)
- Use HTTPS everywhere
- Implement proper CORS policies
- Regular security updates for dependencies

### Supabase Security

- Enable Row Level Security (RLS) on all tables
- Use service role keys only on backend/server environments
- Regularly audit user permissions
- Enable audit logging

Thank you for helping keep Promplify and our users safe!
