const BASE = "http://localhost:8080";

export async function login(email: string, password: string) {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(`Login failed: ${res.status}`);
  return res.json() as Promise<{ token: string; email: string }>;
}

export async function getHealthWithAuth(token: string) {
  const res = await fetch(`${BASE}/api/health`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Health failed: ${res.status}`);
  return res.json();
}

export async function getMe(token: string) {
  const res = await fetch(`${BASE}/api/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Me failed: ${res.status}`);
  return res.json() as Promise<{ email: string }>;
}
