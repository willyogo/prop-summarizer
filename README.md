# Nouns DAO Proposal Summarizer

An application that provides AI-generated summaries for Nouns DAO governance proposals. Just visit `/?id=<proposalId>` to get an instant summary of any proposal. The app automatically caches summaries in Supabase for quick access in the future.

## Features

- Instant AI summaries of Nouns DAO proposals via URL parameter
- Automatic caching to Supabase database
- Ethereum blockchain integration
- Clean, responsive UI with Nouns-inspired design

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Express.js
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI GPT-4o-mini
- **Blockchain**: Ethers.js for Ethereum interaction

## Getting Started

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Copy `.env.example` to `.env` and fill in your API keys:
     - `OPENAI_API_KEY`: Your OpenAI API key
     - `ALCHEMY_RPC_URL`: Ethereum RPC URL from Alchemy
     - `SUPABASE_URL`: Your Supabase project URL
     - `SUPABASE_SERVICE_ROLE`: Your Supabase service role key

4. Set up Supabase:
   - Click "Connect to Supabase" to set up your Supabase project
   - Run the migration in `supabase/migrations/create_proposal_summaries_table.sql`

5. Run the development server:
   ```bash
   npm run dev
   ```

## Usage

Visit `http://localhost:5173/?id=<proposalId>` to get a summary of a Nouns DAO proposal. For example:
- `http://localhost:5173/?id=101` for Proposal #101
- `http://localhost:5173/?id=242` for Proposal #242

The first time a proposal is requested, the app will:
1. Fetch the proposal data from the Nouns DAO contract
2. Generate an AI summary
3. Store both the full description and summary in Supabase
4. Return the summary to the user

Subsequent requests for the same proposal will serve the cached summary from Supabase.

## Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## License

MIT