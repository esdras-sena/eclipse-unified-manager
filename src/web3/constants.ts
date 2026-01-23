// Contract addresses from environment variables with fallbacks
export const OPTIMISTIC_ORACLE_ADDRESS = import.meta.env.VITE_OPTIMISTIC_ORACLE || "0x23ac4b26f613cd8d856c13a9286eba589997afaac4e0cf9b03244364eb4a639";
export const OPTIMISTIC_ORACLE_MANAGED_ADDRESS = import.meta.env.VITE_OPTIMISTIC_ORACLE_MANAGED || "0x65ef54706de8e17bf27d3763ad069d66e454d4d93fa40a99fc98eb26c43dd1";
export const OPTIMISTIC_ORACLE_ASSERTER_ADDRESS = import.meta.env.VITE_OPTIMISTIC_ORACLE_ASSERTER || "0x21271f50e1b2fac113aa8a34f49579f882f3df60d572fe1bd337582a1188411";
export const VOTE_CONTRACT_ADDRESS = import.meta.env.VITE_VOTE_CONTRACT || "0x5f579462f954ada060d0433c2616f4acd5e25c4a49cd2768770ea014fe250e4";
export const FINDER = import.meta.env.VITE_FINDER || "0x141765bb701187ea266bdff407a5eccb557256f698f50e0cda81c14fe6c7c94";

// Deployment blocks for each oracle contract (Starknet Sepolia)
export const OPTIMISTIC_ORACLE_DEPLOY_BLOCK = Number(import.meta.env.VITE_OO_DEPLOY_BLOCK) || 5682617;
export const OPTIMISTIC_ORACLE_MANAGED_DEPLOY_BLOCK = Number(import.meta.env.VITE_OO_MANAGED_DEPLOY_BLOCK) || 5682581;
export const OPTIMISTIC_ORACLE_ASSERTER_DEPLOY_BLOCK = Number(import.meta.env.VITE_OO_ASSERTER_DEPLOY_BLOCK) || 5682630;
