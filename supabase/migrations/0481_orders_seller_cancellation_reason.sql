-- Reason shown to buyer when seller sets order status to cancelled (email + order page).
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS seller_cancellation_reason TEXT;

COMMENT ON COLUMN public.orders.seller_cancellation_reason IS 'Set when seller cancels: message emailed to buyer and shown on order detail.';
