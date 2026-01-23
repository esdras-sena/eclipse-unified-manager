import { useCallback, useState } from 'react';
import { useAccount } from '@starknet-react/core';
import { OPTIMISTIC_ORACLE_ADDRESS, OPTIMISTIC_ORACLE_MANAGED_ADDRESS } from '../constants';
import { OracleType } from '@/components/QueryDetailPanel';

interface ProposePriceParams {
  oracleType: OracleType;
  requester: string; // ContractAddress
  identifier: string; // felt252 hex (identifierRaw)
  timestamp: number; // u64
  ancillaryDataString: string; // The decoded string to convert to hex
  proposedPrice: bigint; // i256 value
}

// Convert a UTF-8 string to ByteArray calldata format
// ByteArray = { data: Array<bytes31>, pending_word: felt252, pending_word_len: u32 }
// Calldata format: [data_length, ...chunks, pending_word, pending_word_len]
function serializeStringToByteArray(str: string): string[] {
  const result: string[] = [];
  const bytes: number[] = [];
  
  // Convert string to UTF-8 bytes
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code < 0x80) {
      bytes.push(code);
    } else if (code < 0x800) {
      bytes.push(0xc0 | (code >> 6));
      bytes.push(0x80 | (code & 0x3f));
    } else {
      bytes.push(0xe0 | (code >> 12));
      bytes.push(0x80 | ((code >> 6) & 0x3f));
      bytes.push(0x80 | (code & 0x3f));
    }
  }
  
  // Split into 31-byte chunks
  const chunkSize = 31;
  const fullChunks: string[] = [];
  let i = 0;
  
  while (i + chunkSize <= bytes.length) {
    let hex = '0x';
    for (let j = 0; j < chunkSize; j++) {
      hex += bytes[i + j].toString(16).padStart(2, '0');
    }
    fullChunks.push(hex);
    i += chunkSize;
  }
  
  // Remaining bytes become pending_word
  let pendingWord = '0x0';
  const pendingLen = bytes.length - i;
  
  if (pendingLen > 0) {
    pendingWord = '0x';
    for (let j = i; j < bytes.length; j++) {
      pendingWord += bytes[j].toString(16).padStart(2, '0');
    }
  }
  
  // Build calldata: [data_length, ...chunks, pending_word, pending_word_len]
  result.push(String(fullChunks.length));
  result.push(...fullChunks);
  result.push(pendingWord);
  result.push(String(pendingLen));
  
  return result;
}

// Serialize i256 for Starknet calldata
// Format: [signal, low, high] where signal is 0 for positive, 1 for negative
function serializeI256(value: bigint): string[] {
  const signal = value >= 0n ? 0 : 1;
  const magnitude = value >= 0n ? value : -value;
  const low = magnitude & ((1n << 128n) - 1n);
  const high = magnitude >> 128n;
  
  return [
    String(signal),
    low.toString(),
    high.toString(),
  ];
}

export function useProposePrice() {
  const { account, address } = useAccount();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Get contract address based on oracle type
  const getContractAddress = (oracleType: OracleType): string => {
    switch (oracleType) {
      case 'optimistic-oracle':
        return OPTIMISTIC_ORACLE_ADDRESS;
      case 'optimistic-oracle-managed':
        return OPTIMISTIC_ORACLE_MANAGED_ADDRESS;
      default:
        throw new Error(`Unsupported oracle type for propose: ${oracleType}`);
    }
  };

  const proposePrice = useCallback(async (params: ProposePriceParams): Promise<string | null> => {
    if (!account) {
      setError(new Error('Wallet not connected'));
      return null;
    }

    setIsPending(true);
    setError(null);

    try {
      const contractAddress = getContractAddress(params.oracleType);

      // Build calldata for propose_price(requester, identifier, timestamp, ancillaryData, proposedPrice)
      // Parameters:
      // - requester: ContractAddress (felt252)
      // - identifier: felt252
      // - timestamp: u64
      // - ancillaryData: ByteArray [data_len, ...chunks, pending_word, pending_word_len]
      // - proposedPrice: i256 [signal, low, high]
      
      // Serialize ancillaryData string to ByteArray calldata
      const ancillaryDataCalldata = serializeStringToByteArray(params.ancillaryDataString);
      
      const calldata: string[] = [
        params.requester,           // requester: ContractAddress
        params.identifier,          // identifier: felt252
        String(params.timestamp),   // timestamp: u64
        ...ancillaryDataCalldata,   // ancillaryData: ByteArray
        ...serializeI256(params.proposedPrice),      // proposedPrice: i256
      ];

      console.log('=== propose_price calldata ===');
      console.log('requester:', params.requester);
      console.log('identifier:', params.identifier);
      console.log('timestamp:', params.timestamp);
      console.log('ancillaryDataString:', params.ancillaryDataString);
      console.log('ancillaryDataCalldata:', ancillaryDataCalldata);
      console.log('proposedPrice:', params.proposedPrice.toString());
      console.log('serialized calldata:', calldata);

      const result = await account.execute({
        contractAddress,
        entrypoint: 'propose_price',
        calldata,
      });

      console.log('Propose price transaction submitted:', result.transaction_hash);
      
      // Wait for transaction to be accepted
      await account.waitForTransaction(result.transaction_hash);
      
      setIsPending(false);
      return result.transaction_hash;
    } catch (err) {
      console.error('Propose price error:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsPending(false);
      return null;
    }
  }, [account]);

  return {
    proposePrice,
    isPending,
    error,
    isConnected: !!address,
  };
}
