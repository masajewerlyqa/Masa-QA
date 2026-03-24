-- Migration: Add payment_method column to orders table
-- Stores the payment method used: card, cod (cash on delivery), bank_transfer

ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'cod';

COMMENT ON COLUMN public.orders.payment_method IS 'Payment method: card, cod, bank_transfer';
