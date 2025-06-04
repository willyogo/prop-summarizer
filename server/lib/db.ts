import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import fetch from 'cross-fetch';

// Ensure environment variables are loaded
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// More detailed error messages for debugging
if (!supabaseUrl) {
  console.error('Missing SUPABASE_URL in environment variables');
  throw new Error("SUPABASE_URL is not set in environment variables");
}

if (!supabaseKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY in environment variables');
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set in environment variables");
}

// Create client with enhanced retry logic and better error handling
const createClientWithRetry = (maxRetries = 3, initialDelay = 1000) => {
  let attempt = 0;
  let client;
  
  const tryConnect = async () => {
    attempt++;
    console.log(`Attempting to create Supabase client (attempt ${attempt}/${maxRetries})`);
    
    try {
      // Create the client with custom fetch implementation
      client = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false
        },
        global: {
          headers: {
            'Authorization': `Bearer ${supabaseKey}`
          },
          fetch: fetch
        }
      });

      // Test the connection with better error handling
      const { data, error } = await client
        .from('proposal_summaries')
        .select('id')
        .limit(1)
        .throwOnError();

      if (error) {
        console.error('Database query error:', error);
        throw error;
      }

      console.log('Successfully established database connection');
      return client;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorDetails = {
        message: errorMessage,
        type: error.constructor.name,
        details: error.details || 'No additional details',
        stack: error instanceof Error ? error.stack : undefined
      };

      console.error(`Connection attempt ${attempt} failed:`, errorDetails);

      if (attempt >= maxRetries) {
        throw new Error(`Failed to connect after ${maxRetries} attempts: ${errorMessage}`);
      }

      // Exponential backoff with jitter
      const jitter = Math.random() * 200;
      const delay = (initialDelay * Math.pow(2, attempt - 1)) + jitter;
      await new Promise(resolve => setTimeout(resolve, delay));
      return tryConnect();
    }
  };

  return {
    connect: tryConnect,
    reset: async () => {
      attempt = 0;
      return tryConnect();
    }
  };
};

const clientManager = createClientWithRetry();
let supabase;

// Initialize connection
async function initializeConnection() {
  try {
    supabase = await clientManager.connect();
  } catch (error) {
    console.error('Failed to initialize database connection:', error);
    throw error;
  }
}

// Initialize the connection
initializeConnection();

export async function getProposalSummary(id: number) {
  try {
    if (!supabase) {
      console.log('Database connection not initialized, attempting to connect...');
      await initializeConnection();
    }

    console.log(`Fetching proposal summary for ID: ${id}`);
    
    let retries = 3;
    let lastError;
    
    while (retries > 0) {
      try {
        const { data, error } = await supabase
          .from('proposal_summaries')
          .select('*')
          .eq('id', id)
          .single()
          .throwOnError();

        if (error) {
          throw error;
        }

        console.log(`Successfully retrieved proposal summary for ID: ${id}`, {
          dataReceived: !!data
        });

        return data;
      } catch (error) {
        lastError = error;
        retries--;
        
        if (retries > 0) {
          console.log(`Retrying database query (${retries} attempts remaining)`);
          await clientManager.reset();
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    console.error('Failed to fetch proposal summary after all retries:', {
      proposalId: id,
      error: lastError instanceof Error ? lastError.message : 'Unknown error',
      fullError: lastError
    });
    
    throw lastError;
  } catch (error) {
    console.error('Error in getProposalSummary:', {
      proposalId: id,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      fullError: error
    });
    throw error;
  }
}

export { supabase }