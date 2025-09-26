# 🚀 Quantum Memory API Routes

## 📍 基本分析エンドポイント

### 標準量子分析
```
POST /api/quantum/analyze
```
- 基本的な量子記憶分析
- 記憶テキストと感情から場所を推定

### AI強化量子分析
```
POST /api/quantum/analyze-advanced  
```
- VQE + AI統合 + 誤り訂正付き
- セマンティック埋め込み + 神経量子状態
- 量子マップ可視化データ付き

---

## 🗺️ 量子マップ可視化エンドポイント

### 量子確率ヒートマップ
```
GET /api/quantum/maps/heatmap/{center_lat}/{center_lng}
```
- **例**: `/api/quantum/maps/heatmap/35.3197/139.5464`
- 50x50グリッド高解像度ヒートマップ
- 量子確率分布とコヒーレンス場

### 量子コヒーレンス場
```
GET /api/quantum/maps/coherence/{center_lat}/{center_lng}
```
- **例**: `/api/quantum/maps/coherence/35.3197/139.5464`
- コヒーレンス強度場の可視化
- 量子状態純粋度マッピング

### 量子もつれネットワーク
```
GET /api/quantum/maps/network/{center_lat}/{center_lng}
```
- **例**: `/api/quantum/maps/network/35.3197/139.5464`
- エンタングルメントエッジ可視化
- 量子相関ネットワーク表示

### 3D量子状態可視化
```
GET /api/quantum/maps/quantum3d/{center_lat}/{center_lng}
```
- **例**: `/api/quantum/maps/quantum3d/35.3197/139.5464`
- Blochベクトル3D表示
- 量子状態球面投影

---

## 🔍 検索・分析エンドポイント

### 記憶ID別分析取得
```
GET /api/quantum/analysis/memory/{memory_id}
```
- **例**: `/api/quantum/analysis/memory/mem_1234567890`
- 過去の分析結果取得
- タイムスタンプ付き履歴

### 場所名検索
```
GET /api/quantum/locations/search/{location_name}
```
- **例**: `/api/quantum/locations/search/鎌倉`
- 部分一致による場所検索
- キーワード・感情共鳴データ付き

### 感情量子状態分析
```
GET /api/quantum/emotions/analysis/{emotion_type}
```
- **例**: `/api/quantum/emotions/analysis/nostalgic`
- 感情タイプ別量子特性
- 互換性のある場所リスト

### 場所座標取得
```
GET /api/locations/coordinates/{location_name}
```
- **例**: `/api/locations/coordinates/鎌倉の静かな石段寺`
- 場所名から座標データ取得

---

## 📊 システム情報エンドポイント

### 量子システム統計
```
GET /api/quantum/statistics/overview
```
- システム稼働状況
- キャッシュ統計
- 量子バックエンド情報
- 高度機能有効状況

### 量子状態監視
```
GET /api/quantum/state
```
- リアルタイム量子システム状態
- コヒーレンス時間
- アクティブqubit数
- 最終測定時刻

### ネットワーク解析
```
GET /api/quantum/network-analysis
```
- 量子もつれネットワーク統計
- エッジ強度分析
- ネットワークトポロジー

---

## 🏥 ヘルスチェック

### システムヘルス
```
GET /health
```
- システム稼働確認
- Qiskit可用性
- 高度機能ステータス

### ルート情報
```
GET /
```
- API基本情報
- バージョン情報
- 量子バックエンド状況

---

## 📝 リクエスト例

### 記憶分析 (POST)
```json
{
  "memory": "古い神社の石段を歩いている",
  "emotion": "nostalgic",
  "timestamp": "2024-12-25T10:30:00Z"
}
```

### レスポンス例
```json
{
  "primary_location": {
    "name": "鎌倉の静かな石段寺",
    "coordinates": {"lat": 35.3197, "lng": 139.5464},
    "probability": 0.89
  },
  "quantum_state": {
    "coherence": 0.85,
    "entanglement": 0.72,
    "superposition": 0.91
  },
  "quantum_map": {
    "type": "probability",
    "heatmap": {...},
    "quantum_points": [...]
  },
  "advanced_features": {
    "ai_enhanced": true,
    "error_correction": true,
    "vqe_optimization": true
  }
}
```

---

## 🎯 フロントエンド統合

### React Router設定例
```tsx
// 各画面のURL設定
/quantum/analyze          → 基本分析画面
/quantum/analyze-advanced → AI強化分析画面
/quantum/maps/heatmap     → ヒートマップ画面
/quantum/maps/network     → ネットワーク画面
/quantum/maps/3d          → 3D可視化画面
/quantum/search           → 場所・感情検索画面
/quantum/statistics       → システム統計画面
```

これで各画面が明確なURLを持ち、RESTful APIとして整理されました。