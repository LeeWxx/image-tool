<script lang="ts">
  import { useAuthState } from '../state/authState.svelte.ts';
  import { openAuthWindow } from '../services/auth.service.ts';

  const auth = useAuthState();
  const statusMessage = $derived(auth.status);
  const authenticated = $derived(auth.isAuthenticated);

  async function handleAuth() {
    try {
      await openAuthWindow();
    } catch (error) {
      console.error('Error during authentication:', error);
    }
  }
</script>

<div class="auth-container">
  <div class="auth-status" class:authenticated={authenticated}>
    {statusMessage}
  </div>
  <button class="auth-button" onclick={handleAuth}>
    Connect Google Drive
  </button>
</div>

<style>
  .auth-container {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 20px;
    gap: 10px;
  }

  .auth-status {
    font-size: 0.9em;
    padding: 5px 10px;
    border-radius: 4px;
    background-color: #f0f0f0;
  }

  .auth-status.authenticated {
    background-color: #e6f7e6;
  }

  .auth-button {
    background-color: #4285F4;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
  }

  .auth-button:hover {
    background-color: #3367D6;
  }
</style>
