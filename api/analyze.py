from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import time
try:
    from models import MemoryAnalysisRequest, QuantumResult
    from quantum_engine import QuantumMemoryEngine
except ImportError:
    from .models import MemoryAnalysisRequest, QuantumResult
    from .quantum_engine import QuantumMemoryEngine

app = FastAPI()

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Vercelの場合は適切なドメインに変更
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 量子エンジンの初期化
import os
ibm_token = os.environ.get('IBM_QUANTUM_TOKEN')
use_real_quantum = os.environ.get('USE_REAL_QUANTUM', 'false').lower() == 'true'

quantum_engine = QuantumMemoryEngine(
    use_real_quantum=use_real_quantum,
    ibm_token=ibm_token
)

@app.get("/")
async def root():
    """API ルート"""
    return {
        "message": "🚀 Quantum Memory API",
        "version": "1.0.0",
        "quantum_backend": "Qiskit" if quantum_engine.use_real_quantum else "Quantum Simulator",
        "status": "running"
    }

@app.post("/analyze")
async def analyze_memory(request: MemoryAnalysisRequest):
    """記憶分析エンドポイント"""
    start_time = time.time()
    
    result = await quantum_engine.analyze_memory(
        memory_text=request.memory,
        emotion=request.emotion
    )
    
    analysis_time = int((time.time() - start_time) * 1000)
    result.analysis_time = analysis_time
    
    return result

async def handler(request):
    """Vercel用のリクエストハンドラー"""
    if request.method == "POST":
        try:
            # JSONボディを解析
            body = await request.json()
            analysis_request = MemoryAnalysisRequest(**body)
            
            start_time = time.time()
            
            # 量子分析の実行
            result = await quantum_engine.analyze_memory(
                memory_text=analysis_request.memory,
                emotion=analysis_request.emotion
            )
            
            analysis_time = int((time.time() - start_time) * 1000)
            result.analysis_time = analysis_time
            
            return {
                "statusCode": 200,
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "POST, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type"
                },
                "body": result.model_dump_json()
            }
            
        except Exception as e:
            return {
                "statusCode": 500,
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                },
                "body": f'{{"error": "量子分析エラー: {str(e)}"}}'
            }
    
    elif request.method == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            },
            "body": ""
        }
    
    else:
        return {
            "statusCode": 405,
            "headers": {"Content-Type": "application/json"},
            "body": '{"error": "Method not allowed"}'
        }