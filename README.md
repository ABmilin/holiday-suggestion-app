# 休日の過ごし方AIコンシェルジュ

天気・気分・現在地から、

- その日の過ごし方（カフェ / 公園 など）
- おすすめの本（Google Books API）
- 周辺マップ（OpenStreetMap + Leaflet）

を提案してくれる Web アプリです。

## 技術スタック

- フロントエンド: React + Vite
- バックエンド: Node.js + Express
- 天気API: Open-Meteo
- 本API: Google Books API
- 地図: OpenStreetMap + React-Leaflet

## セットアップ

### 1. バックエンド (server)

```bash
cd server
npm install

# .env を作成
# (必要に応じて Google Books の API キーをセットする)
echo "PORT=4000" > .env
echo "GOOGLE_BOOKS_API_KEY=" >> .env

npm run dev