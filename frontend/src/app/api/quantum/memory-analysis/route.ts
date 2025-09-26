import { NextRequest, NextResponse } from 'next/server'

/**
 * Quantum memory analysis endpoint using Python quantum engine
 */
export async function POST(request: NextRequest) {
  try {
    const { memory, emotion, timestamp } = await request.json()

    if (!memory || !emotion) {
      return NextResponse.json(
        { success: false, error: 'Memory and emotion are required' },
        { status: 400 }
      )
    }

    console.log(`[${timestamp || Date.now()}] Quantum API analyzing:`, memory.slice(0, 100) + '...')

    // Call Python quantum engine
    const pythonResponse = await fetch('http://localhost:8000/quantum-analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        memory_text: memory,
        emotion: emotion,
        timestamp: timestamp || Date.now()
      }),
    })

    if (!pythonResponse.ok) {
      throw new Error(`Python API error: ${pythonResponse.status}`)
    }

    const quantumResult = await pythonResponse.json()

    return NextResponse.json({
      success: true,
      result: {
        location: quantumResult.primary_location.name,
        story: quantumResult.primary_location.story,
        region: extractRegion(quantumResult.primary_location.name),
        secondaryLocations: quantumResult.secondary_locations.map((loc: any) => ({
          name: loc.name,
          probability: loc.probability,
          description: loc.description,
          region: extractRegion(loc.name)
        })),
        quantumState: quantumResult.quantum_state,
        processingInfo: {
          backendType: 'quantum_engine',
          coherence: quantumResult.quantum_state.coherence,
          entanglement: quantumResult.quantum_state.entanglement,
          superposition: quantumResult.quantum_state.superposition,
          analysisTime: quantumResult.analysis_time
        }
      },
      source: 'quantum_engine'
    })

  } catch (error) {
    console.error('Quantum memory analysis failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Quantum memory analysis failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        source: 'quantum_engine'
      },
      { status: 500 }
    )
  }
}

function extractRegion(locationName: string): string {
  // Check if this is a Japanese location first
  const japanesePrefectures = ['鎌倉', '京都', '奈良', '尾道', '長崎', '金沢', '飛騨', '高山', '熱海', '小樽', '神戸', '山形', '東京', '大阪', '横浜', '名古屋', '札幌', '福岡', '仙台', '広島']
  
  for (const prefecture of japanesePrefectures) {
    if (locationName.includes(prefecture)) {
      return prefecture
    }
  }
  
  // Check for international locations
  const internationalPatterns = [
    { pattern: /(Paris|パリ|Louvre|Eiffel|Seine|セーヌ)/i, region: 'France' },
    { pattern: /(London|ロンドン|Thames|テムズ|Westminster|Big Ben)/i, region: 'UK' },
    { pattern: /(New York|ニューヨーク|Manhattan|Brooklyn|Central Park)/i, region: 'USA' },
    { pattern: /(Rome|ローマ|Vatican|Colosseum|Italy|イタリア)/i, region: 'Italy' },
    { pattern: /(Berlin|ベルリン|Munich|ミュンヘン|Germany|ドイツ)/i, region: 'Germany' },
    { pattern: /(Madrid|マドリード|Barcelona|バルセロナ|Spain|スペイン)/i, region: 'Spain' },
    { pattern: /(Amsterdam|アムステルダム|Rotterdam|Netherlands|オランダ)/i, region: 'Netherlands' },
    { pattern: /(Zurich|チューリッヒ|Geneva|ジュネーブ|Switzerland|スイス)/i, region: 'Switzerland' },
    { pattern: /(Sydney|シドニー|Melbourne|メルボルン|Australia|オーストラリア)/i, region: 'Australia' },
    { pattern: /(Toronto|トロント|Vancouver|バンクーバー|Canada|カナダ)/i, region: 'Canada' },
    { pattern: /(Tuscany|トスカーナ|Florence|フィレンツェ|Venice|ベニス)/i, region: 'Italy' }
  ]
  
  for (const { pattern, region } of internationalPatterns) {
    if (pattern.test(locationName)) {
      return region
    }
  }
  
  // For Japanese locations, try to extract the first part
  if (/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(locationName)) {
    return locationName.split('の')[0] || 'Japan'
  }
  
  // Default fallback
  return 'International'
}