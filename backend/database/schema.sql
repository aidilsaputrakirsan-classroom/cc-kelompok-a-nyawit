-- =========================
-- ENUM TYPES (SAFE CREATE)
-- =========================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'asset_status'
    ) THEN
        CREATE TYPE asset_status AS ENUM (
            'available',
            'in_use',
            'maintenance',
            'decommissioned'
        );
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'user_role'
    ) THEN
        CREATE TYPE user_role AS ENUM (
            'admin',
            'manager',
            'user'
        );
    END IF;
END$$;

-- =========================
-- USERS TABLE
-- =========================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(200),
    hashed_password VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'user',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================
-- CATEGORIES TABLE
-- =========================
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================
-- LOCATIONS TABLE
-- =========================
CREATE TABLE IF NOT EXISTS locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================
-- ASSETS TABLE
-- =========================
CREATE TABLE IF NOT EXISTS assets (
    id SERIAL PRIMARY KEY,
    asset_code VARCHAR(50) UNIQUE NOT NULL,
    serial_number VARCHAR(100) UNIQUE,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    ip_address VARCHAR(64),
    mac_address VARCHAR(64),
    purchase_date DATE,
    location_id INTEGER,
    status asset_status NOT NULL DEFAULT 'available',
    category_id INTEGER NOT NULL,
    created_by INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_assets_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_assets_location
        FOREIGN KEY (location_id)
        REFERENCES locations(id)
        ON DELETE SET NULL,
    CONSTRAINT fk_assets_created_by
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE SET NULL
);

-- =========================
-- BORROW LOGS TABLE
-- =========================
CREATE TABLE IF NOT EXISTS borrow_logs (
    id SERIAL PRIMARY KEY,
    asset_id INTEGER NOT NULL,
    user_name VARCHAR(150) NOT NULL,
    department VARCHAR(100),
    notes TEXT,
    borrowed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    returned_at TIMESTAMPTZ,

    CONSTRAINT fk_borrow_logs_asset
        FOREIGN KEY (asset_id)
        REFERENCES assets(id)
        ON DELETE CASCADE
);

-- =========================
-- INDEXES
-- =========================
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE INDEX IF NOT EXISTS idx_assets_asset_code
    ON assets(asset_code);

CREATE INDEX IF NOT EXISTS idx_assets_status
    ON assets(status);

CREATE INDEX IF NOT EXISTS idx_assets_category_id
    ON assets(category_id);

CREATE INDEX IF NOT EXISTS idx_borrow_logs_asset_id
    ON borrow_logs(asset_id);

CREATE INDEX IF NOT EXISTS idx_borrow_logs_borrowed_at
    ON borrow_logs(borrowed_at DESC);
