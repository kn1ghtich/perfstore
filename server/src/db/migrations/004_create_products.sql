CREATE TABLE IF NOT EXISTS products (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    slug            VARCHAR(255) UNIQUE NOT NULL,
    brand_id        INTEGER REFERENCES brands(id) ON DELETE SET NULL,
    description     TEXT,
    price           DECIMAL(10,2) NOT NULL,
    gender          VARCHAR(20) CHECK (gender IN ('male', 'female', 'unisex')),
    concentration   VARCHAR(50),
    volume_ml       INTEGER,
    image_url       VARCHAR(500),
    in_stock        BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_gender ON products(gender);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
