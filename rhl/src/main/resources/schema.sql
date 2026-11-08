-- =======================================================================
-- SYSTEM: Realtime Ride-Hailing & Logistics On-Demand System (SRS-RHL-002)
-- SCRIPT: Database Schema (PostgreSQL)
-- =======================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Identity Domain
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(30) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. Driver & Vehicle Domain
CREATE TABLE IF NOT EXISTS driver_profiles (
    driver_id UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    license_number VARCHAR(50) UNIQUE,
    review_status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    availability_status VARCHAR(30) NOT NULL DEFAULT 'OFFLINE',
    rejection_reason VARCHAR(500),
    rating NUMERIC(3, 2) DEFAULT 5.00,
    approved_at TIMESTAMPTZ,
    approved_by UUID,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_driver_availability ON driver_profiles(availability_status);
CREATE INDEX IF NOT EXISTS idx_driver_review ON driver_profiles(review_status);

CREATE TABLE IF NOT EXISTS vehicles (
    vehicle_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID NOT NULL REFERENCES driver_profiles(driver_id) ON DELETE CASCADE,
    vehicle_type VARCHAR(30) NOT NULL,
    plate_number VARCHAR(20) NOT NULL UNIQUE,
    brand VARCHAR(50),
    model VARCHAR(50),
    color VARCHAR(30),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_vehicles_driver ON vehicles(driver_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_plate ON vehicles(plate_number);

CREATE TABLE IF NOT EXISTS driver_documents (
    document_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID NOT NULL REFERENCES driver_profiles(driver_id) ON DELETE CASCADE,
    document_type VARCHAR(30) NOT NULL,
    document_number VARCHAR(50),
    expiry_date DATE,
    file_url VARCHAR(500) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    verified_at TIMESTAMPTZ,
    verified_by UUID,
    rejection_reason VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_documents_driver ON driver_documents(driver_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON driver_documents(status);

-- 3. Pricing Domain
CREATE TABLE IF NOT EXISTS pricing_rules (
    rule_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_type VARCHAR(30) NOT NULL,
    vehicle_type VARCHAR(30) NOT NULL,
    region VARCHAR(50) NOT NULL DEFAULT 'DEFAULT',
    base_fare NUMERIC(15, 2) NOT NULL,
    per_km_rate NUMERIC(15, 2) NOT NULL,
    per_minute_rate NUMERIC(15, 2) NOT NULL,
    minimum_fare NUMERIC(15, 2) NOT NULL,
    cancellation_fee NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(10) NOT NULL DEFAULT 'VND',
    version INT NOT NULL DEFAULT 1,
    effective_from TIMESTAMPTZ NOT NULL,
    effective_to TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pricing_service_region ON pricing_rules(service_type, vehicle_type, region);

CREATE TABLE IF NOT EXISTS fare_quotes (
    quote_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL,
    service_type VARCHAR(30) NOT NULL,
    vehicle_type VARCHAR(30) NOT NULL,
    pickup_latitude DOUBLE PRECISION NOT NULL,
    pickup_longitude DOUBLE PRECISION NOT NULL,
    pickup_address VARCHAR(500) NOT NULL,
    dropoff_latitude DOUBLE PRECISION NOT NULL,
    dropoff_longitude DOUBLE PRECISION NOT NULL,
    dropoff_address VARCHAR(500) NOT NULL,
    distance_meters BIGINT NOT NULL,
    duration_seconds BIGINT NOT NULL,
    base_fare NUMERIC(15, 2) NOT NULL,
    distance_fare NUMERIC(15, 2) NOT NULL,
    time_fare NUMERIC(15, 2) NOT NULL,
    surge_multiplier NUMERIC(5, 2) NOT NULL DEFAULT 1.00,
    total_fare NUMERIC(15, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'VND',
    rule_version INT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    is_used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_quote_customer ON fare_quotes(customer_id);
CREATE INDEX IF NOT EXISTS idx_quote_expires ON fare_quotes(expires_at);

-- 4. Trip Domain
CREATE TABLE IF NOT EXISTS trips (
    trip_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_code VARCHAR(32) NOT NULL UNIQUE,
    service_type VARCHAR(30) NOT NULL,
    vehicle_type VARCHAR(30) NOT NULL,
    customer_id UUID NOT NULL,
    driver_id UUID,
    status VARCHAR(30) NOT NULL DEFAULT 'CREATED',
    pickup_latitude DOUBLE PRECISION NOT NULL,
    pickup_longitude DOUBLE PRECISION NOT NULL,
    pickup_address VARCHAR(500) NOT NULL,
    dropoff_latitude DOUBLE PRECISION NOT NULL,
    dropoff_longitude DOUBLE PRECISION NOT NULL,
    dropoff_address VARCHAR(500) NOT NULL,
    distance_meters BIGINT,
    duration_seconds BIGINT,
    quote_id UUID NOT NULL,
    estimated_fare NUMERIC(15, 2) NOT NULL,
    final_fare NUMERIC(15, 2),
    surge_multiplier NUMERIC(5, 2) NOT NULL DEFAULT 1.00,
    currency VARCHAR(10) NOT NULL DEFAULT 'VND',
    receiver_name VARCHAR(100),
    receiver_phone VARCHAR(20),
    package_description VARCHAR(500),
    delivery_proof_url VARCHAR(500),
    cancelled_by UUID,
    cancellation_reason VARCHAR(500),
    cancellation_fee NUMERIC(15, 2),
    accepted_at TIMESTAMPTZ,
    arrived_pickup_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_trip_customer ON trips(customer_id);
CREATE INDEX IF NOT EXISTS idx_trip_driver ON trips(driver_id);
CREATE INDEX IF NOT EXISTS idx_trip_status ON trips(status);
CREATE INDEX IF NOT EXISTS idx_trip_code ON trips(trip_code);

CREATE TABLE IF NOT EXISTS trip_status_histories (
    history_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES trips(trip_id) ON DELETE CASCADE,
    old_status VARCHAR(30),
    new_status VARCHAR(30) NOT NULL,
    actor_id UUID NOT NULL,
    actor_role VARCHAR(30) NOT NULL,
    reason VARCHAR(500),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_status_history_trip ON trip_status_histories(trip_id);

-- 5. Dispatch Domain
CREATE TABLE IF NOT EXISTS driver_offers (
    offer_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES trips(trip_id) ON DELETE CASCADE,
    driver_id UUID NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'OFFERED',
    offered_at TIMESTAMPTZ NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    responded_at TIMESTAMPTZ,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_offer_trip ON driver_offers(trip_id);
CREATE INDEX IF NOT EXISTS idx_offer_driver ON driver_offers(driver_id);
CREATE INDEX IF NOT EXISTS idx_offer_status ON driver_offers(status);

-- 6. Payment Domain
CREATE TABLE IF NOT EXISTS payments (
    payment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL,
    customer_id UUID NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'VND',
    payment_method VARCHAR(30) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    provider_reference VARCHAR(100),
    idempotency_key VARCHAR(100) UNIQUE,
    failure_reason VARCHAR(500),
    refunded_amount NUMERIC(15, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payments_trip ON payments(trip_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer ON payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_idempotency ON payments(idempotency_key);

-- 7. Wallet & Ledger Domain
CREATE TABLE IF NOT EXISTS wallets (
    wallet_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID NOT NULL UNIQUE,
    currency VARCHAR(10) NOT NULL DEFAULT 'VND',
    balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_wallet_driver ON wallets(driver_id);

CREATE TABLE IF NOT EXISTS wallet_entries (
    entry_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID NOT NULL REFERENCES wallets(wallet_id) ON DELETE CASCADE,
    entry_type VARCHAR(30) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    balance_after NUMERIC(15, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'VND',
    reference_type VARCHAR(50),
    reference_id VARCHAR(100),
    notes VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_wallet_entry_wallet ON wallet_entries(wallet_id);
CREATE INDEX IF NOT EXISTS idx_wallet_entry_reference ON wallet_entries(reference_id);

-- 8. Platform Domain (Outbox & Audit)
CREATE TABLE IF NOT EXISTS outbox_events (
    event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    aggregate_type VARCHAR(50) NOT NULL,
    aggregate_id VARCHAR(100) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_version INT NOT NULL DEFAULT 1,
    payload TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    retry_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_outbox_status_created ON outbox_events(status, created_at);

CREATE TABLE IF NOT EXISTS audit_records (
    audit_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID NOT NULL,
    actor_role VARCHAR(30) NOT NULL,
    action VARCHAR(50) NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    target_id VARCHAR(100) NOT NULL,
    before_snapshot TEXT,
    after_snapshot TEXT,
    result VARCHAR(20) NOT NULL DEFAULT 'SUCCESS',
    correlation_id VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_records(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_target ON audit_records(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_records(created_at);

-- 9. Rating & Review Domain
CREATE TABLE IF NOT EXISTS ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL UNIQUE REFERENCES trips(trip_id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES driver_profiles(driver_id) ON DELETE CASCADE,
    score INT NOT NULL,
    comment VARCHAR(500),
    tags VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rating_trip ON ratings(trip_id);
CREATE INDEX IF NOT EXISTS idx_rating_driver ON ratings(driver_id);
CREATE INDEX IF NOT EXISTS idx_rating_customer ON ratings(customer_id);
