USE osos_db;

-- Catalogs
CREATE TABLE IF NOT EXISTS catalogs_positions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS catalogs_blood_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(10) NOT NULL
);

CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role ENUM('parent', 'coach', 'admin') DEFAULT 'parent',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Main tables
CREATE TABLE IF NOT EXISTS players (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    birth_date DATE NOT NULL,
    curp VARCHAR(18),
    photo_url VARCHAR(255),
    emergency_phone VARCHAR(20),
    user_id INT,
    position_id INT,
    category_id INT,
    blood_type_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (position_id) REFERENCES catalogs_positions(id),
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (blood_type_id) REFERENCES catalogs_blood_types(id)
);

CREATE TABLE IF NOT EXISTS teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    logo_url VARCHAR(255),
    home_stadium VARCHAR(255),
    jersey_color_hex VARCHAR(10) DEFAULT '#e30514',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS matches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    local_team_id INT NOT NULL,
    visitor_team_id INT NOT NULL,
    match_date DATETIME NOT NULL,
    stadium_id INT,
    week_number INT DEFAULT 1,
    home_score INT DEFAULT 0,
    visitor_score INT DEFAULT 0,
    result_status ENUM('PENDIENTE', 'VICTORIA', 'DERROTA', 'EMPATE') DEFAULT 'PENDIENTE',
    FOREIGN KEY (local_team_id) REFERENCES teams(id),
    FOREIGN KEY (visitor_team_id) REFERENCES teams(id)
);

INSERT IGNORE INTO catalogs_positions (name) VALUES ('Quarterback (QB)'), ('Running Back (RB)'), ('Wide Receiver (WR)'), ('Tight End (TE)'), ('Linebacker (LB)'), ('Cornerback (CB)'), ('Safety (S)');
INSERT IGNORE INTO catalogs_blood_types (name) VALUES ('O+'), ('O-'), ('A+'), ('A-'), ('B+'), ('B-'), ('AB+'), ('AB-');
