export interface Coordinates {
  lat: number
  lng: number
}

export interface Location {
  name: string
  story: string
  probability: number
  coordinates: Coordinates
  imageUrl?: string | null
}

export interface SecondaryLocation {
  name: string
  probability: number
  description: string
  coordinates?: Coordinates | null
}

export interface QuantumState {
  coherence: number
  entanglement: number
  superposition: number
}

export interface QuantumResult {
  primaryLocation: Location
  secondaryLocations: SecondaryLocation[]
  quantumState: QuantumState
  analysisTime: number
}

export interface MemoryInput {
  text: string
  emotion: string
  timestamp?: Date
}

export interface EmotionOption {
  key: string
  label: string
  emoji: string
}