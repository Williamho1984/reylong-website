create table products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  category text not null,
  is_featured boolean default false,
  sort_order integer default 0,
  name_en text not null,
  name_es text not null,
  description_en text not null,
  description_es text not null,
  specs jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table product_media (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  type text check (type in ('image', 'video', 'catalog_pdf')) not null,
  url text not null,
  caption_en text default '',
  caption_es text default '',
  sort_order integer default 0
);

create table news (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  published_at timestamptz not null,
  cover_image_url text default '',
  title_en text not null,
  title_es text not null,
  content_en text not null,
  content_es text not null
);

create table case_studies (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  client text not null,
  country text not null,
  published_at timestamptz not null,
  cover_image_url text default '',
  title_en text not null,
  title_es text not null,
  content_en text not null,
  content_es text not null,
  product_id uuid references products(id) on delete set null
);

create table events (
  id uuid primary key default gen_random_uuid(),
  title_en text not null,
  title_es text not null,
  date_start date not null,
  date_end date not null,
  location text not null,
  booth_number text default '',
  description_en text not null,
  description_es text not null,
  url text default ''
);

create table inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text not null,
  email text not null,
  company text not null,
  country text not null,
  phone text default '',
  product_id uuid references products(id) on delete set null,
  message text not null,
  status text check (status in ('new', 'read', 'replied')) default 'new'
);

alter table products enable row level security;
alter table product_media enable row level security;
alter table news enable row level security;
alter table case_studies enable row level security;
alter table events enable row level security;
alter table inquiries enable row level security;

create policy "public_read_products" on products for select using (true);
create policy "public_read_product_media" on product_media for select using (true);
create policy "public_read_news" on news for select using (true);
create policy "public_read_case_studies" on case_studies for select using (true);
create policy "public_read_events" on events for select using (true);
create policy "public_insert_inquiries" on inquiries for insert with check (true);
