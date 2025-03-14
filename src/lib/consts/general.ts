export const API_URL_BASE_SEPOLIA = "https://prod.base-sepolia.intuition-api.com/v1/graphql";
export const API_URL_BASE = 'https://prod.base.intuition-api.com/v1/graphql';
export const EXPLORER_URL = "https://app.i7n.xyz";

// URL path helpers
export const getAtomUrl = (id: string) => `${EXPLORER_URL}/a/${id}`;
export const getTripleUrl = (id: string) => `${EXPLORER_URL}/t/${id}`;
export const getListUrl = (id: string) => `${EXPLORER_URL}/list/${id}`;

// Get API URL based on network preference
import { getPreferenceValues } from "@raycast/api";

interface Preferences {
  network: "base" | "base-sepolia";
}

export function getApiUrl(): string {
  try {
    const preferences = getPreferenceValues<Preferences>();
    return preferences.network === "base-sepolia" ? API_URL_BASE_SEPOLIA : API_URL_BASE;
  } catch (error) {
    // Default to Base mainnet if preferences can't be loaded
    console.error("Error loading preferences:", error);
    return API_URL_BASE;
  }
}

export const API_URL = getApiUrl();