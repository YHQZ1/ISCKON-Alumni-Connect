-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.campaigns (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  title text NOT NULL,
  short_description text,
  body text,
  target_amount numeric DEFAULT 0,
  current_amount numeric DEFAULT 0,
  currency text DEFAULT 'INR'::text,
  status text DEFAULT 'active'::text,
  start_at timestamp with time zone DEFAULT now(),
  end_at timestamp with time zone,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT campaigns_pkey PRIMARY KEY (id),
  CONSTRAINT campaigns_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id)
);
CREATE TABLE public.donations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL,
  donor_user_id uuid,
  donor_name text,
  donor_email text,
  amount numeric NOT NULL CHECK (amount > 0::numeric),
  currency text DEFAULT 'INR'::text,
  payment_provider text,
  provider_payment_id text,
  status text DEFAULT 'pending'::text,
  receipt_url text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT donations_pkey PRIMARY KEY (id),
  CONSTRAINT donations_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id),
  CONSTRAINT donations_donor_user_id_fkey FOREIGN KEY (donor_user_id) REFERENCES public.users(id)
);
CREATE TABLE public.schools (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_id uuid,
  name text NOT NULL,
  display_name text,
  registration_number text UNIQUE,
  description text,
  street text,
  city text,
  state text,
  pincode text,
  country text DEFAULT 'India'::text,
  contact_person_name text,
  contact_email text,
  contact_phone text,
  website text,
  logo_url text,
  verified boolean DEFAULT false,
  verified_at timestamp with time zone,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT schools_pkey PRIMARY KEY (id),
  CONSTRAINT schools_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email text NOT NULL DEFAULT ''::text UNIQUE,
  password text NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  first_name text DEFAULT ''::text,
  last_name text DEFAULT ''::text,
  user_type text NOT NULL DEFAULT 'alumni'::text,
  graduation_year integer,
  institution_name text,
  location text NOT NULL DEFAULT ''::text,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);