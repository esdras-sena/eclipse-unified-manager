import { num } from 'starknet';

// Convert felt252 to string (for identifiers)
export function felt252ToString(felt: string | bigint): string {
  try {
    const hex = typeof felt === 'bigint' ? felt.toString(16) : felt;
    const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
    // Convert hex to bytes and then to string
    let str = '';
    for (let i = 0; i < cleanHex.length; i += 2) {
      const byte = parseInt(cleanHex.substr(i, 2), 16);
      if (byte !== 0) {
        str += String.fromCharCode(byte);
      }
    }
    return str || hex;
  } catch {
    return String(felt);
  }
}

// Format address for display
export function formatAddress(address: string): string {
  if (!address || address === '0x0' || address === '0x0000000000000000000000000000000000000000') {
    return '0x0';
  }
  const clean = address.startsWith('0x') ? address : `0x${address}`;
  if (clean.length <= 10) return clean;
  return `${clean.slice(0, 6)}...${clean.slice(-4)}`;
}

// Format timestamp to readable date
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

// Calculate time left from expiration timestamp
export function calculateTimeLeft(expirationTimestamp: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = expirationTimestamp - now;
  
  if (diff <= 0) return 'Ended';
  
  const hours = Math.floor(diff / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  const seconds = diff % 60;
  
  if (hours > 0) {
    return `${hours} h ${minutes} m ${seconds} s`;
  } else if (minutes > 0) {
    return `${minutes} m ${seconds} s`;
  }
  return `${seconds} s`;
}

// Format bigint to decimal string (assuming 18 decimals by default)
export function formatBigInt(value: bigint, decimals: number = 18): string {
  if (!value || value === BigInt(0)) return '0';
  
  const str = value.toString();
  if (str.length <= decimals) {
    const padded = str.padStart(decimals + 1, '0');
    const intPart = padded.slice(0, -decimals) || '0';
    const decPart = padded.slice(-decimals).replace(/0+$/, '');
    return decPart ? `${intPart}.${decPart}` : intPart;
  }
  
  const intPart = str.slice(0, -decimals);
  const decPart = str.slice(-decimals).replace(/0+$/, '');
  return decPart ? `${intPart}.${decPart}` : intPart;
}

// Parse ByteArray from Starknet event
export function parseByteArray(byteArray: any): string {
  if (!byteArray) return '';
  
  // Handle if it's already a string
  if (typeof byteArray === 'string') {
    // Try to decode if it looks like hex
    if (byteArray.startsWith('0x')) {
      try {
        return hexToString(byteArray);
      } catch {
        return byteArray;
      }
    }
    return byteArray;
  }
  
  // Handle ByteArray struct format
  if (typeof byteArray === 'object') {
    // Check for pending_word pattern
    if ('data' in byteArray && 'pending_word' in byteArray) {
      try {
        let result = '';
        // Decode data array
        if (Array.isArray(byteArray.data)) {
          for (const felt of byteArray.data) {
            result += felt252ToString(felt);
          }
        }
        // Add pending word
        if (byteArray.pending_word && byteArray.pending_word !== '0x0') {
          result += felt252ToString(byteArray.pending_word);
        }
        return result || JSON.stringify(byteArray);
      } catch {
        return JSON.stringify(byteArray);
      }
    }
    return JSON.stringify(byteArray);
  }
  
  return String(byteArray);
}

// Convert hex string to readable string
export function hexToString(hex: string): string {
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
  let str = '';
  for (let i = 0; i < cleanHex.length; i += 2) {
    const byte = parseInt(cleanHex.substr(i, 2), 16);
    if (byte !== 0) {
      str += String.fromCharCode(byte);
    }
  }
  return str;
}

// Generate unique ID from tx hash and event parameters
export function generateQueryId(txHash: string, identifier: string, timestamp: number): string {
  return `${txHash}-${identifier}-${timestamp}`;
}

// Parse i256 from Starknet (signed 256-bit integer)
export function parseI256(value: any): bigint {
  if (!value) return BigInt(0);
  
  // Handle struct format with low/high
  if (typeof value === 'object' && 'low' in value && 'high' in value) {
    const low = BigInt(value.low || 0);
    const high = BigInt(value.high || 0);
    return low + (high << BigInt(128));
  }
  
  return BigInt(value);
}

// Parse u256 from Starknet
export function parseU256(value: any): bigint {
  if (!value) return BigInt(0);
  
  // Handle struct format with low/high
  if (typeof value === 'object' && 'low' in value && 'high' in value) {
    const low = BigInt(value.low || 0);
    const high = BigInt(value.high || 0);
    return low + (high << BigInt(128));
  }
  
  return BigInt(value);
}
