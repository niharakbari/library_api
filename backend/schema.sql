CREATE DATABASE IF NOT EXISTS library_api;
USE library_api;

-- Drop the old tables
DROP TABLE IF EXISTS refresh_tokens;
DROP TABLE IF EXISTS users;

-- Recreate the unified users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'VIEWER',
    refresh_token_id VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
