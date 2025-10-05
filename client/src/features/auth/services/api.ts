export type AuthStatusResponse = {
  authenticated: boolean;
};

export type AuthUrlResponse = {
  authUrl?: string;
};

export async function fetchAuthStatus(signal?: AbortSignal): Promise<AuthStatusResponse> {
  const response = await fetch('/api/auth/status', { signal });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to check auth status (${response.status}): ${text}`);
  }
  return response.json();
}

export async function fetchAuthUrl(signal?: AbortSignal): Promise<AuthUrlResponse> {
  const response = await fetch('/api/auth/google', { signal });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to fetch auth URL (${response.status}): ${text}`);
  }
  return response.json();
}
