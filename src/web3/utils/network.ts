export function getNodeUrl() {
  // Legacy single URL override (support both Vite and Next.js env vars)
  const explicit = import.meta.env?.VITE_RPC_URL || (typeof process !== 'undefined' ? process.env?.NEXT_PUBLIC_RPC_URL : undefined);
  if (explicit && typeof explicit === 'string') return explicit;

  const envSepolia = import.meta.env?.VITE_SEPOLIA_RPC_URL || (typeof process !== 'undefined' ? process.env?.NEXT_PUBLIC_SEPOLIA_RPC_URL : undefined);
  const envMainnet = import.meta.env?.VITE_MAINNET_RPC_URL || (typeof process !== 'undefined' ? process.env?.NEXT_PUBLIC_MAINNET_RPC_URL : undefined);

  let hint = (import.meta.env?.VITE_CHAIN || (typeof process !== 'undefined' ? process.env?.NEXT_PUBLIC_CHAIN : '') || '').toLowerCase();
  if (typeof window !== 'undefined') {
    try {
      const ls = (localStorage.getItem('preferredChain') || '').toLowerCase();
      if (ls) hint = ls;
    } catch {}
  }

  const isMain = hint.includes('main');
  const fallbackMain = 'https://rpc.starknet.lava.build:443';
  const fallbackSep = 'https://rpc.starknet-testnet.lava.build:443';
  return isMain ? (envMainnet || fallbackMain) : (envSepolia || fallbackSep);
}