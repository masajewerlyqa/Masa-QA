-- Add tracking fields to orders table
-- tracking_number: shipping provider's tracking number
-- shipping_company: carrier name (DHL, FedEx, Aramex, etc.)
-- estimated_delivery: expected delivery date

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS tracking_number TEXT,
ADD COLUMN IF NOT EXISTS shipping_company TEXT,
ADD COLUMN IF NOT EXISTS estimated_delivery DATE;

-- Add index for faster lookups by tracking number
CREATE INDEX IF NOT EXISTS idx_orders_tracking_number ON orders(tracking_number) WHERE tracking_number IS NOT NULL;

-- Comment explaining the fields
COMMENT ON COLUMN orders.tracking_number IS 'Shipping carrier tracking number';
COMMENT ON COLUMN orders.shipping_company IS 'Name of the shipping carrier (DHL, FedEx, Aramex, etc.)';
COMMENT ON COLUMN orders.estimated_delivery IS 'Estimated delivery date';
