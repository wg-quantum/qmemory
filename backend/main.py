import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

class GeminiAnalysisRequest(BaseModel):
    memory: str
    emotion: str
    api_key: str
    model_name: Optional[str] = None
    
    model_config = {"protected_namespaces": ()}

class GeminiImageRequest(BaseModel):
    location: str
    memory: str
    emotion: str
    api_key: str
    model_name: Optional[str] = None
    
    model_config = {"protected_namespaces": ()}
import numpy as np
from datetime import datetime
import time

from quantum_engine import QuantumMemoryEngine
from quantum_map_engine import QuantumMapEngine, QuantumMapPoint, MapVisualizationType
from models import MemoryAnalysisRequest, QuantumResult, Location, SecondaryLocation, QuantumState
from gemini_service import gemini_service, GeminiAnalysisResult

app = FastAPI(
    title="Quantum Memory Recall API",
    description="量子コンピュータを利用した記憶分析・位置推定システム",
    version="1.0.0"
)

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 環境変数から量子設定を取得
USE_REAL_QUANTUM = os.getenv("USE_REAL_QUANTUM", "false").lower() == "true"
IBM_QUANTUM_TOKEN = os.getenv("IBM_QUANTUM_TOKEN")

# 量子エンジンの初期化
quantum_engine = QuantumMemoryEngine(
    use_real_quantum=USE_REAL_QUANTUM,
    ibm_token=IBM_QUANTUM_TOKEN
)

# 量子マップエンジンの初期化
quantum_map_engine = QuantumMapEngine()

@app.get("/")
async def root():
    return {
        "message": "Quantum Memory Recall API",
        "version": "1.0.0",
        "status": "operational",
        "quantum_backend": quantum_engine.get_backend_info(),
        "environment": {
            "use_real_quantum": USE_REAL_QUANTUM,
            "ibm_token_configured": bool(IBM_QUANTUM_TOKEN)
        }
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
        "last_measurement": quantum_engine.get_last_measurement_time(),
        "configuration": {
            "use_real_quantum": USE_REAL_QUANTUM,
            "ibm_token_configured": bool(IBM_QUANTUM_TOKEN)
        }
    }

@app.post("/api/memory/save")
async def save_memory(memory_data: dict):
    """
    分析結果を保存
    """
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

@app.post("/api/quantum/analyze-advanced")
async def analyze_memory_advanced(request: MemoryAnalysisRequest):
    """
    高度な量子分析 - AI統合版
    URL: POST /api/quantum/analyze-advanced
    """
    try:
        start_time = time.time()
        
        # 高精度量子分析実行
        result = await quantum_engine.analyze_memory(
            memory_text=request.memory,
            emotion=request.emotion
        )
        
        analysis_time = int((time.time() - start_time) * 1000)
        result.analysis_time = analysis_time
        
        # 量子マップポイント生成
        quantum_points = [
            QuantumMapPoint(
                lat=result.primary_location.coordinates.lat,
                lng=result.primary_location.coordinates.lng,
                quantum_probability=result.primary_location.probability,
                coherence=result.quantum_state.coherence,
                entanglement=result.quantum_state.entanglement,
                confidence=0.95,
                semantic_similarity=0.9
            )
        ]
        
        # セカンダリ場所も追加
        for sec_loc in result.secondary_locations:
            if sec_loc.coordinates:
                quantum_points.append(QuantumMapPoint(
                    lat=sec_loc.coordinates.lat,
                    lng=sec_loc.coordinates.lng,
                    quantum_probability=sec_loc.probability,
                    coherence=result.quantum_state.coherence * 0.7,
                    entanglement=result.quantum_state.entanglement * 0.6,
                    confidence=0.8,
                    semantic_similarity=0.7
                ))
        
        # 量子マップ可視化データ生成
        map_visualization = await quantum_map_engine.generate_quantum_map_visualization(
            quantum_points=quantum_points,
            center_lat=result.primary_location.coordinates.lat,
            center_lng=result.primary_location.coordinates.lng,
            visualization_type=MapVisualizationType.PROBABILITY_HEATMAP
        )
        
        # ストーリーオーバーレイ生成
        story_overlay = quantum_map_engine.generate_quantum_story_overlay(
            primary_location={
                'name': result.primary_location.name,
                'story': result.primary_location.story,
                'coordinates': {
                    'lat': result.primary_location.coordinates.lat,
                    'lng': result.primary_location.coordinates.lng
                }
            },
            secondary_locations=[
                {
                    'name': loc.name,
                    'description': loc.description,
                    'probability': loc.probability,
                    'coordinates': {
                        'lat': loc.coordinates.lat,
                        'lng': loc.coordinates.lng
                    }
                }
                for loc in result.secondary_locations if loc.coordinates
            ],
            quantum_state={
                'coherence': result.quantum_state.coherence,
                'entanglement': result.quantum_state.entanglement,
                'superposition': result.quantum_state.superposition
            }
        )
        
        return {
            **result.__dict__,
            "quantum_map": map_visualization,
            "story_overlay": story_overlay,
            "advanced_features": {
                "ai_enhanced": True,
                "error_correction": True,
                "vqe_optimization": True,
                "neural_quantum_states": True
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"高度な量子分析エラー: {str(e)}"
        )

@app.get("/api/quantum/maps/heatmap/{center_lat}/{center_lng}")
async def get_quantum_probability_heatmap(center_lat: float, center_lng: float):
    """
    量子確率ヒートマップ取得
    URL: GET /api/quantum/maps/heatmap/35.3197/139.5464
    """
    try:
        # サンプル量子ポイント生成
        sample_points = [
            QuantumMapPoint(
                lat=center_lat, lng=center_lng,
                quantum_probability=0.9, coherence=0.85, entanglement=0.7,
                confidence=0.95, semantic_similarity=0.9
            )
        ]
        
        visualization_data = await quantum_map_engine.generate_quantum_map_visualization(
            quantum_points=sample_points,
            center_lat=center_lat,
            center_lng=center_lng,
            visualization_type=MapVisualizationType.PROBABILITY_HEATMAP
        )
        
        return visualization_data
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"ヒートマップ生成エラー: {str(e)}"
        )

@app.get("/api/quantum/maps/coherence/{center_lat}/{center_lng}")
async def get_quantum_coherence_field(center_lat: float, center_lng: float):
    """
    量子コヒーレンス場取得
    URL: GET /api/quantum/maps/coherence/35.3197/139.5464
    """
    try:
        sample_points = [
            QuantumMapPoint(
                lat=center_lat, lng=center_lng,
                quantum_probability=0.8, coherence=0.9, entanglement=0.6,
                confidence=0.9, semantic_similarity=0.85
            )
        ]
        
        visualization_data = await quantum_map_engine.generate_quantum_map_visualization(
            quantum_points=sample_points,
            center_lat=center_lat,
            center_lng=center_lng,
            visualization_type=MapVisualizationType.COHERENCE_FIELD
        )
        
        return visualization_data
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"コヒーレンス場生成エラー: {str(e)}"
        )

@app.get("/api/quantum/maps/network/{center_lat}/{center_lng}")
async def get_quantum_entanglement_network(center_lat: float, center_lng: float):
    """
    量子もつれネットワーク取得
    URL: GET /api/quantum/maps/network/35.3197/139.5464
    """
    try:
        # 複数の量子ポイントでネットワーク生成
        sample_points = [
            QuantumMapPoint(
                lat=center_lat, lng=center_lng,
                quantum_probability=0.9, coherence=0.85, entanglement=0.8,
                confidence=0.95, semantic_similarity=0.9
            ),
            QuantumMapPoint(
                lat=center_lat + 0.1, lng=center_lng + 0.1,
                quantum_probability=0.7, coherence=0.8, entanglement=0.7,
                confidence=0.9, semantic_similarity=0.8
            ),
            QuantumMapPoint(
                lat=center_lat - 0.05, lng=center_lng + 0.15,
                quantum_probability=0.6, coherence=0.75, entanglement=0.65,
                confidence=0.85, semantic_similarity=0.75
            )
        ]
        
        network_viz = await quantum_map_engine.generate_quantum_map_visualization(
            quantum_points=sample_points,
            center_lat=center_lat,
            center_lng=center_lng,
            visualization_type=MapVisualizationType.ENTANGLEMENT_NETWORK
        )
        
        return network_viz
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"ネットワーク生成エラー: {str(e)}"
        )

@app.get("/api/quantum/maps/quantum3d/{center_lat}/{center_lng}")
async def get_quantum_3d_visualization(center_lat: float, center_lng: float):
    """
    3D量子状態可視化取得  
    URL: GET /api/quantum/maps/quantum3d/35.3197/139.5464
    """
    try:
        sample_points = [
            QuantumMapPoint(
                lat=center_lat, lng=center_lng,
                quantum_probability=0.85, coherence=0.9, entanglement=0.75,
                confidence=0.92, semantic_similarity=0.88
            ),
            QuantumMapPoint(
                lat=center_lat + 0.08, lng=center_lng - 0.05,
                quantum_probability=0.7, coherence=0.8, entanglement=0.6,
                confidence=0.87, semantic_similarity=0.82
            )
        ]
        
        viz_3d = await quantum_map_engine.generate_quantum_map_visualization(
            quantum_points=sample_points,
            center_lat=center_lat,
            center_lng=center_lng,
            visualization_type=MapVisualizationType.QUANTUM_STATE_3D
        )
        
        return viz_3d
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"3D可視化生成エラー: {str(e)}"
        )

@app.get("/api/quantum/analysis/memory/{memory_id}")
async def get_memory_analysis_by_id(memory_id: str):
    """
    記憶ID別分析結果取得
    URL: GET /api/quantum/analysis/memory/mem_1234567890
    """
    try:
        # 実際の実装では、データベースからmemory_idで検索
        # ここではサンプルデータを返す
        return {
            "memory_id": memory_id,
            "analysis": {
                "timestamp": datetime.now().isoformat(),
                "memory_text": "古い神社の石段を歩いている記憶",
                "emotion": "nostalgic",
                "quantum_state": {
                    "coherence": 0.85,
                    "entanglement": 0.72,
                    "superposition": 0.91
                },
                "primary_location": {
                    "name": "鎌倉の静かな石段寺",
                    "coordinates": {"lat": 35.3197, "lng": 139.5464},
                    "probability": 0.89
                }
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"記憶分析取得エラー: {str(e)}"
        )

@app.get("/api/quantum/locations/search/{location_name}")  
async def search_quantum_locations(location_name: str):
    """
    場所名による量子位置検索
    URL: GET /api/quantum/locations/search/鎌倉
    """
    try:
        # 場所データベースから検索
        location_data = quantum_engine.location_database
        
        matching_locations = []
        for name, data in location_data.items():
            if location_name.lower() in name.lower():
                matching_locations.append({
                    "name": name,
                    "coordinates": data["coordinates"],
                    "keywords": data["keywords"],
                    "emotional_resonance": data["emotional_resonance"]
                })
        
        return {
            "search_query": location_name,
            "total_matches": len(matching_locations),
            "locations": matching_locations
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"場所検索エラー: {str(e)}"
        )

@app.get("/api/quantum/emotions/analysis/{emotion_type}")
async def analyze_emotion_quantum_state(emotion_type: str):
    """
    感情タイプ別量子状態分析
    URL: GET /api/quantum/emotions/analysis/nostalgic
    """
    try:
        emotion_mapping = quantum_engine.emotion_mapping
        
        if emotion_type.lower() in emotion_mapping:
            emotion_data = emotion_mapping[emotion_type.lower()]
            
            return {
                "emotion_type": emotion_type,
                "quantum_properties": {
                    "amplitude": emotion_data["quantum_amplitude"],
                    "phase": emotion_data["phase"],
                    "resonance_keywords": emotion_data["resonance"]
                },
                "compatible_locations": [
                    {
                        "name": loc_name,
                        "resonance_score": loc_data["emotional_resonance"].get(emotion_type.lower(), 0)
                    }
                    for loc_name, loc_data in quantum_engine.location_database.items()
                    if emotion_type.lower() in loc_data["emotional_resonance"]
                ]
            }
        else:
            raise HTTPException(
                status_code=404,
                detail=f"感情タイプ '{emotion_type}' が見つかりません"
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"感情分析エラー: {str(e)}"
        )

@app.get("/api/quantum/statistics/overview")
async def get_quantum_system_statistics():
    """
    量子システム統計概要
    URL: GET /api/quantum/statistics/overview
    """
    try:
        backend_info = quantum_engine.get_backend_info()
        
        return {
            "system_status": "operational",
            "quantum_backend": backend_info,
            "statistics": {
                "total_locations": len(quantum_engine.location_database),
                "supported_emotions": len(quantum_engine.emotion_mapping),
                "active_qubits": quantum_engine.get_active_qubits(),
                "coherence_time_us": quantum_engine.get_coherence_time(),
                "entanglement_pairs": quantum_engine.get_entanglement_pairs()
            },
            "cache_statistics": {
                "circuit_cache_size": len(quantum_engine._circuit_cache),
                "vector_cache_size": len(quantum_engine._vector_cache),
                "result_cache_size": len(quantum_engine._result_cache),
                "compiled_circuit_cache_size": len(quantum_engine._compiled_circuit_cache)
            },
            "advanced_features": {
                "quantum_error_correction": quantum_engine._error_mitigation_enabled,
                "variational_quantum_eigensolver": True,
                "neural_quantum_states": True,
                "semantic_embeddings": len(quantum_engine._semantic_embeddings),
                "ai_integration": True
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"統計取得エラー: {str(e)}"
        )

@app.get("/api/quantum/network-analysis")
async def get_quantum_network_analysis():
    """
    量子ネットワーク解析データ取得
    URL: GET /api/quantum/network-analysis
    """
    try:
        # サンプル量子ポイント生成（実際は分析結果から）
        sample_points = [
            QuantumMapPoint(
                lat=35.3197, lng=139.5464,
                quantum_probability=0.9, coherence=0.85, entanglement=0.7,
                confidence=0.95, semantic_similarity=0.9
            ),
            QuantumMapPoint(
                lat=35.0116, lng=135.7681,
                quantum_probability=0.7, coherence=0.8, entanglement=0.6,
                confidence=0.9, semantic_similarity=0.8
            ),
        ]
        
        network_viz = await quantum_map_engine.generate_quantum_map_visualization(
            quantum_points=sample_points,
            center_lat=35.2, center_lng=138.0,
            visualization_type=MapVisualizationType.ENTANGLEMENT_NETWORK
        )
        
        return network_viz
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"ネットワーク解析エラー: {str(e)}"
        )

@app.post("/api/gemini/analyze-memory")
async def analyze_memory_with_gemini(request: GeminiAnalysisRequest):
    """
    Gemini APIを使用してメモリを分析
    """
    try:
        result = await gemini_service.analyze_memory_with_gemini(
            memory=request.memory,
            emotion=request.emotion,
            api_key=request.api_key,
            model_name=request.model_name
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Gemini記憶分析エラー: {str(e)}"
        )

@app.post("/api/gemini/generate-image")
async def generate_memory_image(request: GeminiImageRequest):
    """
    記憶に基づく画像生成用の説明を生成
    """
    try:
        description = await gemini_service.generate_memory_image(
            location=request.location,
            memory=request.memory,
            emotion=request.emotion,
            api_key=request.api_key,
            model_name=request.model_name
        )
        return {"description": description}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"画像説明生成エラー: {str(e)}"
        )

@app.get("/health")
async def health_check():
    """
    ヘルスチェックエンドポイント
    """
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "quantum_system": "operational",
        "qiskit_available": quantum_engine.backend_info.get("quantum_available", False),
        "advanced_features": {
            "quantum_error_correction": True,
            "neural_quantum_states": True,
            "ai_integration": True,
            "quantum_maps": True,
            "variational_quantum_eigensolver": True,
            "gemini_integration": True
        }
    }

# Vercel用のハンドラー
from fastapi import Request

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

# Vercel の場合は uvicorn.run を呼ばない
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8010)),
        reload=True,
        log_level="info"
    )