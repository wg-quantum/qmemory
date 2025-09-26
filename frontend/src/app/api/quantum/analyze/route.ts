import { NextRequest, NextResponse } from 'next/server'
import { QuantumResult } from '@/types/quantum'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8010'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { memory, emotion } = body

    // Try Python backend first
    try {
      const response = await fetch(`${BACKEND_URL}/api/quantum/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          memory,
          emotion
        }),
      })

      if (response.ok) {
        const data = await response.json()
        return NextResponse.json(data)
      } else {
        console.log('Backend error, falling back to mock data')
      }
    } catch (backendError) {
      console.log('Backend not available, using mock data')
    }
    
    // Fallback to mock data
    const mockResult = generateMockResult(memory, emotion)
    return NextResponse.json(mockResult)
    
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