// client/src/MapView.jsx
import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Leaflet のデフォルトアイコン設定（Vite などでアイコンが消える問題の対策）
const defaultIcon = L.icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

// lat, lon は中心位置
// keyword は「この辺で○○を探そう」の表示用
// selectable = true のときだけ、地図クリックで位置を選べる
// onLocationSelect({ lat, lon }) で親に通知
export function MapView({
  lat,
  lon,
  keyword,
  selectable = false,
  onLocationSelect,
}) {
  const [position, setPosition] = useState(getInitialPosition(lat, lon));

  // 親から lat / lon が変わったら中心も更新
  useEffect(() => {
    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      setPosition([lat, lon]);
    }
  }, [lat, lon]);

  function LocationPicker() {
    useMapEvents({
      click(e) {
        if (!selectable) return;
        const { lat, lng } = e.latlng;
        setPosition([lat, lng]);
        if (onLocationSelect) {
          onLocationSelect({ lat, lon: lng });
        }
      },
    });
    return null;
  }

  return (
    <MapContainer
      center={position}
      zoom={14}
      style={{ height: "260px", width: "100%" }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* クリックで位置選択するためのイベント */}
      <LocationPicker />

      <Marker position={position}>
        <Popup>
          {selectable
            ? "ここを中心にプランを考えます"
            : keyword
            ? `このあたりで「${keyword}」を探してみましょう`
            : "このあたり"}
        </Popup>
      </Marker>
    </MapContainer>
  );
}

function getInitialPosition(lat, lon) {
  if (Number.isFinite(lat) && Number.isFinite(lon)) return [lat, lon];
  // デフォルトは東京駅あたり
  return [35.681236, 139.767125];
}