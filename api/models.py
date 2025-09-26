from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Any
from datetime import datetime

class Coordinates(BaseModel):
    lat: float
    lng: float

class Location(BaseModel):
    name: str
    story: str
    probability: float
    coordinates: Coordinates
    image_url: Optional[str] = None

class SecondaryLocation(BaseModel):
    name: str
    probability: float
    description: str
    coordinates: Optional[Coordinates] = None

class QuantumState(BaseModel):
    coherence: float
    entanglement: float
    superposition: float

class QuantumResult(BaseModel):
    primary_location: Location
    secondary_locations: List[SecondaryLocation]
    quantum_state: QuantumState
    analysis_time: int

class MemoryAnalysisRequest(BaseModel):
    memory: str
    emotion: str
    timestamp: Optional[datetime] = None

class MemoryVector(BaseModel):
    """記憶ベクトルの量子表現"""
    model_config = ConfigDict(arbitrary_types_allowed=True)
    
    components: List[Any]  # Complex numbers as Any type
    dimension: int
    entanglement_measure: float

class EmotionQuantumState(BaseModel):
    """感情の量子状態表現"""
    model_config = ConfigDict(arbitrary_types_allowed=True)
    
    amplitudes: List[Any]  # Complex numbers as Any type
    phases: List[float]
    coherence_measure: float