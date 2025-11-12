import React, { useEffect, useState } from "react";
import { login, register, getHealthWithAuth, getMe } from "./api";

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
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("1234");
  const [token, setToken] = useState<string | null>(null);
  const [health, setHealth] = useState<Health | null>(null);
  const [me, setMe] = useState<{ email: string } | null>(null);
  const [msg, setMsg] = useState<string>("");
  const [mode, setMode] = useState<"login" | "register">("login");

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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(mode === "login" ? "로그인 요청 중…" : "회원가입 요청 중…");
    try {
      const res = mode === "login"
        ? await login(email, password)
        : await register(email, password);
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
    setMsg("로그아웃됨");
  }

  return (
    <main style={{ fontFamily: "system-ui", padding: 24, maxWidth: 760, margin: "0 auto" }}>
      <h1>AI Image Studio — Day 2</h1>

      {!token ? (
        <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, maxWidth: 360 }}>
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
          <div style={{ color: msg.startsWith("로그인 성공") || msg.startsWith("회원가입 성공") || msg === "성공!" ? "#0a0" : "#d33" }}>
            {msg}
          </div>
        </form>
      ) : (
        <section style={{ display: "grid", gap: 12 }}>
          <div>
            <strong>저장된 토큰:</strong>
            <pre style={{ background: "#111", color: "#0f0", padding: 8, borderRadius: 6, whiteSpace: "pre-wrap" }}>
              {token}
            </pre>
          </div>

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

          <div>{msg}</div>
          <button onClick={logout} style={{ padding: "10px 14px", width: 120 }}>로그아웃</button>
        </section>
      )}
    </main>
  );
}
