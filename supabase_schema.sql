-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Rooms Table
create table if not exists rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  room_number text not null unique,
  description text default '',
  capacity integer default 20,
  is_locked boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Users Table
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password text not null,
  role text not null check (role in ('ADMIN', 'JURY', 'COORDINATOR')),
  room_id uuid references rooms(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Teams Table
create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  college text not null,
  leader_name text not null,
  members text[] default '{}'::text[],
  problem_statement text not null,
  phone text not null,
  email text not null,
  submission_link text default '',
  room_id uuid references rooms(id) on delete cascade not null,
  is_present boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Evaluations Table
create table if not exists evaluations (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams(id) on delete cascade not null unique,
  room_id uuid references rooms(id) on delete cascade not null,
  jury_id uuid references users(id) on delete cascade not null,
  innovation integer not null check (innovation >= 0 and innovation <= 20),
  technical_excellence integer not null check (technical_excellence >= 0 and technical_excellence <= 20),
  presentation integer not null check (presentation >= 0 and presentation <= 20),
  feasibility integer not null check (feasibility >= 0 and feasibility <= 20),
  impact integer not null check (impact >= 0 and impact <= 20),
  total_score integer not null check (total_score >= 0 and total_score <= 100),
  remarks text default '',
  is_locked boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Requests Table
create table if not exists requests (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references rooms(id) on delete cascade not null,
  jury_id uuid references users(id) on delete cascade not null,
  team_id uuid references teams(id) on delete cascade not null,
  reason text not null,
  status text default 'PENDING' check (status in ('PENDING', 'APPROVED', 'REJECTED')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Notifications Table
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  type text not null,
  target_role text default 'ALL',
  target_room_id uuid references rooms(id) on delete set null,
  read_by text[] default '{}'::text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Audit Logs Table
create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  user_name text default 'System',
  action text not null,
  details text not null,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for performance
create index if not exists idx_teams_room_id on teams(room_id);
create index if not exists idx_evaluations_room_id on evaluations(room_id);
create index if not exists idx_evaluations_total_score on evaluations(total_score desc);
create index if not exists idx_requests_room_status on requests(room_id, status);
