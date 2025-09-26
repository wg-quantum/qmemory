# QMemory Makefile
# Quantum Memory Analysis Platform

.PHONY: help install dev build start clean test quantum-test setup lint type-check reinstall check-deps install-frontend install-backend frontend backend quantum env-help dev-watch quantum-watch deploy docker-build docker-run stats

help:
	@echo "QMemory 開発用 Makefile"
	@echo ""
	@echo "利用可能なコマンド:"
	@echo "  make setup        - 初回セットアップ"
	@echo "  make install      - 依存関係インストール"
	@echo "  make dev          - フロントエンドとバックエンドを同時に起動"
	@echo "  make frontend     - Next.js フロントエンドのみ起動"
	@echo "  make backend      - Python バックエンドのみ起動"
	@echo "  make build        - フロントエンドの本番ビルド"
	@echo "  make start        - フロントエンド本番サーバー起動"
	@echo "  make test         - テスト一式の実行"
	@echo "  make lint         - ESLint の実行"
	@echo "  make type-check   - TypeScript 型チェック"
	@echo "  make clean        - ビルドキャッシュを削除"
	@echo "  make env-help     - 環境変数設定ガイド"

setup: install
	@if [ -f .env.example ] && [ ! -f .env ]; then \
		echo ".env ファイルを作成します。"; \
		cp .env.example .env; \
		echo "必要に応じて .env の内容を更新してください。"; \
	fi
	@echo "セットアップが完了しました。"

install: check-deps install-frontend install-backend
	@echo "依存関係のインストールが完了しました。"

reinstall:
	@echo "既存の依存関係を削除します。"
	rm -rf frontend/node_modules venv
	@echo "依存関係を再インストールします。"
	@$(MAKE) install

check-deps:
	@if ! command -v npm >/dev/null 2>&1; then \
		echo "npm が見つかりません。Node.js をインストールしてください。"; \
		exit 1; \
	fi
	@if ! command -v python3 >/dev/null 2>&1 && ! command -v python >/dev/null 2>&1; then \
		echo "Python が見つかりません。Python 3.8 以降をインストールしてください。"; \
		exit 1; \
	fi
	@if [ ! -d "frontend/node_modules" ]; then \
		echo "注意: frontend/node_modules が存在しません。make install を実行してください。"; \
	fi
	@if [ ! -d "venv" ]; then \
		echo "注意: venv が存在しません。make install を実行してください。"; \
	fi

install-frontend:
	@echo "Next.js フロントエンドの依存関係をインストールします。"
	npm --prefix frontend install --legacy-peer-deps

install-backend:
	@echo "Python バックエンドの仮想環境を準備します。"
	@if [ ! -d "venv" ]; then \
		echo "仮想環境を作成します。"; \
		python3 -m venv venv; \
	fi
	@echo "pip をアップグレードします。"
	venv/bin/pip install --upgrade pip setuptools wheel
	@echo "FastAPI 依存関係をインストールします。"
	venv/bin/pip install fastapi uvicorn pydantic numpy
	@echo "量子関連ライブラリのインストールを試行します。"
	@venv/bin/pip install qiskit==0.45.0 || echo "Qiskit のインストールに失敗しました。"
	@venv/bin/pip install qiskit-algorithms==0.2.1 || echo "qiskit-algorithms のインストールに失敗しました。"
	@venv/bin/pip install qiskit-ibm-runtime || echo "qiskit-ibm-runtime のインストールに失敗しました。"
	@venv/bin/pip install qiskit-ibm-provider || echo "qiskit-ibm-provider のインストールに失敗しました。"

dev: check-deps
	@echo "フロントエンドとバックエンドを起動します。"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend:  http://localhost:8002"
	@$(MAKE) -j2 frontend backend

frontend: check-deps
	@echo "Next.js フロントエンドを起動します。"
	npm --prefix frontend run dev

backend: check-deps
	@echo "Python バックエンドを起動します。"
	@cd api && ../venv/bin/python -m uvicorn analyze:app --host 0.0.0.0 --port 8002 --reload

build:
	@echo "Next.js フロントエンドをビルドします。"
	npm --prefix frontend run build
	@echo "ビルドが完了しました。"

start: build
	@echo "本番モードでフロントエンドを起動します。"
	npm --prefix frontend start

test:
	@echo "テストを実行します。"
	@$(MAKE) quantum-test
	@$(MAKE) lint
	@$(MAKE) type-check
	@echo "テストが完了しました。"

quantum-test:
	@echo "量子関連テストを実行します。"
	venv/bin/python scripts/test_quantum.py

lint:
	@echo "ESLint を実行します。"
	npm --prefix frontend run lint

type-check:
	@echo "TypeScript 型チェックを実行します。"
	npm --prefix frontend run type-check

clean:
	@echo "ビルドキャッシュおよび一時ファイルを削除します。"
	rm -rf frontend/.next frontend/dist frontend/node_modules/.cache
	@echo "クリーンアップが完了しました。"

quantum:
	@echo "IBM Quantum の設定を確認します。"
	@if [ -z "$$IBM_QUANTUM_TOKEN" ]; then \
		echo "IBM_QUANTUM_TOKEN が設定されていません。"; \
		echo "https://quantum-computing.ibm.com/ からトークンを取得してください。"; \
	fi
	@USE_REAL_QUANTUM=true $(MAKE) dev

env-help:
	@echo "必要な環境変数:"
	@echo "  IBM_QUANTUM_TOKEN  - IBM Quantum の API トークン"
	@echo "  USE_REAL_QUANTUM   - 実機を利用する場合は true"
	@echo "  GEMINI_API_KEY     - Google Gemini の API キー"
	@echo "設定手順:"
	@echo "  1. .env.example を .env にコピー"
	@echo "  2. 必要なトークンや鍵を記入"
	@echo "  3. make dev または make quantum を実行"

dev-watch:
	@echo "フロントエンド・バックエンド・量子テストを同時監視します。"
	@$(MAKE) -j3 frontend backend quantum-watch

quantum-watch:
	@echo "量子関連ファイルを監視します。"
	@while true; do \
		inotifywait -e modify api/quantum_engine.py api/models.py 2>/dev/null && \
		echo "量子ファイルの変更を検知しました。テストを再実行します。" && \
		$(MAKE) quantum-test; \
	done

deploy: build
	@echo "ビルド済みフロントエンドのデプロイ準備が整いました。"

docker-build:
	@echo "Docker イメージをビルドします。"
	docker build -t qmemory .

docker-run:
	@echo "Docker コンテナを起動します。"
	docker run -p 3000:3000 -p 8000:8000 qmemory

stats:
	@echo "フロントエンドとバックエンドのファイル数を集計します。"
	@echo "Frontend files (TypeScript/JavaScript):"
	@find frontend/src -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | wc -l
	@echo "Backend files (Python):"
	@find api -name "*.py" | wc -l
	@echo "Total lines of code:"
	@find frontend/src api -name "*.ts" -o -name "*.tsx" -o -name "*.py" | xargs wc -l | tail -1
