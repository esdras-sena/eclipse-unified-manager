// Contract addresses from environment variables with fallbacks
export const OPTIMISTIC_ORACLE_ADDRESS = import.meta.env.VITE_OPTIMISTIC_ORACLE || "0x246e9c22ebcabf4aafc8c939481557d2f77b94f9f586372cbb6b9951ee6b5a";
export const OPTIMISTIC_ORACLE_MANAGED_ADDRESS = import.meta.env.VITE_OPTIMISTIC_ORACLE_MANAGED || "0x23faf70c1b0262c46a72ed70125380bef435025d2f0e1d5184b528fd96b570c";
export const OPTIMISTIC_ORACLE_ASSERTER_ADDRESS = import.meta.env.VITE_OPTIMISTIC_ORACLE_ASSERTER || "0x602ff5e6c02b20203d1e5550a791345f1cb6acb42b257e2e4bfda8bddb1b956";
export const VOTE_CONTRACT_ADDRESS = import.meta.env.VITE_VOTE_CONTRACT || "0x6975fc84224e0f89bc049ac24e0849cb099379487cf3e3d8c38ddafe62eb8e8";
export const FINDER = import.meta.env.VITE_FINDER || "0x7d8e087aae580d60980b75a430ca16438e9d490ede1100e588dac47779eb67e";
export const USDC_MOCK = import.meta.env.VITE_USDC_MOCK || "0x2257581a17eb707cd3c75a92bc3235a53f30ee9015e3284e6e9add18e357651";

// Deployment blocks for each oracle contract (Starknet Sepolia)
export const OPTIMISTIC_ORACLE_DEPLOY_BLOCK = Number(import.meta.env.VITE_OO_DEPLOY_BLOCK) || 5720830;
export const OPTIMISTIC_ORACLE_MANAGED_DEPLOY_BLOCK = Number(import.meta.env.VITE_OO_MANAGED_DEPLOY_BLOCK) || 5720793;
export const OPTIMISTIC_ORACLE_ASSERTER_DEPLOY_BLOCK = Number(import.meta.env.VITE_OO_ASSERTER_DEPLOY_BLOCK) || 5720845;
