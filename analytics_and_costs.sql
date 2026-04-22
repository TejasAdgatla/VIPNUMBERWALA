-- SQL for Admin Dashboard & Costs
ALTER TABLE vip_numbers ADD COLUMN IF NOT EXISTS purchase_cost numeric DEFAULT 0;

-- Create analytics table
CREATE TABLE IF NOT EXISTS site_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT DEFAULT 'page_view',
    page_path TEXT,
    visitor_id TEXT,
    device_type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable full access for now (dev)
CREATE POLICY "Public can log analytics" ON site_analytics FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can read analytics" ON site_analytics FOR SELECT USING (true);
ALTER TABLE site_analytics ENABLE ROW LEVEL SECURITY;
