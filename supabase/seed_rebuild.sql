-- ==========================================================
-- BuyerHQ Rebuild Seed Data
-- ==========================================================
-- Run after setup_production_db.sql

insert into public.agents (
  id,
  name,
  email,
  phone,
  agency_name,
  bio,
  avatar_url,
  state,
  suburbs,
  specializations,
  years_experience,
  properties_purchased,
  avg_rating,
  review_count,
  is_verified,
  is_active,
  licence_number,
  licence_verified_at,
  website_url,
  linkedin_url,
  fee_structure
) values
  (
    'a1111111-1111-4111-8111-111111111111',
    'Sophie Nguyen',
    'sophie.nguyen@harbouradvocacy.com.au',
    '0412 338 104',
    'Harbour Advocacy Partners',
    'Sophie has spent over a decade representing owner occupiers and upgraders across Sydney''s inner west and lower north shore. She is known for calm negotiation, disciplined due diligence, and strong auction strategy.',
    null,
    'NSW',
    array['Newtown','Dulwich Hill','Marrickville','Leichhardt'],
    array['First Home Buyers','Auction Bidding','Family Upgraders'],
    12,
    168,
    4.9,
    3,
    true,
    true,
    'NSW-BA-87422',
    now() - interval '120 days',
    'https://harbouradvocacy.com.au',
    'https://linkedin.com/in/sophienguyenbuyersagent',
    'Fixed fee from $11,500'
  ),
  (
    'b2222222-2222-4222-8222-222222222222',
    'Liam O''Connor',
    'liam.oconnor@yarrabuyer.com.au',
    '0433 728 510',
    'Yarra Buyer Advisory',
    'Liam specialises in Melbourne''s inner north and bayside markets. His clients value his data-first valuation process and ability to source tightly held homes before they are publicly advertised.',
    null,
    'VIC',
    array['Richmond','Brunswick','Northcote','Elwood'],
    array['Investment Strategy','Off-Market Access','Luxury'],
    9,
    114,
    4.8,
    3,
    true,
    true,
    'VIC-BA-33109',
    now() - interval '84 days',
    'https://yarrabuyer.com.au',
    'https://linkedin.com/in/liamoconnorbuyersagent',
    'Fixed fee from $13,900'
  ),
  (
    'c3333333-3333-4333-8333-333333333333',
    'Amelia Brooks',
    'amelia.brooks@rivercitybuyers.com.au',
    '0407 118 902',
    'River City Buyers Group',
    'Amelia guides both first home buyers and strategic investors through the Brisbane corridor. She focuses on stock quality, flood risk checks, and long-term performance fundamentals.',
    null,
    'QLD',
    array['New Farm','Paddington','Ashgrove','Camp Hill'],
    array['First Home Buyers','Investment Strategy','Negotiation'],
    7,
    92,
    4.7,
    3,
    true,
    true,
    'QLD-BA-55418',
    now() - interval '61 days',
    'https://rivercitybuyers.com.au',
    'https://linkedin.com/in/ameliabrooksbuyersagent',
    'Fixed fee from $9,800'
  ),
  (
    'd4444444-4444-4444-8444-444444444444',
    'Noah Campbell',
    'noah.campbell@westcoastacquire.com.au',
    '0421 220 672',
    'West Coast Acquire',
    'Noah leads a Perth-focused team helping families and professionals secure homes in high-demand coastal and school-catchment precincts with a strong focus on price discipline.',
    null,
    'WA',
    array['Mount Lawley','Leederville','Subiaco','Scarborough'],
    array['Family Upgraders','Auction Bidding','Off-Market Access'],
    10,
    131,
    4.8,
    3,
    true,
    true,
    'WA-BA-22061',
    now() - interval '142 days',
    'https://westcoastacquire.com.au',
    'https://linkedin.com/in/noahcampbellbuyersagent',
    'Fixed fee from $10,500'
  ),
  (
    'e5555555-5555-4555-8555-555555555555',
    'Grace Patel',
    'grace.patel@adelaidesmartbuy.com.au',
    '0419 900 144',
    'Adelaide Smart Buy',
    'Grace supports interstate movers and local buyers with a practical, transparent process. She has particular strength in character homes and value-add opportunities around Adelaide''s fringe suburbs.',
    null,
    'SA',
    array['Norwood','Prospect','Unley','Glenelg'],
    array['First Home Buyers','Interstate Relocation','Investment Strategy'],
    6,
    73,
    4.6,
    3,
    true,
    true,
    'SA-BA-11870',
    now() - interval '47 days',
    'https://adelaidesmartbuy.com.au',
    'https://linkedin.com/in/gracepatelbuyersagent',
    'Fixed fee from $8,900'
  ),
  (
    'f6666666-6666-4666-8666-666666666666',
    'Ethan Morris',
    'ethan.morris@taspropertyallies.com.au',
    '0401 813 550',
    'Tas Property Allies',
    'Ethan helps buyers identify quality assets in Hobart and surrounding growth corridors. His approach combines local council insight, rental demand trends, and renovation feasibility.',
    null,
    'TAS',
    array['Battery Point','Sandy Bay','North Hobart','Bellerive'],
    array['Investment Strategy','First Home Buyers','Due Diligence'],
    5,
    58,
    4.5,
    3,
    true,
    true,
    'TAS-BA-77211',
    now() - interval '96 days',
    'https://taspropertyallies.com.au',
    'https://linkedin.com/in/ethanmorrisbuyersagent',
    'Fixed fee from $8,500'
  ),
  (
    'a7777777-7777-4777-8777-777777777777',
    'Charlotte Evans',
    'charlotte.evans@capitalbuyercollective.com.au',
    '0435 211 099',
    'Capital Buyer Collective',
    'Charlotte represents professionals and diplomats purchasing in Canberra. She is highly regarded for suburb selection strategy, bid execution, and concise vendor-side negotiation.',
    null,
    'ACT',
    array['Kingston','Griffith','Braddon','Campbell'],
    array['Luxury','Auction Bidding','Negotiation'],
    8,
    88,
    4.7,
    3,
    true,
    true,
    'ACT-BA-90017',
    now() - interval '73 days',
    'https://capitalbuyercollective.com.au',
    'https://linkedin.com/in/charlotteevansbuyersagent',
    'Fixed fee from $12,400'
  ),
  (
    'b8888888-8888-4888-8888-888888888888',
    'Mason Reed',
    'mason.reed@topendbuyerpartners.com.au',
    '0418 604 311',
    'Top End Buyer Partners',
    'Mason assists buyers entering Darwin and regional NT markets, with an emphasis on investment-grade stock, realistic yield assumptions, and smooth contract management.',
    null,
    'NT',
    array['Parap','Nightcliff','Fannie Bay','Larrakeyah'],
    array['Investment Strategy','Commercial','First Home Buyers'],
    4,
    42,
    4.4,
    3,
    true,
    true,
    'NT-BA-44703',
    now() - interval '55 days',
    'https://topendbuyerpartners.com.au',
    'https://linkedin.com/in/masonreedbuyersagent',
    'Fixed fee from $8,700'
  )
on conflict (id) do update set
  name = excluded.name,
  email = excluded.email,
  phone = excluded.phone,
  agency_name = excluded.agency_name,
  bio = excluded.bio,
  state = excluded.state,
  suburbs = excluded.suburbs,
  specializations = excluded.specializations,
  years_experience = excluded.years_experience,
  properties_purchased = excluded.properties_purchased,
  avg_rating = excluded.avg_rating,
  review_count = excluded.review_count,
  is_verified = excluded.is_verified,
  is_active = excluded.is_active,
  licence_number = excluded.licence_number,
  licence_verified_at = excluded.licence_verified_at,
  website_url = excluded.website_url,
  linkedin_url = excluded.linkedin_url,
  fee_structure = excluded.fee_structure;

insert into public.reviews (agent_id, buyer_name, rating, comment, property_suburb, property_type, is_approved) values
  ('a1111111-1111-4111-8111-111111111111','Olivia R.',5,'Sophie kept us focused and negotiated hard in a competitive campaign. We bought below our walk-away number.','Marrickville','House',true),
  ('a1111111-1111-4111-8111-111111111111','Daniel T.',5,'Great process, clear communication, and excellent auction strategy.','Leichhardt','Townhouse',true),
  ('a1111111-1111-4111-8111-111111111111','Priya K.',4,'Very strong on due diligence and vendor negotiations.','Newtown','Apartment',true),

  ('b2222222-2222-4222-8222-222222222222','James W.',5,'Liam found an off-market option that matched our brief perfectly.','Brunswick','House',true),
  ('b2222222-2222-4222-8222-222222222222','Mia A.',4,'Practical advice and disciplined pricing saved us from overpaying.','Richmond','Apartment',true),
  ('b2222222-2222-4222-8222-222222222222','Harper S.',5,'Fast, professional, and transparent from shortlisting to settlement.','Northcote','Townhouse',true),

  ('c3333333-3333-4333-8333-333333333333','Lucas M.',5,'Amelia balanced lifestyle and investment outcomes brilliantly.','Paddington','House',true),
  ('c3333333-3333-4333-8333-333333333333','Zoe C.',4,'Helpful at every stage and very strong on local market data.','Camp Hill','House',true),
  ('c3333333-3333-4333-8333-333333333333','Ava N.',5,'Negotiation result exceeded expectations.','New Farm','Apartment',true),

  ('d4444444-4444-4444-8444-444444444444','Ethan B.',5,'Noah was decisive at auction and secured the property under budget.','Subiaco','House',true),
  ('d4444444-4444-4444-8444-444444444444','Sienna L.',4,'Great communication and realistic strategy.','Leederville','Apartment',true),
  ('d4444444-4444-4444-8444-444444444444','Cooper J.',5,'Excellent local knowledge and a very smooth process.','Mount Lawley','House',true),

  ('e5555555-5555-4555-8555-555555555555','Nora P.',5,'Grace made our interstate move much easier and less stressful.','Norwood','House',true),
  ('e5555555-5555-4555-8555-555555555555','Harrison D.',4,'Strong suburb advice and realistic budgeting support.','Unley','Townhouse',true),
  ('e5555555-5555-4555-8555-555555555555','Ella F.',5,'Very responsive and excellent contract guidance.','Prospect','House',true),

  ('f6666666-6666-4666-8666-666666666666','Lily G.',5,'Ethan is detail-focused and helped us avoid a risky purchase.','Sandy Bay','Apartment',true),
  ('f6666666-6666-4666-8666-666666666666','Noah V.',4,'Practical recommendations and clear next steps throughout.','Battery Point','House',true),
  ('f6666666-6666-4666-8666-666666666666','Isla H.',5,'Great local contacts and very thorough due diligence.','North Hobart','Townhouse',true),

  ('a7777777-7777-4777-8777-777777777777','Leo Y.',5,'Charlotte executed an excellent auction plan and kept us composed.','Braddon','Apartment',true),
  ('a7777777-7777-4777-8777-777777777777','Aria Q.',4,'Clear strategy, quick communication, and realistic expectations.','Campbell','Townhouse',true),
  ('a7777777-7777-4777-8777-777777777777','Owen Z.',5,'Outstanding negotiation and market insights in Canberra.','Kingston','House',true),

  ('b8888888-8888-4888-8888-888888888888','Ruby E.',4,'Mason was practical and honest about yield and condition trade-offs.','Nightcliff','Apartment',true),
  ('b8888888-8888-4888-8888-888888888888','Kai U.',5,'Great communication and efficient end-to-end process.','Parap','House',true),
  ('b8888888-8888-4888-8888-888888888888','Chloe I.',4,'Strong value in negotiation support and due diligence checks.','Fannie Bay','Townhouse',true);

insert into public.blog_posts (
  title,
  slug,
  excerpt,
  content,
  category,
  author,
  published_at,
  is_published,
  cover_image_url
) values
  (
    'How to Choose a Buyer''s Agent Without Getting Overwhelmed',
    'how-to-choose-a-buyers-agent',
    'A practical framework to compare buyer''s agents on strategy, track record, communication, and fee transparency.',
    '# How to Choose a Buyer''s Agent Without Getting Overwhelmed

Choosing representation can feel harder than choosing the property itself. Start with three filters: **local evidence**, **process clarity**, and **fit**.

## 1) Local evidence beats generic claims

Ask for recent purchases in your preferred suburbs, including purchase method, days on market, and the rationale behind price positioning.

## 2) Process clarity prevents surprises

A quality advisor can explain their workflow from brief creation through due diligence and negotiation. If the process sounds vague, outcomes usually are too.

## 3) Fit matters

You need someone who can challenge assumptions while keeping you confident under pressure. Communication cadence and decision style should be aligned early.

BuyerHQ profiles are structured to make this comparison faster, with verified credentials, review context, and fee framing in one place.',
    'Buying Strategy',
    'BuyerHQ Editorial',
    now() - interval '6 days',
    true,
    null
  ),
  (
    'What Off-Market Access Really Means in 2026',
    'what-off-market-access-means-2026',
    'Off-market is not magic stock. It is access quality plus fast decision execution. Here is what buyers should expect.',
    '# What Off-Market Access Really Means in 2026

Off-market opportunities are rarely "hidden bargains". More often, they are transactions where the selling agent is testing buyer depth discreetly.

## Key takeaway

Access matters, but execution matters more. Buyers who can review quickly, assess risk correctly, and commit with confidence usually win.

## Questions to ask your advisor

- How is stock sourced?
- How do you validate fair value without open-market competition?
- What is your decision framework when listings are imperfect?

Strong advisors combine network access with disciplined acquisition criteria.',
    'Market Trends',
    'BuyerHQ Editorial',
    now() - interval '4 days',
    true,
    null
  ),
  (
    'Case Study: From Shortlist to Exchange in 21 Days',
    'case-study-shortlist-to-exchange-21-days',
    'A Sydney buyer needed speed without sacrificing diligence. Here is how the acquisition was structured.',
    '# Case Study: From Shortlist to Exchange in 21 Days

A relocating family needed to secure in the inner west before school intake. Timeline pressure was high.

## What worked

1. A focused brief reduced review noise.
2. Risk-first due diligence removed borderline stock quickly.
3. A pre-committed negotiation plan prevented emotional bidding.

## Outcome

The buyer secured within budget, with no major contract surprises, and enough lead time for settlement logistics.

Speed does not have to mean compromise when process discipline is in place.',
    'Case Study',
    'BuyerHQ Editorial',
    now() - interval '2 days',
    true,
    null
  )
on conflict (slug) do update set
  title = excluded.title,
  excerpt = excluded.excerpt,
  content = excluded.content,
  category = excluded.category,
  author = excluded.author,
  published_at = excluded.published_at,
  is_published = excluded.is_published,
  cover_image_url = excluded.cover_image_url;

update public.agents a
set review_count = r.cnt,
    avg_rating = r.avg_rating
from (
  select agent_id, count(*)::int as cnt, round(avg(rating)::numeric, 1) as avg_rating
  from public.reviews
  where is_approved = true
  group by agent_id
) r
where a.id = r.agent_id;

select 'BuyerHQ seed data complete' as status;
