-- Initial database setup
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Sequences for custom IDs
CREATE SEQUENCE IF NOT EXISTS booking_id_seq START 1000;
CREATE SEQUENCE IF NOT EXISTS order_id_seq START 1000;

-- Function to generate booking ID (BK + 4 digits)
CREATE OR REPLACE FUNCTION generate_booking_id() RETURNS TEXT AS $$
BEGIN
  RETURN 'BK' || LPAD(NEXTVAL('booking_id_seq')::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to generate order ID (ORD + 4 digits)
CREATE OR REPLACE FUNCTION generate_order_id() RETURNS TEXT AS $$
BEGIN
  RETURN 'ORD' || LPAD(NEXTVAL('order_id_seq')::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;
