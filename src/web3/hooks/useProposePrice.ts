import { useCallback, useState } from 'react';
import { useAccount } from '@starknet-react/core';
import { Contract } from 'starknet';
import { OPTIMISTIC_ORACLE_ADDRESS, OPTIMISTIC_ORACLE_MANAGED_ADDRESS, USDC_MOCK } from '../constants';
import { OracleType } from '@/components/QueryDetailPanel';

import ooAbi from '../abis/ooAbi.json';
import ooManagedAbi from '../abis/ooManagedAbi.json';

// Minimal ERC20 ABI for approve
const erc20Abi = [
  {
    name: "approve",
    type: "function",
    inputs: [
      { name: "spender", type: "core::starknet::contract_address::ContractAddress" },
      { name: "amount", type: "core::integer::u256" }
    ],
    outputs: [{ type: "core::bool" }],
    state_mutability: "external"
  }
];

interface ProposePriceParams {
  oracleType: OracleType;
  requester: string; // ContractAddress
  identifier: string; // felt252 hex (identifierRaw)
  timestamp: number; // u64
  ancillaryDataString: string; // The decoded string to convert to ByteArray
  proposedPrice: bigint; // i256 value
  bond: bigint; // Bond amount to approve
}

function utf8ToHex(str: string): string {
  // Use standard UTF-8 encoding (browser-safe)
  const bytes = new TextEncoder().encode(str);
  let hex = '0x';
  for (const b of bytes) hex += b.toString(16).padStart(2, '0');
  return hex;
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

// Build Cairo u256 struct for approve amount
function toU256(value: bigint) {
  const low = value & ((1n << 128n) - 1n);
  const high = value >> 128n;
  return { low: low.toString(), high: high.toString() };
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
      const oracleAddress = getContractAddress(params.oracleType);
      const abi = getContractAbi(params.oracleType) as any;

      // Voyager-style: pass ancillary as a HEX string; starknet.js will recognize 0x.. and
      // encode it into Cairo ByteArray internally.
      const ancillaryDataHex = utf8ToHex(params.ancillaryDataString);

      console.log('=== propose_price params ===');
      console.log('requester:', params.requester);
      console.log('identifier:', params.identifier);
      console.log('timestamp:', params.timestamp);
      console.log('ancillaryDataString:', params.ancillaryDataString);
      console.log('ancillaryDataHex:', ancillaryDataHex);
      console.log('proposedPrice:', params.proposedPrice.toString());
      console.log('bond:', params.bond.toString());

      // Step 1: Approve the oracle contract to spend bond amount
      console.log('=== Approving bond transfer ===');
      const tokenContract = new Contract({ abi: erc20Abi, address: USDC_MOCK, providerOrAccount: account });
      const bondU256 = toU256(params.bond);
      
      console.log('Token address:', USDC_MOCK);
      console.log('Spender (oracle):', oracleAddress);
      console.log('Amount (u256):', bondU256);

      const approveResult = await tokenContract.invoke("approve", [oracleAddress, bondU256]);
      console.log('Approve transaction submitted:', approveResult.transaction_hash);
      
      // Wait for approval to be confirmed
      await account.waitForTransaction(approveResult.transaction_hash);
      console.log('Approve confirmed');

      // Step 2: Call propose_price
      console.log('=== Calling propose_price ===');
      const writeContract = new Contract({ abi, address: oracleAddress, providerOrAccount: account });
      const proposedPriceI256 = toI256(params.proposedPrice);

      console.log('proposedPriceI256:', proposedPriceI256);

      // Use invoke with array-style args (same pattern as contract.call in tests)
      const result = await writeContract.invoke("propose_price", [
        params.requester,
        params.identifier,
        params.timestamp,
        ancillaryDataHex,
        proposedPriceI256
      ]);

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
