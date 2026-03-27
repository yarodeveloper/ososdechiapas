-- Update Script for Osos de Chiapas Real-time Match Synchronization
-- Deployment Date: 2026-03-26
-- NOTE: Please ensure you are running this on the correct database (osos_db as per your .env)

-- Use the specific database used by the application
USE osos_db;

-- 1. Ensure columns exist in matches table
ALTER TABLE matches ADD COLUMN IF NOT EXISTS possession VARCHAR(50) DEFAULT 'Osos';
ALTER TABLE matches ADD COLUMN IF NOT EXISTS down_and_distance VARCHAR(50) DEFAULT '1ST & 10';
ALTER TABLE matches ADD COLUMN IF NOT EXISTS current_quarter VARCHAR(10) DEFAULT '1Q';
ALTER TABLE matches ADD COLUMN IF NOT EXISTS time_left VARCHAR(10) DEFAULT '15:00';

-- 2. Create game_plays table for the Live Playbook Log
CREATE TABLE IF NOT EXISTS game_plays (
    id INT AUTO_INCREMENT PRIMARY KEY, 
    match_id INT NOT NULL, 
    play_type VARCHAR(50) NOT NULL, 
    description TEXT, 
    score_change INT DEFAULT 0, 
    team VARCHAR(50), 
    quarter VARCHAR(10), 
    time_left VARCHAR(10), 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    FOREIGN KEY (match_id) REFERENCES matches(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. (Optional) Initialize a test match with real-time data if none exist
-- We use a condition to check if a match with id 1 exists
UPDATE matches 
SET result_status = 'PENDIENTE', 
    possession = 'Osos', 
    current_quarter = '1Q', 
    time_left = '15:00' 
WHERE id = 1;
