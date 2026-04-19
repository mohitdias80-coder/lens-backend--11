CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    website VARCHAR(255),
    industry VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    password VARCHAR(255) NOT NULL,
    stripe_customer_id VARCHAR(255),
    subscription_tier VARCHAR(50) DEFAULT 'starter',
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS brand_agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
    agent_name VARCHAR(255),
    agent_id VARCHAR(255) UNIQUE,
    personality VARCHAR(50) DEFAULT 'balanced',
    monthly_budget DECIMAL(10,2) DEFAULT 0,
    cost_per_connection DECIMAL(10,4) DEFAULT 0.10,
    max_daily_connections INT DEFAULT 1000,
    target_interests TEXT[],
    soul TEXT,
    status VARCHAR(50) DEFAULT 'active',
    deployed_at TIMESTAMP DEFAULT NOW(),
    last_active TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS brand_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    price DECIMAL(10,2),
    description TEXT,
    product_url VARCHAR(500),
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS brand_agent_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_agent_id UUID REFERENCES brand_agents(id) ON DELETE CASCADE,
    user_agent_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    relevance_score DECIMAL(5,2),
    pitch_sent_at TIMESTAMP,
    user_responded_at TIMESTAMP,
    outcome VARCHAR(50),
    sale_amount DECIMAL(10,2),
    commission_earned DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS brand_communities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
    brand_agent_id UUID REFERENCES brand_agents(id) ON DELETE CASCADE,
    community_name VARCHAR(255),
    member_count INT DEFAULT 0,
    post_count INT DEFAULT 0,
    engagement_rate DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS community_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID REFERENCES brand_communities(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    likes INT DEFAULT 0,
    comments INT DEFAULT 0,
    target_interests TEXT[],
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS brand_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    connections INT DEFAULT 0,
    pitches_sent INT DEFAULT 0,
    accept_rate DECIMAL(5,2) DEFAULT 0,
    sales INT DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0,
    roi DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(brand_id, date)
);

