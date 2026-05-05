-- ============================================================
-- Rat Watch Taipei — Supabase Schema
-- Paste this entire file into: Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── reports ────────────────────────────────────────────────────────────────
create table if not exists reports (
  id          uuid primary key default uuid_generate_v4(),
  type        text not null,           -- rat-live | rat-dead | poisoned | nest | env-risk
  location    text not null,
  district    text,
  loc_type    text,                    -- market | restaurant | garbage | drain | park | building | other
  animal      text,                    -- cat | dog | bird | other (for poisoned type)
  count       text,                    -- 1 | 2-5 | 6-10 | 10+
  description        text,
  photo_url   text,
  source      text,
  source_url  text,
  x           integer default 340,
  y           integer default 160,
  created_at  timestamptz default now()
);

-- ── cats ───────────────────────────────────────────────────────────────────
create table if not exists cats (
  id          uuid primary key default uuid_generate_v4(),
  location    text not null,
  district    text,
  count       integer default 1,
  status      text default 'active',   -- active | tnr | declining | new
  names       text,                    -- individual cat names/descriptions
  description        text,
  photo_url   text,
  rat_nearby  text default 'unknown',  -- yes | no | unknown
  caretaker   text,
  org         text,                    -- org id from CAT_ORGS list
  org_label   text,
  org_url     text,
  x           integer default 340,
  y           integer default 160,
  created_at  timestamptz default now()
);

-- ── drugs ──────────────────────────────────────────────────────────────────
create table if not exists drugs (
  id          uuid primary key default uuid_generate_v4(),
  location    text not null,
  district    text,
  date        text,                    -- YYYY-MM-DD
  time_str    text,                    -- HH:MM
  by          text default 'unknown',  -- gov | private | unknown
  color       text default 'unknown',  -- blue | green | pink | pellet | station | unknown
  near_cat    text default 'unknown',  -- yes | no | unknown
  description        text,
  photo_url   text,
  x           integer default 340,
  y           integer default 160,
  created_at  timestamptz default now()
);

-- ── Row Level Security (allow public read + insert, no delete/update) ──────
alter table reports enable row level security;
alter table cats    enable row level security;
alter table drugs   enable row level security;

create policy "public read reports"  on reports for select using (true);
create policy "public insert reports" on reports for insert with check (true);

create policy "public read cats"     on cats    for select using (true);
create policy "public insert cats"   on cats    for insert with check (true);

create policy "public read drugs"    on drugs   for select using (true);
create policy "public insert drugs"  on drugs   for insert with check (true);

-- ── Storage bucket for photos ──────────────────────────────────────────────
-- Run this separately in the Storage section OR via SQL:
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict do nothing;

create policy "public upload photos"
  on storage.objects for insert
  with check (bucket_id = 'photos');

create policy "public read photos"
  on storage.objects for select
  using (bucket_id = 'photos');

-- ── Seed data (optional — real news-sourced reports) ──────────────────────
insert into reports (type, location, district, loc_type, description, count, source, source_url, x, y) values
('rat-live', '中山區雙連市場花圃',           '中山區', 'market',     '白天發現10幾隻老鼠在花圃群聚，完全不怕人。（來源：自由時報 2026-05-01）',      '10+',  '自由時報', 'https://news.ltn.com.tw/news/life/breakingnews/5421743', 255, 118),
('rat-live', '中山區心中山線形公園',          '中山區', 'park',       '線形公園多處鼠竄，鼠洞幾乎打通地底。議員林亮君直播記錄。（來源：民視 2026-05-01）', '10+',  '民視新聞', 'https://tw.news.yahoo.com/', 270, 105),
('rat-dead', '台北車站外圍人行道',            '中正區', 'transit',    '死鼠陳屍北車外人行道，2隻鳥正在啄食鼠屍。施景中醫師示警。（來源：自由時報 2026-05-03）', '1',  '自由時報', 'https://news.ltn.com.tw/news/life/breakingnews/5423999', 240, 195),
('rat-live', '大安區大安森林公園周邊',        '大安區', 'park',       '今年1月爆發漢他病毒死亡病例。公園內鳳頭蒼鷹生態受到老鼠藥威脅。（來源：大紀元 2026-05-03）', '6-10', '大紀元', 'https://www.epochtimes.com/', 590, 122),
('env-risk', '中山區心中山線形公園樹穴',      '中山區', 'park',       '市府在線形公園樹穴投放老鼠藥，未使用毒餌站，藥餌直接曝露於公共空間。（來源：大紀元 2026-05-01）', '1',  '大紀元', 'https://www.epochtimes.com/', 262, 112),
('poisoned', '中山區線形公園附近',           '中山區', 'park',       '有毛小孩誤食路邊老鼠藥後口吐白沫。議員林亮君記錄並質疑市府投藥方式。（民視 2026-05-02）', '1',  '民視新聞', null, 268, 120),
('rat-live', '士林區市場周邊',              '士林區', 'market',     '鼠患從中山雙連一帶蔓延至士林周邊市場區。（來源：大紀元 2026-05-03）',          '6-10', '大紀元', 'https://www.epochtimes.com/', 80, 65);

insert into cats (location, district, count, status, names, description, rat_nearby, caretaker, x, y) values
('中正區羅斯福路三段公園旁', '中正區', 6, 'tnr',      '虎斑「小花」、橘貓「胖虎」、三花「阿妹」等', '已由里長協助TNR，活動範圍穩定。附近無明顯鼠患。', 'no',      '黃里長',  250, 195),
('大安區和平東路二段公園',  '大安區', 4, 'active',   '黑貓「小黑」、灰貓×2、白底橘紋母貓',        '活躍於公園角落與停車場，夜間巡邏廣。',           'yes',     '志工林女士', 578, 132),
('萬華區西昌街',           '萬華區', 3, 'declining', '老虎紋母貓、幼貓×2',                      '近期貓隻數量減少，疑似附近排水溝投藥導致。',      'yes',     null,       98, 213),
('北投區公館路市場旁',     '北投區', 5, 'active',   '白貓「雪球」、橘白花貓×2、純橘×2',          '公園及老市場旁固定巡邏，里長反映近年鼠患明顯減少。','no',  '貓咪協會北投站', 92, 110);

insert into drugs (location, district, date, time_str, by, color, near_cat, description, x, y) values
('中山區心中山線形公園樹穴', '中山區', '2026-05-01', '09:00', 'gov',     'station', 'unknown', '台北市環保局在線形公園樹穴大量投放老鼠藥，部分未使用毒餌站。議員林亮君批評。', 260, 115),
('全市47處公有市場',        '大同區', '2026-04-06', '',      'gov',     'station', 'unknown', '台北市市場處完成47處公有市場清消作業。',                                         570, 195),
('中山區雙連市場周邊鼠洞口', '中山區', '2026-05-02', '08:00', 'gov',     'pellet',  'yes',     '市府派員投藥並以發泡劑填補鼠洞。猛禽研究會警告恐培養超級老鼠。',               252, 122),
('大安區大安森林公園附近',  '大安區', '2026-04-28', '',      'gov',     'station', 'yes',     '投藥作業。議員警告：鳳頭蒼鷹恐受生物放大效應毒害。',                             582, 130);
