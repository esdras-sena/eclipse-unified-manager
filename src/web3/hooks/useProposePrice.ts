import { useCallback, useState } from 'react';
import { useAccount } from '@starknet-react/core';
import { OPTIMISTIC_ORACLE_ADDRESS, OPTIMISTIC_ORACLE_MANAGED_ADDRESS } from '../constants';
import { OracleType } from '@/components/QueryDetailPanel';
import { CallData, cairo, byteArray as starknetByteArray } from 'starknet';

interface ProposePriceParams {
  oracleType: OracleType;
  requester: string;
  identifierRaw: string; // Raw felt252 hex value
  timestamp: string;
  ancillaryData: string; // Original title/ancillary data string
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

      // Build ByteArray for ancillaryData using starknet.js byteArray module
      const ancillaryDataByteArray = starknetByteArray.byteArrayFromString(params.ancillaryData);

      // Call propose_price function
      // identifier is already a raw felt252 hex value
      const calldata = CallData.compile({
        requester: params.requester,
        identifier: params.identifierRaw,
        timestamp: cairo.uint256(params.timestamp),
        ancillaryData: ancillaryDataByteArray,
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
