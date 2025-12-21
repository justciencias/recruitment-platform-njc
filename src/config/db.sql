CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    department VARCHAR(50),
    role VARCHAR(50),
    access_level INT DEFAULT 1, -- 1: Read, 2: Evaluator, 3: Admin
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE candidates (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    current_stage VARCHAR(50) DEFAULT 'Application', -- Forms, Group Dynamics, Interviews, etc.
    extra_attributes JSONB, -- Stores custom fields dynamically
    recruitment_period_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE evaluations (
    id SERIAL PRIMARY KEY,
    candidate_id INT REFERENCES candidates(id) ON DELETE CASCADE,
    member_id INT REFERENCES users(id),
    score INT CHECK (score >= 0 AND score <= 5),
    feedback_text TEXT,
    stage_name VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE email_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL, -- e.g., 'Interview_Pass', 'Waitlist'
    subject VARCHAR(200) NOT NULL,
    body_html TEXT NOT NULL, -- HTML content with placeholders
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);