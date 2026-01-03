/*
  # GlobeTrotter Database Schema
  
  ## Overview
  Complete database schema for the GlobeTrotter travel planning platform.
  
  ## New Tables
  
  ### 1. profiles
  - `id` (uuid, references auth.users)
  - `email` (text)
  - `full_name` (text)
  - `avatar_url` (text)
  - `language_preference` (text, default 'en')
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### 2. cities
  - `id` (uuid, primary key)
  - `name` (text, not null)
  - `country` (text, not null)
  - `region` (text)
  - `description` (text)
  - `cost_index` (numeric, 1-5 scale)
  - `popularity_score` (integer, default 0)
  - `image_url` (text)
  - `latitude` (numeric)
  - `longitude` (numeric)
  - `created_at` (timestamptz)
  
  ### 3. trips
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `name` (text, not null)
  - `description` (text)
  - `start_date` (date)
  - `end_date` (date)
  - `cover_photo_url` (text)
  - `is_public` (boolean, default false)
  - `total_budget` (numeric)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### 4. stops
  - `id` (uuid, primary key)
  - `trip_id` (uuid, references trips)
  - `city_id` (uuid, references cities)
  - `start_date` (date)
  - `end_date` (date)
  - `order_index` (integer)
  - `notes` (text)
  - `accommodation_cost` (numeric, default 0)
  - `transportation_cost` (numeric, default 0)
  - `created_at` (timestamptz)
  
  ### 5. activities
  - `id` (uuid, primary key)
  - `city_id` (uuid, references cities)
  - `name` (text, not null)
  - `description` (text)
  - `category` (text, e.g., 'sightseeing', 'food', 'adventure', 'culture')
  - `estimated_cost` (numeric)
  - `duration_hours` (numeric)
  - `image_url` (text)
  - `popularity_score` (integer, default 0)
  - `created_at` (timestamptz)
  
  ### 6. trip_activities
  - `id` (uuid, primary key)
  - `stop_id` (uuid, references stops)
  - `activity_id` (uuid, references activities)
  - `scheduled_date` (date)
  - `scheduled_time` (time)
  - `custom_cost` (numeric, overrides activity cost if set)
  - `notes` (text)
  - `order_index` (integer)
  - `created_at` (timestamptz)
  
  ## Security
  - Enable RLS on all tables
  - Users can only access their own profiles
  - Users can manage their own trips and related data
  - Public trips are readable by anyone
  - Cities and activities are readable by all authenticated users
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  language_preference text DEFAULT 'en',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create cities table
CREATE TABLE IF NOT EXISTS cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  country text NOT NULL,
  region text,
  description text,
  cost_index numeric CHECK (cost_index >= 1 AND cost_index <= 5),
  popularity_score integer DEFAULT 0,
  image_url text,
  latitude numeric,
  longitude numeric,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cities are viewable by authenticated users"
  ON cities FOR SELECT
  TO authenticated
  USING (true);

-- Create trips table
CREATE TABLE IF NOT EXISTS trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  start_date date,
  end_date date,
  cover_photo_url text,
  is_public boolean DEFAULT false,
  total_budget numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trips"
  ON trips FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Public trips are viewable by everyone"
  ON trips FOR SELECT
  TO authenticated
  USING (is_public = true);

CREATE POLICY "Users can insert own trips"
  ON trips FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trips"
  ON trips FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own trips"
  ON trips FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create stops table
CREATE TABLE IF NOT EXISTS stops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  city_id uuid NOT NULL REFERENCES cities(id) ON DELETE RESTRICT,
  start_date date,
  end_date date,
  order_index integer DEFAULT 0,
  notes text,
  accommodation_cost numeric DEFAULT 0,
  transportation_cost numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE stops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view stops for their trips"
  ON stops FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = stops.trip_id
      AND (trips.user_id = auth.uid() OR trips.is_public = true)
    )
  );

CREATE POLICY "Users can insert stops for their trips"
  ON stops FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = stops.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update stops for their trips"
  ON stops FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = stops.trip_id
      AND trips.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = stops.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete stops for their trips"
  ON stops FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = stops.trip_id
      AND trips.user_id = auth.uid()
    )
  );

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id uuid NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  category text,
  estimated_cost numeric DEFAULT 0,
  duration_hours numeric DEFAULT 1,
  image_url text,
  popularity_score integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Activities are viewable by authenticated users"
  ON activities FOR SELECT
  TO authenticated
  USING (true);

-- Create trip_activities table
CREATE TABLE IF NOT EXISTS trip_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stop_id uuid NOT NULL REFERENCES stops(id) ON DELETE CASCADE,
  activity_id uuid NOT NULL REFERENCES activities(id) ON DELETE RESTRICT,
  scheduled_date date,
  scheduled_time time,
  custom_cost numeric,
  notes text,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE trip_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view trip activities for their trips"
  ON trip_activities FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stops
      JOIN trips ON trips.id = stops.trip_id
      WHERE stops.id = trip_activities.stop_id
      AND (trips.user_id = auth.uid() OR trips.is_public = true)
    )
  );

CREATE POLICY "Users can insert trip activities for their trips"
  ON trip_activities FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stops
      JOIN trips ON trips.id = stops.trip_id
      WHERE stops.id = trip_activities.stop_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update trip activities for their trips"
  ON trip_activities FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stops
      JOIN trips ON trips.id = stops.trip_id
      WHERE stops.id = trip_activities.stop_id
      AND trips.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stops
      JOIN trips ON trips.id = stops.trip_id
      WHERE stops.id = trip_activities.stop_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete trip activities for their trips"
  ON trip_activities FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stops
      JOIN trips ON trips.id = stops.trip_id
      WHERE stops.id = trip_activities.stop_id
      AND trips.user_id = auth.uid()
    )
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON trips(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_is_public ON trips(is_public);
CREATE INDEX IF NOT EXISTS idx_stops_trip_id ON stops(trip_id);
CREATE INDEX IF NOT EXISTS idx_stops_city_id ON stops(city_id);
CREATE INDEX IF NOT EXISTS idx_activities_city_id ON activities(city_id);
CREATE INDEX IF NOT EXISTS idx_trip_activities_stop_id ON trip_activities(stop_id);
CREATE INDEX IF NOT EXISTS idx_trip_activities_activity_id ON trip_activities(activity_id);