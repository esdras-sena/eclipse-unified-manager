import { useEffect, useState } from 'react';
import { loadAbi } from '../utils/fetchEvents';
import { 
  OPTIMISTIC_ORACLE_ADDRESS, 
  OPTIMISTIC_ORACLE_MANAGED_ADDRESS, 
  OPTIMISTIC_ORACLE_ASSERTER_ADDRESS 
} from '../constants';

interface FunctionInfo {
  name: string;
  inputs: string;
  outputs: string;
  stateMutability?: string;
}

interface ContractAbiInfo {
  name: string;
  address: string;
  functions: FunctionInfo[];
  loading: boolean;
  error: string | null;
}

function extractFunctionsFromAbi(abi: any[]): FunctionInfo[] {
  const functions: FunctionInfo[] = [];
  
  for (const item of abi) {
    // Extract from interfaces
    if (item.type === 'interface' && item.items) {
      for (const fn of item.items) {
        if (fn.type === 'function') {
          functions.push({
            name: fn.name,
            inputs: fn.inputs?.map((i: any) => `${i.name}: ${i.type}`).join(', ') || '',
            outputs: fn.outputs?.map((o: any) => o.type).join(', ') || 'void',
            stateMutability: fn.state_mutability,
          });
        }
      }
    }
    // Also check for standalone functions
    if (item.type === 'function') {
      functions.push({
        name: item.name,
        inputs: item.inputs?.map((i: any) => `${i.name}: ${i.type}`).join(', ') || '',
        outputs: item.outputs?.map((o: any) => o.type).join(', ') || 'void',
        stateMutability: item.state_mutability,
      });
    }
  }
  
  return functions;
}

export function useContractAbis() {
  const [contracts, setContracts] = useState<ContractAbiInfo[]>([
    { name: 'Optimistic Oracle', address: OPTIMISTIC_ORACLE_ADDRESS, functions: [], loading: true, error: null },
    { name: 'Optimistic Oracle Managed', address: OPTIMISTIC_ORACLE_MANAGED_ADDRESS, functions: [], loading: true, error: null },
    { name: 'Optimistic Oracle Asserter', address: OPTIMISTIC_ORACLE_ASSERTER_ADDRESS, functions: [], loading: true, error: null },
  ]);

  useEffect(() => {
    async function fetchAbis() {
      const contractList = [
        { name: 'Optimistic Oracle', address: OPTIMISTIC_ORACLE_ADDRESS },
        { name: 'Optimistic Oracle Managed', address: OPTIMISTIC_ORACLE_MANAGED_ADDRESS },
        { name: 'Optimistic Oracle Asserter', address: OPTIMISTIC_ORACLE_ASSERTER_ADDRESS },
      ];

      const results = await Promise.all(
        contractList.map(async (contract) => {
          try {
            const abi = await loadAbi(contract.address);
            return { ...contract, functions: extractFunctionsFromAbi(abi), loading: false, error: null };
          } catch (e: any) {
            return { ...contract, functions: [], loading: false, error: e.message };
          }
        })
      );

      setContracts(results);
    }

    fetchAbis();
  }, []);

  return contracts;
}

// Debug component to display ABI info
export function AbiDebugPanel() {
  const contracts = useContractAbis();

  // Debug logging removed - use browser devtools to inspect 'contracts' if needed

  return null; // This is just for debugging, doesn't render anything
}
