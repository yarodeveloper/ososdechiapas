USE osos_db;

-- 1. Leagues table
CREATE TABLE IF NOT EXISTS leagues (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT 1
);

-- 2. Ensure categories has league_id
ALTER TABLE categories ADD COLUMN IF NOT EXISTS league_id INT AFTER id;

-- 3. Teams table
CREATE TABLE IF NOT EXISTS teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    is_club_oso BOOLEAN DEFAULT 0,
    logo_url VARCHAR(255)
);
ALTER TABLE teams ADD COLUMN IF NOT EXISTS is_club_oso BOOLEAN DEFAULT 0;

-- 4. Matches table
CREATE TABLE IF NOT EXISTS matches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    local_team_id INT NOT NULL,
    visitor_team_id INT NOT NULL,
    match_date DATETIME NOT NULL,
    home_score INT DEFAULT 0,
    visitor_score INT DEFAULT 0,
    status ENUM('scheduled', 'live', 'finished') DEFAULT 'scheduled',
    location VARCHAR(255),
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- 5. Player Performance (Digital Sheet)
CREATE TABLE IF NOT EXISTS player_performance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_id INT NOT NULL,
    match_id INT NOT NULL,
    touchdowns INT DEFAULT 0,
    yards_rushing INT DEFAULT 0,
    yards_passing INT DEFAULT 0,
    yards_receiving INT DEFAULT 0,
    tackles INT DEFAULT 0,
    interceptions INT DEFAULT 0,
    sacks INT DEFAULT 0,
    is_mvp BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(id),
    FOREIGN KEY (match_id) REFERENCES matches(id)
);

-- Seed some leagues if empty
INSERT IGNORE INTO leagues (name) VALUES ('OEFA'), ('ACHFA'), ('LIGA TUXTLA');

-- Seed Club Oso as a team if empty
INSERT IGNORE INTO teams (name, is_club_oso) VALUES ('Club Osos de Chiapas', 1);
