CREATE TABLE IF NOT EXISTS product_notes (
    id         SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    layer      VARCHAR(10) CHECK (layer IN ('top', 'middle', 'base')),
    note       VARCHAR(100) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notes_product ON product_notes(product_id);
