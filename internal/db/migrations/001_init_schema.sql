-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des utilisateurs (Brique HoneyID)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL, 
    kyc_status TEXT DEFAULT 'PENDING'
);

-- Table des missions (Brique HoneyTrust)
CREATE TABLE missions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES users(id),
    freelancer_id UUID REFERENCES users(id),
    status TEXT NOT NULL,
    amount_cents BIGINT NOT NULL,
    currency TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Le Ledger (Brique HoneyPay - Immuable)
CREATE TABLE ledger (
    id SERIAL PRIMARY KEY,
    mission_id UUID REFERENCES missions(id),
    entry_type TEXT NOT NULL, 
    amount_cents BIGINT NOT NULL,
    tx_reference TEXT UNIQUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- HoneyEvidence (Brique HoneyEvidence)
CREATE TABLE evidence (
    id SERIAL PRIMARY KEY,
    mission_id UUID REFERENCES missions(id),
    file_hash TEXT NOT NULL,
    file_metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
