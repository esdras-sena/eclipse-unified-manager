import { useState, useEffect, useCallback } from 'react';
import { RpcProvider, Contract, Abi } from 'starknet';
import { getNodeUrl } from '../utils/network';
import { loadAbi } from '../utils/fetchEvents';
import { 
  OPTIMISTIC_ORACLE_ADDRESS, 
  OPTIMISTIC_ORACLE_MANAGED_ADDRESS, 
  OPTIMISTIC_ORACLE_ASSERTER_ADDRESS,
} from '../constants';
import { CombinedQuery } from '../types';
import { 
  formatTimestamp, 
  calculateTimeLeft, 
  parseByteArray, 
  formatBigInt,
  parseU256,
  parseI256,
  felt252ToString
} from '../utils/helpers';

function getProvider() {
  return new RpcProvider({ nodeUrl: getNodeUrl() });
}

// Parse Request struct from contract
function parseRequestFromContract(request: any, index: number): CombinedQuery | null {
  if (!request) return null;
  
  const proposer = request.proposer?.toString() || '0x0';
  const isRequested = proposer === '0x0' || proposer === '0';
  const isSettled = request.settled;
  const disputer = request.disputer?.toString() || '0x0';
  const isDisputed = disputer !== '0x0' && disputer !== '0' && !isSettled;
  
  const expirationTime = Number(request.expirationTime || 0);
  const now = Math.floor(Date.now() / 1000);
  const isExpired = expirationTime > 0 && expirationTime <= now;
  
  let status: "active" | "ended" | "disputed" = "active";
  if (isSettled || isExpired) {
    status = "ended";
  } else if (isDisputed) {
    status = "disputed";
  }
  
  const proposedPrice = parseI256(request.proposedPrice);
  const resolvedPrice = parseI256(request.resolvedPrice);
  const reward = parseU256(request.reward);
  const bond = parseU256(request.requestSettings?.bond || 0);
  const finalFee = parseU256(request.finalFee);
  
  return {
    id: String(index + 1),
    title: `Request #${index + 1}`,
    subtitle: expirationTime > 0 ? formatTimestamp(expirationTime - 7200) : 'Pending',
    proposal: isRequested ? 'Pending' : formatBigInt(proposedPrice),
    bond: formatBigInt(bond),
    status,
    timeLeft: expirationTime > 0 ? calculateTimeLeft(expirationTime) : undefined,
    transactionHash: '0x0', // Will be populated from events if needed
    eventIndex: String(index),
    description: '',
    oracleType: 'optimistic-oracle',
    reward: formatBigInt(reward),
    eventBased: request.requestSettings?.eventBased || false,
    proposer: proposer !== '0x0' && proposer !== '0' ? proposer : undefined,
    currency: request.currency?.toString(),
    result: isSettled ? formatBigInt(resolvedPrice) : undefined,
  };
}

// Parse Assertion struct from contract
function parseAssertionFromContract(assertion: any, index: number): CombinedQuery | null {
  if (!assertion) return null;
  
  const isSettled = assertion.settled;
  const disputer = assertion.disputer?.toString() || '0x0';
  const isDisputed = disputer !== '0x0' && disputer !== '0' && !isSettled;
  
  const expirationTime = Number(assertion.expiration_time || 0);
  const assertionTime = Number(assertion.assertion_time || 0);
  const now = Math.floor(Date.now() / 1000);
  const isExpired = expirationTime > 0 && expirationTime <= now;
  
  let status: "active" | "ended" | "disputed" = "active";
  if (isSettled || isExpired) {
    status = "ended";
  } else if (isDisputed) {
    status = "disputed";
  }
  
  const bond = parseU256(assertion.bond);
  const settlementResolution = assertion.settlement_resolution;
  
  return {
    id: String(index + 1),
    title: `Assertion #${index + 1}`,
    subtitle: assertionTime > 0 ? formatTimestamp(assertionTime) : 'Unknown',
    proposal: isSettled ? (settlementResolution ? 'true' : 'false') : 'Pending',
    bond: formatBigInt(bond),
    status,
    timeLeft: expirationTime > 0 && !isSettled ? calculateTimeLeft(expirationTime) : undefined,
    transactionHash: '0x0',
    eventIndex: String(index),
    description: '',
    oracleType: 'optimistic-oracle-asserter',
    asserter: assertion.asserter?.toString(),
    caller: assertion.escalation_manager_settings?.asserting_caller?.toString(),
    escalationManager: assertion.escalation_manager_settings?.escalation_manager?.toString(),
    callbackRecipient: assertion.callback_recipient?.toString(),
    currency: assertion.currency?.toString(),
    identifier: felt252ToString(assertion.identifier),
    result: isSettled ? (settlementResolution ? 'true' : 'false') : undefined,
  };
}

// Fetch all requests using get_all_requests
async function fetchAllRequestsFromContract(
  contractAddr: string,
  oracleType: 'optimistic-oracle' | 'optimistic-oracle-managed'
): Promise<CombinedQuery[]> {
  try {
    const provider = getProvider();
    const abi = await loadAbi(contractAddr);
    const contract = new Contract({ abi, address: contractAddr, providerOrAccount: provider });
    
    // Call get_all_requests
    const result = await contract.call('get_all_requests');
    
    if (!result || !Array.isArray(result)) {
      console.log(`No requests found for ${oracleType}`);
      return [];
    }
    
    const requests = result as any[];
    const queries: CombinedQuery[] = [];
    
    for (let i = 0; i < requests.length; i++) {
      const parsed = parseRequestFromContract(requests[i], i);
      if (parsed) {
        parsed.oracleType = oracleType;
        queries.push(parsed);
      }
    }
    
    return queries;
  } catch (error) {
    console.error(`Error fetching requests from ${oracleType}:`, error);
    return [];
  }
}

// Fetch all assertions using get_all_assertion
async function fetchAllAssertionsFromContract(): Promise<CombinedQuery[]> {
  try {
    const provider = getProvider();
    const abi = await loadAbi(OPTIMISTIC_ORACLE_ASSERTER_ADDRESS);
    const contract = new Contract({ abi, address: OPTIMISTIC_ORACLE_ASSERTER_ADDRESS, providerOrAccount: provider });
    
    // Call get_all_assertion
    const result = await contract.call('get_all_assertion');
    
    if (!result || !Array.isArray(result)) {
      console.log('No assertions found');
      return [];
    }
    
    const assertions = result as any[];
    const queries: CombinedQuery[] = [];
    
    for (let i = 0; i < assertions.length; i++) {
      const parsed = parseAssertionFromContract(assertions[i], i);
      if (parsed) {
        queries.push(parsed);
      }
    }
    
    return queries;
  } catch (error) {
    console.error('Error fetching assertions:', error);
    return [];
  }
}

// Main hook to fetch all oracle data
export function useOracleEvents() {
  const [queries, setQueries] = useState<CombinedQuery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [ooQueries, ooManagedQueries, ooAsserterQueries] = await Promise.all([
        fetchAllRequestsFromContract(OPTIMISTIC_ORACLE_ADDRESS, 'optimistic-oracle'),
        fetchAllRequestsFromContract(OPTIMISTIC_ORACLE_MANAGED_ADDRESS, 'optimistic-oracle-managed'),
        fetchAllAssertionsFromContract(),
      ]);
      
      // Re-assign unique IDs
      let idCounter = 0;
      const allQueries = [...ooQueries, ...ooManagedQueries, ...ooAsserterQueries].map(q => ({
        ...q,
        id: String(++idCounter),
      }));
      
      console.log(`Fetched ${allQueries.length} total queries:`, {
        oo: ooQueries.length,
        ooManaged: ooManagedQueries.length,
        ooAsserter: ooAsserterQueries.length,
      });
      
      setQueries(allQueries);
    } catch (err) {
      console.error('Error fetching oracle data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch data'));
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  return { queries, loading, error, refetch: fetchData };
}

// Hook to fetch only verify queries (proposed but not settled)
export function useVerifyQueries() {
  const { queries, loading, error, refetch } = useOracleEvents();
  
  const verifyQueries = queries.filter(q => 
    q.status === 'active' || q.status === 'disputed'
  );
  
  return { queries: verifyQueries, loading, error, refetch };
}

// Hook to fetch only propose queries (requested but not proposed)
export function useProposeQueries() {
  const { queries, loading, error, refetch } = useOracleEvents();
  
  const proposeQueries = queries.filter(q => 
    q.proposal === 'Pending'
  );
  
  return { queries: proposeQueries, loading, error, refetch };
}

// Hook to fetch only settled queries
export function useSettledQueries() {
  const { queries, loading, error, refetch } = useOracleEvents();
  
  const settledQueries = queries.filter(q => 
    q.status === 'ended' && q.result !== undefined
  );
  
  return { queries: settledQueries, loading, error, refetch };
}
