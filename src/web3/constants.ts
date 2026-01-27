// Contract addresses from environment variables with fallbacks
export const OPTIMISTIC_ORACLE_ADDRESS = import.meta.env.VITE_OPTIMISTIC_ORACLE || "0x6b0290f99cebfa699b10c50525825df2dbc8b572611421141280079498a893";
export const OPTIMISTIC_ORACLE_MANAGED_ADDRESS = import.meta.env.VITE_OPTIMISTIC_ORACLE_MANAGED || "0x71ab019e4f78cdde674640fa237e517c4744ba4ef489c43d3334a488249e6b3";
export const OPTIMISTIC_ORACLE_ASSERTER_ADDRESS = import.meta.env.VITE_OPTIMISTIC_ORACLE_ASSERTER || "0x4ac55130a1eb8c462536921fb5a9a0b9f4c00d4ad47c04b7dba5e9a006c1ec2";
export const VOTE_CONTRACT_ADDRESS = import.meta.env.VITE_VOTE_CONTRACT || "0x1cf58617e3b5844360ec31dcd73ec50a4240f2591f88a250bc457613bcfd678";
export const FINDER = import.meta.env.VITE_FINDER || "0x1759be3958b8418cbbd9347ff1ecbc54d4ed67c3caf78656a6a1b762d4cee0f";
export const USDC_MOCK = import.meta.env.VITE_USDC_MOCK || "0x735885e94ed9e0cd3186b17b97d97042cd3b3c595725434326f8a6f608851bb";

// Deployment blocks for each oracle contract (Starknet Sepolia)
export const OPTIMISTIC_ORACLE_DEPLOY_BLOCK = Number(import.meta.env.VITE_OO_DEPLOY_BLOCK) || 5865555;
export const OPTIMISTIC_ORACLE_MANAGED_DEPLOY_BLOCK = Number(import.meta.env.VITE_OO_MANAGED_DEPLOY_BLOCK) || 5865541;
export const OPTIMISTIC_ORACLE_ASSERTER_DEPLOY_BLOCK = Number(import.meta.env.VITE_OO_ASSERTER_DEPLOY_BLOCK) || 5865568;
