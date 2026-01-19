// Debug script to fetch and log contract ABIs
// Run this to see available functions in each oracle contract

import { RpcProvider } from 'starknet';
import { 
  OPTIMISTIC_ORACLE_ADDRESS, 
  OPTIMISTIC_ORACLE_MANAGED_ADDRESS, 
  OPTIMISTIC_ORACLE_ASSERTER_ADDRESS 
} from '../constants';

const provider = new RpcProvider({ nodeUrl: 'https://rpc.starknet-testnet.lava.build:443' });

async function fetchAndLogAbi(name: string, address: string) {
  console.log(`\n=== ${name} (${address}) ===\n`);
  
  try {
    const klass = await provider.getClassAt(address);
    const abi = klass?.abi;
    
    if (!abi) {
      console.log('No ABI found');
      return;
    }
    
    const abiArray = typeof abi === 'string' ? JSON.parse(abi) : abi;
    
    // Find all functions (interfaces)
    const interfaces = abiArray.filter((item: any) => item.type === 'interface');
    const functions = abiArray.filter((item: any) => item.type === 'function');
    
    console.log('=== INTERFACES ===');
    for (const iface of interfaces) {
      console.log(`\nInterface: ${iface.name}`);
      if (iface.items) {
        for (const item of iface.items) {
          if (item.type === 'function') {
            const inputs = item.inputs?.map((i: any) => `${i.name}: ${i.type}`).join(', ') || '';
            const outputs = item.outputs?.map((o: any) => o.type).join(', ') || 'void';
            console.log(`  - ${item.name}(${inputs}) -> ${outputs}`);
          }
        }
      }
    }
    
    console.log('\n=== STANDALONE FUNCTIONS ===');
    for (const fn of functions) {
      const inputs = fn.inputs?.map((i: any) => `${i.name}: ${i.type}`).join(', ') || '';
      const outputs = fn.outputs?.map((o: any) => o.type).join(', ') || 'void';
      console.log(`  - ${fn.name}(${inputs}) -> ${outputs}`);
    }
    
  } catch (error) {
    console.error('Error fetching ABI:', error);
  }
}

export async function logAllAbis() {
  await fetchAndLogAbi('Optimistic Oracle', OPTIMISTIC_ORACLE_ADDRESS);
  await fetchAndLogAbi('Optimistic Oracle Managed', OPTIMISTIC_ORACLE_MANAGED_ADDRESS);
  await fetchAndLogAbi('Optimistic Oracle Asserter', OPTIMISTIC_ORACLE_ASSERTER_ADDRESS);
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).logAllAbis = logAllAbis;
}
