const BASE = "http://localhost:8080";

type ApiErrorBody = { code?: string; message?: string };

async function handle<T = any>(res: Response): Promise<T> {
  if (res.ok) return res.json();
  // 표준 에러 바디 시도 → 실패 시 텍스트
  let body: ApiErrorBody | string = "";
  try { body = await res.json(); } catch { body = await res.text().catch(() => ""); }
  const code = typeof body === "object" ? body.code : undefined;
  const msg  = typeof body === "object" ? body.message : (body || `HTTP ${res.status}`);
  throw new Error(code ? `${code}:${msg}` : msg);
}

export async function register(email: string, password: string) {
  const res = await fetch(`${BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handle<{ token: string; email: string }>(res);
}

export async function login(email: string, password: string) {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handle<{ token: string; email: string }>(res);
}

export async function getHealthWithAuth(token: string) {
  const res = await fetch(`${BASE}/api/health`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handle(res);
}

export async function getMe(token: string) {
  const res = await fetch(`${BASE}/api/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handle<{ email: string }>(res);
}
export async function createProject(token: string, title: string) {
  const res = await fetch(`http://localhost:8080/api/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error(`createProject:${res.status}`);
  return res.json() as Promise<{ id: number; title: string; ownerEmail: string; createdAt: string }>;
}

export async function listProjects(token: string) {
  const res = await fetch(`http://localhost:8080/api/projects`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`listProjects:${res.status}`);
  return res.json() as Promise<Array<{ id: number; title: string; ownerEmail: string; createdAt: string }>>;
}

export async function createJob(token: string, projectId: number, paramsJson: string) {
  const res = await fetch(`http://localhost:8080/api/projects/${projectId}/jobs`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ paramsJson }),
  });
  if (!res.ok) throw new Error(`createJob:${res.status}`);
  return res.json() as Promise<{ id: number; projectId: number; status: string; paramsJson: string; createdAt: string }>;
}

export async function listJobs(token: string, projectId: number) {
  const res = await fetch(`http://localhost:8080/api/projects/${projectId}/jobs`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`listJobs:${res.status}`);
  return res.json() as Promise<Array<{ id: number; projectId: number; status: string; paramsJson: string; createdAt: string }>>;
}
