// Contract addresses from environment variables with fallbacks
export const OPTIMISTIC_ORACLE_ADDRESS = import.meta.env.VITE_OPTIMISTIC_ORACLE || "0x5511a9e125467ddcbea4c613089d9e90475b988ecfe104a454cc11dc68e1f7f";
export const OPTIMISTIC_ORACLE_MANAGED_ADDRESS = import.meta.env.VITE_OPTIMISTIC_ORACLE_MANAGED || "0x9016171a6daa7aea59cef0eef497de46e3cc06d379000c2952daaf7f01825a";
export const OPTIMISTIC_ORACLE_ASSERTER_ADDRESS = import.meta.env.VITE_OPTIMISTIC_ORACLE_ASSERTER || "0x6a6feb5f198c9cc2398a27a346970e9b49458b7a96a9ec114a9f48602515f86";
export const VOTE_CONTRACT_ADDRESS = import.meta.env.VITE_VOTE_CONTRACT || "0x5681054570c48a5d1c127ec8520b5e9d3abc0372f892721e5bf718e6ccf97b5";
export const FINDER = import.meta.env.VITE_FINDER || "0x27a5876fc7e36d0a3f49d3bd2def7eb42429f3a99edb88dde9fa00618a1b443";
export const USDC_MOCK = import.meta.env.VITE_USDC_MOCK || "0xa45aaa07ac0f0c07e01716fe2d680e8efe5ef404fc838bea618f86fd884e5d";

// Deployment blocks for each oracle contract (Starknet Sepolia)
export const OPTIMISTIC_ORACLE_DEPLOY_BLOCK = Number(import.meta.env.VITE_OO_DEPLOY_BLOCK) || 5699852;
export const OPTIMISTIC_ORACLE_MANAGED_DEPLOY_BLOCK = Number(import.meta.env.VITE_OO_MANAGED_DEPLOY_BLOCK) || 5699818;
export const OPTIMISTIC_ORACLE_ASSERTER_DEPLOY_BLOCK = Number(import.meta.env.VITE_OO_ASSERTER_DEPLOY_BLOCK) || 5699865;
