# Supabase Configuration

This directory contains all Supabase-related configuration files and database migrations for the Promplify project.

## Directory Structure

```
supabase/
├── README.md                          # This file
├── config.toml                       # Supabase CLI configuration
├── migrations/                       # Database migration files
│   ├── 20240417_create_api_tokens.sql
│   ├── 20240417_update_api_tokens.sql
│   ├── 20250403143728_add_views_to_prompt_template.sql
│   ├── 20250605_create_plaza_tables.sql
│   └── 20741203_modify_tags_constraint.sql
└── functions/                        # Edge Functions
    └── optimize-system-prompt/       # AI prompt optimization function
        └── index.ts
```

## Setup Instructions

### 1. Install Supabase CLI

```bash
npm install -g supabase
```

### 2. Login to Supabase

```bash
supabase login
```

### 3. Link to Your Project

```bash
supabase link --project-ref YOUR_PROJECT_ID
```

### 4. Apply Database Migrations

```bash
supabase db push
```

### 5. Deploy Edge Functions

```bash
# Deploy all functions
supabase functions deploy

# Or deploy specific function
supabase functions deploy optimize-system-prompt
```

## Environment Variables Required

### For Edge Functions

The following environment variables need to be set in your Supabase project:

1. **DEEPSEEK_API_KEY** - API key for DeepSeek AI service (for prompt optimization)

Set them using:

```bash
supabase secrets set DEEPSEEK_API_KEY=your_deepseek_api_key
```

### For Local Development

Create a `.env` file in the project root with:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Database Schema

The database includes the following main tables:

- **prompts** - User prompts and templates
- **categories** - Prompt categories
- **tags** - Prompt tags
- **prompt_tags** - Many-to-many relationship between prompts and tags
- **api_tokens** - API access tokens for external integrations
- **plaza_prompts** - Shared prompts in the community plaza
- **plaza_likes** - Likes for plaza prompts

## Edge Functions

### optimize-system-prompt

Optimizes user prompts using AI to improve clarity and effectiveness.

- **Endpoint**: `/functions/v1/optimize-system-prompt`
- **Method**: POST
- **Requires**: User authentication
- **Dependencies**: DEEPSEEK_API_KEY environment variable

## Row Level Security (RLS)

All tables have Row Level Security enabled to ensure users can only access their own data, except for:

- Plaza prompts (public read access)
- Shared prompts (controlled sharing)

## Contributing

When making database changes:

1. Create a new migration file with timestamp prefix
2. Test locally with `supabase db reset`
3. Apply to staging with `supabase db push`
4. Update this README if schema changes significantly

## Troubleshooting

### Common Issues

1. **Migration fails**: Check for conflicting constraints or foreign key issues
2. **Function deploy fails**: Ensure all required environment variables are set
3. **RLS blocks queries**: Verify authentication and row-level security policies

### Local Development

To work with a local Supabase instance:

```bash
supabase start
supabase db reset
supabase functions serve
```
