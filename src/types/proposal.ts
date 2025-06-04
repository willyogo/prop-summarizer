export interface ProposalSummary {
  id: number;
  summary: string;
  description: string;
  cached?: boolean;
}

export interface ProposalError {
  error: string;
}

export type ApiResponse = ProposalSummary | ProposalError;