# QMemory - 量子記憶再構成システム

## 概要

QMemoryは、量子コンピューティングの概念を活用した革新的な記憶解析システムです。曖昧な記憶の断片から、量子重ね合わせとエンタングルメントの原理を用いて、最も可能性の高い場所を推定します。

## 特徴

- 🎯 量子重ね合わせによる記憶の並列処理
- 🌐 多言語対応（日本語メイン）
- 📱 レスポンシブデザイン
- ⚡ Next.js 15を使用したモダンな実装
- 🎨 美しいアニメーションとパーティクル背景

## Vercelデプロイガイド

### 1. 環境変数の設定

Vercelダッシュボードで以下の環境変数を設定してください：

```bash
# 必須環境変数
NODE_ENV=production
NEXT_PUBLIC_APP_NAME=QMemory - 量子記憶再構成
NEXT_PUBLIC_APP_VERSION=2.0.0

# オプション - Gemini API使用時
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash-latest

# オプション - カスタムバックエンド使用時
BACKEND_URL=https://your-backend-url.com
```

### 2. デプロイ設定

- **フレームワーク**: Next.js
- **ビルドコマンド**: `npm run build`
- **出力ディレクトリ**: `.next`
- **Node.js バージョン**: 18.x

### 3. 自動デプロイ

このリポジトリをVercelにインポートすると、自動的にデプロイが開始されます。

## 開発環境

### セットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 本番環境プレビュー
npm run start
```

### 環境変数設定

`.env.local`ファイルを作成し、以下を設定：

```bash
# 開発環境用設定
GEMINI_API_KEY=your_development_api_key
BACKEND_URL=http://localhost:8010
```

## 技術スタック

- **フロントエンド**: Next.js 15, React 18
- **スタイリング**: Tailwind CSS
- **アニメーション**: Framer Motion  
- **アイコン**: Lucide React
- **画像処理**: Next/Image
- **マップ**: Leaflet
- **型定義**: TypeScript

## API エンドポイント

### `/api/gemini/analyze-memory`
記憶の断片を解析し、場所の候補を返します。

**パラメータ**:
- `memory`: 記憶の断片（文字列）
- `emotion`: 感情の種類
- `timestamp`: リクエストタイムスタンプ

## エラーハンドリング

### 本番環境での対応

- カスタム404ページ
- グローバルエラーハンドリング
- APIエラーのフォールバック機能
- 入力値のサニタイゼーション
- タイムアウト処理

### エラー画面

- `/not-found`: 404エラーページ
- `/error`: 一般的なエラーページ  
- `/global-error`: システムレベルエラーページ

## パフォーマンス最適化

- 画像最適化（Next/Image使用）
- 静的アセットのキャッシング
- APIレスポンスのキャッシング設定
- 遅延読み込み対応

## セキュリティ

- 入力値の検証とサニタイゼーション
- XSSおよびCSRF対策
- 環境変数での秘匿情報管理
- HTTPSによる通信暗号化

## トラブルシューティング

### デプロイエラー

1. **ビルドエラー**: TypeScriptエラーをチェック
2. **環境変数エラー**: Vercelダッシュボードで設定確認
3. **画像読み込みエラー**: public/imagesディレクトリの確認

### 実行時エラー

1. **APIエラー**: ネットワーク接続とエンドポイント確認
2. **記憶解析エラー**: フォールバック機能が動作
3. **地図表示エラー**: 座標データの確認

## ライセンス

MIT License

## サポート

問題が発生した場合は、Issueを作成してください。