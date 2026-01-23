import { OracleType } from "@/components/QueryDetailPanel";

// Base request interface for OO and OO Managed
export interface OracleRequest {
  txHash: string;
  requester: string;
  identifier: string;
  timestamp: number;
  ancillaryData: string;
  currency: string;
  reward: bigint;
  finalFee: bigint;
}

// Proposed price data
export interface ProposedPrice {
  txHash: string;
  requester: string;
  proposer: string;
  identifier: string;
  timestamp: number;
  ancillaryData: string;
  proposedPrice: bigint;
  expirationTimestamp: number;
  currency: string;
}

// Disputed price data
export interface DisputedPrice {
  txHash: string;
  requester: string;
  proposer: string;
  disputer: string;
  identifier: string;
  timestamp: number;
  ancillaryData: string;
  proposedPrice: bigint;
}

// Settled request data
export interface SettledRequest {
  txHash: string;
  requester: string;
  proposer: string;
  disputer: string;
  identifier: string;
  timestamp: number;
  ancillaryData: string;
  price: bigint;
  payout: bigint;
}

// Assertion made data (for OO Asserter)
export interface AssertionMade {
  txHash: string;
  assertionId: string;
  domainId: string;
  claim: string;
  asserter: string;
  callbackRecipient: string;
  escalationManager: string;
  caller: string;
  expirationTimestamp: number;
  currency: string;
  bond: bigint;
  identifier: string;
}

// Assertion disputed data
export interface AssertionDisputed {
  txHash: string;
  assertionId: string;
  caller: string;
  disputer: string;
  requestId: string;
}

// Assertion settled data
export interface AssertionSettled {
  txHash: string;
  assertionId: string;
  bondRecipient: string;
  disputed: boolean;
  settlementResolution: boolean;
  settleCaller: string;
}

// Raw ByteArray structure from Starknet events for contract calls
export interface RawByteArray {
  data: string[]; // Array of bytes31 felts
  pending_word: string; // Last incomplete word
  pending_word_len: number; // Length of pending word in bytes
}

// Contract state enum values from get_state
export type ContractState = 'Requested' | 'Proposed' | 'Expired' | 'Disputed' | 'Resolved' | 'Settled';

// Combined query interface for UI
export interface CombinedQuery {
  id: string;
  title: string;
  subtitle: string;
  proposal: string;
  bond: string;
  bondRaw?: bigint; // Raw bond value for contract calls
  finalFee?: bigint; // Final fee for contract calls
  bondToken?: string;
  status: "active" | "ended" | "disputed";
  contractState?: ContractState; // Actual state from get_state contract call
  timeLeft?: string;
  transactionHash: string;
  eventIndex: string;
  description?: string;
  eventBased?: boolean;
  oracleType: OracleType;
  oracleAddress?: string;
  reward?: string;
  // Request-type fields
  requestId?: string; // The unique request identifier from the contract
  identifier?: string;
  identifierRaw?: string; // Raw felt252 hex for contract calls
  requester?: string;
  requesterTxHash?: string;
  proposer?: string;
  proposerTxHash?: string;
  timestamp?: number; // Unix timestamp for contract calls
  ancillaryDataString?: string; // Exact decoded ancillaryData string (source of truth for contract calls)
  ancillaryDataRaw?: RawByteArray; // Raw ByteArray for contract calls
  // Asserter-type fields
  asserter?: string;
  asserterTxHash?: string;
  caller?: string;
  escalationManager?: string;
  callbackRecipient?: string;
  // Timestamp data
  requestedTime?: string;
  requestedTimeUnix?: string;
  proposedTime?: string;
  proposedTimeUnix?: string;
  settledTime?: string;
  settledTimeUnix?: string;
  result?: string;
  currency?: string;
}
