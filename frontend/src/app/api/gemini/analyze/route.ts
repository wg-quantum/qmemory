import { NextRequest, NextResponse } from 'next/server'
import { analyzeMemoryWithGemini } from '@/lib/gemini'
import { QuantumResult } from '@/types/quantum'

export async function POST(request: NextRequest) {
  try {
    const { memory, emotion, apiKey } = await request.json()

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'API key is required' },
        { status: 400 }
      )
    }

    if (!memory || !emotion) {
      return NextResponse.json(
        { success: false, error: 'Memory and emotion are required' },
        { status: 400 }
      )
    }

    try {
      const geminiResult = await analyzeMemoryWithGemini(memory, emotion, apiKey)
      
      // Format the response to match QuantumResult type
      const quantumResult: QuantumResult = {
        primaryLocation: {
          name: geminiResult.location,
          story: geminiResult.story,
          probability: 75 + Math.random() * 20, // 75-95% confidence
          coordinates: { lat: 35.6762, lng: 139.6503 }, // Default to Tokyo, should be improved
          imageUrl: null
        },
        secondaryLocations: geminiResult.secondaryLocations.map(loc => ({
          name: loc.name,
          probability: loc.probability,
          description: loc.description
        })),
        quantumState: {
          coherence: 0.85 + Math.random() * 0.1,
          entanglement: 0.7 + Math.random() * 0.2,
          superposition: 0.9 + Math.random() * 0.05
        },
        analysisTime: Math.floor(2000 + Math.random() * 1000)
      }

      return NextResponse.json({
        success: true,
        result: quantumResult
      })
    } catch (error: any) {
      console.error('Gemini analysis error:', error)
      
      let errorMessage = 'Failed to analyze memory with Gemini'
      
      if (error.message?.includes('API_KEY_INVALID')) {
        errorMessage = 'Invalid API key. Please check your key and try again.'
      } else if (error.message?.includes('PERMISSION_DENIED')) {
        errorMessage = 'Permission denied. Please ensure your API key has the correct permissions.'
      } else if (error.message?.includes('QUOTA_EXCEEDED')) {
        errorMessage = 'API quota exceeded. Please check your usage limits.'
      }

      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('API Error:', error)
    
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    )
  }
}