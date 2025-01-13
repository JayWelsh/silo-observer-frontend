// API
export const API_ENDPOINT = "https://api.silo.observer";
// export const API_ENDPOINT = "http://localhost:8000";

// Contract Addresses
export const XAI_ADDRESS_ETH_MAINNET = "0xd7C9F0e536dC865Ae858b0C0453Fe76D13c3bEAc";
export const WETH_ADDRESS_ETH_MAINNET = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
export const CRVUSD_ADDRESS_ETH_MAINNET = "0xf939E0A03FB07F59A73314E73794Be0E57ac1b4E";

export const DEPLOYMENT_ID_TO_HUMAN_READABLE : {[key: string]: string} = {
  "ethereum-llama": "LLAMA",
  "ethereum-original": "Legacy",
  "arbitrum-original": "Main",
  "optimism-original": "Main",
  "ethereum-main": "Main",
  "base-original": "Main",
  "base-btcfi": "BTCfi",
  "sonic-main-v2": "Main",
}

export const SORTABLE_DEPLOYMENT_ID_TO_HUMAN_READABLE : {[key: string]: string} = {
  "a-ethereum-original": "Legacy",
  "b-ethereum-llama": "LLAMA",
  "c-ethereum-main": "Main",
  "d-arbitrum-original": "Main",
  "e-base-original": "Main",
  "f-base-btcfi": "BTCfi",
  "g-optimism-original": "Main",
  "h-sonic-main-v2": "Main",
}

export const NETWORK_TO_HUMAN_READABLE : {[key: string]: string} = {
  "ethereum": "Ethereum",
  "arbitrum": "Arbitrum",
  "optimism": "Optimism",
  "base": "Base",
  "sonic": "Sonic",
}

export const TIMESTAMP_TO_DEPLOYMENT_BREAKPOINTS = {
  1660034657: ["ethereum-original"],
  1673287775: ["ethereum-original", "arbitrum-original"],
  1690438799: ["ethereum-original", "arbitrum-original", "ethereum-llama"],
  1718211000: ["ethereum-original", "arbitrum-original", "ethereum-llama", "optimism-original"],
  1721722823: ["ethereum-original", "arbitrum-original", "ethereum-llama", "optimism-original", "ethereum-main"],
  1726155000: ["ethereum-original", "arbitrum-original", "ethereum-llama", "optimism-original", "ethereum-main", "base-original"],
  1733428800: ["ethereum-original", "arbitrum-original", "ethereum-llama", "optimism-original", "ethereum-main", "base-original", "base-btcfi"],
  1736464800: ["ethereum-original", "arbitrum-original", "ethereum-llama", "optimism-original", "ethereum-main", "base-original", "base-btcfi", "sonic-main-v2"],
}

export const CHAIN_COUNT = 5;

export const CHAIN_ID_TO_DEPLOYMENT_COUNT : {[key: string]: number} = {
  "ethereum": 3,
  "arbitrum": 1,
  "optimism": 1,
  "base": 2,
  "sonic": 1,
}

export type CHAIN_ID = "ethereum" | "arbitrum" | "optimism" | "base" | "sonic";

export const CHAIN_ID_TO_DEPLOYMENT_IDS = {
  ethereum: ['ethereum-original', 'ethereum-llama', 'ethereum-main'],
  arbitrum: ['arbitrum-original'],
  optimism: ['optimism-original'],
  base: ['base-original', 'base-btcfi'],
  sonic: ['sonic-main-v2'],
}

export const CHAIN_ID_TO_PIE_COLOR : {[key: string]: string} = {
  "ethereum": "#32ff00",
  "optimism": "#ff0421",
  "arbitrum": "#93bad8",
  "base": "#1a54f4",
  "sonic": "#fe9a4e",
}

export const GAIN_OR_LOSS_TO_PIE_COLOR : {[key: string]: string} = {
  "gain": "#25d800",
  "loss": "#d10000",
}