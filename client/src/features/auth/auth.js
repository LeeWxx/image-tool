import { writable } from 'svelte/store';

export const authStatus = writable('Checking Google Drive status...');
export const isAuthenticated = writable(false);