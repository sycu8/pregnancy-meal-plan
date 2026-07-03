const AUTH_TOKEN_KEY = "bau-an-gi:auth-token";
const AUTH_USER_KEY = "bau-an-gi:auth-user";

export type StoredAuthUser = {
  id: string;
  email?: string;
  locale: "vi" | "en";
  premium: boolean;
};

export function saveAuthSession(token: string, user: StoredAuthUser) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getAuthUser(): StoredAuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(AUTH_USER_KEY);
    return raw ? (JSON.parse(raw) as StoredAuthUser) : null;
  } catch {
    return null;
  }
}

export function clearAuthSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_USER_KEY);
}

export function authHeaders(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
