import numpy as np
import random
import time
from typing import Dict, List, Tuple, Optional
from datetime import datetime

# Quantum computing libraries
try:
    from qiskit import QuantumCircuit, execute, Aer, transpile
    from qiskit.quantum_info import Statevector, partial_trace, entropy
    from qiskit_algorithms.optimizers import COBYLA
    from qiskit_ibm_runtime import QiskitRuntimeService, Sampler, Estimator
    from qiskit_ibm_provider import IBMProvider
    QISKIT_AVAILABLE = True
except ImportError:
    QISKIT_AVAILABLE = False
    print("Qiskit not available, using quantum simulation")
    # モッククラスを定義
    class QuantumCircuit:
        pass

from models import (
    QuantumResult, Location, SecondaryLocation, QuantumState, 
    Coordinates, MemoryVector, EmotionQuantumState
)

class QuantumMemoryEngine:
    """量子記憶分析エンジン"""
    
    def __init__(self, use_real_quantum: bool = False, ibm_token: str = None):
        self.use_real_quantum = use_real_quantum and QISKIT_AVAILABLE
        self.ibm_token = ibm_token
        self.qubit_count = 8
        self.memory_dimension = 256
        self.emotion_dimension = 64
        self.location_database = self._initialize_location_database()
        self.emotion_mapping = self._initialize_emotion_mapping()
        
        # 量子バックエンド初期化
        self.quantum_backend = None
        self.service = None
        self._initialize_quantum_backend()
        
        # 量子状態の初期化
        self.last_measurement_time = None
        self.coherence_time = 100.0  # microseconds
        self.active_qubits = self.qubit_count
        
    def _initialize_location_database(self) -> Dict[str, Dict]:
        """場所データベースの初期化"""
        return {
            '鎌倉の静かな石段寺': {
                'coordinates': {'lat': 35.3197, 'lng': 139.5464},
                'keywords': ['石段', '寺', '静か', '古い', '鎌倉', '竹', '瞑想'],
                'emotional_resonance': {'nostalgic': 0.9, 'peaceful': 0.8, 'mysterious': 0.7}
            },
            '京都の古い茶屋街': {
                'coordinates': {'lat': 35.0116, 'lng': 135.7681},
                'keywords': ['茶屋', '古い', '京都', '石畳', '提灯', '木造'],
                'emotional_resonance': {'nostalgic': 0.95, 'warm': 0.8, 'peaceful': 0.7}
            },
            '瀬戸内海の小島': {
                'coordinates': {'lat': 34.3853, 'lng': 133.7956},
                'keywords': ['海', '島', '青い', '船', '潮風', '灯台', '夕日'],
                'emotional_resonance': {'peaceful': 0.9, 'nostalgic': 0.8, 'melancholy': 0.6}
            },
            '北海道の雪景色': {
                'coordinates': {'lat': 43.0642, 'lng': 141.3469},
                'keywords': ['雪', '白い', '寒い', '静寂', '森', '足跡', '吐息'],
                'emotional_resonance': {'peaceful': 0.8, 'contemplative': 0.9, 'isolated': 0.7}
            },
            '東京の隠れた路地': {
                'coordinates': {'lat': 35.6762, 'lng': 139.6503},
                'keywords': ['路地', '狭い', '赤提灯', '居酒屋', '雨', '石畳', '人声'],
                'emotional_resonance': {'nostalgic': 0.8, 'warm': 0.9, 'mysterious': 0.6}
            },
            '富士山の見える湖': {
                'coordinates': {'lat': 35.5000, 'lng': 138.7667},
                'keywords': ['富士山', '湖', '青い', '山', '反射', '雲', '風'],
                'emotional_resonance': {'peaceful': 0.95, 'awe': 0.9, 'contemplative': 0.8}
            },
            '奈良の鹿がいる公園': {
                'coordinates': {'lat': 34.6851, 'lng': 135.8048},
                'keywords': ['鹿', '公園', '奈良', '古い', '大仏', '木々', '草'],
                'emotional_resonance': {'peaceful': 0.9, 'nostalgic': 0.8, 'warm': 0.7}
            },
            '沖縄の青い海岸': {
                'coordinates': {'lat': 26.2085, 'lng': 127.6792},
                'keywords': ['海', '青い', '白い砂', '珊瑚', '波', '太陽', '椰子'],
                'emotional_resonance': {'peaceful': 0.9, 'joyful': 0.8, 'warm': 0.9}
            }
        }
    
    def _initialize_quantum_backend(self):
        """量子バックエンドの初期化"""
        if not QISKIT_AVAILABLE:
            self.backend_name = "quantum_simulator"
            return
            
        if self.use_real_quantum and self.ibm_token:
            try:
                # IBM Quantum Runtime Service の初期化
                self.service = QiskitRuntimeService(token=self.ibm_token)
                
                # 利用可能なバックエンドを取得
                backends = self.service.backends()
                
                # 最適なバックエンドを選択（キューが少ない順）
                real_backends = [b for b in backends if not b.simulator]
                if real_backends:
                    # キューの長さでソート
                    self.quantum_backend = min(real_backends, key=lambda b: b.status().pending_jobs)
                    self.backend_name = self.quantum_backend.name
                    print(f"Using real quantum device: {self.backend_name}")
                else:
                    # リアルデバイスが利用できない場合はシミュレータ
                    self.quantum_backend = self.service.backend('ibmq_qasm_simulator')
                    self.backend_name = 'ibmq_qasm_simulator'
                    print("Real quantum devices not available, using IBM simulator")
                    
            except Exception as e:
                print(f"Failed to initialize IBM Quantum: {e}")
                self.use_real_quantum = False
                self.quantum_backend = Aer.get_backend('qasm_simulator')
                self.backend_name = 'qasm_simulator'
        else:
            # ローカルシミュレータを使用
            self.quantum_backend = Aer.get_backend('qasm_simulator')
            self.backend_name = 'qasm_simulator'
    
    def _initialize_emotion_mapping(self) -> Dict[str, Dict]:
        """感情マッピングの初期化"""
        return {
            'nostalgic': {'quantum_amplitude': 0.8, 'phase': 0.0, 'resonance': ['古い', '記憶', '昔']},
            'peaceful': {'quantum_amplitude': 0.9, 'phase': np.pi/4, 'resonance': ['静か', '穏やか', '平和']},
            'melancholy': {'quantum_amplitude': 0.7, 'phase': np.pi/2, 'resonance': ['寂しい', '哀愁', '切ない']},
            'joyful': {'quantum_amplitude': 0.85, 'phase': 0, 'resonance': ['楽しい', '明るい', '嬉しい']},
            'mysterious': {'quantum_amplitude': 0.75, 'phase': 3*np.pi/4, 'resonance': ['神秘', '不思議', '謎']},
            'contemplative': {'quantum_amplitude': 0.8, 'phase': np.pi/3, 'resonance': ['考える', '瞑想', '思索']},
            'warm': {'quantum_amplitude': 0.85, 'phase': np.pi/6, 'resonance': ['温かい', '優しい', '包まれる']},
            'awe': {'quantum_amplitude': 0.9, 'phase': np.pi/8, 'resonance': ['驚き', '畏敬', '感動']}
        }

    def _create_quantum_circuit(self, memory_text: str, emotion: str) -> QuantumCircuit:
        """記憶と感情から量子回路を作成"""
        circuit = QuantumCircuit(self.qubit_count, self.qubit_count)
        
        # 記憶テキストをバイナリエンコーディング
        memory_hash = hash(memory_text) % (2 ** self.qubit_count)
        emotion_hash = hash(emotion) % (2 ** self.qubit_count)
        
        # 初期状態をセット（記憶に基づく）
        for i in range(self.qubit_count):
            if (memory_hash >> i) & 1:
                circuit.x(i)
        
        # Hadamardゲートで重ね合わせ状態作成
        for i in range(self.qubit_count):
            if (emotion_hash >> i) & 1:
                circuit.h(i)
        
        # エンタングルメント作成（CNOTゲート）
        for i in range(0, self.qubit_count - 1, 2):
            circuit.cx(i, i + 1)
        
        # 位相回転（感情の影響）
        emotion_phase = hash(emotion) / (2**32) * 2 * np.pi
        for i in range(self.qubit_count):
            circuit.rz(emotion_phase / (i + 1), i)
        
        # 測定
        circuit.measure_all()
        
        return circuit

    def _create_memory_vector(self, memory_text: str) -> MemoryVector:
        """記憶テキストから量子ベクトルを作成"""
        if self.use_real_quantum and self.quantum_backend:
            # 実際の量子回路を実行
            circuit = self._create_quantum_circuit(memory_text, "neutral")
            
            try:
                if self.service:
                    # IBM Quantum Runtime Service使用
                    sampler = Sampler(self.quantum_backend)
                    result = sampler.run(circuit, shots=1024).result()
                    counts = result.quasi_dists[0]
                else:
                    # ローカル実行
                    job = execute(circuit, self.quantum_backend, shots=1024)
                    result = job.result()
                    counts = result.get_counts()
                
                # 測定結果から量子ベクトルを構築
                vector_components = []
                for i in range(self.memory_dimension):
                    # ビット状態の確率から振幅を計算
                    bit_index = i % self.qubit_count
                    amplitude = 0
                    for state, count in counts.items():
                        if isinstance(state, int):
                            state_binary = format(state, f'0{self.qubit_count}b')
                        else:
                            state_binary = state
                        if state_binary[bit_index] == '1':
                            amplitude += count / 1024
                    
                    phase = (hash(memory_text + str(i)) % 628) / 100
                    component = np.sqrt(amplitude) * np.exp(1j * phase)
                    vector_components.append(component)
                
                # エンタングルメント測定
                entanglement = self._calculate_quantum_entanglement(counts)
                
            except Exception as e:
                print(f"Quantum execution failed: {e}, falling back to classical")
                return self._create_classical_memory_vector(memory_text)
        else:
            return self._create_classical_memory_vector(memory_text)
        
        # 正規化
        norm = np.sqrt(sum(abs(c)**2 for c in vector_components))
        if norm > 0:
            vector_components = [c / norm for c in vector_components]
        
        return MemoryVector(
            components=vector_components,
            dimension=self.memory_dimension,
            entanglement_measure=entanglement
        )

    def _create_classical_memory_vector(self, memory_text: str) -> MemoryVector:
        """古典的な記憶ベクトル作成（フォールバック）"""
        words = memory_text.lower().split()
        vector_components = []
        
        for i in range(self.memory_dimension):
            word_influence = sum(hash(word + str(i)) % 100 for word in words) / (len(words) * 100)
            phase = (hash(memory_text + str(i)) % 628) / 100
            amplitude = np.sqrt(word_influence)
            component = amplitude * np.exp(1j * phase)
            vector_components.append(component)
        
        # 正規化
        norm = np.sqrt(sum(abs(c)**2 for c in vector_components))
        if norm > 0:
            vector_components = [c / norm for c in vector_components]
        
        entanglement = np.random.uniform(0.3, 0.9)
        
        return MemoryVector(
            components=vector_components,
            dimension=self.memory_dimension,
            entanglement_measure=entanglement
        )

    def _calculate_quantum_entanglement(self, measurement_counts: Dict) -> float:
        """量子測定結果からエンタングルメントを計算"""
        # フォンノイマンエントロピーベースのエンタングルメント測定
        total_shots = sum(measurement_counts.values())
        entropy = 0
        
        for count in measurement_counts.values():
            if count > 0:
                prob = count / total_shots
                entropy -= prob * np.log2(prob)
        
        # エンタングルメント強度として正規化
        max_entropy = np.log2(2 ** self.qubit_count)
        return entropy / max_entropy if max_entropy > 0 else 0

    def _create_emotion_quantum_state(self, emotion: str) -> EmotionQuantumState:
        """感情から量子状態を作成"""
        if self.use_real_quantum and self.quantum_backend:
            # 実際の量子回路を実行
            circuit = self._create_quantum_circuit("emotion", emotion)
            
            try:
                if self.service:
                    sampler = Sampler(self.quantum_backend)
                    result = sampler.run(circuit, shots=1024).result()
                    counts = result.quasi_dists[0]
                else:
                    job = execute(circuit, self.quantum_backend, shots=1024)
                    result = job.result()
                    counts = result.get_counts()
                
                # 測定結果から感情量子状態を構築
                amplitudes = []
                phases = []
                
                for i in range(self.emotion_dimension):
                    bit_index = i % self.qubit_count
                    amplitude = 0
                    for state, count in counts.items():
                        if isinstance(state, int):
                            state_binary = format(state, f'0{self.qubit_count}b')
                        else:
                            state_binary = state
                        if state_binary[bit_index] == '1':
                            amplitude += count / 1024
                    
                    phase = (hash(emotion + str(i)) % 628) / 100
                    amplitudes.append(amplitude * np.exp(1j * phase))
                    phases.append(phase)
                
                # コヒーレンス測定
                coherence = self._calculate_quantum_coherence(counts)
                
            except Exception as e:
                print(f"Quantum execution failed: {e}, falling back to classical")
                return self._create_classical_emotion_state(emotion)
        else:
            return self._create_classical_emotion_state(emotion)
        
        return EmotionQuantumState(
            amplitudes=amplitudes,
            phases=phases,
            coherence_measure=coherence
        )

    def _create_classical_emotion_state(self, emotion: str) -> EmotionQuantumState:
        """古典的な感情状態作成（フォールバック）"""
        if emotion.lower() in self.emotion_mapping:
            emotion_data = self.emotion_mapping[emotion.lower()]
            base_amplitude = emotion_data['quantum_amplitude']
            base_phase = emotion_data['phase']
        else:
            base_amplitude = 0.5
            base_phase = 0.0
        
        amplitudes = []
        phases = []
        
        for i in range(self.emotion_dimension):
            amplitude = base_amplitude * np.exp(-i * 0.01) * (1 + 0.1 * np.sin(i * 0.1))
            phase = base_phase + i * 0.05 + np.random.normal(0, 0.1)
            
            amplitudes.append(amplitude * np.exp(1j * phase))
            phases.append(phase)
        
        coherence = np.abs(np.mean(amplitudes)) / np.sqrt(np.mean([abs(a)**2 for a in amplitudes]))
        
        return EmotionQuantumState(
            amplitudes=amplitudes,
            phases=phases,
            coherence_measure=coherence
        )

    def _calculate_quantum_coherence(self, measurement_counts: Dict) -> float:
        """量子測定結果からコヒーレンスを計算"""
        total_shots = sum(measurement_counts.values())
        if total_shots == 0:
            return 0.0
        
        # 状態ベクトルの均一性を測定
        probs = [count / total_shots for count in measurement_counts.values()]
        coherence = 1.0 - np.var(probs) if len(probs) > 1 else 1.0
        
        return max(0.0, min(1.0, coherence))

    def _quantum_entanglement_analysis(self, memory_vector: MemoryVector, emotion_state: EmotionQuantumState) -> Dict:
        """記憶と感情の量子もつれ解析"""
        # 簡略化された量子もつれ計算
        memory_amplitudes = [abs(c) for c in memory_vector.components[:self.emotion_dimension]]
        emotion_amplitudes = [abs(c) for c in emotion_state.amplitudes]
        
        # 相互相関計算
        correlation = np.corrcoef(memory_amplitudes, emotion_amplitudes)[0, 1]
        if np.isnan(correlation):
            correlation = 0.5
        
        # 量子もつれ強度
        entanglement_strength = abs(correlation) * memory_vector.entanglement_measure * emotion_state.coherence_measure
        
        # 測定による波束の収束（位置確率分布）
        location_probabilities = {}
        for location_name, location_data in self.location_database.items():
            # キーワードマッチング
            keyword_score = 0
            for keyword in location_data['keywords']:
                if keyword in memory_vector.components:  # 簡略化
                    keyword_score += 1
            keyword_score = keyword_score / len(location_data['keywords'])
            
            # 感情共鳴
            emotion_score = 0
            if hasattr(emotion_state, 'emotion_type'):
                emotion_type = emotion_state.emotion_type.lower()
                if emotion_type in location_data['emotional_resonance']:
                    emotion_score = location_data['emotional_resonance'][emotion_type]
            else:
                # デフォルト感情スコア
                emotion_score = 0.5
            
            # 量子確率計算
            quantum_probability = (keyword_score * 0.4 + emotion_score * 0.3 + entanglement_strength * 0.3)
            quantum_probability = max(0.0, min(1.0, quantum_probability + np.random.normal(0, 0.1)))
            
            location_probabilities[location_name] = quantum_probability
        
        return {
            'entanglement_strength': entanglement_strength,
            'correlation': correlation,
            'location_probabilities': location_probabilities
        }

    async def analyze_memory(self, memory_text: str, emotion: str) -> QuantumResult:
        """メイン分析関数"""
        # 量子ベクトル作成
        memory_vector = self._create_memory_vector(memory_text)
        emotion_state = self._create_emotion_quantum_state(emotion)
        
        # 量子もつれ解析
        entanglement_result = self._quantum_entanglement_analysis(memory_vector, emotion_state)
        
        # 最も確率の高い場所を選択
        location_probs = entanglement_result['location_probabilities']
        sorted_locations = sorted(location_probs.items(), key=lambda x: x[1], reverse=True)
        
        if not sorted_locations:
            # デフォルト場所
            primary_location_name = '鎌倉の静かな石段寺'
            primary_probability = 0.5
        else:
            primary_location_name = sorted_locations[0][0]
            primary_probability = sorted_locations[0][1]
        
        primary_location_data = self.location_database[primary_location_name]
        
        # プライマリ場所
        primary_location = Location(
            name=primary_location_name,
            story=f"量子もつれ解析により、あなたの記憶「{memory_text[:50]}...」と感情「{emotion}」が最も強く共鳴する場所として特定されました。",
            probability=primary_probability,
            coordinates=Coordinates(**primary_location_data['coordinates'])
        )
        
        # セカンダリ場所
        secondary_locations = []
        for location_name, probability in sorted_locations[1:4]:  # 上位3つ
            if probability > 0.2:  # 閾値
                secondary_locations.append(SecondaryLocation(
                    name=location_name,
                    probability=probability,
                    description=f"確率 {probability:.1%} で共鳴する可能性のある場所",
                    coordinates=Coordinates(**self.location_database[location_name]['coordinates'])
                ))
        
        # 量子状態
        quantum_state = QuantumState(
            coherence=emotion_state.coherence_measure,
            entanglement=entanglement_result['entanglement_strength'],
            superposition=memory_vector.entanglement_measure
        )
        
        # 測定時間記録
        self.last_measurement_time = time.time()
        
        return QuantumResult(
            primary_location=primary_location,
            secondary_locations=secondary_locations,
            quantum_state=quantum_state,
            analysis_time=0  # 後で設定される
        )

    def get_backend_info(self) -> Dict:
        """バックエンド情報取得"""
        return {
            "name": self.backend_name,
            "qubits": self.qubit_count,
            "quantum_available": QISKIT_AVAILABLE,
            "memory_dimension": self.memory_dimension
        }

    def get_coherence_time(self) -> float:
        """コヒーレンス時間取得"""
        return self.coherence_time

    def get_entanglement_pairs(self) -> int:
        """エンタングルメントペア数取得"""
        return self.qubit_count // 2

    def get_active_qubits(self) -> int:
        """アクティブキューbit数取得"""
        return self.active_qubits

    def get_last_measurement_time(self) -> Optional[float]:
        """最後の測定時間取得"""
        return self.last_measurement_time

    def get_location_coordinates(self, location_name: str) -> Optional[Dict]:
        """場所名から座標取得"""
        if location_name in self.location_database:
            return self.location_database[location_name]['coordinates']
        return None