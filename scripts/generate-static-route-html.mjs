import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const distDir = path.resolve("dist");
const sourceHtmlPath = path.join(distDir, "index.html");

const defaultImage = "https://promplify.com/web-app-manifest-512x512.png";

const routes = [
  {
    outputPath: "auth",
    urlPath: "/auth/",
    title: "Sign In - Promplify",
    heading: "Sign in to Promplify",
    description: "Sign in or create an account to continue managing your AI prompts with Promplify.",
    keywords: "Promplify sign in, prompt management account",
    robots: "noindex, nofollow",
  },
  {
    outputPath: "auth/callback",
    urlPath: "/auth/callback/",
    title: "Complete Sign In - Promplify",
    heading: "Complete your Promplify sign-in",
    description: "Complete your Promplify sign-in and continue to your prompt workspace.",
    keywords: "Promplify authentication callback",
    robots: "noindex, nofollow",
  },
  {
    outputPath: "templates",
    urlPath: "/templates/",
    title: "AI Prompt Templates & Workflow Tool - Promplify",
    heading: "Reusable AI prompt templates",
    description:
      "Browse reusable AI prompt templates for ChatGPT, Claude, coding, research, and marketing. Save prompt workflow templates to your own library.",
    keywords:
      "AI prompt templates, prompt library, prompt template tool, ChatGPT prompt templates, Claude prompt templates, prompt workflow templates, prompt optimization, AI workflow tools",
    sections: [
      {
        title: "Built for repeatable AI workflows",
        items: [
          "Browse structured prompt templates for software engineering, product writing, research synthesis, and marketing campaigns.",
          "Customize reusable variables and save proven templates directly into your personal or team prompt workspace.",
          "Standardize output structure across ChatGPT, Claude, Gemini, and API-driven model pipelines.",
        ],
      },
      {
        title: "Template categories",
        items: [
          "Engineering and code review prompts with clear input and output contracts.",
          "Content strategy, editing, and localization templates for consistent brand voice.",
          "Data analysis, executive summaries, and structured extraction workflows.",
        ],
      },
    ],
  },
  {
    outputPath: "discover",
    urlPath: "/discover/",
    title: "Community Prompts, Shared AI Prompts & Prompt Library - Promplify",
    heading: "Discover shared AI prompts",
    description:
      "Discover community prompts, browse shared AI prompt examples, and save useful prompts into your own prompt library for repeatable AI workflows.",
    keywords: "community prompts, shared prompts, AI prompt library, shared AI prompts, ChatGPT prompts, Claude prompts, prompt discovery",
    sections: [
      {
        title: "Explore community-tested prompts",
        items: [
          "Browse publicly shared AI prompts created by engineers, writers, researchers, and product teams.",
          "Filter community prompts by category, tags, and practical use cases to find working examples faster.",
          "Inspect prompt structure, variables, and formatting patterns before saving them into your own library.",
        ],
      },
      {
        title: "Turn shared examples into reusable workflows",
        items: [
          "Copy or fork community prompts into your Promplify workspace to adapt instructions for your own tasks.",
          "Track revisions as you refine prompts across ChatGPT, Claude, and other large language models.",
          "Publish your own best-performing prompts to share repeatable patterns with the broader community.",
        ],
      },
    ],
  },
  {
    outputPath: "api-docs",
    urlPath: "/api-docs/",
    title: "Prompt API Documentation - Promplify",
    heading: "Promplify API documentation",
    description:
      "Integrate Promplify prompts into your applications with API token authentication, version-aware prompt retrieval, and secure prompt workflows.",
    keywords: "Promplify API, prompt API, prompt management API, prompt versioning, AI prompt integration",
    sections: [
      {
        title: "Authentication and access control",
        items: [
          "Generate personal API tokens from your Promplify account settings and pass them in the Authorization header.",
          "Keep prompt definitions decoupled from application deployments so teams can iterate safely without redeploying code.",
          "Revoke or rotate API tokens at any time to maintain least-privilege access across staging and production services.",
        ],
      },
      {
        title: "Version-aware prompt retrieval",
        items: [
          "Fetch prompts by identifier and version over HTTPS JSON endpoints for deterministic production behavior.",
          "Pin critical workflows to a verified prompt version while testing newer revisions in development environments.",
          "Integrate retrieved prompt templates directly with OpenAI, Anthropic, or custom LLM orchestration pipelines.",
        ],
      },
    ],
  },
  {
    outputPath: "privacy",
    urlPath: "/privacy/",
    title: "Privacy Policy and Data Protection - Promplify",
    heading: "Privacy policy and data protection",
    description: "Learn how Promplify collects, uses, stores, and protects your data when you use our AI prompt management platform and related services.",
    keywords: "Promplify privacy policy, data protection, user privacy",
    sections: [
      {
        title: "How Promplify handles your data",
        items: [
          "Explains account information, prompt storage, operational telemetry, and security safeguards used to operate Promplify.",
          "Describes data retention practices, access controls, and how users can request export or deletion of account records.",
        ],
      },
    ],
  },
  {
    outputPath: "terms",
    urlPath: "/terms/",
    title: "Terms of Service - Promplify",
    heading: "Promplify terms of service",
    description:
      "Read Promplify's Terms of Service to understand account responsibilities, acceptable use, service limitations, and your rights when using the platform.",
    keywords: "Promplify terms of service, user agreement, legal terms",
    sections: [
      {
        title: "Key terms covered",
        items: [
          "Account registration responsibilities, API usage guidelines, and acceptable use standards for shared prompts.",
          "Intellectual property ownership of user-created prompts, service availability terms, and support contacts.",
        ],
      },
    ],
  },
  {
    outputPath: "settings",
    urlPath: "/settings/",
    title: "Account Settings - Promplify",
    heading: "Promplify account settings",
    description: "Manage your Promplify account, preferences, and API access.",
    keywords: "Promplify account settings, API access",
    robots: "noindex, follow",
  },
];

const escapeAttribute = (value) => value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

const buildMetaTag = (attribute, name, content) => `<meta ${attribute}="${name}" content="${escapeAttribute(content)}" />`;

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const metaTagPattern = (attribute, name) => new RegExp(`<meta\\s+${attribute}="${escapeRegExp(name)}"\\s+content="[^"]*"\\s*\\/?>`, "s");

const upsertTag = (html, pattern, tag) => {
  if (pattern.test(html)) {
    return html.replace(pattern, tag);
  }

  return html.replace("</head>", `    ${tag}\n  </head>`);
};

const buildPrerenderedMain = (route) => {
  const sectionsHtml = (route.sections || [])
    .map(
      (section) =>
        `        <section>\n          <h2>${escapeAttribute(section.title)}</h2>\n          <ul>\n${section.items
          .map((item) => `            <li>${escapeAttribute(item)}</li>`)
          .join("\n")}\n          </ul>\n        </section>`
    )
    .join("\n");

  return [
    `<div id="root">`,
    `      <main data-seo-prerendered="true" style="max-width:780px;margin:48px auto;padding:0 20px;font-family:system-ui,-apple-system,sans-serif;line-height:1.65;color:#111827">`,
    `        <h1>${escapeAttribute(route.heading)}</h1>`,
    `        <p>${escapeAttribute(route.description)}</p>`,
    sectionsHtml,
    `        <nav aria-label="Primary links">`,
    `          <a href="/">Home</a> · <a href="/templates/">AI Prompt Templates</a> · <a href="/discover/">Discover Community Prompts</a> · <a href="/api-docs/">Prompt API Documentation</a> · <a href="/privacy/">Privacy Policy</a> · <a href="/terms/">Terms of Service</a>`,
    `        </nav>`,
    `      </main>`,
    `    </div>`,
  ]
    .filter(Boolean)
    .join("\n");
};

const applyRouteMetadata = (html, route) => {
  const url = `https://promplify.com${route.urlPath}`;
  let output = html;

  output = upsertTag(output, /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/s, `<link rel="canonical" href="${url}" />`);
  output = upsertTag(output, /<title>.*?<\/title>/s, `<title>${escapeAttribute(route.title)}</title>`);
  output = upsertTag(output, metaTagPattern("name", "description"), buildMetaTag("name", "description", route.description));
  output = upsertTag(output, metaTagPattern("name", "keywords"), buildMetaTag("name", "keywords", route.keywords));
  output = upsertTag(output, metaTagPattern("property", "og:url"), buildMetaTag("property", "og:url", url));
  output = upsertTag(output, metaTagPattern("property", "og:title"), buildMetaTag("property", "og:title", route.title));
  output = upsertTag(output, metaTagPattern("property", "og:description"), buildMetaTag("property", "og:description", route.description));
  output = upsertTag(output, metaTagPattern("property", "og:image"), buildMetaTag("property", "og:image", defaultImage));
  output = upsertTag(output, metaTagPattern("name", "twitter:card"), buildMetaTag("name", "twitter:card", "summary_large_image"));
  output = upsertTag(output, metaTagPattern("name", "twitter:title"), buildMetaTag("name", "twitter:title", route.title));
  output = upsertTag(output, metaTagPattern("name", "twitter:description"), buildMetaTag("name", "twitter:description", route.description));
  output = upsertTag(output, metaTagPattern("name", "twitter:image"), buildMetaTag("name", "twitter:image", defaultImage));

  if (route.robots) {
    output = upsertTag(output, metaTagPattern("name", "robots"), buildMetaTag("name", "robots", route.robots));
  }

  output = output.replace(
    /<noscript>[\s\S]*?<\/noscript>/,
    `<noscript><main><h1>${escapeAttribute(route.heading)}</h1><p>${escapeAttribute(route.description)}</p></main></noscript>`
  );

  output = output.replace(/<div id="root">[\s\S]*?<\/div>/, buildPrerenderedMain(route));

  return output;
};

const main = async () => {
  const sourceHtml = await readFile(sourceHtmlPath, "utf8");

  await Promise.all(
    routes.map(async (route) => {
      const routeDir = path.join(distDir, route.outputPath);
      await mkdir(routeDir, { recursive: true });
      await writeFile(path.join(routeDir, "index.html"), applyRouteMetadata(sourceHtml, route), "utf8");
    })
  );
};

await main();
