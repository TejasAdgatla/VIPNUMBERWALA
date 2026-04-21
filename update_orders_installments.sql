-- Update orders table for installments
ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_milestones integer DEFAULT 1;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS paid_milestones integer DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS paid_amount numeric DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_amount numeric DEFAULT 0;

-- Ensure number_id is not null for mapping
-- ALTER TABLE orders ALTER COLUMN number_id SET NOT NULL;
