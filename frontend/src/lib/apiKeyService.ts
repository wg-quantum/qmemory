/**
 * API Key Service - Handles API key retrieval from multiple sources
 */

export interface ApiKeyInfo {
  key: string
  source: 'environment' | 'localStorage' | 'none'
  isValid: boolean
}

export class ApiKeyService {
  /**
   * Get Gemini API key from localStorage (client-side only)
   * Environment variables are handled server-side via API routes
   */
  static getGeminiApiKey(): ApiKeyInfo {
    // Check localStorage (client-side)
    if (typeof window !== 'undefined') {
      const localKey = localStorage.getItem('gemini_api_key')
      if (localKey) {
        return {
          key: localKey,
          source: 'localStorage',
          isValid: this.validateGeminiApiKey(localKey)
        }
      }
    }

    return {
      key: '',
      source: 'none',
      isValid: false
    }
  }

  /**
   * Check if environment API key is available (server-side check)
   */
  static async checkEnvironmentApiKey(): Promise<{
    hasKey: boolean
    source: 'environment' | 'none'
  }> {
    try {
      const response = await fetch('/api/config')
      const data = await response.json()
      
      return {
        hasKey: data.config?.hasGeminiApiKey || false,
        source: data.config?.geminiKeySource || 'none'
      }
    } catch (error) {
      console.error('Failed to check environment API key:', error)
      return {
        hasKey: false,
        source: 'none'
      }
    }
  }

  /**
   * Analyze memory using quantum engine, then fallback to Gemini AI
   */
  static async analyzeMemory(memory: string, emotion: string): Promise<any> {
    // Clean memory text and ensure fresh analysis
    const cleanMemory = memory.replace(/\s*\[\d+\]\s*$/, '').trim()
    const timestamp = Date.now()
    
    console.log('ApiKeyService: Starting analysis for:', cleanMemory.slice(0, 50) + '...')
    
    // First try quantum engine (if available)
    try {
      const response = await fetch('/api/quantum/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'X-Timestamp': timestamp.toString()
        },
        body: JSON.stringify({ memory: cleanMemory, emotion, timestamp }),
      })

      const data = await response.json()
      
      if (data.success) {
        return {
          success: true,
          result: data.result,
          source: 'quantum_engine'
        }
      }
    } catch (error) {
      console.warn('Quantum engine analysis failed, trying Gemini AI:', error)
    }

    // Fallback to Gemini AI (environment key)
    try {
      const response = await fetch('/api/gemini/analyze-memory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'X-Timestamp': timestamp.toString()
        },
        body: JSON.stringify({ memory: cleanMemory, emotion, timestamp }),
      })

      const data = await response.json()
      
      if (data.success) {
        return {
          success: true,
          result: data.result,
          source: 'gemini_env'
        }
      }
    } catch (error) {
      console.warn('Server-side Gemini analysis failed, trying localStorage key:', error)
    }

    // Fallback to client-side with localStorage key
    const apiKeyInfo = this.getGeminiApiKey()
    if (!apiKeyInfo.isValid) {
      throw new Error('No valid API key found. Please set GEMINI_API_KEY environment variable or configure it in settings.')
    }

    // Import and use client-side analysis
    const { analyzeMemoryWithGemini } = await import('@/lib/gemini')
    const result = await analyzeMemoryWithGemini(cleanMemory, emotion, apiKeyInfo.key)
    
    return {
      success: true,
      result,
      source: 'gemini_local'
    }
  }

  /**
   * Get Unsplash API key for better image quality
   */
  static getUnsplashApiKey(): string | null {
    // Environment variable (public)
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY) {
      return process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY
    }

    // Fallback to localStorage
    if (typeof window !== 'undefined') {
      return localStorage.getItem('unsplash_api_key')
    }

    return null
  }

  /**
   * Validate if API key format is correct
   */
  static validateGeminiApiKey(key: string): boolean {
    if (!key || key.trim().length === 0) return false
    
    // Basic format validation for Gemini API key
    // Gemini API keys typically start with 'AI' and are around 40 characters
    const trimmedKey = key.trim()
    return trimmedKey.length >= 30 && trimmedKey.length <= 50
  }

  /**
   * Save API key to localStorage (client-side only)
   */
  static saveGeminiApiKey(key: string): boolean {
    if (typeof window === 'undefined') return false
    
    try {
      if (key.trim().length === 0) {
        localStorage.removeItem('gemini_api_key')
      } else {
        localStorage.setItem('gemini_api_key', key.trim())
      }
      return true
    } catch (error) {
      console.error('Failed to save API key:', error)
      return false
    }
  }

  /**
   * Get API key source information for display
   */
  static getApiKeySourceInfo(): {
    hasEnvironmentKey: boolean
    hasLocalStorageKey: boolean
    currentSource: 'environment' | 'localStorage' | 'none'
  } {
    const hasEnvironmentKey = typeof process !== 'undefined' && !!process.env.GEMINI_API_KEY
    const hasLocalStorageKey = typeof window !== 'undefined' && !!localStorage.getItem('gemini_api_key')
    
    let currentSource: 'environment' | 'localStorage' | 'none' = 'none'
    if (hasEnvironmentKey) {
      currentSource = 'environment'
    } else if (hasLocalStorageKey) {
      currentSource = 'localStorage'
    }

    return {
      hasEnvironmentKey,
      hasLocalStorageKey,
      currentSource
    }
  }
}

export default ApiKeyService