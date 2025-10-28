import React, { useEffect, useState } from "react";

export default function App() {
  const [text, setText] = useState("loading...");

  useEffect(() => {
    fetch("http://localhost:8080/api/health")
      .then(r => r.json())
      .then(d => setText(JSON.stringify(d, null, 2)))
      .catch(e => setText("error: " + (e?.message ?? "unknown")));
  }, []);

  return (
    <main style={{fontFamily:"system-ui", padding:24, maxWidth:760, margin:"0 auto"}}>
      <h1>AI Image Studio — Day 1</h1>
      <p>백엔드 /api/health 호출 결과:</p>
      <pre style={{background:"#111", color:"#0f0", padding:12, borderRadius:8}}>{text}</pre>
    </main>
  );
}
