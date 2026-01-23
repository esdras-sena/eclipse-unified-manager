import { useCallback, useState } from 'react';
import { useAccount } from '@starknet-react/core';
import { byteArray, CallData } from 'starknet';
import { OPTIMISTIC_ORACLE_ADDRESS, OPTIMISTIC_ORACLE_MANAGED_ADDRESS } from '../constants';
import { OracleType } from '@/components/QueryDetailPanel';

interface ProposePriceParams {
  oracleType: OracleType;
  requester: string; // ContractAddress
  identifier: string; // felt252 hex (identifierRaw)
  timestamp: number; // u64
  ancillaryDataString: string; // The decoded string to convert to ByteArray
  proposedPrice: bigint; // i256 value
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
      // Use starknet.js byteArray.byteArrayFromString() and CallData.compile() for proper encoding
      
      // Create ByteArray from string using starknet.js
      const ancillaryDataByteArray = byteArray.byteArrayFromString(params.ancillaryDataString);
      
      // Compile ByteArray to calldata format using starknet.js CallData.compile
      const ancillaryDataCalldata = CallData.compile([ancillaryDataByteArray]);
      
      // Build full calldata
      const calldata: string[] = [
        params.requester,           // requester: ContractAddress
        params.identifier,          // identifier: felt252
        String(params.timestamp),   // timestamp: u64
        ...ancillaryDataCalldata,   // ancillaryData: ByteArray (properly compiled)
        ...serializeI256(params.proposedPrice),      // proposedPrice: i256
      ];

      console.log('=== propose_price calldata ===');
      console.log('requester:', params.requester);
      console.log('identifier:', params.identifier);
      console.log('timestamp:', params.timestamp);
      console.log('ancillaryDataString:', params.ancillaryDataString);
      console.log('ancillaryDataByteArray:', ancillaryDataByteArray);
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
