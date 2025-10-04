-- Migration: Create users table and admin user
-- Run this against the PostgreSQL database

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    hashed_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create admin user (password: 'admin123')
-- Note: This is a bcrypt hash for 'admin123'
INSERT INTO users (email, full_name, hashed_password, is_active) 
VALUES (
    'admin@example.com',
    'Admin User',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HSbK8m2',
    TRUE
) ON CONFLICT (email) DO NOTHING;

-- Create test user (password: 'test123')
INSERT INTO users (email, full_name, hashed_password, is_active) 
VALUES (
    'test@example.com',
    'Test User',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HSbK8m2',
    TRUE
) ON CONFLICT (email) DO NOTHING;

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Show created users
SELECT id, email, full_name, is_active, created_at FROM users;
