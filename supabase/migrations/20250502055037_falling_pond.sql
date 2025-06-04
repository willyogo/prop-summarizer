/*
  # Add service role insert policy

  1. Changes
    - Add new RLS policy to allow service role to insert data into proposal_summaries table
  
  2. Security
    - Grant INSERT permission to service role via RLS policy
*/

-- Create policy to allow service role to insert data
CREATE POLICY "Allow service role to insert"
  ON proposal_summaries
  FOR INSERT
  TO service_role
  WITH CHECK (true);