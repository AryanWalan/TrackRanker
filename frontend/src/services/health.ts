import { API_BASE_URL } from "../config/api";

export interface HealthResponse {
  status: string;
  application: string;
  timestampUtc: string;
}

export async function getHealth(signal?: AbortSignal): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/health`, { signal });

  if (!response.ok) {
    throw new Error(`Health request failed with status ${response.status}.`);
  }

  return response.json() as Promise<HealthResponse>;
}
