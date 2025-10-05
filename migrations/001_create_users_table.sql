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

-- Create admin user (password: 'Admin123!')
-- Note: This is a bcrypt hash for 'Admin123!'
INSERT INTO users (email, full_name, hashed_password, is_active) 
VALUES (
    'admin@example.com',
    'Admin User',
    '$2b$12$xfdbdNHdGJmZqCQNlLb3O.Qt8XYiA4e7NjiTxBEgSAWi3ouVCEhfu',
    TRUE
) ON CONFLICT (email) DO UPDATE SET 
    hashed_password = EXCLUDED.hashed_password,
    full_name = EXCLUDED.full_name,
    is_active = EXCLUDED.is_active;

-- Create test user (password: 'Test123!')
INSERT INTO users (email, full_name, hashed_password, is_active) 
VALUES (
    'test@example.com',
    'Test User',
    '$2b$12$0qYwSxzhcwZYgEi86Z.iY.RL2fqPFGBzlIVt6rl0QwwegKdt7WTM2',
    TRUE
) ON CONFLICT (email) DO UPDATE SET 
    hashed_password = EXCLUDED.hashed_password,
    full_name = EXCLUDED.full_name,
    is_active = EXCLUDED.is_active;

-- Add role column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';

-- Create user_roles table for RBAC
CREATE TABLE IF NOT EXISTS user_roles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, role)
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- Update existing users with roles
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
UPDATE users SET role = 'user' WHERE email = 'test@example.com';

-- Show created users
SELECT id, email, full_name, is_active, role, created_at FROM users;
