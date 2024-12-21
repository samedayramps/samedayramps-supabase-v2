-- Add customer_id column to addresses table
alter table public.addresses
add column if not exists customer_id uuid references customers(id) on delete cascade;

-- Add index for customer_id
create index if not exists addresses_customer_id_idx on addresses(customer_id); 