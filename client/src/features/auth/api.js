export async function checkAuthStatus() {
  const response = await fetch('/api/auth/status');
  return response.json();
}

export async function getAuthUrl() {
  const response = await fetch('/api/auth/google');
  return response.json();
}