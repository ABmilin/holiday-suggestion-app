import { useState } from "react";
import { fetchHealth, fetchSuggestions } from "./api";
import { MapView } from "./MapView";

function App() {
  const [mood, setMood] = useState("なんか寂しい");
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [healthStatus, setHealthStatus] = useState(null);

  const handleUseCurrentLocation = () => {
    setError("");
    if (!navigator.geolocation) {
      setError("このブラウザでは位置情報が利用できません。");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6));
        setLon(pos.coords.longitude.toFixed(6));
      },
      () => {
        setError("現在地の取得に失敗しました。");
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!lat || !lon) {
      setError("緯度・経度を入力するか「現在地を使う」を押してください。");
      return;
    }

    setLoading(true);
    try {
      const data = await fetchSuggestions({ lat, lon, mood });
      setResult(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleHealthCheck = async () => {
    setHealthStatus(null);
    try {
      const data = await fetchHealth();
      setHealthStatus(data.status);
    } catch (err) {
      console.error(err);
      setHealthStatus("error");
    }
  };

  const temp = result?.weather?.temperature;
  const place = result?.plan?.place;
  const books = result?.books ?? [];

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "24px",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        background: "#f5f5f7"
      }}
    >
      <div
        style={{
          maxWidth: "960px",
          margin: "0 auto",
          background: "#fff",
          borderRadius: "18px",
          padding: "24px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)"
        }}
      >
        <h1 style={{ fontSize: "1.6rem", marginBottom: "0.5rem" }}>
          休日の過ごし方AIコンシェルジュ
        </h1>
        <p style={{ color: "#555", marginBottom: "1.5rem" }}>
          今日の <strong>天気</strong> と <strong>気分</strong>、
          そして <strong>今いる場所</strong> から、
          本・過ごし方・行き先をまとめて提案します。
        </p>

        {/* 入力フォーム */}
        <form onSubmit={handleSubmit} style={{ marginBottom: "1.5rem" }}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.25rem" }}>
              今の気分
            </label>
            <input
              type="text"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              style={{
                width: "100%",
                padding: "0.5rem 0.75rem",
                borderRadius: "8px",
                border: "1px solid #ddd"
              }}
            />
            <small style={{ color: "#777" }}>
              例：「ちょっと疲れてる」「ワクワクしてる」「モヤモヤする」など
            </small>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr auto",
              gap: "0.75rem",
              alignItems: "end",
              marginBottom: "1rem"
            }}
          >
            <div>
              <label style={{ display: "block", marginBottom: "0.25rem" }}>
                緯度 (lat)
              </label>
              <input
                type="number"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                step="0.000001"
                placeholder="35.680959"
                style={{
                  width: "100%",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "8px",
                  border: "1px solid #ddd"
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.25rem" }}>
                経度 (lon)
              </label>
              <input
                type="number"
                value={lon}
                onChange={(e) => setLon(e.target.value)}
                step="0.000001"
                placeholder="139.767306"
                style={{
                  width: "100%",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "8px",
                  border: "1px solid #ddd"
                }}
              />
            </div>
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              style={{
                padding: "0.6rem 0.8rem",
                borderRadius: "999px",
                border: "none",
                cursor: "pointer",
                background: "#eee",
                whiteSpace: "nowrap"
              }}
            >
              現在地を使う
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "0.7rem 1.4rem",
              borderRadius: "999px",
              border: "none",
              cursor: "pointer",
              background: "#007aff",
              color: "#fff",
              fontWeight: 600
            }}
          >
            {loading ? "考え中..." : "おすすめを出してもらう"}
          </button>
        </form>

        {/* エラー表示 */}
        {error && (
          <div
            style={{
              marginBottom: "1rem",
              padding: "0.75rem 1rem",
              borderRadius: "8px",
              background: "#ffeef0",
              color: "#b00020"
            }}
          >
            {error}
          </div>
        )}

        {/* 結果表示 */}
        {result && (
          <div style={{ display: "grid", gap: "1.5rem" }}>
            {/* プラン概要 */}
            <section>
              <h2 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>
                今日のプラン
              </h2>
              <p style={{ whiteSpace: "pre-line" }}>{result.plan.summary}</p>
              {typeof temp === "number" && (
                <p style={{ color: "#555", marginTop: "0.5rem" }}>
                  現在の気温：{temp}℃（推定）
                </p>
              )}
            </section>

            {/* 行き先の候補（テキスト版） */}
            {place && (
              <section>
                <h2 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>
                  行き先の候補
                </h2>
                <p>
                  キーワード：<strong>{place.keyword}</strong>
                </p>
                <p style={{ marginTop: "0.25rem" }}>{place.description}</p>

                {lat && lon ? (
                  <div
                    style={{
                      marginTop: "0.75rem",
                      borderRadius: "12px",
                      overflow: "hidden",
                      border: "1px solid #ddd"
                    }}
                  >
                    <MapView
                      lat={Number(lat)}
                      lon={Number(lon)}
                      keyword={place.keyword}
                    />
                  </div>
                ) : (
                  <p style={{ marginTop: "0.5rem", color: "#777" }}>
                    緯度・経度を入力すると、この下に地図が表示されます。
                  </p>
                )}
              </section>
            )}

            {/* 本のおすすめ */}
            <section>
              <h2 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>
                おすすめの本
              </h2>
              {books.length === 0 && (
                <p>条件に合う本が見つかりませんでした。</p>
              )}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "1rem"
                }}
              >
                {books.map((book) => (
                  <article
                    key={book.id}
                    style={{
                      border: "1px solid #eee",
                      borderRadius: "12px",
                      padding: "0.75rem"
                    }}
                  >
                    {book.thumbnail && (
                      <img
                        src={book.thumbnail}
                        alt={book.title}
                        style={{
                          width: "100%",
                          borderRadius: "8px",
                          marginBottom: "0.5rem",
                          objectFit: "cover",
                          maxHeight: "220px"
                        }}
                      />
                    )}
                    <h3 style={{ fontSize: "0.95rem", marginBottom: "0.25rem" }}>
                      {book.title}
                    </h3>
                    {book.authors?.length > 0 && (
                      <p style={{ fontSize: "0.8rem", color: "#666" }}>
                        {book.authors.join(", ")}
                      </p>
                    )}
                    {book.description && (
                      <p
                        style={{
                          fontSize: "0.8rem",
                          color: "#555",
                          marginTop: "0.4rem"
                        }}
                      >
                        {book.description.slice(0, 80)}
                        {book.description.length > 80 ? "…" : ""}
                      </p>
                    )}
                    {book.infoLink && (
                      <a
                        href={book.infoLink}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: "inline-block",
                          marginTop: "0.4rem",
                          fontSize: "0.8rem",
                          color: "#007aff"
                        }}
                      >
                        くわしく見る
                      </a>
                    )}
                  </article>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* 接続状態のチェック（おまけ） */}
        <div style={{ marginTop: "2rem", fontSize: "0.85rem" }}>
          <button
            type="button"
            onClick={handleHealthCheck}
            style={{
              padding: "0.3rem 0.8rem",
              borderRadius: "999px",
              border: "1px solid #ddd",
              background: "#fafafa",
              cursor: "pointer",
              marginRight: "0.5rem"
            }}
          >
            接続状態を再チェック
          </button>
          {healthStatus && (
            <span>
              バックエンド:{" "}
              <strong
                style={{
                  color: healthStatus === "ok" ? "#0a7c20" : "#b00020"
                }}
              >
                {healthStatus}
              </strong>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;