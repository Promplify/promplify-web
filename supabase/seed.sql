-- Local-only sample templates for immediate development feedback.
INSERT INTO public.prompt_template (id, title, system_prompt, category)
VALUES
  (
    -1,
    'Code Review Assistant',
    'Review the provided code for correctness, security, maintainability, and test coverage. Return prioritized findings with concrete fixes.',
    'Coding'
  ),
  (
    -2,
    'Research Synthesizer',
    'Synthesize the supplied sources into a concise brief. Separate supported facts, open questions, and recommended next steps.',
    'Research'
  ),
  (
    -3,
    'Campaign Brief Builder',
    'Turn the product context into a campaign brief with audience, positioning, key messages, channels, and measurable success criteria.',
    'Marketing'
  )
ON CONFLICT (id) DO UPDATE
SET
  title = EXCLUDED.title,
  system_prompt = EXCLUDED.system_prompt,
  category = EXCLUDED.category;
