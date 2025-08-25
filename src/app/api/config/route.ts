import { NextResponse } from 'next/server'

/**
 * API endpoint to check if environment variables are configured
 * This allows client-side code to know if API keys are available
 */
export async function GET() {
  try {
    const hasGeminiKey = !!process.env.GEMINI_API_KEY
    
    return NextResponse.json({
      success: true,
      config: {
        hasGeminiApiKey: hasGeminiKey,
        geminiKeySource: hasGeminiKey ? 'environment' : 'none'
      }
    })
  } catch (error) {
    console.error('Config check failed:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to check configuration' },
      { status: 500 }
    )
  }
}