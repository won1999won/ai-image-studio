// app/frontend/src/App.tsx
import React, { useEffect, useState } from "react";
import {
  login,
  register,
  getHealthWithAuth,
  getMe,
  createProject,
  listProjects,
  createJob,
  listJobs,
} from "./api";

type Health = { ok: boolean; service: string; version: string };

function userMessageOf(error: Error) {
  const raw = error.message || "";
  const i = raw.indexOf(":");
  const code = i > -1 ? raw.slice(0, i) : "";
  const msg = i > -1 ? raw.slice(i + 1) : raw;

  switch (code) {
    case "email_already_exists":
      return "이미 가입된 이메일입니다. 다른 이메일을 사용해 주세요.";
    case "invalid_credentials":
      return "이메일 또는 비밀번호가 올바르지 않습니다.";
    case "validation_error":
      return `입력 형식 오류: ${msg}`;
    default:
      return msg || "알 수 없는 오류가 발생했어요.";
  }
}

export default function App() {
  // 인증/기본 상태
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("1234");
  const [token, setToken] = useState<string | null>(null);
  const [health, setHealth] = useState<Health | null>(null);
  const [me, setMe] = useState<{ email: string } | null>(null);
  const [msg, setMsg] = useState<string>("");
  const [mode, setMode] = useState<"login" | "register">("login");

  // 프로젝트/작업 상태
  const [projects, setProjects] = useState<Array<{ id: number; title: string }>>([]);
  const [selectedPid, setSelectedPid] = useState<number | null>(null);
  const [jobs, setJobs] = useState<Array<{ id: number; status: string; paramsJson: string }>>([]);
  const [newTitle, setNewTitle] = useState("My First Project");
  const [newParams, setNewParams] = useState('{"faceSR":true,"strength":0.7}');

  // 시작 시 저장된 토큰 복원
  useEffect(() => {
    const t = localStorage.getItem("token");
    if (t) setToken(t);
  }, []);

  // 토큰 있으면 /api/health + /api/me 호출
  useEffect(() => {
    if (!token) return;
    setMsg("토큰으로 API 호출 중…");
    Promise.all([getHealthWithAuth(token), getMe(token)])
      .then(([h, m]) => {
        setHealth(h);
        setMe(m);
        setMsg("성공!");
      })
      .catch((e: any) => {
        setMsg(userMessageOf(e));
        setHealth(null);
        setMe(null);
      });
  }, [token]);

  // 토큰 획득 직후 프로젝트 목록 불러오기
  useEffect(() => {
    if (!token) return;
    listProjects(token)
      .then((ps) => {
        const mapped = ps.map((p) => ({ id: p.id, title: p.title }));
        setProjects(mapped);
        if (mapped.length) setSelectedPid(mapped[0].id);
      })
      .catch((e) => setMsg("프로젝트 조회 실패: " + e.message));
  }, [token]);

  // 프로젝트 선택 변경 시 해당 프로젝트의 작업 목록 불러오기
  useEffect(() => {
    if (!token || !selectedPid) return;
    listJobs(token, selectedPid)
      .then((js) => setJobs(js.map((j) => ({ id: j.id, status: j.status, paramsJson: j.paramsJson }))))
      .catch((e) => setMsg("작업 조회 실패: " + e.message));
  }, [token, selectedPid]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(mode === "login" ? "로그인 요청 중…" : "회원가입 요청 중…");
    try {
      const res = mode === "login" ? await login(email, password) : await register(email, password);
      localStorage.setItem("token", res.token);
      setToken(res.token);
      setMsg(`${mode === "login" ? "로그인" : "회원가입"} 성공: ${res.email}`);
    } catch (e: any) {
      setMsg(userMessageOf(e));
    }
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setHealth(null);
    setMe(null);
    setProjects([]);
    setJobs([]);
    setSelectedPid(null);
    setMsg("로그아웃됨");
  }

  return (
    <main style={{ fontFamily: "system-ui", padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1>AI Image Studio — MVP 대시보드</h1>

      {!token ? (
        <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, maxWidth: 420 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={() => setMode("login")}
              style={{ padding: "6px 10px", background: mode === "login" ? "#ddd" : "#f4f4f4" }}
            >
              로그인
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              style={{ padding: "6px 10px", background: mode === "register" ? "#ddd" : "#f4f4f4" }}
            >
              회원가입
            </button>
          </div>

          <label>
            이메일
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%", padding: 8, marginTop: 4 }}
              type="email"
              required
            />
          </label>
          <label>
            비밀번호
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%", padding: 8, marginTop: 4 }}
              type="password"
              required
            />
          </label>

          <button type="submit" style={{ padding: "10px 14px" }}>
            {mode === "login" ? "로그인" : "회원가입"}
          </button>
          <div
            style={{
              color:
                msg.startsWith("로그인 성공") || msg.startsWith("회원가입 성공") || msg === "성공!" ? "#0a0" : "#d33",
            }}
          >
            {msg}
          </div>
        </form>
      ) : (
        <section style={{ display: "grid", gap: 16 }}>
          {/* 토큰 / me / health */}
          <div>
            <strong>저장된 토큰:</strong>
            <pre style={{ background: "#111", color: "#0f0", padding: 8, borderRadius: 6, whiteSpace: "pre-wrap" }}>
              {token}
            </pre>
          </div>

          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
            <div>
              <strong>/api/me 응답(이메일):</strong>
              <pre style={{ background: "#111", color: "#0f0", padding: 12, borderRadius: 8 }}>
                {me ? JSON.stringify(me, null, 2) : "호출 전 또는 실패"}
              </pre>
            </div>
            <div>
              <strong>/api/health 응답:</strong>
              <pre style={{ background: "#111", color: "#0f0", padding: 12, borderRadius: 8 }}>
                {health ? JSON.stringify(health, null, 2) : "호출 전 또는 실패"}
              </pre>
            </div>
          </div>

          {/* 프로젝트 & 작업 대시보드 */}
          <section style={{ display: "grid", gap: 12, padding: 16, border: "1px solid #ddd", borderRadius: 8 }}>
            <h2 style={{ margin: 0 }}>프로젝트 & 작업</h2>

            {/* 프로젝트 생성 */}
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="프로젝트 제목"
                style={{ padding: 8, flex: 1 }}
              />
              <button
                onClick={async () => {
                  if (!token) return;
                  try {
                    const p = await createProject(token, newTitle);
                    setProjects([{ id: p.id, title: p.title }, ...projects]);
                    setSelectedPid(p.id);
                    setMsg("프로젝트 생성 성공");
                  } catch (e: any) {
                    setMsg("프로젝트 생성 실패: " + e.message);
                  }
                }}
                style={{ padding: "8px 12px" }}
              >
                프로젝트 생성
              </button>
            </div>

            {/* 프로젝트 선택 */}
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <label>프로젝트 선택:</label>
              <select
                value={selectedPid ?? ""}
                onChange={(e) => setSelectedPid(Number(e.target.value))}
                style={{ padding: 8 }}
              >
                <option value="" disabled>
                  선택
                </option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} (#{p.id})
                  </option>
                ))}
              </select>
            </div>

            {/* 작업 생성 */}
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                value={newParams}
                onChange={(e) => setNewParams(e.target.value)}
                placeholder='{"faceSR":true,"strength":0.7}'
                style={{ padding: 8, flex: 1, fontFamily: "monospace" }}
              />
              <button
                disabled={!selectedPid}
                onClick={async () => {
                  if (!token || !selectedPid) return;
                  try {
                    const j = await createJob(token, selectedPid, newParams);
                    setJobs([{ id: j.id, status: j.status, paramsJson: j.paramsJson }, ...jobs]);
                    setMsg("작업 생성 성공 (상태: " + j.status + ")");
                  } catch (e: any) {
                    setMsg("작업 생성 실패: " + e.message);
                  }
                }}
                style={{ padding: "8px 12px" }}
              >
                작업 생성
              </button>
            </div>

            {/* 작업 목록 */}
            <div>
              <strong>작업 목록:</strong>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {jobs.map((j) => (
                  <li key={j.id} style={{ fontFamily: "monospace" }}>
                    #{j.id} — {j.status} — {j.paramsJson}
                  </li>
                ))}
                {!jobs.length && <li>아직 작업이 없습니다.</li>}
              </ul>
            </div>
          </section>

          <div style={{ color: msg === "성공!" || msg.includes("성공") ? "#0a0" : "#d33" }}>{msg}</div>
          <button onClick={logout} style={{ padding: "10px 14px", width: 120 }}>
            로그아웃
          </button>
        </section>
      )}
    </main>
  );
}
