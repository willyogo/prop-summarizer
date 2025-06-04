import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is required");
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

export async function summarize(text: string) {
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