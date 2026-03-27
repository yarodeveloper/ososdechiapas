USE osos_db;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS possession VARCHAR(50) DEFAULT 'Osos';
ALTER TABLE matches ADD COLUMN IF NOT EXISTS down_and_distance VARCHAR(50) DEFAULT '1ST & 10';
ALTER TABLE matches ADD COLUMN IF NOT EXISTS current_quarter VARCHAR(10) DEFAULT '1Q';
ALTER TABLE matches ADD COLUMN IF NOT EXISTS time_left VARCHAR(10) DEFAULT '15:00';

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
);
