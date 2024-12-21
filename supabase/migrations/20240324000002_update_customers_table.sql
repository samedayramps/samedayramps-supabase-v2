-- Remove address columns from customers table since we're using the addresses table
alter table customers
    drop column if exists address,
    drop column if exists city,
    drop column if exists state,
    drop column if exists zip;