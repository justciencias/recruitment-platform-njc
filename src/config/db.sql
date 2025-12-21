-- 1. Tabela de Períodos de Recrutamento
CREATE TABLE IF NOT EXISTS recruitment_periods (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT true
);

-- 2. Tabela de Candidatos (Ambiente Candidatos)
CREATE TABLE IF NOT EXISTS candidates (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    current_stage VARCHAR(50) DEFAULT 'Triagem',
    recruitment_period_id INTEGER REFERENCES recruitment_periods(id),
    cv_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabela de Utilizadores/Membros (Ambiente Membros)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    department VARCHAR(100),
    access_level INTEGER DEFAULT 1, -- 1: Member, 2: Evaluator, 3: Admin
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabela de Avaliações (Histórico/Feedback)
CREATE TABLE IF NOT EXISTS evaluations (
    id SERIAL PRIMARY KEY,
    candidate_id INTEGER REFERENCES candidates(id) ON DELETE CASCADE,
    member_id INTEGER REFERENCES users(id),
    feedback TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    stage_evaluated VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabela de Templates de Email
CREATE TABLE IF NOT EXISTS email_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    subject VARCHAR(255),
    body TEXT,
    type VARCHAR(50) -- Ex: 'Rejeição', 'Entrevista', 'Aprovação'
);