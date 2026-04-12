/// <reference types="react-scripts" />

// Global firebase namespace declaration for firebase v8
declare namespace firebase {
  interface User {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    emailVerified: boolean;
    getIdToken(forceRefresh?: boolean): Promise<string>;
  }
}
