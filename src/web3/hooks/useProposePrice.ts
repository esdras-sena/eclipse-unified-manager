import { useCallback, useState } from 'react';
import { useAccount } from '@starknet-react/core';
import { OPTIMISTIC_ORACLE_ADDRESS, OPTIMISTIC_ORACLE_MANAGED_ADDRESS } from '../constants';
import { OracleType } from '@/components/QueryDetailPanel';

interface ProposePriceParams {
  oracleType: OracleType;
  requestId: string; // The unique request identifier (felt252 hex)
  proposedPrice: bigint; // The value (positive for YES_OR_NO_QUERY)
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

      // Build calldata manually for propose_price(requestId: felt252, proposedPrice: i256)
      // i256 struct: { signal: u8, value: u256 { low: u128, high: u128 } }
      // Total calldata: [requestId, signal, value_low, value_high]
      
      const priceBigInt = params.proposedPrice;
      const signal = priceBigInt >= 0n ? 0 : 1;
      const magnitude = priceBigInt >= 0n ? priceBigInt : -priceBigInt;
      const low = magnitude & ((1n << 128n) - 1n);
      const high = magnitude >> 128n;

      const calldata = [
        params.requestId,           // requestId: felt252
        String(signal),             // i256.signal: u8
        low.toString(),             // i256.value.low: u128
        high.toString(),            // i256.value.high: u128
      ];

      console.log('propose_price calldata:', {
        requestId: params.requestId,
        signal,
        low: low.toString(),
        high: high.toString(),
        calldata,
      });

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
