import { NextRequest, NextResponse } from 'next/server'
import { analyzeMemoryWithGemini } from '@/lib/gemini'

/**
 * Server-side memory analysis using environment variable
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

    console.log(`[${timestamp || Date.now()}] Gemini API analyzing:`, memory.slice(0, 100) + '...')

    // Use environment variable API key
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'Gemini API key not configured in environment variables' },
        { status: 500 }
      )
    }

    const result = await analyzeMemoryWithGemini(memory, emotion, apiKey)

    return NextResponse.json({
      success: true,
      result
    })

  } catch (error) {
    console.error('Memory analysis failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Memory analysis failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}