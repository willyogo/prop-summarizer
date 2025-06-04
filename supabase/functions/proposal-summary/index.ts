import { createClient } from "npm:@supabase/supabase-js@2.39.0";
import OpenAI from "npm:openai@4.20.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const SYSTEM_PROMPT = `You are "Nouns Proposal Summarizer," a neutral analyst who writes concise, reader‑friendly briefs for busy Nouners. Every summary must be easy to skim yet deep enough for an informed vote.`;

const USER_PROMPT = `Create a **Markdown** summary with *exactly* the following structure:

1. **TL;DR 📌** – A single sentence (≤ 40 words) capturing the essence.

2. **What It Does** – 3‑5 bullet points explaining the core deliverables or actions.

3. **Why It Matters** – 2‑4 bullets on impact: proliferation, ROI potential, community benefit, or treasury considerations.

4. **Risks / Open Questions ⚠️** – Up to 3 concise bullets on execution risks, dependencies, or unclear details.

5. **Timeline & Milestones** – Bullet list of any stated dates, phases, or checkpoints (omit if none).

6. **Bottom Line** – One sentence that a voter could quote to justify a *yes*, *no*, or *abstain* stance (stay neutral; do **not** recommend).

Style rules:
- Plain English; no DAO jargon or smart‑contract code unless essential.
- Keep each bullet ≤ 25 words.
- Use bold for section headers only; avoid excessive formatting.
- Never invent facts. If data is missing, omit that bullet.
- Stay objective; do not inject personal opinion.`;

// Initialize OpenAI client once
const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY")
});

// Validate required environment variables
const requiredEnvVars = {
  OPENAI_API_KEY: Deno.env.get("OPENAI_API_KEY"),
  SUPABASE_URL: Deno.env.get("SUPABASE_URL"),
  SUPABASE_ANON_KEY: Deno.env.get("SUPABASE_ANON_KEY"),
};

// Check for missing environment variables
const missingEnvVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(", ")}`);
}

async function fetchProposal(id: number) {
  console.log(`[Subgraph] Fetching proposal #${id}`);
  
  const response = await fetch('https://www.nouns.camp/subgraphs/nouns', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `query ProposalDescription($id: ID!) {
        proposal(id: $id) {
          description
        }
      }`,
      variables: { id: id.toString() }
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  
  if (!data.data?.proposal) {
    throw new Error(`Proposal #${id} does not exist`);
  }

  return { 
    id, 
    description: data.data.proposal.description 
  };
}

async function summarize(text: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `${USER_PROMPT}\n\nProposal text:\n${text}` }
      ]
    });
    
    return completion.choices[0].message.content?.trim() || "No summary generated";
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to generate summary: " + (error instanceof Error ? error.message : "Unknown error"));
  }
}

Deno.serve(async (req) => {
  // Early validation of environment variables
  if (missingEnvVars.length > 0) {
    return new Response(
      JSON.stringify({ 
        error: `Server configuration error: Missing ${missingEnvVars.join(", ")}` 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const id = parseInt(url.pathname.split("/").pop() || "", 10);

    if (isNaN(id) || id < 0) {
      return new Response(
        JSON.stringify({ error: "Invalid proposal ID" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const supabase = createClient(
      requiredEnvVars.SUPABASE_URL,
      requiredEnvVars.SUPABASE_ANON_KEY,
      { auth: { persistSession: false } }
    );

    // Check cache
    const { data: cached, error: cacheError } = await supabase
      .from("proposal_summaries")
      .select("summary, description")
      .eq("id", id)
      .single();

    if (cached) {
      return new Response(
        JSON.stringify({ id, ...cached, cached: true }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Fetch and summarize
    const proposal = await fetchProposal(id);
    const summary = await summarize(proposal.description);

    // Store in cache
    await supabase
      .from("proposal_summaries")
      .insert({ id, description: proposal.description, summary });

    return new Response(
      JSON.stringify({ 
        id, 
        description: proposal.description, 
        summary, 
        cached: false 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});