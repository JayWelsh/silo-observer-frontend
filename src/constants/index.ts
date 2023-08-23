// API
export const API_ENDPOINT = "https://api.silo.observer";
// export const API_ENDPOINT = "http://localhost:8000";

// Contract Addresses
export const XAI_ADDRESS_ETH_MAINNET = "0xd7C9F0e536dC865Ae858b0C0453Fe76D13c3bEAc";
export const WETH_ADDRESS_ETH_MAINNET = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

export const DEPLOYMENT_ID_TO_HUMAN_READABLE : {[key: string]: string} = {
  "ethereum-original": "Original",
  "arbitrum-original": "Original",
  "ethereum-llama": "LLAMA",
}

export const NETWORK_TO_HUMAN_READABLE : {[key: string]: string} = {
  "ethereum": "Ethereum",
  "arbitrum": "Arbitrum",
}