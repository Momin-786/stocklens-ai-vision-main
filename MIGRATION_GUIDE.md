# Database Migration Guide

This guide explains how to apply the database migrations to your Supabase project.

## What These Migrations Do

1. **First Migration** (`20251105183319_...sql`):
   - Creates `profiles` table for user data
   - Sets up Row Level Security (RLS) policies
   - Creates trigger to auto-create profiles when users sign up
   - Creates function to auto-update timestamps

2. **Second Migration** (`20251105191217_...sql`):
   - Creates `portfolio_holdings` table for user stock holdings
   - Creates `watchlist` table for tracking stocks
   - Sets up RLS policies for both tables
   - Links tables to user authentication

## Method 1: Using Supabase Dashboard (Easiest)

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project (project ID: `kgfxsxwkdbtvkanopeuf`)
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the contents of **BOTH** migration files in order:
   - First: Copy content from `supabase/migrations/20251105183319_97c7af2c-2fcb-4e67-a072-65a3a548c60b.sql`
   - Then: Copy content from `supabase/migrations/20251105191217_6cf4ee29-688f-491b-97a5-6510f676b7b9.sql`
6. Click **Run** (or press Ctrl+Enter)

**OR** use the combined migration file below:

## Method 2: Using Supabase CLI (If Linked)

If you have Supabase CLI linked to your project:

```bash
# Make sure you're in the project root
supabase db push
```

Or apply migrations individually:

```bash
supabase migration up
```

## Method 3: Combined Migration File

For convenience, you can also use the `APPLY_ALL_MIGRATIONS.sql` file in this directory, which contains both migrations in the correct order.

## Verification

After running migrations, verify in Supabase Dashboard:

1. Go to **Table Editor** - you should see:
   - ✅ `profiles`
   - ✅ `portfolio_holdings`
   - ✅ `watchlist`

2. Go to **Database** → **Functions** - you should see:
   - ✅ `handle_new_user()`
   - ✅ `update_updated_at_column()`

3. Go to **Database** → **Triggers** - you should see:
   - ✅ `on_auth_user_created`
   - ✅ `update_profiles_updated_at`
   - ✅ `update_portfolio_holdings_updated_at`

## Troubleshooting

### Error: "relation already exists"
- This means tables already exist. You can either:
  - Drop existing tables and re-run migrations
  - Or skip this step if tables are already set up correctly

### Error: "function already exists"
- The functions are already created. You can safely ignore or use `CREATE OR REPLACE FUNCTION` syntax

### RLS Policies Not Working
- Make sure Row Level Security is enabled on all tables
- Check that policies are created correctly
- Verify you're authenticated when testing

