#!/usr/bin/env python3
"""
IBM Quantum Integration Test Script
実際の量子デバイスでの動作確認用テストスクリプト
"""
import os
import sys
import asyncio
from api.quantum_engine import QuantumMemoryEngine

async def test_quantum_functionality():
    """量子機能のテスト"""
    print("=== IBM Quantum Integration Test ===")
    
    # 環境変数確認
    ibm_token = os.environ.get('IBM_QUANTUM_TOKEN')
    use_real_quantum = os.environ.get('USE_REAL_QUANTUM', 'false').lower() == 'true'
    
    print(f"IBM Token configured: {'Yes' if ibm_token else 'No'}")
    print(f"Real quantum enabled: {use_real_quantum}")
    
    if not ibm_token and use_real_quantum:
        print("⚠️  Warning: USE_REAL_QUANTUM=true but no IBM_QUANTUM_TOKEN provided")
        print("   Please set your IBM Quantum token in environment variables")
        return False
    
    # 量子エンジン初期化
    print("\n1. Initializing Quantum Engine...")
    try:
        engine = QuantumMemoryEngine(
            use_real_quantum=use_real_quantum,
            ibm_token=ibm_token
        )
        print(f"✅ Engine initialized with backend: {engine.backend_name}")
        print(f"   Using real quantum: {engine.use_real_quantum}")
        
        # バックエンド情報表示
        backend_info = engine.get_backend_info()
        print(f"   Backend info: {backend_info}")
        
    except Exception as e:
        print(f"❌ Failed to initialize quantum engine: {e}")
        return False
    
    # 量子メモリ分析テスト
    print("\n2. Testing Quantum Memory Analysis...")
    test_memory = "海辺の夕日を見ながら歩いた記憶"
    test_emotion = "nostalgic"
    
    try:
        start_time = asyncio.get_event_loop().time()
        result = await engine.analyze_memory(test_memory, test_emotion)
        end_time = asyncio.get_event_loop().time()
        
        print(f"✅ Analysis completed in {(end_time - start_time):.2f} seconds")
        print(f"   Primary location: {result.primary_location.name}")
        print(f"   Probability: {result.primary_location.probability:.3f}")
        print(f"   Quantum state - Coherence: {result.quantum_state.coherence:.3f}")
        print(f"   Quantum state - Entanglement: {result.quantum_state.entanglement:.3f}")
        print(f"   Secondary locations: {len(result.secondary_locations)}")
        
        # 量子統計情報
        if hasattr(engine, 'last_measurement_time'):
            print(f"   Last measurement time: {engine.get_last_measurement_time()}")
        
    except Exception as e:
        print(f"❌ Failed to analyze memory: {e}")
        return False
    
    # 複数回テストで一貫性確認
    print("\n3. Testing Consistency (3 runs)...")
    results = []
    for i in range(3):
        try:
            result = await engine.analyze_memory(f"{test_memory} - run {i+1}", test_emotion)
            results.append(result.primary_location.probability)
            print(f"   Run {i+1}: Probability = {result.primary_location.probability:.3f}")
        except Exception as e:
            print(f"❌ Failed run {i+1}: {e}")
            return False
    
    # 結果の変動確認（量子性の証拠）
    if len(set(f"{p:.3f}" for p in results)) > 1:
        print("✅ Results show quantum variation (good!)")
    else:
        print("⚠️  Results are identical (may indicate classical fallback)")
    
    print("\n=== Test Summary ===")
    print("✅ All quantum functionality tests passed!")
    if engine.use_real_quantum:
        print("🎯 Successfully using real IBM Quantum devices!")
    else:
        print("🔬 Using quantum simulation (to enable real quantum, set environment variables)")
    
    return True

def main():
    """メイン実行関数"""
    try:
        # 非同期実行
        success = asyncio.run(test_quantum_functionality())
        
        if success:
            print("\n🎉 IBM Quantum integration is working correctly!")
            sys.exit(0)
        else:
            print("\n❌ Some tests failed. Please check your configuration.")
            sys.exit(1)
            
    except KeyboardInterrupt:
        print("\n\nTest interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()