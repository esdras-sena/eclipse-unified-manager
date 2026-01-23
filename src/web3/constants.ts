// Contract addresses from environment variables with fallbacks
export const OPTIMISTIC_ORACLE_ADDRESS = import.meta.env.VITE_OPTIMISTIC_ORACLE || "0x730c29a5f1e6cc39c19800b952bf43b7d530570db71a1ce5b3d99c059d68c81";
export const OPTIMISTIC_ORACLE_MANAGED_ADDRESS = import.meta.env.VITE_OPTIMISTIC_ORACLE_MANAGED || "0x7a9c6e02a1ae1c3afb0d52f258919b08b069f66f8864c51255dc641b7e63512";
export const OPTIMISTIC_ORACLE_ASSERTER_ADDRESS = import.meta.env.VITE_OPTIMISTIC_ORACLE_ASSERTER || "0x36c50cbcaf478ef252e27ba46bbbaf7676f32deba44fd1fd0102b996cfe8cee";
export const VOTE_CONTRACT_ADDRESS = import.meta.env.VITE_VOTE_CONTRACT || "0x32943ea33361fa68f7da0fb6c11fa2f1e426b75da9c450496c7676b8238240e";
export const FINDER = import.meta.env.VITE_FINDER || "0x7aaf8ef90c7bee831cdf51621c8171493aa74612d38afab94079d54816117cc";

// Deployment blocks for each oracle contract (Starknet Sepolia)
export const OPTIMISTIC_ORACLE_DEPLOY_BLOCK = Number(import.meta.env.VITE_OO_DEPLOY_BLOCK) || 5685168;
export const OPTIMISTIC_ORACLE_MANAGED_DEPLOY_BLOCK = Number(import.meta.env.VITE_OO_MANAGED_DEPLOY_BLOCK) || 5685135;
export const OPTIMISTIC_ORACLE_ASSERTER_DEPLOY_BLOCK = Number(import.meta.env.VITE_OO_ASSERTER_DEPLOY_BLOCK) || 5685182;
