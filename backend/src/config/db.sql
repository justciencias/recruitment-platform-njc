-- 1. Recruitment Tracks (To define different seasons, e.g., 'Spring 2026')
CREATE TABLE IF NOT EXISTS recruitment_tracks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'active', 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users/Members (Must be created before candidates for the locked_by_id reference)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Matches password_hash in login/register logic
    department VARCHAR(100),
    access_level INTEGER DEFAULT 1, -- 1: Member, 2: Evaluator, 3: Admin
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Candidates
CREATE TABLE IF NOT EXISTS candidates (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    
    degree_type VARCHAR(20) CHECK (degree_type IN ('BSc', 'Masters')), 
    current_stage VARCHAR(50) DEFAULT 'Phase 1 (Forms)',
    track_id INTEGER REFERENCES recruitment_tracks(id) ON DELETE SET NULL,
    
    -- Exclusive Feedback Locking
    -- ON DELETE SET NULL ensures candidate isn't deleted if the locking member is removed
    locked_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL DEFAULT NULL,
    
    intermediate_decision TEXT,
    final_decision TEXT,
    private_admin_notes TEXT, 
    
    cv_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Evaluations (History/Feedback)
CREATE TABLE IF NOT EXISTS evaluations (
    id SERIAL PRIMARY KEY,
    candidate_id INTEGER REFERENCES candidates(id) ON DELETE CASCADE,
    -- Added ON DELETE CASCADE so evaluations vanish if a user is deleted
    member_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    feedback TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    
    stage_evaluated VARCHAR(100), 
    is_final_submission BOOLEAN DEFAULT false, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Email Templates
CREATE TABLE IF NOT EXISTS email_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL, 
    subject VARCHAR(255),
    body_html TEXT,
    type VARCHAR(50) 
);