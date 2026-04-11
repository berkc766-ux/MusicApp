-- ============================================================
-- Minimal Migration — Sadece eksik olanlar
-- Supabase SQL Editor'da çalıştır
-- ============================================================

-- categories, languages, songs.category_id, songs.language_id
-- zaten mevcut → dokunulmadı.

-- 1. liked_songs tablosu
CREATE TABLE IF NOT EXISTS liked_songs (
  user_id  INTEGER REFERENCES users(id) ON DELETE CASCADE,
  song_id  INTEGER REFERENCES songs(id) ON DELETE CASCADE,
  liked_at DATE DEFAULT CURRENT_DATE,
  PRIMARY KEY (user_id, song_id)
);

-- 2. playlists.is_public sütunu
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='playlists' AND column_name='is_public'
  ) THEN
    ALTER TABLE playlists ADD COLUMN is_public BOOLEAN DEFAULT FALSE;
  END IF;
END $$;
