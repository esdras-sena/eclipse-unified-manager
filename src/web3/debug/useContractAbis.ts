import { useEffect, useState } from 'react';
import { RpcProvider } from 'starknet';
import { 
  OPTIMISTIC_ORACLE_ADDRESS, 
  OPTIMISTIC_ORACLE_MANAGED_ADDRESS, 
  OPTIMISTIC_ORACLE_ASSERTER_ADDRESS 
} from '../constants';
import { getNodeUrl } from '../utils/network';

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

const provider = new RpcProvider({ nodeUrl: getNodeUrl() });

async function extractFunctions(address: string): Promise<FunctionInfo[]> {
  const klass = await provider.getClassAt(address);
  const abi = klass?.abi;
  
  if (!abi) return [];
  
  const abiArray = typeof abi === 'string' ? JSON.parse(abi) : abi;
  const functions: FunctionInfo[] = [];
  
  // Extract from interfaces
  for (const item of abiArray) {
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
      const results = await Promise.all([
        extractFunctions(OPTIMISTIC_ORACLE_ADDRESS).catch(e => ({ error: e.message })),
        extractFunctions(OPTIMISTIC_ORACLE_MANAGED_ADDRESS).catch(e => ({ error: e.message })),
        extractFunctions(OPTIMISTIC_ORACLE_ASSERTER_ADDRESS).catch(e => ({ error: e.message })),
      ]);

      setContracts(prev => prev.map((contract, i) => {
        const result = results[i];
        if ('error' in result) {
          return { ...contract, loading: false, error: result.error };
        }
        return { ...contract, loading: false, functions: result };
      }));
    }

    fetchAbis();
  }, []);

  return contracts;
}

// Debug component to display ABI info
export function AbiDebugPanel() {
  const contracts = useContractAbis();

  useEffect(() => {
    // Log to console for easy viewing
    contracts.forEach(contract => {
      if (!contract.loading && contract.functions.length > 0) {
        console.log(`\n=== ${contract.name} ===`);
        console.log(`Address: ${contract.address}`);
        console.log('Functions:');
        
        // Group by view/external
        const viewFunctions = contract.functions.filter(f => f.stateMutability === 'view');
        const externalFunctions = contract.functions.filter(f => f.stateMutability === 'external');
        
        console.log('\n-- View Functions (read-only, useful for querying state) --');
        viewFunctions.forEach(fn => {
          console.log(`  ${fn.name}(${fn.inputs}) -> ${fn.outputs}`);
        });
        
        console.log('\n-- External Functions (state-changing) --');
        externalFunctions.forEach(fn => {
          console.log(`  ${fn.name}(${fn.inputs}) -> ${fn.outputs}`);
        });
      }
    });
  }, [contracts]);

  return null; // This is just for debugging, doesn't render anything
}
