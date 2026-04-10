-- Run this in your NEW Supabase project's SQL Editor
-- (app.supabase.com → Your Project → SQL Editor → New Query)

-- 1. Link artists to user accounts (for artist login)
ALTER TABLE artists ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id);

-- 2. Optional: Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_artists_user_id ON artists(user_id);

-- 3. Verify the column was added
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'artists' AND column_name = 'user_id';
