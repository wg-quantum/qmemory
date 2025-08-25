import { GoogleGenerativeAI } from '@google/generative-ai'
import { decryptApiKey } from './crypto'

let genAI: GoogleGenerativeAI | null = null

export function getGeminiClient(): GoogleGenerativeAI | null {
  if (genAI) return genAI

  // Try to get API key from localStorage (browser only)
  if (typeof window !== 'undefined') {
    const encryptedKey = localStorage.getItem('gemini_api_key_encrypted')
    if (encryptedKey) {
      try {
        const apiKey = decryptApiKey(encryptedKey)
        genAI = new GoogleGenerativeAI(apiKey)
        return genAI
      } catch (error) {
        console.error('Failed to initialize Gemini client:', error)
      }
    }
  }

  return null
}

export async function analyzeMemoryWithGemini(
  memory: string,
  emotion: string,
  apiKey: string
): Promise<{
  location: string
  story: string
  region: string
  secondaryLocations: Array<{ name: string; probability: number; description: string; region: string }>
}> {
  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  // Detect if this is about international locations
  const isInternational = /(Paris|London|New York|Rome|Berlin|Madrid|Amsterdam|Zurich|Sydney|Toronto|France|UK|USA|Italy|Germany|Spain|Netherlands|Switzerland|Australia|Canada|パリ|ロンドン|ニューヨーク|ローマ|ベルリン|マドリード|アムステルダム|チューリッヒ|シドニー|トロント|フランス|イギリス|アメリカ|イタリア|ドイツ|スペイン|オランダ|スイス|オーストラリア|カナダ|Europe|ヨーロッパ|海外|外国|石畳|教会|カフェ.*コーヒー|エッフェル塔|セーヌ川|テムズ川|高層ビル.*タクシー)/i.test(memory)
  
  const locationConstraint = isInternational 
    ? "Use real, existing locations worldwide that match the memory. If the memory suggests international locations (Europe, America, etc.), suggest those places. Include specific landmarks, cities, or well-known places that actually exist."
    : "Use real, existing locations primarily in Japan, but if the memory clearly suggests international locations, include those as well."

  const regionInstruction = isInternational
    ? '"region": "Country or major region (e.g., France, UK, USA, Italy, etc.)"'
    : '"region": "Prefecture, country, or region name"'

  const prompt = `
You are a quantum memory reconstruction AI that helps people discover meaningful locations from their memory fragments.

Given the following memory fragment and emotional context, suggest specific, real locations that could match this memory.

Memory Fragment: "${memory}"
Emotional Context: "${emotion}"

Please respond in the following JSON format:
{
  "primaryLocation": {
    "name": "A specific, real location name (city, landmark, or place)",
    "story": "A 2-3 sentence deeply emotional and poetic story connecting the memory to this place, written in Japanese",
    ${regionInstruction}
  },
  "secondaryLocations": [
    {
      "name": "Another possible real location",
      "probability": number between 10-30,
      "description": "Brief poetic description in Japanese",
      ${regionInstruction}
    },
    {
      "name": "Third possible real location", 
      "probability": number between 5-25,
      "description": "Brief poetic description in Japanese",
      ${regionInstruction}
    }
  ]
}

IMPORTANT: 
- ${locationConstraint}
- The locations should be places that actually exist and can be found on maps
- Match the geographic context of the memory (if it mentions Europe, suggest European places)
- Focus on creating emotionally resonant connections between the memory and real places
- Stories should be deeply moving and poetic, evoking the feeling of lost memories being recovered
- If memory mentions specific international elements (stone streets, churches, cafes in Europe, etc.), suggest international locations`

  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Parse the JSON response
    const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const data = JSON.parse(cleanedText)

    return {
      location: data.primaryLocation.name,
      story: data.primaryLocation.story,
      region: data.primaryLocation.region,
      secondaryLocations: data.secondaryLocations || []
    }
  } catch (error) {
    console.error('Gemini analysis error:', error)
    throw new Error('Failed to analyze memory with Gemini')
  }
}

export async function generateMemoryImage(
  location: string,
  memory: string,
  emotion: string,
  apiKey: string
): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const prompt = `
Create a detailed, artistic description for an image that represents:
- Location: ${location}
- Memory: ${memory}
- Emotion: ${emotion}

Describe the scene in vivid detail, including lighting, colors, atmosphere, and specific visual elements that would evoke nostalgia and emotional depth. The description should be suitable for image generation.`

  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Gemini image description error:', error)
    throw new Error('Failed to generate image description')
  }
}