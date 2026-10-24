-- Applied to the cinegram Supabase project on 2026-10-24.

-- Replies: which card a card answers, and the buyer's email so replies can reach them without showing it.
alter table public.sent_cards add column if not exists reply_to text;
alter table public.sent_cards add column if not exists sender_email text;
create index if not exists sent_cards_reply_to_idx on public.sent_cards (reply_to) where reply_to is not null;

-- Birthday reminders, emailed a week ahead by a daily cron. Only the server (service role) reads or writes them.
create table if not exists public.reminders (
  id text primary key,
  created_at timestamptz not null default now(),
  email text not null check (char_length(email) between 3 and 254),
  to_name text not null check (char_length(to_name) between 1 and 60),
  month smallint not null check (month between 1 and 12),
  day smallint not null check (day between 1 and 31),
  lang text not null default 'en',
  occasion text not null default 'birthday',
  token text not null,
  active boolean not null default true,
  last_sent_year integer
);
create index if not exists reminders_due_idx on public.reminders (month, day) where active;
create index if not exists reminders_email_idx on public.reminders (email);
alter table public.reminders enable row level security;
