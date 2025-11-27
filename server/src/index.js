const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();
const { classifyWeather, buildPlan } = require("./engine");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// ヘルスチェック
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/suggestions", async (req, res) => {
  try {
    const { lat, lon, mood = "" } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ error: "lat と lon は必須です" });
    }

    // 1. 天気情報取得（Open-Meteo）
    const weatherUrl = "https://api.open-meteo.com/v1/forecast";
    const weatherResp = await axios.get(weatherUrl, {
      params: {
        latitude: lat,
        longitude: lon,
        hourly: "temperature_2m,precipitation",
        current_weather: true,
        timezone: "auto"
      }
    });

    const { current_weather, hourly } = weatherResp.data;

    const currentWeather = {
      temperature: current_weather?.temperature ?? null,
      weatherCode: current_weather?.weathercode ?? null,
      precipitation: hourly?.precipitation?.[0] ?? 0
    };

    const weatherTag = classifyWeather(currentWeather);

    // 2. プラン生成
    const plan = buildPlan(mood, weatherTag, currentWeather);

    // 3. 本のデータ取得（Google Books API）
    const booksResp = await axios.get(
      "https://www.googleapis.com/books/v1/volumes",
      {
        params: {
          q: plan.bookQuery,
          maxResults: 6,
          langRestrict: "ja",
          key: process.env.GOOGLE_BOOKS_API_KEY || undefined
        }
      }
    );

    const books =
      booksResp.data.items?.map((item) => {
        const info = item.volumeInfo || {};
        return {
          id: item.id,
          title: info.title,
          authors: info.authors || [],
          description: info.description,
          thumbnail: info.imageLinks?.thumbnail,
          infoLink: info.infoLink
        };
      }) ?? [];

    res.json({
      weather: {
        ...currentWeather,
        weatherTag
      },
      mood,
      plan,
      books
    });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "サジェスト取得中にエラーが発生しました" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});