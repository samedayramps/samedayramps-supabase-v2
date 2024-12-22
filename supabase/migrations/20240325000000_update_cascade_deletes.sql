-- Drop existing foreign key constraints
ALTER TABLE addresses DROP CONSTRAINT IF EXISTS addresses_customer_id_fkey;
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_customer_id_fkey;
ALTER TABLE quotes DROP CONSTRAINT IF EXISTS quotes_customer_id_fkey;
ALTER TABLE agreements DROP CONSTRAINT IF EXISTS agreements_customer_id_fkey;

-- First, modify the leads table to allow NULL customer_id
ALTER TABLE leads ALTER COLUMN customer_id DROP NOT NULL;

-- Recreate foreign key constraints
-- For leads, use SET NULL instead of CASCADE
ALTER TABLE leads
  ADD CONSTRAINT leads_customer_id_fkey
  FOREIGN KEY (customer_id)
  REFERENCES customers(id)
  ON DELETE SET NULL;

-- For other tables, use CASCADE
ALTER TABLE addresses
  ADD CONSTRAINT addresses_customer_id_fkey
  FOREIGN KEY (customer_id)
  REFERENCES customers(id)
  ON DELETE CASCADE;

ALTER TABLE quotes
  ADD CONSTRAINT quotes_customer_id_fkey
  FOREIGN KEY (customer_id)
  REFERENCES customers(id)
  ON DELETE CASCADE;

ALTER TABLE agreements
  ADD CONSTRAINT agreements_customer_id_fkey
  FOREIGN KEY (customer_id)
  REFERENCES customers(id)
  ON DELETE CASCADE;

-- Also ensure that when a quote is deleted, its agreements are deleted
ALTER TABLE agreements DROP CONSTRAINT IF EXISTS agreements_quote_id_fkey;
ALTER TABLE agreements
  ADD CONSTRAINT agreements_quote_id_fkey
  FOREIGN KEY (quote_id)
  REFERENCES quotes(id)
  ON DELETE CASCADE;

-- And when an agreement is deleted, its installations and invoices are deleted
ALTER TABLE installations DROP CONSTRAINT IF EXISTS installations_agreement_id_fkey;
ALTER TABLE installations
  ADD CONSTRAINT installations_agreement_id_fkey
  FOREIGN KEY (agreement_id)
  REFERENCES agreements(id)
  ON DELETE CASCADE;

ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_agreement_id_fkey;
ALTER TABLE invoices
  ADD CONSTRAINT invoices_agreement_id_fkey
  FOREIGN KEY (agreement_id)
  REFERENCES agreements(id)
  ON DELETE CASCADE; 