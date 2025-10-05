import { useAuthState } from '../state/authState.svelte.ts';
import { fetchAuthStatus, fetchAuthUrl } from './api.ts';

export async function loadAuthStatus() {
  const auth = useAuthState();
  auth.setStatus('Checking Google Drive status...');
  try {
    const data = await fetchAuthStatus();
    auth.setAuthenticated(Boolean(data.authenticated));
    auth.setStatus(data.authenticated ? 'Connected to Google Drive' : 'Not connected');
    return data.authenticated;
  } catch (error) {
    auth.setStatus('Connection check failed');
    auth.setAuthenticated(false);
    throw error;
  }
}

export async function openAuthWindow() {
  const data = await fetchAuthUrl();
  if (data.authUrl) {
    window.open(data.authUrl, '_blank');
  }
}

export function setAuthStatus(message: string) {
  const auth = useAuthState();
  auth.setStatus(message);
}

export function setAuthenticated(value: boolean) {
  const auth = useAuthState();
  auth.setAuthenticated(value);
}
