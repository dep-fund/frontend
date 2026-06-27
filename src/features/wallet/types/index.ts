export interface WalletTransaction {
  hash: string;
  to: string;
  value: string;
  status: 'pending' | 'success' | 'failed';
  timestamp: number;
}

export interface WalletState {
  address: string | undefined;
  isConnected: boolean;
  chainId: number | undefined;
  balance: string | undefined;
}

export interface SendTransactionParams {
  to: string;
  value: string;
}

export interface Chain {
  id: number;
  name: string;
}

export type TransactionType = "BUY" | "SELL" | "DIVIDEND" | "DIVIDEND_DISTRIBUTION" | "INVESTMENT";

export interface TransactionResponse {
  id: string;
  tx_hash: string;
  type: TransactionType;
  wallet_id: string;
  project_id?: string;
  created_at: string;
}
