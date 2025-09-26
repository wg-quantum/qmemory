from quantum_engine import QuantumMemoryEngine

# 量子エンジンの初期化
quantum_engine = QuantumMemoryEngine()

async def handler(request):
    """量子システム状態取得のVercel用ハンドラー"""
    if request.method == "GET":
        try:
            state_data = {
                "backend": quantum_engine.get_backend_info(),
                "coherence_time": quantum_engine.get_coherence_time(),
                "entanglement_pairs": quantum_engine.get_entanglement_pairs(),
                "active_qubits": quantum_engine.get_active_qubits(),
                "last_measurement": quantum_engine.get_last_measurement_time()
            }
            
            return {
                "statusCode": 200,
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type"
                },
                "body": str(state_data).replace("'", '"')  # 簡易JSON変換
            }
            
        except Exception as e:
            return {
                "statusCode": 500,
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                },
                "body": f'{{"error": "状態取得エラー: {str(e)}"}}'
            }
    
    elif request.method == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
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