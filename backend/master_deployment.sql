-- Osos de Chiapas - MASTER DEPLOYMENT & MIGRATION SCRIPT
-- Deployment Date: 2026-03-26

-- 1. Ensure we use the correct database as per .env
USE osos_db;

-- 2. MIGRATION FROM OLD DB (clubosos_db) if it still exists on the server
-- Move critical tables if they are missing in the target database
-- NOTE: If these tables already exist in osos_db, these commands might fail safely or can be skipped.
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS player_stats;
DROP TABLE IF EXISTS players;
DROP TABLE IF EXISTS events;

-- Create missing tables in osos_db to match the app structure
-- (Assuming they want a fresh or moved copy)
-- If the tables existed in clubosos_db, you can run RENAME manually or use these CREATEs:

CREATE TABLE IF NOT EXISTS players (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    birth_date DATE NOT NULL,
    position VARCHAR(20),
    jersey_number INT,
    photo_url VARCHAR(255),
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. MATCH SYNC UPDATES (The most recent critical changes)
-- Ensure 'matches' table has all synchronization fields
ALTER TABLE matches ADD COLUMN IF NOT EXISTS possession VARCHAR(50) DEFAULT 'Osos';
ALTER TABLE matches ADD COLUMN IF NOT EXISTS down_and_distance VARCHAR(50) DEFAULT '1ST & 10';
ALTER TABLE matches ADD COLUMN IF NOT EXISTS current_quarter VARCHAR(10) DEFAULT '1Q';
ALTER TABLE matches ADD COLUMN IF NOT EXISTS time_left VARCHAR(10) DEFAULT '15:00';

-- 4. Create game_plays table for the Live Playbook Log
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

-- 5. Initialize test data for Immediate Verification
-- Update existing record or insert if none exist
INSERT INTO matches (id, local_team_id, visitor_team_id, match_date, result_status, possession, current_quarter, time_left)
VALUES (1, 1, 2, NOW(), 'PENDIENTE', 'Osos', '1Q', '15:00')
ON DUPLICATE KEY UPDATE 
    result_status = 'PENDIENTE', 
    possession = 'Osos', 
    current_quarter = '1Q', 
    time_left = '15:00';
