-- Schema for Club Osos de Chiapas
-- Use this script to initialize the MySQL database on your VPS.

CREATE DATABASE IF NOT EXISTS clubosos_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE clubosos_db;

-- 1. Users table (Parents, Coaches, Admins)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role ENUM('parent', 'coach', 'admin') DEFAULT 'parent',
    avatar_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Categories table
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    min_age INT,
    max_age INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Players table
CREATE TABLE players (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL, -- The Parent (Primary contact)
    category_id INT NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    birth_date DATE NOT NULL,
    position VARCHAR(20), -- QB, WR, RB, etc.
    jersey_number INT,
    photo_url VARCHAR(255),
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- 4. Games table (Game Center)
CREATE TABLE games (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    opponent VARCHAR(100) NOT NULL,
    location VARCHAR(200),
    game_date DATETIME NOT NULL,
    home_score INT DEFAULT 0,
    away_score INT DEFAULT 0,
    status ENUM('scheduled', 'live', 'finished', 'cancelled') DEFAULT 'scheduled',
    current_quarter INT DEFAULT 1,
    time_left VARCHAR(10) DEFAULT '15:00',
    live_qr_code VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- 5. Events table (Calendar)
CREATE TABLE events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT, -- NULL if it's a general club event
    title VARCHAR(150) NOT NULL,
    description TEXT,
    event_type ENUM('game', 'practice', 'trip', 'meeting', 'social') DEFAULT 'practice',
    start_time DATETIME NOT NULL,
    end_time DATETIME,
    location VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- 6. Player Stats table (Center of Statistics)
CREATE TABLE player_stats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_id INT NOT NULL,
    game_id INT NOT NULL,
    touchdowns INT DEFAULT 0,
    yards_rushing INT DEFAULT 0,
    yards_passing INT DEFAULT 0,
    yards_receiving INT DEFAULT 0,
    tackles INT DEFAULT 0,
    sacks INT DEFAULT 0,
    interceptions INT DEFAULT 0,
    points_extra INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(id),
    FOREIGN KEY (game_id) REFERENCES games(id)
);

-- 7. Attendance table
CREATE TABLE attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_id INT NOT NULL,
    event_id INT NOT NULL,
    status ENUM('present', 'absent', 'excused', 'late') DEFAULT 'present',
    notes TEXT,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(id),
    FOREIGN KEY (event_id) REFERENCES events(id)
);

-- 8. Payments table
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL, -- The Parent
    amount DECIMAL(10, 2) NOT NULL,
    description VARCHAR(255) NOT NULL,
    due_date DATE NOT NULL,
    paid_at DATETIME,
    status ENUM('pending', 'paid', 'late', 'partially_paid') DEFAULT 'pending',
    payment_method VARCHAR(50),
    receipt_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
