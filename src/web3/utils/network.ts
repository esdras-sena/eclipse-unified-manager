export function getNodeUrl() {
  // Legacy single URL override
  const explicit = process.env.NEXT_PUBLIC_RPC_URL;
  if (explicit && typeof explicit === 'string') return explicit;

  const envSepolia = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL;
  const envMainnet = process.env.NEXT_PUBLIC_MAINNET_RPC_URL;

  let hint = (process.env.NEXT_PUBLIC_CHAIN || '').toLowerCase();
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