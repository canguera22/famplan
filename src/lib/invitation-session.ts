const PENDING_INVITATION_KEY = "mesa.pending-family-invitation";
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function rememberPendingInvitation(token: string): void {
  if (typeof window === "undefined" || !UUID_PATTERN.test(token)) return;
  window.localStorage.setItem(PENDING_INVITATION_KEY, token);
}

export function readPendingInvitation(): string | null {
  if (typeof window === "undefined") return null;
  const token = window.localStorage.getItem(PENDING_INVITATION_KEY);
  if (!token || !UUID_PATTERN.test(token)) {
    window.localStorage.removeItem(PENDING_INVITATION_KEY);
    return null;
  }
  return token;
}

export function clearPendingInvitation(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(PENDING_INVITATION_KEY);
}
