import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const distDir = path.resolve("dist");
const sourceHtmlPath = path.join(distDir, "index.html");

const defaultImage = "https://promplify.com/web-app-manifest-512x512.png";

const routes = [
  {
    outputPath: "templates",
    urlPath: "/templates/",
    title: "AI Prompt Templates, Prompt Template Tool & Workflow Templates - Promplify",
    description: "Browse AI prompt templates, use Promplify as a prompt template tool, and build repeatable prompt workflow templates for ChatGPT, Claude, coding, research, and marketing.",
    keywords: "AI prompt templates, prompt library, prompt template tool, ChatGPT prompt templates, Claude prompt templates, prompt workflow templates, prompt optimization, AI workflow tools",
  },
  {
    outputPath: "discover",
    urlPath: "/discover/",
    title: "Community Prompts, Shared AI Prompts & Prompt Library - Promplify",
    description: "Discover community prompts, browse shared AI prompt examples, and save useful prompts into your own prompt library for repeatable AI workflows.",
    keywords: "community prompts, shared prompts, AI prompt library, shared AI prompts, ChatGPT prompts, Claude prompts, prompt discovery",
  },
  {
    outputPath: "api-docs",
    urlPath: "/api-docs/",
    title: "Prompt API Documentation - Promplify",
    description: "Integrate Promplify prompts into your applications with API token authentication, version-aware prompt retrieval, and secure prompt workflows.",
    keywords: "Promplify API, prompt API, prompt management API, prompt versioning, AI prompt integration",
  },
];

const escapeAttribute = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

const buildMetaTag = (attribute, name, content) => `<meta ${attribute}="${name}" content="${escapeAttribute(content)}" />`;

const upsertTag = (html, pattern, tag) => {
  if (pattern.test(html)) {
    return html.replace(pattern, tag);
  }

  return html.replace("</head>", `    ${tag}\n  </head>`);
};

const applyRouteMetadata = (html, route) => {
  const url = `https://promplify.com${route.urlPath}`;
  let output = html;

  output = upsertTag(output, /<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${url}" />`);
  output = upsertTag(output, /<title>.*?<\/title>/s, `<title>${escapeAttribute(route.title)}</title>`);
  output = upsertTag(output, /<meta name="description" content="[^"]*" \/>/, buildMetaTag("name", "description", route.description));
  output = upsertTag(output, /<meta name="keywords" content="[^"]*" \/>/, buildMetaTag("name", "keywords", route.keywords));
  output = upsertTag(output, /<meta property="og:url" content="[^"]*" \/>/, buildMetaTag("property", "og:url", url));
  output = upsertTag(output, /<meta property="og:title" content="[^"]*" \/>/, buildMetaTag("property", "og:title", route.title));
  output = upsertTag(output, /<meta property="og:description" content="[^"]*" \/>/, buildMetaTag("property", "og:description", route.description));
  output = upsertTag(output, /<meta property="og:image" content="[^"]*" \/>/, buildMetaTag("property", "og:image", defaultImage));
  output = upsertTag(output, /<meta name="twitter:card" content="[^"]*" \/>/, buildMetaTag("name", "twitter:card", "summary_large_image"));
  output = upsertTag(output, /<meta name="twitter:title" content="[^"]*" \/>/, buildMetaTag("name", "twitter:title", route.title));
  output = upsertTag(output, /<meta name="twitter:description" content="[^"]*" \/>/, buildMetaTag("name", "twitter:description", route.description));
  output = upsertTag(output, /<meta name="twitter:image" content="[^"]*" \/>/, buildMetaTag("name", "twitter:image", defaultImage));

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
