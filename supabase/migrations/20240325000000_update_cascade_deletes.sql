-- Drop existing foreign key constraints
ALTER TABLE addresses DROP CONSTRAINT IF EXISTS addresses_customer_id_fkey;
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_customer_id_fkey;
ALTER TABLE quotes DROP CONSTRAINT IF EXISTS quotes_lead_id_fkey;
ALTER TABLE agreements DROP CONSTRAINT IF EXISTS agreements_quote_id_fkey;
ALTER TABLE agreements DROP CONSTRAINT IF EXISTS agreements_customer_id_fkey;
ALTER TABLE agreements DROP CONSTRAINT IF EXISTS agreements_address_id_fkey;
ALTER TABLE installations DROP CONSTRAINT IF EXISTS installations_agreement_id_fkey;
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_agreement_id_fkey;

-- Update table definitions
ALTER TABLE customers 
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN first_name SET NOT NULL,
  ALTER COLUMN last_name SET NOT NULL;

ALTER TABLE addresses 
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN customer_id SET NOT NULL,
  ALTER COLUMN formatted_address SET NOT NULL;

ALTER TABLE leads 
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN status SET NOT NULL DEFAULT 'NEW';

ALTER TABLE quotes 
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN lead_id SET NOT NULL,
  ALTER COLUMN quote_status SET NOT NULL DEFAULT 'DRAFT',
  ALTER COLUMN monthly_rental_rate SET NOT NULL DEFAULT 0,
  ALTER COLUMN setup_fee SET NOT NULL DEFAULT 0;

ALTER TABLE agreements 
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN quote_id SET NOT NULL,
  ALTER COLUMN agreement_status SET NOT NULL DEFAULT 'DRAFT',
  ALTER COLUMN customer_id SET NOT NULL,
  ALTER COLUMN address_id SET NOT NULL;

ALTER TABLE installations 
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN agreement_id SET NOT NULL,
  ALTER COLUMN sign_off SET NOT NULL DEFAULT false;

ALTER TABLE invoices 
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN agreement_id SET NOT NULL,
  ALTER COLUMN invoice_type SET NOT NULL,
  ALTER COLUMN amount SET NOT NULL DEFAULT 0,
  ALTER COLUMN paid SET NOT NULL DEFAULT false;

-- Recreate foreign key constraints with appropriate ON DELETE actions
ALTER TABLE addresses 
  ADD CONSTRAINT addresses_customer_id_fkey 
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE;

ALTER TABLE leads 
  ADD CONSTRAINT leads_customer_id_fkey 
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL;

ALTER TABLE quotes 
  ADD CONSTRAINT quotes_lead_id_fkey 
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE;

ALTER TABLE agreements 
  ADD CONSTRAINT agreements_quote_id_fkey 
  FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE,
  ADD CONSTRAINT agreements_customer_id_fkey 
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  ADD CONSTRAINT agreements_address_id_fkey 
  FOREIGN KEY (address_id) REFERENCES addresses(id) ON DELETE CASCADE;

ALTER TABLE installations 
  ADD CONSTRAINT installations_agreement_id_fkey 
  FOREIGN KEY (agreement_id) REFERENCES agreements(id) ON DELETE CASCADE;

ALTER TABLE invoices 
  ADD CONSTRAINT invoices_agreement_id_fkey 
  FOREIGN KEY (agreement_id) REFERENCES agreements(id) ON DELETE CASCADE; 