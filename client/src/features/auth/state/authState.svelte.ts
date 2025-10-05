let statusMessage = $state('Checking Google Drive status...');
let authenticated = $state(false);

export function useAuthState() {
  return {
    get status() {
      return statusMessage;
    },
    setStatus(value: string) {
      statusMessage = value;
    },
    get isAuthenticated() {
      return authenticated;
    },
    setAuthenticated(value: boolean) {
      authenticated = value;
    }
  };
}
