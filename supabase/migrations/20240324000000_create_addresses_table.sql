create table if not exists public.addresses (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    formatted_address text not null,
    street_number text,
    street_name text,
    city text,
    state text,
    postal_code text,
    country text,
    lat double precision,
    lng double precision,
    place_id text,
    lead_id uuid references public.leads(id) on delete cascade not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add indexes
create index if not exists addresses_lead_id_idx on public.addresses(lead_id);
create index if not exists addresses_place_id_idx on public.addresses(place_id);

-- Add RLS policies
alter table public.addresses enable row level security;

create policy "Enable read access for authenticated users" on public.addresses
    for select
    to authenticated
    using (true);

create policy "Enable insert access for authenticated users" on public.addresses
    for insert
    to authenticated
    with check (true);

create policy "Enable update access for authenticated users" on public.addresses
    for update
    to authenticated
    using (true);

create policy "Enable delete access for authenticated users" on public.addresses
    for delete
    to authenticated
    using (true); 