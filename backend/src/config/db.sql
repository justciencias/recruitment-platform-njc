-- 1. Recruitment Tracks (To define different seasons, e.g., 'Spring 2026')
CREATE TABLE IF NOT EXISTS recruitment_tracks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Candidates
-- Added degree_type as a direct attribute 
CREATE TABLE IF NOT EXISTS candidates (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    
    -- Attributes for filtering and organization
    degree_type VARCHAR(20) CHECK (degree_level IN ('BSc', 'Masters')), ]
    current_stage VARCHAR(50) DEFAULT 'Phase 1 (Forms)',
    track_id INTEGER REFERENCES recruitment_tracks(id),
    
    -- Exclusive Feedback Locking
    -- Prevents multiple members from evaluating the same candidate simultaneously
    locked_by_id INTEGER REFERENCES users(id) DEFAULT NULL,
    
    -- Decision Fields (Intermediate and Final)
    intermediate_decision TEXT,
    final_decision TEXT,
    
    -- Privacy Control 
    -- Only visible to Access Level 3 (Presidency and RH)
    private_admin_notes TEXT, 
    
    cv_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Users/Members
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    department VARCHAR(100),
    access_level INTEGER DEFAULT 1, -- 1: Member, 2: Evaluator, 3: Admin (Presidency/RH)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Evaluations (History/Feedback)
CREATE TABLE IF NOT EXISTS evaluations (
    id SERIAL PRIMARY KEY,
    candidate_id INTEGER REFERENCES candidates(id) ON DELETE CASCADE,
    member_id INTEGER REFERENCES users(id),
    feedback TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    
    stage_evaluated VARCHAR(100), 
    
    -- Once true, everyone can search and see this final feedback 
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