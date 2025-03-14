export const API_URL_BASE_SEPOLIA = "https://prod.base-sepolia.intuition-api.com/v1/graphql";
export const API_URL_BASE = 'https://prod.base.intuition-api.com/v1/graphql';
export const API_URL = API_URL_BASE; // Default to BASE mainnet
export const EXPLORER_URL = "https://app.i7n.xyz";

// URL path helpers
export const getAtomUrl = (id: string) => `${EXPLORER_URL}/a/${id}`;
export const getTripleUrl = (id: string) => `${EXPLORER_URL}/t/${id}`;
export const getListUrl = (id: string) => `${EXPLORER_URL}/list/${id}`;