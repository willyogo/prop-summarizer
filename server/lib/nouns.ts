import dotenv from "dotenv";

dotenv.config();

export async function fetchProposal(id: number) {
  console.log(`[Subgraph] Fetching proposal #${id}`);
  
  try {
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
      console.log(`[Subgraph] Proposal #${id} does not exist`);
      throw new Error(`Proposal #${id} does not exist`);
    }

    console.log(`[Subgraph] Successfully fetched proposal #${id}`);
    return { 
      id, 
      description: data.data.proposal.description 
    };
  } catch (error) {
    console.error(`[Subgraph] Error fetching proposal #${id}:`, error);
    throw error instanceof Error 
      ? error 
      : new Error(`Failed to fetch proposal #${id}`);
  }
}