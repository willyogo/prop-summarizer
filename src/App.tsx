import { useEffect, useState } from 'react';
import { Loading } from './components/Loading';
import { ErrorDisplay } from './components/ErrorDisplay';
import { ProposalSummary } from './components/ProposalSummary';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { type ProposalSummary as ProposalSummaryType } from './types/proposal';

export function App() {
  const [data, setData] = useState<ProposalSummaryType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProposal = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        
        if (!id) {
          setError('No proposal ID provided. Use /?id=<proposalId> to view a proposal summary.');
          setLoading(false);
          return;
        }
        
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/proposal-summary/${id}`, {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          }
        });
        
        const contentType = response.headers.get("content-type");
        
        if (!response.ok) {
          if (contentType?.includes("application/json")) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Failed to fetch proposal #${id}`);
          } else {
            throw new Error(`Failed to fetch proposal #${id}`);
          }
        }
        
        if (!contentType?.includes("application/json")) {
          throw new Error("Invalid response format from server");
        }
        
        const proposalData = await response.json();
        setData(proposalData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load proposal');
      } finally {
        setLoading(false);
      }
    };

    fetchProposal();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <Loading />
        ) : error ? (
          <ErrorDisplay message={error} />
        ) : data ? (
          <ProposalSummary data={data} />
        ) : null}
      </div>
      <Footer />
    </div>
  );
}