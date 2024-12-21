-- Add notes column to leads table
alter table public.leads 
add column if not exists notes jsonb;

-- Update RLS policies if needed
create policy "Enable update of notes for authenticated users" on public.leads
    for update
    to authenticated
    using (true)
    with check (true); 