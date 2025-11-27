const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/api/health`);
  if (!res.ok) {
    throw new Error("バックエンドへの接続に失敗しました");
  }
  return res.json();
}

export async function fetchSuggestions({ lat, lon, mood }) {
  const params = new URLSearchParams({ lat, lon, mood });
  const res = await fetch(`${API_BASE}/api/suggestions?` + params.toString());
  if (!res.ok) {
    throw new Error("おすすめ取得に失敗しました");
  }
  return res.json();
}