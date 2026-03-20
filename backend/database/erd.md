# Database ERD (Mermaid)

Di bawah ini adalah diagram tabel dari `schema.sql`.

```mermaid
erDiagram
    CATEGORIES {
        INT id PK
        VARCHAR name UK
        TEXT description
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    ASSETS {
        INT id PK
        VARCHAR asset_code UK
        VARCHAR serial_number UK
        VARCHAR brand
        VARCHAR model
        TEXT specs
        VARCHAR ip_address
        VARCHAR mac_address
        DATE purchase_date
        VARCHAR location
        ASSET_STATUS status
        INT category_id FK
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    BORROW_LOGS {
        INT id PK
        INT asset_id FK
        VARCHAR user_name
        VARCHAR department
        TEXT notes
        TIMESTAMPTZ borrowed_at
        TIMESTAMPTZ returned_at
    }

    CATEGORIES ||--o{ ASSETS : has
    ASSETS ||--o{ BORROW_LOGS : borrowed_in
```

## Export jadi gambar (PNG/SVG)

Jalankan dari folder `backend/database`:

```bash
npx -y @mermaid-js/mermaid-cli -i erd.mmd -o erd.svg
npx -y @mermaid-js/mermaid-cli -i erd.mmd -o erd.png
```

Hasil file gambar:

- `backend/database/erd.svg`
- `backend/database/erd.png`
