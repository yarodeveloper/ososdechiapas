USE osos_db;

-- Primero verificamos si first_name existe para renombrar o si ya existe name
ALTER TABLE players ADD COLUMN IF NOT EXISTS name VARCHAR(255) AFTER user_id;
ALTER TABLE players ADD COLUMN IF NOT EXISTS curp VARCHAR(18) AFTER name;
ALTER TABLE players ADD COLUMN IF NOT EXISTS position_id INT AFTER curp;
ALTER TABLE players ADD COLUMN IF NOT EXISTS blood_type_id INT AFTER category_id;
ALTER TABLE players ADD COLUMN IF NOT EXISTS emergency_phone VARCHAR(20) AFTER blood_type_id;
ALTER TABLE players ADD COLUMN IF NOT EXISTS allergies TEXT AFTER emergency_phone;

-- Catálogos si no existen
CREATE TABLE IF NOT EXISTS catalogs_positions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS catalogs_blood_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(10) NOT NULL
);

-- Poblar catálogos si están vacíos
INSERT IGNORE INTO catalogs_positions (name) VALUES 
('Quarterback (QB)'), ('Running Back (RB)'), ('Wide Receiver (WR)'), 
('Tight End (TE)'), ('Offensive Line (OL)'), ('Defensive Line (DL)'), 
('Linebacker (LB)'), ('Defensive Back (DB)'), ('Kicker (K)'), ('Punter (P)');

INSERT IGNORE INTO catalogs_blood_types (name) VALUES 
('A+'), ('A-'), ('B+'), ('B-'), ('O+'), ('O-'), ('AB+'), ('AB-');
