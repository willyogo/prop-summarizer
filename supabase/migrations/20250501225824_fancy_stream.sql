/*
  # Create proposal_summaries table

  1. New Tables
    - `proposal_summaries`
      - `id` (int, primary key) - The Nouns DAO proposal ID
      - `description` (text) - The full proposal description text
      - `summary` (text) - The AI-generated summary of the proposal
      - `created_at` (timestamp) - When this record was created
  2. Security
    - Enable RLS on `proposal_summaries` table
    - Add policy for public read access to proposal summaries
*/

-- Create the proposal_summaries table
CREATE TABLE IF NOT EXISTS proposal_summaries (
  id int PRIMARY KEY,
  description text NOT NULL,
  summary text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE proposal_summaries ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access"
  ON proposal_summaries
  FOR SELECT
  TO public
  USING (true);