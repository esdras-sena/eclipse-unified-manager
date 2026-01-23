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

// Combined query interface for UI
export interface CombinedQuery {
  id: string;
  title: string;
  subtitle: string;
  proposal: string;
  bond: string;
  bondToken?: string;
  status: "active" | "ended" | "disputed";
  timeLeft?: string;
  transactionHash: string;
  eventIndex: string;
  description?: string;
  eventBased?: boolean;
  oracleType: OracleType;
  oracleAddress?: string;
  reward?: string;
  // Request-type fields
  identifier?: string;
  identifierRaw?: string; // Raw felt252 hex for contract calls
  requester?: string;
  requesterTxHash?: string;
  proposer?: string;
  proposerTxHash?: string;
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
