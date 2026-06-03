-- Run in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/lqgrvkhrbsgbatzhzgvy/sql/new

-- 1. Enable pgvector
create extension if not exists vector;

-- 2. Create table (384-dim for bge-small-en-v1.5)
create table if not exists chatbot_qa (
  id bigserial primary key,
  category text not null,
  question text not null,
  answer text not null,
  related_product text,
  priority char(1),
  embedding vector(384)
);

-- 3. RLS
alter table chatbot_qa enable row level security;

create policy "public read chatbot_qa"
  on chatbot_qa for select
  to anon, authenticated
  using (true);

-- 4. Semantic search function
create or replace function match_chatbot_qa(
  query_embedding vector(384),
  match_threshold float default 0.4,
  match_count int default 3
)
returns table (
  id bigint,
  category text,
  question text,
  answer text,
  related_product text,
  similarity float
)
language sql stable security invoker
as $$
  select
    cqa.id,
    cqa.category,
    cqa.question,
    cqa.answer,
    cqa.related_product,
    1 - (cqa.embedding <=> query_embedding) as similarity
  from chatbot_qa cqa
  where 1 - (cqa.embedding <=> query_embedding) > match_threshold
  order by cqa.embedding <=> query_embedding
  limit match_count;
$$;

-- 5. Grant execute to REST API roles
grant execute on function match_chatbot_qa to anon, authenticated;
