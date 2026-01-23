import { useCallback, useState } from 'react';
import { useAccount } from '@starknet-react/core';
import { OPTIMISTIC_ORACLE_ADDRESS, OPTIMISTIC_ORACLE_MANAGED_ADDRESS } from '../constants';
import { OracleType } from '@/components/QueryDetailPanel';
import { CallData, cairo } from 'starknet';

interface ProposePriceParams {
  oracleType: OracleType;
  requestId: string; // The unique request identifier
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

      // Build the i256 struct for proposedPrice
      // signal: 0 = positive, 1 = negative
      // value: u256 with low/high
      const i256Value = {
        signal: 0, // 0 = positive
        value: cairo.uint256(params.proposedPrice),
      };

      // Call propose_price function with requestId and proposedPrice
      // Pass requestId exactly as received from the event (already a felt252 hex)
      console.log('propose_price params:', {
        requestId: params.requestId,
        proposedPrice: params.proposedPrice.toString(),
        i256Value,
      });
      
      const calldata = CallData.compile({
        requestId: params.requestId,
        proposedPrice: i256Value,
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
