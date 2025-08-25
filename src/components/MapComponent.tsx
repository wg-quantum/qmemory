'use client'

import { useEffect, useRef } from 'react'
import { Location } from '@/types/quantum'

interface MapComponentProps {
  location: Location
}

export default function MapComponent({ location }: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)

  useEffect(() => {
    if (!mapRef.current || typeof window === 'undefined') return

    // Leafletを動的にインポート
    const initMap = async () => {
      const L = (await import('leaflet')).default

      // 既存のマップがあれば削除
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
      }

      // 新しいマップを作成
      mapInstanceRef.current = L.map(mapRef.current!).setView(
        [location.coordinates.lat, location.coordinates.lng], 
        15
      )

      // OpenStreetMapタイルレイヤーを追加
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(mapInstanceRef.current)

      // カスタムマーカーアイコンを作成
      const customIcon = L.divIcon({
        html: `
          <div style="
            background: linear-gradient(135deg, #60a5fa, #a78bfa);
            width: 30px;
            height: 30px;
            border-radius: 50% 50% 50% 0;
            border: 3px solid white;
            transform: rotate(-45deg);
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
          ">
            <div style="
              width: 12px;
              height: 12px;
              background: white;
              border-radius: 50%;
              position: absolute;
              top: 6px;
              left: 6px;
            "></div>
          </div>
        `,
        className: 'custom-marker',
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30]
      })

      // マーカーを追加
      const marker = L.marker(
        [location.coordinates.lat, location.coordinates.lng],
        { icon: customIcon }
      ).addTo(mapInstanceRef.current)

      // ポップアップを追加
      marker.bindPopup(`
        <div style="
          font-family: 'Inter', sans-serif;
          padding: 8px;
          max-width: 200px;
        ">
          <strong style="color: #1e293b; font-size: 16px;">
            ${location.name}
          </strong><br>
          <span style="color: #64748b; font-size: 14px;">
            観測された記憶の場所
          </span>
        </div>
      `).openPopup()

      // マップサイズを調整
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize()
      }, 100)
    }

    initMap()

    // クリーンアップ
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [location])

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div 
        ref={mapRef}
        className="w-full h-80 rounded-2xl border border-slate-600/30 overflow-hidden shadow-xl"
        style={{ zIndex: 1 }}
      />
      <div className="text-center mt-4 text-sm text-slate-400">
        {location.name} - 確率: {location.probability}%
      </div>
    </div>
  )
}