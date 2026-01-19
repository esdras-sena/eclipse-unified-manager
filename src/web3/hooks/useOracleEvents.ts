import { useState, useEffect, useCallback } from 'react';
import { RpcProvider, hash, num, events, CallData, Abi, createAbiParser } from 'starknet';
import { getNodeUrl } from '../utils/network';
import { 
  OPTIMISTIC_ORACLE_ADDRESS, 
  OPTIMISTIC_ORACLE_MANAGED_ADDRESS, 
  OPTIMISTIC_ORACLE_ASSERTER_ADDRESS 
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

const provider = new RpcProvider({ nodeUrl: getNodeUrl() });

interface EventData {
  requests: Map<string, any>;
  proposals: Map<string, any>;
  disputes: Map<string, any>;
  settlements: Map<string, any>;
}

interface AssertionEventData {
  assertions: Map<string, any>;
  disputes: Map<string, any>;
  settlements: Map<string, any>;
}

// Cache for ABIs
const abiCache: Map<string, Abi> = new Map();

async function loadAbi(contractAddr: string): Promise<Abi> {
  if (abiCache.has(contractAddr)) {
    return abiCache.get(contractAddr)!;
  }
  
  const klass = await provider.getClassAt(contractAddr);
  let abi = klass?.abi;
  if (typeof abi === 'string') {
    abi = JSON.parse(abi) as Abi;
  }
  if (!Array.isArray(abi)) {
    throw new Error('ABI not array for ' + contractAddr);
  }
  abiCache.set(contractAddr, abi);
  return abi;
}

async function fetchAllEvents(
  contractAddr: string, 
  fromBlock: number, 
  toBlock: number,
  eventKeys: string[][]
): Promise<{ events: any[], txHashes: string[] }> {
  let allEvents: any[] = [];
  let continuationToken: string | undefined = undefined;
  
  do {
    const eventsList = await provider.getEvents({
      address: contractAddr,
      from_block: { block_number: fromBlock },
      to_block: { block_number: toBlock },
      keys: eventKeys,
      chunk_size: 1000,
      continuation_token: continuationToken,
    });
    continuationToken = eventsList.continuation_token;
    allEvents = allEvents.concat(eventsList.events);
  } while (continuationToken);
  
  const txHashes = allEvents.map(e => e.transaction_hash);
  return { events: allEvents, txHashes };
}

// Generate unique key for request/assertion
function generateRequestKey(requester: string, identifier: string, timestamp: number | string, ancillaryData: string): string {
  return `${requester}-${identifier}-${timestamp}-${ancillaryData.slice(0, 20)}`;
}

function generateAssertionKey(assertionId: string): string {
  return assertionId;
}

// Fetch OO and OO Managed events
export async function fetchOptimisticOracleEvents(
  contractAddr: string,
  oracleType: 'optimistic-oracle' | 'optimistic-oracle-managed'
): Promise<CombinedQuery[]> {
  try {
    const latestBlock = await provider.getBlockNumber();
    const fromBlock = Math.max(0, latestBlock - 100000); // Last ~100k blocks
    
    const abi = await loadAbi(contractAddr);
    const abiEvents = events.getAbiEvents(abi);
    const abiStructs = CallData.getAbiStruct(abi);
    const abiEnums = CallData.getAbiEnum(abi);
    const parser = createAbiParser(abi);
    
    // Fetch all event types
    const requestKey = num.toHex(hash.starknetKeccak('RequestPrice'));
    const proposeKey = num.toHex(hash.starknetKeccak('ProposePrice'));
    const disputeKey = num.toHex(hash.starknetKeccak('DisputePrice'));
    const settleKey = num.toHex(hash.starknetKeccak('Settle'));
    
    // Fetch all events in parallel
    const [requestResult, proposeResult, disputeResult, settleResult] = await Promise.all([
      fetchAllEvents(contractAddr, fromBlock, latestBlock, [[requestKey]]),
      fetchAllEvents(contractAddr, fromBlock, latestBlock, [[proposeKey]]),
      fetchAllEvents(contractAddr, fromBlock, latestBlock, [[disputeKey]]),
      fetchAllEvents(contractAddr, fromBlock, latestBlock, [[settleKey]]),
    ]);
    
    // Parse events
    const eventData: EventData = {
      requests: new Map(),
      proposals: new Map(),
      disputes: new Map(),
      settlements: new Map(),
    };
    
    // Parse request events
    for (let i = 0; i < requestResult.events.length; i++) {
      try {
        const parsed = events.parseEvents([requestResult.events[i]], abiEvents, abiStructs, abiEnums, parser);
        if (parsed.length > 0) {
          const evt = Object.values(parsed[0])[0] as any;
          const key = generateRequestKey(
            String(evt.requester), 
            String(evt.identifier), 
            evt.timestamp,
            parseByteArray(evt.ancillaryData)
          );
          eventData.requests.set(key, {
            ...evt,
            txHash: requestResult.txHashes[i],
            eventIndex: i.toString(),
          });
        }
      } catch (e) {
        console.warn('Failed to parse request event:', e);
      }
    }
    
    // Parse proposal events
    for (let i = 0; i < proposeResult.events.length; i++) {
      try {
        const parsed = events.parseEvents([proposeResult.events[i]], abiEvents, abiStructs, abiEnums, parser);
        if (parsed.length > 0) {
          const evt = Object.values(parsed[0])[0] as any;
          const key = generateRequestKey(
            String(evt.requester), 
            String(evt.identifier), 
            evt.timestamp,
            parseByteArray(evt.ancillaryData)
          );
          eventData.proposals.set(key, {
            ...evt,
            txHash: proposeResult.txHashes[i],
            eventIndex: i.toString(),
          });
        }
      } catch (e) {
        console.warn('Failed to parse proposal event:', e);
      }
    }
    
    // Parse dispute events
    for (let i = 0; i < disputeResult.events.length; i++) {
      try {
        const parsed = events.parseEvents([disputeResult.events[i]], abiEvents, abiStructs, abiEnums, parser);
        if (parsed.length > 0) {
          const evt = Object.values(parsed[0])[0] as any;
          const key = generateRequestKey(
            String(evt.requester), 
            String(evt.identifier), 
            evt.timestamp,
            parseByteArray(evt.ancillaryData)
          );
          eventData.disputes.set(key, {
            ...evt,
            txHash: disputeResult.txHashes[i],
            eventIndex: i.toString(),
          });
        }
      } catch (e) {
        console.warn('Failed to parse dispute event:', e);
      }
    }
    
    // Parse settlement events
    for (let i = 0; i < settleResult.events.length; i++) {
      try {
        const parsed = events.parseEvents([settleResult.events[i]], abiEvents, abiStructs, abiEnums, parser);
        if (parsed.length > 0) {
          const evt = Object.values(parsed[0])[0] as any;
          const key = generateRequestKey(
            String(evt.requester), 
            String(evt.identifier), 
            evt.timestamp,
            parseByteArray(evt.ancillaryData)
          );
          eventData.settlements.set(key, {
            ...evt,
            txHash: settleResult.txHashes[i],
            eventIndex: i.toString(),
          });
        }
      } catch (e) {
        console.warn('Failed to parse settlement event:', e);
      }
    }
    
    // Combine into queries
    const queries: CombinedQuery[] = [];
    let idCounter = 0;
    
    // Process all requests
    for (const [key, request] of eventData.requests) {
      const proposal = eventData.proposals.get(key);
      const dispute = eventData.disputes.get(key);
      const settlement = eventData.settlements.get(key);
      
      const now = Math.floor(Date.now() / 1000);
      let status: "active" | "ended" | "disputed" = "active";
      
      if (settlement) {
        status = "ended";
      } else if (dispute) {
        status = "disputed";
      } else if (proposal && proposal.expirationTimestamp && Number(proposal.expirationTimestamp) <= now) {
        status = "ended";
      }
      
      const timestamp = Number(request.timestamp);
      const ancillaryData = parseByteArray(request.ancillaryData);
      const identifier = felt252ToString(request.identifier);
      
      const query: CombinedQuery = {
        id: String(++idCounter),
        title: ancillaryData.length > 100 ? ancillaryData.slice(0, 100) + '...' : ancillaryData || identifier,
        subtitle: formatTimestamp(timestamp),
        proposal: proposal ? formatBigInt(parseI256(proposal.proposedPrice)) : 'Pending',
        bond: proposal ? formatBigInt(parseU256(request.finalFee)) : '0',
        status,
        transactionHash: request.txHash,
        eventIndex: request.eventIndex,
        description: ancillaryData,
        oracleType,
        reward: formatBigInt(parseU256(request.reward)),
        identifier,
        requester: String(request.requester),
        requesterTxHash: request.txHash,
        proposer: proposal ? String(proposal.proposer) : undefined,
        proposerTxHash: proposal?.txHash,
        currency: String(request.currency),
        requestedTime: formatTimestamp(timestamp),
        requestedTimeUnix: String(timestamp),
      };
      
      if (proposal) {
        query.proposedTime = formatTimestamp(Number(proposal.expirationTimestamp) - 7200); // Assuming 2h liveness
        query.proposedTimeUnix = String(Number(proposal.expirationTimestamp) - 7200);
        query.timeLeft = calculateTimeLeft(Number(proposal.expirationTimestamp));
      }
      
      if (settlement) {
        query.settledTime = formatTimestamp(now); // We don't have exact settle time from event
        query.result = formatBigInt(parseI256(settlement.price));
      }
      
      queries.push(query);
    }
    
    return queries;
  } catch (error) {
    console.error('Error fetching OO events:', error);
    return [];
  }
}

// Fetch OO Asserter events
export async function fetchOptimisticOracleAsserterEvents(): Promise<CombinedQuery[]> {
  try {
    const latestBlock = await provider.getBlockNumber();
    const fromBlock = Math.max(0, latestBlock - 100000);
    
    const abi = await loadAbi(OPTIMISTIC_ORACLE_ASSERTER_ADDRESS);
    const abiEvents = events.getAbiEvents(abi);
    const abiStructs = CallData.getAbiStruct(abi);
    const abiEnums = CallData.getAbiEnum(abi);
    const parser = createAbiParser(abi);
    
    // Fetch all event types
    const assertionMadeKey = num.toHex(hash.starknetKeccak('AssertionMade'));
    const assertionDisputedKey = num.toHex(hash.starknetKeccak('AssertionDisputed'));
    const assertionSettledKey = num.toHex(hash.starknetKeccak('AssertionSettled'));
    
    const [madeResult, disputedResult, settledResult] = await Promise.all([
      fetchAllEvents(OPTIMISTIC_ORACLE_ASSERTER_ADDRESS, fromBlock, latestBlock, [[assertionMadeKey]]),
      fetchAllEvents(OPTIMISTIC_ORACLE_ASSERTER_ADDRESS, fromBlock, latestBlock, [[assertionDisputedKey]]),
      fetchAllEvents(OPTIMISTIC_ORACLE_ASSERTER_ADDRESS, fromBlock, latestBlock, [[assertionSettledKey]]),
    ]);
    
    const eventData: AssertionEventData = {
      assertions: new Map(),
      disputes: new Map(),
      settlements: new Map(),
    };
    
    // Parse assertion made events
    for (let i = 0; i < madeResult.events.length; i++) {
      try {
        const parsed = events.parseEvents([madeResult.events[i]], abiEvents, abiStructs, abiEnums, parser);
        if (parsed.length > 0) {
          const evt = Object.values(parsed[0])[0] as any;
          const key = generateAssertionKey(String(evt.assertion_id));
          eventData.assertions.set(key, {
            ...evt,
            txHash: madeResult.txHashes[i],
            eventIndex: i.toString(),
          });
        }
      } catch (e) {
        console.warn('Failed to parse assertion made event:', e);
      }
    }
    
    // Parse dispute events
    for (let i = 0; i < disputedResult.events.length; i++) {
      try {
        const parsed = events.parseEvents([disputedResult.events[i]], abiEvents, abiStructs, abiEnums, parser);
        if (parsed.length > 0) {
          const evt = Object.values(parsed[0])[0] as any;
          const key = generateAssertionKey(String(evt.assertion_id));
          eventData.disputes.set(key, {
            ...evt,
            txHash: disputedResult.txHashes[i],
            eventIndex: i.toString(),
          });
        }
      } catch (e) {
        console.warn('Failed to parse assertion dispute event:', e);
      }
    }
    
    // Parse settlement events
    for (let i = 0; i < settledResult.events.length; i++) {
      try {
        const parsed = events.parseEvents([settledResult.events[i]], abiEvents, abiStructs, abiEnums, parser);
        if (parsed.length > 0) {
          const evt = Object.values(parsed[0])[0] as any;
          const key = generateAssertionKey(String(evt.assertion_id));
          eventData.settlements.set(key, {
            ...evt,
            txHash: settledResult.txHashes[i],
            eventIndex: i.toString(),
          });
        }
      } catch (e) {
        console.warn('Failed to parse assertion settlement event:', e);
      }
    }
    
    // Combine into queries
    const queries: CombinedQuery[] = [];
    let idCounter = 0;
    
    for (const [key, assertion] of eventData.assertions) {
      const dispute = eventData.disputes.get(key);
      const settlement = eventData.settlements.get(key);
      
      const now = Math.floor(Date.now() / 1000);
      let status: "active" | "ended" | "disputed" = "active";
      
      if (settlement) {
        status = "ended";
      } else if (dispute) {
        status = "disputed";
      } else if (assertion.expiration_timestamp && Number(assertion.expiration_timestamp) <= now) {
        status = "ended";
      }
      
      const claim = parseByteArray(assertion.claim);
      const expirationTimestamp = Number(assertion.expiration_timestamp);
      
      const query: CombinedQuery = {
        id: String(++idCounter),
        title: claim.length > 100 ? claim.slice(0, 100) + '...' : claim || `Assertion ${key.slice(0, 10)}`,
        subtitle: formatTimestamp(expirationTimestamp - 7200), // Assuming 2h before expiration was assertion time
        proposal: settlement ? String(settlement.settlement_resolution) : 'Pending',
        bond: formatBigInt(parseU256(assertion.bond)),
        status,
        transactionHash: assertion.txHash,
        eventIndex: assertion.eventIndex,
        description: claim,
        oracleType: 'optimistic-oracle-asserter',
        eventBased: Boolean(assertion.callback_recipient && assertion.callback_recipient !== '0x0'),
        asserter: String(assertion.asserter),
        asserterTxHash: assertion.txHash,
        caller: String(assertion.caller),
        escalationManager: String(assertion.escalation_manager),
        callbackRecipient: String(assertion.callback_recipient),
        currency: String(assertion.currency),
        identifier: felt252ToString(assertion.identifier),
        timeLeft: calculateTimeLeft(expirationTimestamp),
      };
      
      if (settlement) {
        query.result = settlement.settlement_resolution ? 'true' : 'false';
      }
      
      queries.push(query);
    }
    
    return queries;
  } catch (error) {
    console.error('Error fetching OO Asserter events:', error);
    return [];
  }
}

// Main hook to fetch all oracle events
export function useOracleEvents() {
  const [queries, setQueries] = useState<CombinedQuery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [ooQueries, ooManagedQueries, ooAsserterQueries] = await Promise.all([
        fetchOptimisticOracleEvents(OPTIMISTIC_ORACLE_ADDRESS, 'optimistic-oracle'),
        fetchOptimisticOracleEvents(OPTIMISTIC_ORACLE_MANAGED_ADDRESS, 'optimistic-oracle-managed'),
        fetchOptimisticOracleAsserterEvents(),
      ]);
      
      // Re-assign unique IDs
      let idCounter = 0;
      const allQueries = [...ooQueries, ...ooManagedQueries, ...ooAsserterQueries].map(q => ({
        ...q,
        id: String(++idCounter),
      }));
      
      setQueries(allQueries);
    } catch (err) {
      console.error('Error fetching oracle events:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch events'));
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
