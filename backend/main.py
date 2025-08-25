from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import numpy as np
from datetime import datetime
import time

from quantum_engine import QuantumMemoryEngine
from models import MemoryAnalysisRequest, QuantumResult, Location, SecondaryLocation, QuantumState

app = FastAPI(
    title="Quantum Memory Recall API",
    description="量子コンピュータを利用した記憶分析・位置推定システム",
    version="1.0.0"
)

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 量子エンジンの初期化
quantum_engine = QuantumMemoryEngine()

@app.get("/")
async def root():
    return {
        "message": "Quantum Memory Recall API",
        "version": "1.0.0",
        "status": "operational",
        "quantum_backend": quantum_engine.get_backend_info()
    }

@app.post("/api/quantum/analyze", response_model=QuantumResult)
async def analyze_memory(request: MemoryAnalysisRequest):
    """
    記憶の断片と感情から量子的に場所を推定
    """
    try:
        start_time = time.time()
        
        # 量子分析の実行
        result = await quantum_engine.analyze_memory(
            memory_text=request.memory,
            emotion=request.emotion
        )
        
        analysis_time = int((time.time() - start_time) * 1000)
        result.analysis_time = analysis_time
        
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"量子分析エラー: {str(e)}"
        )

@app.get("/api/quantum/state")
async def get_quantum_state():
    """
    現在の量子システムの状態を取得
    """
    return {
        "backend": quantum_engine.get_backend_info(),
        "coherence_time": quantum_engine.get_coherence_time(),
        "entanglement_pairs": quantum_engine.get_entanglement_pairs(),
        "active_qubits": quantum_engine.get_active_qubits(),
        "last_measurement": quantum_engine.get_last_measurement_time()
    }

@app.post("/api/memory/save")
async def save_memory(memory_data: dict):
    """
    分析結果を保存
    """
    # TODO: データベースへの保存実装
    return {
        "status": "saved",
        "timestamp": datetime.now().isoformat(),
        "memory_id": f"mem_{int(time.time())}"
    }

@app.get("/api/locations/coordinates/{location_name}")
async def get_location_coordinates(location_name: str):
    """
    場所名から座標を取得
    """
    coordinates = quantum_engine.get_location_coordinates(location_name)
    if coordinates:
        return coordinates
    else:
        raise HTTPException(
            status_code=404,
            detail=f"場所 '{location_name}' の座標が見つかりません"
        )

@app.get("/health")
async def health_check():
    """
    ヘルスチェックエンドポイント
    """
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "quantum_system": "operational"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8010,
        reload=True,
        log_level="info"
    )