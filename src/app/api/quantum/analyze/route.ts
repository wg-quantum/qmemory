import { NextRequest, NextResponse } from 'next/server'
import { analyzeMemoryWithGemini } from '@/lib/gemini'
import { geocodeLocation } from '@/lib/geocoding'
import { QuantumResult } from '@/types/quantum'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { memory, emotion } = body

    // Try to use Gemini API first if configured
    const geminiApiKey = request.headers.get('X-Gemini-API-Key')
    if (geminiApiKey) {
      try {
        const geminiResult = await analyzeMemoryWithGemini(memory, emotion, geminiApiKey)
        
        // Geocode the primary location
        const primaryGeocode = await geocodeLocation(geminiResult.location)
        const primaryCoordinates = primaryGeocode?.coordinates || { lat: 35.6762, lng: 139.6503 }
        
        // Geocode secondary locations
        const secondaryLocationsWithCoords = await Promise.all(
          geminiResult.secondaryLocations.map(async (loc) => {
            const geocode = await geocodeLocation(loc.name)
            return {
              name: loc.name,
              probability: loc.probability,
              description: loc.description,
              coordinates: geocode?.coordinates || null
            }
          })
        )
        
        // Format the response to match QuantumResult type
        const quantumResult: QuantumResult = {
          primaryLocation: {
            name: geminiResult.location,
            story: geminiResult.story,
            probability: 75 + Math.random() * 20, // 75-95% confidence
            coordinates: primaryCoordinates,
            imageUrl: null
          },
          secondaryLocations: secondaryLocationsWithCoords,
          quantumState: {
            coherence: 0.85 + Math.random() * 0.1,
            entanglement: 0.7 + Math.random() * 0.2,
            superposition: 0.9 + Math.random() * 0.05
          },
          analysisTime: Math.floor(2000 + Math.random() * 1000)
        }

        return NextResponse.json(quantumResult)
      } catch (geminiError) {
        console.log('Gemini API not available, falling back to backend or mock data')
      }
    }

    // Fallback to Python backend
    try {
      const response = await fetch(`${BACKEND_URL}/api/quantum/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`)
      }

      const data = await response.json()
      return NextResponse.json(data)
    } catch (backendError) {
      console.log('Backend not available, using mock data')
      
      // Fallback to mock data
      const mockResult = generateMockResult(memory, emotion)
      return NextResponse.json(mockResult)
    }
  } catch (error) {
    console.error('API Error:', error)
    
    return NextResponse.json(
      { error: 'Failed to analyze memory' },
      { status: 500 }
    )
  }
}

function generateMockResult(memory: string, emotion: string): QuantumResult {
  const locations = [
    '鎌倉の静かな石段寺',
    '京都の古い茶屋街',
    '奈良の鹿と戯れる公園',
    '尾道の坂道カフェ'
  ]

  const stories = [
    '古い石段に響く、あなたの足音。雨上がりの濡れた石が、記憶の中で静かに光っている...',
    '風に揺れる竹の葉音が、遠い記憶を呼び覚ます。石畳を歩く足音と共に...'
  ]

  return {
    primaryLocation: {
      name: locations[Math.floor(Math.random() * locations.length)],
      story: stories[Math.floor(Math.random() * stories.length)],
      probability: 67.4,
      coordinates: { lat: 35.3197, lng: 139.5464 },
      imageUrl: null
    },
    secondaryLocations: [
      { name: '小樽の古い海沿いホテル', probability: 23.7, description: '波の音が聞こえる窓辺...' }
    ],
    quantumState: {
      coherence: 0.89,
      entanglement: 0.72,
      superposition: 0.94
    },
    analysisTime: 2847
  }
}