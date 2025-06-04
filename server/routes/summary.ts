import express from "express";
import { supabase } from "../lib/db";
import { fetchProposal } from "../lib/nouns";
import { summarize } from "../lib/summarize";

export const router = express.Router();

router.get("/summary/:id", async (req, res) => {
  const startTime = Date.now();
  console.log(`[${new Date().toISOString()}] Received request for proposal #${req.params.id}`);
  
  try {
    const id = Number(req.params.id);
    
    if (Number.isNaN(id) || id < 0) {
      console.log(`Invalid proposal ID provided: ${req.params.id}`);
      return res.status(400).json({ 
        error: "Invalid proposal ID. Please provide a valid positive number." 
      });
    }

    // 1. Check cache
    console.log(`Checking cache for proposal #${id}`);
    try {
      const { data: cached, error: cacheError } = await supabase
        .from("proposal_summaries")
        .select("summary, description")
        .eq("id", id)
        .single();

      if (cached) {
        console.log(`Cache hit for proposal #${id}`);
        return res.json({ id, ...cached, cached: true });
      }

      if (cacheError && cacheError.code !== "PGRST116") {
        console.error("Database error:", cacheError);
        throw new Error(`Database error: ${cacheError.message}`);
      }
    } catch (error) {
      console.error("Cache check failed:", error);
      // Continue execution - we'll try to fetch from the blockchain
    }

    console.log(`Cache miss for proposal #${id}, fetching from subgraph`);

    // 2. Not cached → fetch from subgraph, summarize, store
    try {
      const proposal = await fetchProposal(id);
      console.log(`Successfully fetched proposal #${id} from subgraph`);
      
      console.log(`Generating summary for proposal #${id}`);
      const summary = await summarize(proposal.description);
      console.log(`Successfully generated summary for proposal #${id}`);

      // 3. Store in cache
      console.log(`Storing summary for proposal #${id} in database`);
      try {
        const { error: insertError } = await supabase
          .from("proposal_summaries")
          .insert({ id, description: proposal.description, summary });

        if (insertError) {
          console.error("Cache storage error:", insertError);
          // Don't throw - we can still return the generated summary
        } else {
          console.log(`Successfully stored summary for proposal #${id}`);
        }
      } catch (error) {
        console.error("Failed to store in cache:", error);
        // Continue - we can still return the generated summary
      }

      return res.json({ 
        id, 
        description: proposal.description, 
        summary, 
        cached: false 
      });
    } catch (error) {
      console.error(`Error processing proposal #${id}:`, error);
      
      if (error instanceof Error) {
        if (error.message.includes('does not exist')) {
          return res.status(404).json({ 
            error: `Proposal #${id} does not exist. Please check the proposal ID and try again.` 
          });
        }
        return res.status(500).json({
          error: error.message || `Unable to process proposal #${id}. Please try again later.`
        });
      }
      
      return res.status(500).json({ 
        error: `Unable to process proposal #${id}. Please try again later.` 
      });
    }
  } catch (err) {
    console.error("Unhandled server error:", err);
    res.status(500).json({ 
      error: "An unexpected error occurred. Please try again later." 
    });
  } finally {
    console.log(`Request for proposal #${req.params.id} completed in ${Date.now() - startTime}ms`);
  }
});