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
    QISKIT_AVAILABLE = True
except ImportError:
    QISKIT_AVAILABLE = False
    print("Qiskit not available, using quantum simulation")

from models import (
    QuantumResult, Location, SecondaryLocation, QuantumState, 
    Coordinates, MemoryVector, EmotionQuantumState
)

class QuantumMemoryEngine:
    """量子記憶分析エンジン"""
    
    def __init__(self):
        self.backend_name = "qasm_simulator" if QISKIT_AVAILABLE else "quantum_simulator"
        self.qubit_count = 8
        self.memory_dimension = 256
        self.emotion_dimension = 64
        self.location_database = self._initialize_location_database()
        self.emotion_mapping = self._initialize_emotion_mapping()
        
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
            '奈良の鹿と戯れる公園': {
                'coordinates': {'lat': 34.6851, 'lng': 135.8048},
                'keywords': ['鹿', '公園', '奈良', '自然', '動物', '芝生'],
                'emotional_resonance': {'peaceful': 0.9, 'warm': 0.85, 'nostalgic': 0.6}
            },
            '尾道の坂道カフェ': {
                'coordinates': {'lat': 34.4085, 'lng': 133.2042},
                'keywords': ['坂道', 'カフェ', '尾道', '海', '瀬戸内', 'コーヒー'],
                'emotional_resonance': {'peaceful': 0.8, 'nostalgic': 0.7, 'warm': 0.9}
            },
            '長崎の夜景スポット': {
                'coordinates': {'lat': 32.7503, 'lng': 129.8779},
                'keywords': ['夜景', '長崎', '坂', '光', '港', '教会'],
                'emotional_resonance': {'mysterious': 0.8, 'nostalgic': 0.7, 'melancholy': 0.6}
            },
            '金沢の兼六園近くの小径': {
                'coordinates': {'lat': 36.5619, 'lng': 136.6622},
                'keywords': ['兼六園', '小径', '金沢', '庭園', '松', '池'],
                'emotional_resonance': {'peaceful': 0.95, 'nostalgic': 0.8, 'mysterious': 0.5}
            },
            '飛騨高山の古い町並み': {
                'coordinates': {'lat': 36.1460, 'lng': 137.2515},
                'keywords': ['飛騨', '高山', '古い', '町並み', '木造', '酒蔵'],
                'emotional_resonance': {'nostalgic': 0.9, 'peaceful': 0.7, 'warm': 0.6}
            },
            '熱海の温泉街の路地': {
                'coordinates': {'lat': 35.1042, 'lng': 139.0739},
                'keywords': ['温泉', '熱海', '路地', '湯けむり', '旅館', '坂'],
                'emotional_resonance': {'warm': 0.9, 'nostalgic': 0.8, 'peaceful': 0.7}
            },
            '小樽の古い海沿いホテル': {
                'coordinates': {'lat': 43.1907, 'lng': 140.9947},
                'keywords': ['小樽', 'ホテル', '海', '運河', 'レンガ', '港'],
                'emotional_resonance': {'nostalgic': 0.85, 'melancholy': 0.7, 'mysterious': 0.6}
            },
            '神戸の旧居留地カフェ': {
                'coordinates': {'lat': 34.6851, 'lng': 135.1955},
                'keywords': ['神戸', '居留地', 'カフェ', '洋館', 'レンガ', 'コーヒー'],
                'emotional_resonance': {'nostalgic': 0.8, 'warm': 0.9, 'peaceful': 0.7}
            },
            '山形の雨の温泉街': {
                'coordinates': {'lat': 38.2404, 'lng': 140.3633},
                'keywords': ['山形', '温泉', '雨', '湯けむり', '木造', '山'],
                'emotional_resonance': {'melancholy': 0.8, 'peaceful': 0.7, 'nostalgic': 0.6}
            }
        }
    
    def _initialize_emotion_mapping(self) -> Dict[str, np.ndarray]:
        """感情ベクトルマッピングの初期化"""
        return {
            'nostalgic': np.array([0.8, 0.3, 0.9, 0.6]),
            'melancholy': np.array([0.6, 0.9, 0.4, 0.7]),
            'anxious': np.array([0.9, 0.8, 0.2, 0.5]),
            'peaceful': np.array([0.3, 0.2, 0.9, 0.8]),
            'mysterious': np.array([0.7, 0.6, 0.8, 0.9]),
            'warm': np.array([0.9, 0.4, 0.8, 0.9])
        }
    
    async def analyze_memory(self, memory_text: str, emotion: str) -> QuantumResult:
        """記憶の量子分析を実行"""
        
        # 1. 記憶テキストを量子状態に変換
        memory_vector = self._text_to_quantum_state(memory_text)
        
        # 2. 感情を量子状態に変換
        emotion_state = self._emotion_to_quantum_state(emotion)
        
        # 3. 量子もつれ状態を生成
        entangled_state = self._create_entangled_state(memory_vector, emotion_state)
        
        # 4. 量子測定により場所を推定
        location_probabilities = self._quantum_measurement(entangled_state, memory_text)
        
        # 5. 結果を生成
        primary_location = self._get_primary_location(location_probabilities, memory_text, emotion)
        secondary_locations = self._get_secondary_locations(location_probabilities)
        quantum_state = self._calculate_quantum_state(entangled_state)
        
        self.last_measurement_time = datetime.now()
        
        return QuantumResult(
            primary_location=primary_location,
            secondary_locations=secondary_locations,
            quantum_state=quantum_state,
            analysis_time=0  # main.pyで設定される
        )
    
    def _text_to_quantum_state(self, text: str) -> MemoryVector:
        """テキストを量子状態ベクトルに変換"""
        words = text.lower().split()
        
        # 各単語を量子振幅に変換
        components = []
        for i in range(self.memory_dimension):
            amplitude = 0.0
            for word in words:
                # 単語のハッシュ値を使用して振幅を計算
                hash_val = hash(word + str(i)) % 1000
                amplitude += np.sin(hash_val / 1000.0 * 2 * np.pi)
            
            # 複素振幅として保存
            phase = np.random.uniform(0, 2 * np.pi)
            components.append(complex(amplitude * np.cos(phase), amplitude * np.sin(phase)))
        
        # 正規化
        norm = np.sqrt(sum(abs(c)**2 for c in components))
        if norm > 0:
            components = [c / norm for c in components]
        
        # もつれ測度を計算
        entanglement_measure = self._calculate_entanglement_measure(components)
        
        return MemoryVector(
            components=components,
            dimension=self.memory_dimension,
            entanglement_measure=entanglement_measure
        )
    
    def _emotion_to_quantum_state(self, emotion: str) -> EmotionQuantumState:
        """感情を量子状態に変換"""
        base_vector = self.emotion_mapping.get(emotion, np.array([0.5, 0.5, 0.5, 0.5]))
        
        # より高次元に拡張
        amplitudes = []
        phases = []
        
        for i in range(self.emotion_dimension):
            base_idx = i % len(base_vector)
            amplitude = base_vector[base_idx]
            
            # ランダム位相を追加
            phase = np.random.uniform(0, 2 * np.pi)
            
            amplitudes.append(complex(amplitude * np.cos(phase), amplitude * np.sin(phase)))
            phases.append(phase)
        
        # 正規化
        norm = np.sqrt(sum(abs(a)**2 for a in amplitudes))
        if norm > 0:
            amplitudes = [a / norm for a in amplitudes]
        
        # コヒーレンス測度を計算
        coherence_measure = self._calculate_coherence_measure(amplitudes)
        
        return EmotionQuantumState(
            amplitudes=amplitudes,
            phases=phases,
            coherence_measure=coherence_measure
        )
    
    def _create_entangled_state(self, memory_vector: MemoryVector, emotion_state: EmotionQuantumState) -> np.ndarray:
        """記憶と感情の量子もつれ状態を生成"""
        
        # テンソル積でもつれ状態を生成
        entangled_components = []
        
        for i in range(min(len(memory_vector.components), 32)):  # 計算効率のため制限
            for j in range(min(len(emotion_state.amplitudes), 8)):
                # テンソル積の計算
                product = memory_vector.components[i] * emotion_state.amplitudes[j]
                entangled_components.append(product)
        
        # ベル状態的なもつれを追加
        bell_factor = np.exp(1j * np.pi / 4) / np.sqrt(2)
        entangled_components = [c * bell_factor for c in entangled_components]
        
        # 正規化
        entangled_array = np.array(entangled_components)
        norm = np.linalg.norm(entangled_array)
        if norm > 0:
            entangled_array = entangled_array / norm
        
        return entangled_array
    
    def _quantum_measurement(self, entangled_state: np.ndarray, memory_text: str) -> Dict[str, float]:
        """量子測定により場所の確率を計算"""
        probabilities = {}
        
        for location_name, location_data in self.location_database.items():
            # 場所固有の測定演算子を構築
            measurement_operator = self._create_measurement_operator(location_data, memory_text)
            
            # 期待値計算（確率に相当）
            probability = self._calculate_expectation_value(entangled_state, measurement_operator)
            
            # 確率の正規化と調整
            probability = max(0.0, min(1.0, probability))
            probabilities[location_name] = probability
        
        # 全確率の正規化
        total_prob = sum(probabilities.values())
        if total_prob > 0:
            probabilities = {k: v / total_prob for k, v in probabilities.items()}
        
        return probabilities
    
    def _create_measurement_operator(self, location_data: Dict, memory_text: str) -> np.ndarray:
        """場所固有の測定演算子を生成"""
        keywords = location_data['keywords']
        
        # キーワードマッチング
        memory_words = memory_text.lower().split()
        match_score = 0.0
        
        for keyword in keywords:
            for word in memory_words:
                if keyword in word or word in keyword:
                    match_score += 1.0
        
        # 測定演算子の構築（対角行列）
        operator_size = min(len(memory_words) * 16, 256)
        operator = np.zeros((operator_size, operator_size))
        
        for i in range(operator_size):
            # キーワードマッチスコアに基づく固有値
            eigenvalue = match_score * np.exp(-i / operator_size) + np.random.normal(0, 0.1)
            operator[i, i] = max(0, eigenvalue)
        
        return operator
    
    def _calculate_expectation_value(self, state: np.ndarray, operator: np.ndarray) -> float:
        """期待値を計算"""
        state_size = len(state)
        op_size = operator.shape[0]
        
        # サイズを合わせる
        min_size = min(state_size, op_size)
        truncated_state = state[:min_size]
        truncated_operator = operator[:min_size, :min_size]
        
        # 期待値計算 <ψ|O|ψ>
        expectation = np.real(
            np.conj(truncated_state).T @ truncated_operator @ truncated_state
        )
        
        return float(expectation)
    
    def _get_primary_location(self, probabilities: Dict[str, float], memory_text: str, emotion: str) -> Location:
        """最も確率の高い場所を取得"""
        if not probabilities:
            # フォールバック
            location_name = list(self.location_database.keys())[0]
            probability = 0.5
        else:
            location_name = max(probabilities.keys(), key=lambda k: probabilities[k])
            probability = probabilities[location_name]
        
        location_data = self.location_database[location_name]
        
        # ストーリー生成
        story = self._generate_story(location_name, memory_text, emotion)
        
        return Location(
            name=location_name,
            story=story,
            probability=round(probability * 100, 1),
            coordinates=Coordinates(**location_data['coordinates'])
        )
    
    def _get_secondary_locations(self, probabilities: Dict[str, float]) -> List[SecondaryLocation]:
        """次点の場所リストを取得"""
        sorted_locations = sorted(
            probabilities.items(),
            key=lambda x: x[1],
            reverse=True
        )[1:4]  # 上位2-4位
        
        secondary_locations = []
        for location_name, probability in sorted_locations:
            location_data = self.location_database[location_name]
            
            # 簡単な説明文生成
            description = f"{', '.join(location_data['keywords'][:3])}の香りと共に..."
            
            secondary_locations.append(SecondaryLocation(
                name=location_name,
                probability=round(probability * 100, 1),
                description=description,
                coordinates=Coordinates(**location_data['coordinates'])
            ))
        
        return secondary_locations
    
    def _calculate_quantum_state(self, entangled_state: np.ndarray) -> QuantumState:
        """量子状態パラメータを計算"""
        
        # コヒーレンス：状態の純粋度
        coherence = self._calculate_purity(entangled_state)
        
        # もつれ度：フォン・ノイマンエントロピー近似
        entanglement = self._calculate_entanglement_entropy(entangled_state)
        
        # 重ね合わせ度：位相分散
        superposition = self._calculate_superposition_measure(entangled_state)
        
        return QuantumState(
            coherence=coherence,
            entanglement=entanglement,
            superposition=superposition
        )
    
    def _calculate_purity(self, state: np.ndarray) -> float:
        """純粋度を計算"""
        purity = np.sum(np.abs(state)**4)
        return min(1.0, max(0.0, float(purity)))
    
    def _calculate_entanglement_entropy(self, state: np.ndarray) -> float:
        """もつれエントロピーを計算"""
        probabilities = np.abs(state)**2
        probabilities = probabilities[probabilities > 1e-10]  # ゼロ除去
        
        if len(probabilities) == 0:
            return 0.0
        
        entropy = -np.sum(probabilities * np.log2(probabilities))
        max_entropy = np.log2(len(probabilities))
        
        return min(1.0, max(0.0, float(entropy / max_entropy if max_entropy > 0 else 0)))
    
    def _calculate_superposition_measure(self, state: np.ndarray) -> float:
        """重ね合わせ度を計算"""
        phases = np.angle(state)
        phase_variance = np.var(phases)
        max_variance = np.pi**2
        
        superposition = phase_variance / max_variance
        return min(1.0, max(0.0, float(superposition)))
    
    def _calculate_entanglement_measure(self, components: List[complex]) -> float:
        """もつれ測度を計算"""
        if len(components) < 2:
            return 0.0
        
        correlations = []
        for i in range(len(components) - 1):
            correlation = abs(components[i] * np.conj(components[i + 1]))
            correlations.append(correlation)
        
        return float(np.mean(correlations))
    
    def _calculate_coherence_measure(self, amplitudes: List[complex]) -> float:
        """コヒーレンス測度を計算"""
        if len(amplitudes) < 2:
            return 1.0
        
        coherence_sum = 0.0
        for i in range(len(amplitudes) - 1):
            for j in range(i + 1, len(amplitudes)):
                coherence_sum += abs(amplitudes[i] * np.conj(amplitudes[j]))
        
        max_coherence = len(amplitudes) * (len(amplitudes) - 1) / 2
        return float(coherence_sum / max_coherence if max_coherence > 0 else 1.0)
    
    def _generate_story(self, location_name: str, memory_text: str, emotion: str) -> str:
        """場所に基づいたストーリーを生成"""
        templates = {
            'nostalgic': "古い{location}に響く、あなたの足音。{memory_element}が、記憶の中で静かに光っている。その瞬間、時が止まったような感覚とともに、心の奥深くで何かが優しく微笑みかけている...",
            'melancholy': "風に揺れる{location}が、遠い記憶を呼び覚ます。{memory_element}と共に、忘れかけていた誰かの温かい声が聞こえてくる...",
            'peaceful': "夕暮れ時の{location}に、温かな光が反射している。そこには、あなたが探していた安らぎと、懐かしい感情が静かに宿っている...",
            'warm': "{location}に漂う、どこか懐かしい香り。{memory_element}が、この場所での時間をゆっくりと流れさせている...",
            'mysterious': "薄暗い{location}に、神秘的な雰囲気が漂っている。{memory_element}が、隠された記憶の扉を静かに開いている...",
            'anxious': "不安な気持ちが{location}で和らいでいく。{memory_element}が、心の奥の緊張を優しく解きほぐしている..."
        }
        
        template = templates.get(emotion, templates['nostalgic'])
        
        # 場所の特徴的な要素を抽出
        location_element = location_name.split('の')[1] if 'の' in location_name else location_name
        
        # 記憶テキストから要素を抽出
        memory_words = memory_text.split()
        memory_element = memory_words[0] if memory_words else "その風景"
        
        return template.format(
            location=location_element,
            memory_element=memory_element
        )
    
    # システム情報取得メソッド
    def get_backend_info(self) -> Dict[str, str]:
        return {
            "name": self.backend_name,
            "type": "quantum_simulator",
            "qubits": self.qubit_count,
            "qiskit_available": QISKIT_AVAILABLE
        }
    
    def get_coherence_time(self) -> float:
        return self.coherence_time
    
    def get_entanglement_pairs(self) -> int:
        return self.qubit_count // 2
    
    def get_active_qubits(self) -> int:
        return self.active_qubits
    
    def get_last_measurement_time(self) -> Optional[str]:
        return self.last_measurement_time.isoformat() if self.last_measurement_time else None
    
    def get_location_coordinates(self, location_name: str) -> Optional[Dict[str, float]]:
        """場所名から座標を取得"""
        location_data = self.location_database.get(location_name)
        if location_data:
            return location_data['coordinates']
        return None