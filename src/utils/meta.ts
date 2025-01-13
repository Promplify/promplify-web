const APP_NAME = "Promplify";
const DEFAULT_TITLE = "Amplify Your AI Potential";
const DEFAULT_DESCRIPTION = "Promplify helps you manage, optimize, and master your AI prompts. Get AI-powered suggestions and best practices to make your prompts more effective.";
const DEFAULT_KEYWORDS = "AI prompts, prompt engineering, prompt optimization, AI tools, prompt management, artificial intelligence, LLM prompts, ChatGPT prompts";

export const updateMeta = (title?: string, description: string = DEFAULT_DESCRIPTION, keywords: string = DEFAULT_KEYWORDS) => {
  document.title = title ? `${title} - ${APP_NAME}` : `${APP_NAME} - ${DEFAULT_TITLE}`;

  // Update meta description
  let metaDescription = document.querySelector('meta[name="description"]');
  if (!metaDescription) {
    metaDescription = document.createElement("meta");
    metaDescription.setAttribute("name", "description");
    document.head.appendChild(metaDescription);
  }
  metaDescription.setAttribute("content", description);

  // Update meta keywords
  let metaKeywords = document.querySelector('meta[name="keywords"]');
  if (!metaKeywords) {
    metaKeywords = document.createElement("meta");
    metaKeywords.setAttribute("name", "keywords");
    document.head.appendChild(metaKeywords);
  }
  metaKeywords.setAttribute("content", keywords);
};
