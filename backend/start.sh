#!/bin/bash

echo "🌌 Starting Quantum Memory Recall Backend..."

# Python環境確認
echo "Checking Python environment..."
python --version

# 依存関係インストール確認
echo "Installing dependencies..."
pip install -r requirements.txt

# 環境変数読み込み
if [ -f .env ]; then
    echo "Loading environment variables..."
    export $(cat .env | xargs)
fi

# サーバー起動
echo "Starting FastAPI server..."
uvicorn main:app --reload --host 0.0.0.0 --port 8010