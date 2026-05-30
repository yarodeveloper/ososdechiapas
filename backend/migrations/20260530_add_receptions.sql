ALTER TABLE player_stats ADD COLUMN IF NOT EXISTS receptions INT DEFAULT 0 AFTER yards_receiving;
