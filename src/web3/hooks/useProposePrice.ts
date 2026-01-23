import { useCallback, useState } from 'react';
import { useAccount } from '@starknet-react/core';
import { byteArray, Contract } from 'starknet';
import { OPTIMISTIC_ORACLE_ADDRESS, OPTIMISTIC_ORACLE_MANAGED_ADDRESS } from '../constants';
import { OracleType } from '@/components/QueryDetailPanel';

import ooAbi from '../abis/ooAbi.json';
import ooManagedAbi from '../abis/ooManagedAbi.json';

interface ProposePriceParams {
  oracleType: OracleType;
  requester: string; // ContractAddress
  identifier: string; // felt252 hex (identifierRaw)
  timestamp: number; // u64
  ancillaryDataString: string; // The decoded string to convert to ByteArray
  proposedPrice: bigint; // i256 value
}

// Build Cairo i256 struct: { signal: u8, value: u256 { low, high } }
function toI256(value: bigint) {
  const signal = value >= 0n ? 0 : 1;
  const magnitude = value >= 0n ? value : -value;
  const low = magnitude & ((1n << 128n) - 1n);
  const high = magnitude >> 128n;

  return {
    signal,
    value: {
      low: low.toString(),
      high: high.toString(),
    },
  };
}

function getContractAbi(oracleType: OracleType) {
  switch (oracleType) {
    case 'optimistic-oracle':
      return ooAbi;
    case 'optimistic-oracle-managed':
      return ooManagedAbi;
    default:
      throw new Error(`Unsupported oracle type for propose: ${oracleType}`);
  }
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
      const abi = getContractAbi(params.oracleType) as any;

      // Create ByteArray from the RAW decoded ancillaryData string
      const ancillaryDataByteArray = byteArray.byteArrayFromString(params.ancillaryDataString);

      console.log('=== propose_price params ===');
      console.log('requester:', params.requester);
      console.log('identifier:', params.identifier);
      console.log('timestamp:', params.timestamp);
      console.log('ancillaryDataString:', params.ancillaryDataString);
      console.log('ancillaryDataByteArray:', ancillaryDataByteArray);
      console.log('proposedPrice:', params.proposedPrice.toString());

      // Build the call using ABI-aware population (avoids manual ByteArray/i256 ordering bugs)
      const writeContract = new Contract({ abi, address: contractAddress, providerOrAccount: account });
      const proposedPriceI256 = toI256(params.proposedPrice);
      const call = writeContract.populateTransaction.propose_price(
        params.requester,
        params.identifier,
        params.timestamp,
        ancillaryDataByteArray,
        proposedPriceI256
      );

      console.log('=== propose_price call (populated) ===');
      console.log(call);

      const result = await account.execute(call);

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
