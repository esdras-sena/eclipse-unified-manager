// Contract addresses from environment variables with fallbacks
export const OPTIMISTIC_ORACLE_ADDRESS = import.meta.env.VITE_OPTIMISTIC_ORACLE || "0x57c07df1ed898c3b53a63fa9cc8068e0b89e855d3c020b70fb0f56b58da726e";
export const OPTIMISTIC_ORACLE_MANAGED_ADDRESS = import.meta.env.VITE_OPTIMISTIC_ORACLE_MANAGED || "0x64494d190d52a0301073287a6fbea294f612eea541fa15360124cc2f457f2a5";
export const OPTIMISTIC_ORACLE_ASSERTER_ADDRESS = import.meta.env.VITE_OPTIMISTIC_ORACLE_ASSERTER || "0x43c33edd37170536942de3157c00d971c5bdef28501d13dd02b29af6710d17e";
export const VOTE_CONTRACT_ADDRESS = import.meta.env.VITE_VOTE_CONTRACT || "0x1420f0fcbbfdf489442a6b052d9e0c152c2b9ccdc7bc6013307f11c5dc6e050";
export const FINDER = import.meta.env.VITE_FINDER || "0x3314437ac6dd8a39883a080c34cff1e0f776d3fd52a65498ee0b23fda1bfd46";

// Deployment blocks for each oracle contract (Starknet Sepolia)
export const OPTIMISTIC_ORACLE_DEPLOY_BLOCK = Number(import.meta.env.VITE_OO_DEPLOY_BLOCK) || 5651490;
export const OPTIMISTIC_ORACLE_MANAGED_DEPLOY_BLOCK = Number(import.meta.env.VITE_OO_MANAGED_DEPLOY_BLOCK) || 5651477;
export const OPTIMISTIC_ORACLE_ASSERTER_DEPLOY_BLOCK = Number(import.meta.env.VITE_OO_ASSERTER_DEPLOY_BLOCK) || 5651504;
