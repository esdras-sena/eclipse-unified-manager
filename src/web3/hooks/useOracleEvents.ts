import { useState, useEffect, useCallback } from 'react';
import { RpcProvider, events, CallData, createAbiParser, Abi, Contract, byteArray as starknetByteArray } from 'starknet';
import { getNodeUrl } from '../utils/network';
import { 
  OPTIMISTIC_ORACLE_ADDRESS, 
  OPTIMISTIC_ORACLE_MANAGED_ADDRESS, 
  OPTIMISTIC_ORACLE_ASSERTER_ADDRESS,
  OPTIMISTIC_ORACLE_DEPLOY_BLOCK,
  OPTIMISTIC_ORACLE_MANAGED_DEPLOY_BLOCK,
  OPTIMISTIC_ORACLE_ASSERTER_DEPLOY_BLOCK,
} from '../constants';
import { CombinedQuery } from '../types';
import { 
  formatTimestamp, 
  calculateTimeLeft, 
  parseByteArray, 
  formatBigInt,
  parseU256,
  parseI256,
  felt252ToString,
  normalizeAddress,
  normalizeFelt
} from '../utils/helpers';

// Import local ABIs
import ooAbi from '../abis/ooAbi.json';
import ooManagedAbi from '../abis/ooManagedAbi.json';
import ooAsserterAbi from '../abis/ooAsserterAbi.json';

function getProvider() {
  return new RpcProvider({ nodeUrl: getNodeUrl() });
}

// Fetch request details from contract to get bond from RequestSettings
async function fetchRequestFromContract(
  contractAddr: string,
  abi: Abi,
  requester: string,
  identifier: string,
  timestamp: number,
  ancillaryData: string
): Promise<{ bond: bigint; eventBased: boolean } | null> {
  try {
    const provider = getProvider();
    const contract = new Contract({
      abi: abi as any,
      address: contractAddr,
      providerOrAccount: provider,
    });
    
    // Build ByteArray for ancillaryData
    const ancillaryDataByteArray = starknetByteArray.byteArrayFromString(ancillaryData);
    
    const result = await contract.get_request(
      requester,
      identifier,
      timestamp,
      ancillaryDataByteArray
    );
    
    // Result is a Request struct with requestSettings inside
    if (result && result.requestSettings) {
      const bond = parseU256(result.requestSettings.bond);
      const eventBased = result.requestSettings.eventBased === true || 
                         result.requestSettings.eventBased === 1n ||
                         result.requestSettings.eventBased === 1;
      return { bond, eventBased };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching request from contract:', error);
    return null;
  }
}

// Event names from ABIs
const OO_EVENTS = {
  RequestPrice: 'eclipse_oracle::eclipse_oracle::EclipseOracle::RequestPrice',
  ProposePrice: 'eclipse_oracle::eclipse_oracle::EclipseOracle::ProposePrice',
  DisputePrice: 'eclipse_oracle::eclipse_oracle::EclipseOracle::DisputePrice',
  Settle: 'eclipse_oracle::eclipse_oracle::EclipseOracle::Settle',
};

const MANAGED_EVENTS = {
  RequestPrice: 'eclipse_oracle::eclipse_managed_oracle::EclipseManagedOracle::RequestPrice',
  ProposePrice: 'eclipse_oracle::eclipse_managed_oracle::EclipseManagedOracle::ProposePrice',
  DisputePrice: 'eclipse_oracle::eclipse_managed_oracle::EclipseManagedOracle::DisputePrice',
  Settle: 'eclipse_oracle::eclipse_managed_oracle::EclipseManagedOracle::Settle',
};

const ASSERTER_EVENTS = {
  AssertionMade: 'eclipse_oracle::eclipse_oracle_asserter::EclipseOracleAsserter::AssertionMade',
  AssertionDisputed: 'eclipse_oracle::eclipse_oracle_asserter::EclipseOracleAsserter::AssertionDisputed',
  AssertionSettled: 'eclipse_oracle::eclipse_oracle_asserter::EclipseOracleAsserter::AssertionSettled',
};

// Fetch raw events from a contract
async function fetchContractEvents(
  contractAddr: string,
  fromBlock: number
): Promise<{ events: any[]; txHashes: string[] }> {
  const provider = getProvider();
  const toBlock = await provider.getBlockNumber();
  
  let allEvents: any[] = [];
  let continuationToken: string | undefined = undefined;
  
  while (true) {
    const eventsList = await provider.getEvents({
      address: contractAddr,
      from_block: { block_number: fromBlock },
      to_block: { block_number: toBlock },
      chunk_size: 1000,
      continuation_token: continuationToken,
    });
    
    allEvents = allEvents.concat(eventsList.events);
    continuationToken = eventsList.continuation_token;
    
    if (!continuationToken) break;
  }
  
  const txHashes = allEvents.map(e => e.transaction_hash);
  return { events: allEvents, txHashes };
}

// Parse events using local ABI
function parseContractEvents(abi: Abi, rawEvents: any[]): any[] {
  if (rawEvents.length === 0) return [];
  
  const abiEvents = events.getAbiEvents(abi);
  const abiStructs = CallData.getAbiStruct(abi);
  const abiEnums = CallData.getAbiEnum(abi);
  const parser = createAbiParser(abi);
  
  return events.parseEvents(rawEvents, abiEvents, abiStructs, abiEnums, parser);
}

// Generate unique request key for matching events
function getRequestKey(requester: string, identifier: string, timestamp: number | string, ancillaryData: string): string {
  return `${requester}-${identifier}-${timestamp}-${ancillaryData}`;
}

// Fetch requests from OO or OO Managed using events
async function fetchRequestsFromEvents(
  contractAddr: string,
  deployBlock: number,
  abi: Abi,
  eventConfig: typeof OO_EVENTS,
  oracleType: 'optimistic-oracle' | 'optimistic-oracle-managed'
): Promise<CombinedQuery[]> {
  try {
    // Fetch all events
    const { events: rawEvents, txHashes } = await fetchContractEvents(contractAddr, deployBlock);
    console.log(`Fetched ${rawEvents.length} raw events for ${oracleType}`);
    
    if (rawEvents.length === 0) return [];
    
    // Parse events using local ABI
    const parsedEvents = parseContractEvents(abi, rawEvents);
    console.log(`Parsed ${parsedEvents.length} events for ${oracleType}`, parsedEvents);
    
    // Group events by request
    const requestMap = new Map<string, {
      request?: any;
      propose?: any;
      dispute?: any;
      settle?: any;
      txHash: string;
      proposeTxHash?: string;
    }>();
    
    for (let i = 0; i < parsedEvents.length; i++) {
      const event = parsedEvents[i];
      const txHash = txHashes[i];
      
      // Find which event type this is
      for (const [eventType, eventName] of Object.entries(eventConfig)) {
        if (event[eventName]) {
          const data = event[eventName];
          const key = getRequestKey(
            normalizeAddress(data.requester) || '',
            normalizeFelt(data.identifier) || '',
            normalizeFelt(data.timestamp) || '',
            parseByteArray(data.ancillaryData)
          );
          
          const existing = requestMap.get(key) || { txHash };
          
          if (eventType === 'RequestPrice') {
            existing.request = data;
            existing.txHash = txHash;
          } else if (eventType === 'ProposePrice') {
            existing.propose = data;
            existing.proposeTxHash = txHash;
          } else if (eventType === 'DisputePrice') {
            existing.dispute = data;
          } else if (eventType === 'Settle') {
            existing.settle = data;
          }
          
          requestMap.set(key, existing);
          break;
        }
      }
    }
    
    console.log(`Found ${requestMap.size} unique requests for ${oracleType}`);
    
    // Convert to CombinedQuery - fetch bond from contract for each request
    const queries: CombinedQuery[] = [];
    let index = 0;
    
    // Prepare all contract calls in parallel for bond fetching
    const requestEntries = Array.from(requestMap.entries()).filter(([, data]) => data.request);
    
    const bondResults = await Promise.all(
      requestEntries.map(async ([, data]) => {
        const req = data.request;
        const requester = normalizeAddress(req.requester) || '';
        const identifierRaw = normalizeFelt(req.identifier);
        const timestamp = Number(req.timestamp || 0);
        const ancillaryDataStr = parseByteArray(req.ancillaryData);
        
        const contractData = await fetchRequestFromContract(
          contractAddr,
          abi,
          requester,
          identifierRaw,
          timestamp,
          ancillaryDataStr
        );
        
        return contractData;
      })
    );
    
    for (let i = 0; i < requestEntries.length; i++) {
      const [, data] = requestEntries[i];
      const req = data.request;
      const contractData = bondResults[i];
      
      const isSettled = !!data.settle;
      const isDisputed = !!data.dispute && !isSettled;
      const isProposed = !!data.propose;
      
      const expirationTime = data.propose ? Number(data.propose.expirationTimestamp || 0) : 0;
      const now = Math.floor(Date.now() / 1000);
      const isExpired = expirationTime > 0 && expirationTime <= now;
      
      let status: "active" | "ended" | "disputed" = "active";
      if (isSettled || isExpired) {
        status = "ended";
      } else if (isDisputed) {
        status = "disputed";
      }
      
      const reward = parseU256(req.reward);
      // Bond from contract's get_request (RequestSettings.bond)
      const bond = contractData?.bond ?? BigInt(0);
      const eventBased = contractData?.eventBased ?? false;
      const proposedPrice = data.propose ? parseI256(data.propose.proposedPrice) : BigInt(0);
      const settledPrice = data.settle ? parseI256(data.settle.price) : BigInt(0);
      
      const identifierRaw = normalizeFelt(req.identifier); // Raw hex for contract calls
      const identifier = felt252ToString(req.identifier); // Decoded string for display
      const requestTimestamp = Number(req.timestamp || 0);
      const ancillaryDataStr = parseByteArray(req.ancillaryData);
      
      // Parse ancillaryData for title and description
      // Pattern: "q: [title] : [description]" or just plain text as title
      let title = ancillaryDataStr || `${identifier} @ ${requestTimestamp}`;
      let description: string | undefined = undefined;
      
      if (ancillaryDataStr) {
        // Check for pattern: "q: title : description"
        const qMatch = ancillaryDataStr.match(/^q:\s*(.+?)\s*:\s*(.+)$/s);
        if (qMatch) {
          title = qMatch[1].trim();
          description = qMatch[2].trim();
        }
      }
      
      // Format proposal value based on identifier type
      let proposalDisplay = 'Pending';
      if (isProposed) {
        if (identifier === 'YES_OR_NO_QUERY') {
          // For YES_OR_NO_QUERY: 1 = YES, 0 = NO
          proposalDisplay = proposedPrice === BigInt(1) ? 'YES' : proposedPrice === BigInt(0) ? 'NO' : formatBigInt(proposedPrice);
        } else {
          proposalDisplay = formatBigInt(proposedPrice);
        }
      }
      
      // Format result value based on identifier type
      let resultDisplay: string | undefined = undefined;
      if (isSettled) {
        if (identifier === 'YES_OR_NO_QUERY') {
          resultDisplay = settledPrice === BigInt(1) ? 'YES' : settledPrice === BigInt(0) ? 'NO' : formatBigInt(settledPrice);
        } else {
          resultDisplay = formatBigInt(settledPrice);
        }
      }
      
      queries.push({
        id: String(index + 1),
        title,
        subtitle: formatTimestamp(requestTimestamp),
        proposal: proposalDisplay,
        bond: formatBigInt(bond),
        status,
        timeLeft: expirationTime > 0 && !isSettled ? calculateTimeLeft(expirationTime) : undefined,
        transactionHash: data.txHash,
        eventIndex: String(index),
        description,
        oracleType,
        oracleAddress: contractAddr,
        reward: formatBigInt(reward),
        eventBased,
        identifier,
        identifierRaw,
        requester: normalizeAddress(req.requester),
        requesterTxHash: data.txHash,
        proposer: normalizeAddress(data.propose?.proposer),
        proposerTxHash: data.proposeTxHash,
        requestedTime: formatTimestamp(requestTimestamp),
        requestedTimeUnix: String(requestTimestamp),
        proposedTime: data.propose ? formatTimestamp(Number(data.propose.expirationTimestamp) - 7200) : undefined,
        proposedTimeUnix: data.propose ? String(Number(data.propose.expirationTimestamp) - 7200) : undefined,
        currency: normalizeAddress(req.currency),
        result: resultDisplay,
      });
      
      index++;
    }
    
    return queries;
  } catch (error) {
    console.error(`Error fetching events from ${oracleType}:`, error);
    return [];
  }
}

// Fetch assertions from OO Asserter using events
async function fetchAssertionsFromEvents(): Promise<CombinedQuery[]> {
  try {
    const deployBlock = OPTIMISTIC_ORACLE_ASSERTER_DEPLOY_BLOCK || 0;
    
    // Fetch all events
    const { events: rawEvents, txHashes } = await fetchContractEvents(
      OPTIMISTIC_ORACLE_ASSERTER_ADDRESS,
      deployBlock
    );
    console.log(`Fetched ${rawEvents.length} raw events for asserter`);
    
    if (rawEvents.length === 0) return [];
    
    // Parse events using local ABI
    const parsedEvents = parseContractEvents(ooAsserterAbi as Abi, rawEvents);
    console.log(`Parsed ${parsedEvents.length} events for asserter`, parsedEvents);
    
    // Group events by assertion_id
    const assertionMap = new Map<string, {
      made?: any;
      disputed?: any;
      settled?: any;
      txHash: string;
    }>();
    
    for (let i = 0; i < parsedEvents.length; i++) {
      const event = parsedEvents[i];
      const txHash = txHashes[i];
      
      for (const [eventType, eventName] of Object.entries(ASSERTER_EVENTS)) {
        if (event[eventName]) {
          const data = event[eventName];
          const assertionId = data.assertion_id?.toString() || '';
          
          const existing = assertionMap.get(assertionId) || { txHash };
          
          if (eventType === 'AssertionMade') {
            existing.made = data;
            existing.txHash = txHash;
          } else if (eventType === 'AssertionDisputed') {
            existing.disputed = data;
          } else if (eventType === 'AssertionSettled') {
            existing.settled = data;
          }
          
          assertionMap.set(assertionId, existing);
          break;
        }
      }
    }
    
    console.log(`Found ${assertionMap.size} unique assertions`);
    
    // Convert to CombinedQuery
    const queries: CombinedQuery[] = [];
    let index = 0;
    
    for (const [assertionId, data] of assertionMap.entries()) {
      const made = data.made;
      if (!made) continue;
      
      const isSettled = !!data.settled;
      const isDisputed = !!data.disputed && !isSettled;
      
      const expirationTime = Number(made.expiration_timestamp || 0);
      const now = Math.floor(Date.now() / 1000);
      const isExpired = expirationTime > 0 && expirationTime <= now;
      
      let status: "active" | "ended" | "disputed" = "active";
      if (isSettled || isExpired) {
        status = "ended";
      } else if (isDisputed) {
        status = "disputed";
      }
      
      const bond = parseU256(made.bond);
      const identifier = felt252ToString(made.identifier);
      const claimStr = parseByteArray(made.claim);
      const settlementResolution = data.settled?.settlement_resolution;
      
      // Parse claim for title and description
      // Pattern: "q: [title] : [description]" or just plain text as title
      let assertTitle = claimStr || `Assertion ${assertionId.slice(0, 10)}...`;
      let assertDescription: string | undefined = undefined;
      
      if (claimStr) {
        const qMatch = claimStr.match(/^q:\s*(.+?)\s*:\s*(.+)$/s);
        if (qMatch) {
          assertTitle = qMatch[1].trim();
          assertDescription = qMatch[2].trim();
        }
      }
      
      queries.push({
        id: String(index + 1),
        title: assertTitle,
        subtitle: formatTimestamp(expirationTime - 7200),
        proposal: isSettled ? (settlementResolution ? 'true' : 'false') : 'Pending',
        bond: formatBigInt(bond),
        status,
        timeLeft: expirationTime > 0 && !isSettled ? calculateTimeLeft(expirationTime) : undefined,
        transactionHash: data.txHash,
        eventIndex: String(index),
        description: assertDescription,
        oracleType: 'optimistic-oracle-asserter',
        oracleAddress: OPTIMISTIC_ORACLE_ASSERTER_ADDRESS,
        identifier,
        asserter: normalizeAddress(made.asserter),
        asserterTxHash: data.txHash,
        caller: normalizeAddress(made.caller),
        escalationManager: normalizeAddress(made.escalation_manager),
        callbackRecipient: normalizeAddress(made.callback_recipient),
        currency: normalizeAddress(made.currency),
        result: isSettled ? (settlementResolution ? 'true' : 'false') : undefined,
      });
      
      index++;
    }
    
    return queries;
  } catch (error) {
    console.error('Error fetching assertion events:', error);
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
      const ooDeployBlock = OPTIMISTIC_ORACLE_DEPLOY_BLOCK || 0;
      const ooManagedDeployBlock = OPTIMISTIC_ORACLE_MANAGED_DEPLOY_BLOCK || 0;
      
      const [ooQueries, ooManagedQueries, ooAsserterQueries] = await Promise.all([
        fetchRequestsFromEvents(
          OPTIMISTIC_ORACLE_ADDRESS, 
          ooDeployBlock, 
          ooAbi as Abi, 
          OO_EVENTS, 
          'optimistic-oracle'
        ),
        fetchRequestsFromEvents(
          OPTIMISTIC_ORACLE_MANAGED_ADDRESS, 
          ooManagedDeployBlock, 
          ooManagedAbi as Abi, 
          MANAGED_EVENTS, 
          'optimistic-oracle-managed'
        ),
        fetchAssertionsFromEvents(),
      ]);
      
      // Re-assign unique IDs
      let idCounter = 0;
      const allQueries = [...ooQueries, ...ooManagedQueries, ...ooAsserterQueries].map(q => ({
        ...q,
        id: String(++idCounter),
      }));
      
      console.log(`Fetched ${allQueries.length} total queries from events:`, {
        oo: ooQueries.length,
        ooManaged: ooManagedQueries.length,
        ooAsserter: ooAsserterQueries.length,
      });

      // Never fall back to mock/random data; if none found, show empty state.
      setQueries(allQueries);
    } catch (err) {
      console.error('Error fetching oracle events:', err);
      setQueries([]);
      setError(err as Error);
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
  
  // Verify screen only shows requests that have been proposed (proposal !== 'Pending')
  // and are not yet settled (active or disputed status)
  const verifyQueries = queries.filter(q => 
    q.proposal !== 'Pending' && (q.status === 'active' || q.status === 'disputed')
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
