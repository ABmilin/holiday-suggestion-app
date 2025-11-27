// 気分＋天気から「本のキーワード」「過ごし方」「場所検索キーワード」を決める簡易ロジック

function classifyWeather(currentWeather) {
  const { temperature, precipitation, weatherCode } = currentWeather;

  if (precipitation > 0.5) return "rainy";
  if (weatherCode >= 80) return "rainy";
  if (weatherCode >= 70) return "snowy";
  if (temperature >= 28) return "hot";
  if (temperature <= 5) return "cold";
  return "clear";
}

function buildBookQuery(mood, weatherTag) {
  if (weatherTag === "rainy") {
    if (mood.includes("さみ") || mood.includes("落ち")) {
      return "日本 小説 ヒューマンドラマ 心あたたまる";
    }
    return "日本 ミステリー 雨";
  }

  if (weatherTag === "clear" || weatherTag === "hot") {
    if (mood.includes("ワクワク") || mood.includes("楽")) {
      return "青春 小説 旅 友情";
    }
    return "エッセイ 散歩 日常";
  }

  if (weatherTag === "cold") {
    return "日本 小説 心が温まる 冬";
  }

  return "小説";
}

function buildPlaceSuggestion(mood, weatherTag) {
  if (weatherTag === "rainy") {
    return {
      type: "indoor",
      keyword: "カフェ",
      label: "ゆっくり読書できるカフェ",
      description: "雨の日なので、静かなカフェで温かい飲み物を飲みながら読書するプランです。"
    };
  }

  if (weatherTag === "cold") {
    return {
      type: "indoor",
      keyword: "図書館",
      label: "図書館や本屋",
      description: "寒い日は、図書館や本屋でゆっくり本を探しながら過ごすのがおすすめです。"
    };
  }

  if (weatherTag === "hot") {
    return {
      type: "indoor",
      keyword: "水族館",
      label: "水族館やショッピングモール",
      description: "暑い日は屋内の水族館やショッピングモールで涼みながら本や雑貨を見るのも良いですね。"
    };
  }

  if (
    mood.includes("スッキリ") ||
    mood.includes("リフレッシュ") ||
    mood.includes("モヤモヤ")
  ) {
    return {
      type: "outdoor",
      keyword: "公園",
      label: "近くの公園",
      description: "公園を散歩しながら、ベンチで読書するようなゆるい過ごし方はいかがでしょう。"
    };
  }

  return {
    type: "flex",
    keyword: "カフェ",
    label: "カフェや公園",
    description: "気分に合わせて、カフェでゆっくりするか、公園を軽く散歩してみるプランです。"
  };
}

function buildPlan(mood, weatherTag, currentWeather) {
  const bookQuery = buildBookQuery(mood, weatherTag);
  const place = buildPlaceSuggestion(mood, weatherTag);

  const summary = `今日は「${weatherTag}」な天気。気分は「${mood}」ですね。
おすすめは「${place.label}」で、${place.description}`;

  return {
    weatherTag,
    bookQuery,
    place,
    summary
  };
}

module.exports = {
  classifyWeather,
  buildPlan
};