CREATE TYPE asset_status AS ENUM ('available', 'in_use', 'maintenance', 'decommissioned');

CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assets (
    id SERIAL PRIMARY KEY,
    asset_code VARCHAR(50) UNIQUE NOT NULL,
    serial_number VARCHAR(100) UNIQUE,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    specs TEXT,
    ip_address VARCHAR(64),
    mac_address VARCHAR(64),
    purchase_date DATE,
    location VARCHAR(255),
    status asset_status NOT NULL DEFAULT 'available',
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_assets_asset_code ON assets(asset_code);
CREATE INDEX IF NOT EXISTS ix_assets_status ON assets(status);
CREATE INDEX IF NOT EXISTS ix_assets_category_id ON assets(category_id);

ALTER TABLE assets ADD COLUMN IF NOT EXISTS mac_address VARCHAR(64);

CREATE TABLE IF NOT EXISTS borrow_logs (
    id SERIAL PRIMARY KEY,
    asset_id INTEGER NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    user_name VARCHAR(150) NOT NULL,
    department VARCHAR(100),
    notes TEXT,
    borrowed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    returned_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS ix_borrow_logs_asset_id ON borrow_logs(asset_id);
CREATE INDEX IF NOT EXISTS ix_borrow_logs_borrowed_at ON borrow_logs(borrowed_at DESC);
