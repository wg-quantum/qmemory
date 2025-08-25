import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json()

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'API key is required' },
        { status: 400 }
      )
    }

    // Basic API key format validation
    if (!apiKey.startsWith('AIza') || apiKey.length < 30) {
      return NextResponse.json(
        { success: false, error: 'Invalid API key format. Gemini API keys should start with "AIza"' },
        { status: 400 }
      )
    }

    // Initialize Gemini API
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    // Test the connection with a simple prompt
    console.log('Testing Gemini API with key:', apiKey.substring(0, 10) + '...')
    const prompt = 'Hello, this is a test. Please respond with "Connection successful".'
    
    console.log('Sending request to Gemini API...')
    const result = await model.generateContent(prompt)
    console.log('Received response from Gemini API')
    
    const response = await result.response
    const text = response.text()
    console.log('Response text:', text.substring(0, 100))

    if (text) {
      return NextResponse.json({
        success: true,
        message: 'Gemini API connection successful',
        response: text
      })
    } else {
      return NextResponse.json(
        { success: false, error: 'No response from Gemini API' },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Gemini API test error:', error)
    console.error('Error details:', {
      message: error.message,
      status: error.status,
      statusText: error.statusText,
      cause: error.cause
    })
    
    let errorMessage = 'Failed to connect to Gemini API'
    
    // Check for specific error patterns
    if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('Invalid API key')) {
      errorMessage = 'Invalid API key. Please check your key and try again.'
    } else if (error.message?.includes('PERMISSION_DENIED') || error.status === 403) {
      errorMessage = 'Permission denied. Please ensure your API key has the correct permissions.'
    } else if (error.message?.includes('QUOTA_EXCEEDED') || error.status === 429) {
      errorMessage = 'API quota exceeded. Please check your usage limits.'
    } else if (error.status === 400) {
      errorMessage = 'Bad request. Please check your API key format.'
    } else if (error.status === 401) {
      errorMessage = 'Unauthorized. Please check your API key.'
    } else if (error.message?.includes('fetch')) {
      errorMessage = 'Network error. Please check your internet connection.'
    } else if (error.message) {
      errorMessage = `API Error: ${error.message}`
    }

    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? {
          originalError: error.message,
          status: error.status
        } : undefined
      },
      { status: 500 }
    )
  }
}