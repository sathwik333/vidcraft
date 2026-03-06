interface ClerkSession {
  getToken(): Promise<string | null>;
}

interface ClerkInstance {
  session?: ClerkSession;
}

declare global {
  interface Window {
    Clerk?: ClerkInstance;
  }
}

export {};
