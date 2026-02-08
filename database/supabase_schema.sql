-- Supabase Schema for ESCON project
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables to ensure clean slate (CASCADE handles dependencies)
DROP TABLE IF EXISTS skill_enabler_relations CASCADE;
DROP TABLE IF EXISTS skills CASCADE;
DROP TABLE IF EXISTS enablers CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

-- 1. Organizations Table
CREATE TABLE organizations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) UNIQUE NOT NULL, -- e.g. 'robot_solution'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enablers Table
CREATE TABLE enablers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) NOT NULL, -- e.g. 'enabler_1'
    priority INTEGER,
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb, -- color, icon, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, code) -- Composite unique
);

-- 3. Skills Table (Shared across organizations if needed, or specific)
CREATE TABLE skills (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    label VARCHAR(255) NOT NULL, -- Generic label
    korean_label VARCHAR(255),
    english_label VARCHAR(255),
    type VARCHAR(50) NOT NULL CHECK (type IN ('knowledge', 'skill/competence', 'attitude')),
    uri VARCHAR(500) UNIQUE, -- ESCO URI
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Skill-Enabler Relationship Table (N:M Mapping with Context)
CREATE TABLE skill_enabler_relations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    enabler_id UUID REFERENCES enablers(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE, -- Denormalized for query ease
    importance INTEGER CHECK (importance BETWEEN 1 AND 5),
    proficiency VARCHAR(100), -- e.g. "Level 4"
    match_type VARCHAR(50), -- 'Direct', 'Inferred'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(skill_id, enabler_id) -- Prevent duplicate mapping for same enabler
);

-- Indexes for performance
CREATE INDEX idx_enablers_org ON enablers(organization_id);
CREATE INDEX idx_relations_enabler ON skill_enabler_relations(enabler_id);
CREATE INDEX idx_relations_skill ON skill_enabler_relations(skill_id);
