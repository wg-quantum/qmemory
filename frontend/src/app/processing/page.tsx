'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import QuantumProcessingVisualizer from '@/components/QuantumProcessingVisualizer'
import ParticleBackground from '@/components/ParticleBackground'
import { GeminiAnalysisResult, QuantumResult, SecondaryLocation } from '@/types/quantum'
import { geocodeLocation } from '@/lib/geocoding'
import ImageService from '@/lib/imageService'
import CoordinateService from '@/lib/coordinateService'

export default function ProcessingPage() {
  const router = useRouter()
  const [analysisResult, setAnalysisResult] = useState<GeminiAnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Get analysis result from sessionStorage
    const resultData = sessionStorage.getItem('analysisResult')
    if (resultData) {
      try {
        const parsed = JSON.parse(resultData)
        setAnalysisResult(parsed)
      } catch (err) {
        console.error('Failed to parse analysis result:', err)
        setError('解析データの読み込みに失敗しました')
      }
    } else {
      setError('解析データが見つかりません')
    }
  }, [])

  const handleComplete = async () => {
    if (!analysisResult) {
      setError('解析結果が無いため処理できません')
      return
    }

    try {
      console.log('Starting quantum processing...')
      const geminiResult = analysisResult

      // Safely geocode primary location with fallback
      let primaryGeocode = null
      let primaryImage = ''
      
      try {
        primaryGeocode = await geocodeLocation(geminiResult.location)
      } catch (geocodeError) {
        console.warn('Primary geocoding failed, using fallback:', geocodeError)
      }
      
      try {
        primaryImage = await ImageService.getLocationImage(geminiResult.location, geminiResult.region)
      } catch (imageError) {
        console.warn('Primary image loading failed:', imageError)
      }

      // Process secondary locations with error handling
      const secondaryLocationPromises = (geminiResult.secondaryLocations || []).map(async (loc: any) => {
        try {
          const geocode = await geocodeLocation(loc.name).catch(() => null)
          const image = await ImageService.getLocationImage(loc.name, loc.region || '特定地域').catch(() => '')
          
          return {
            name: loc.name || '未特定の場所',
            probability: loc.probability || 30,
            description: loc.description || '量子推定による候補地',
            coordinates: geocode?.coordinates || CoordinateService.getCoordinatesForLocation(loc.name, loc.region),
            imageUrl: image || null
          } as SecondaryLocation
        } catch (locError) {
          console.warn(`Failed to process location ${loc.name}:`, locError)
          return null
        }
      })
      
      const secondaryLocationsWithData = await Promise.allSettled(secondaryLocationPromises)

      const processedSecondaryLocations = secondaryLocationsWithData
        .filter((result): result is PromiseFulfilledResult<SecondaryLocation> => result.status === 'fulfilled')
        .map(result => result.value)

      const quantumResult: QuantumResult = {
        primaryLocation: {
          name: geminiResult.location,
          story: geminiResult.story,
          probability: 75 + Math.floor(Math.random() * 20), // 75-95%
          coordinates: primaryGeocode?.coordinates || CoordinateService.getCoordinatesForLocation(geminiResult.location, geminiResult.region),
          imageUrl: primaryImage
        },
        secondaryLocations: processedSecondaryLocations,
        quantumState: {
          coherence: Math.random(),
          entanglement: Math.random(),
          superposition: Math.random()
        },
        analysisTime: Date.now()
      }

      // Store result in sessionStorage and navigate
      sessionStorage.setItem('quantumResult', JSON.stringify(quantumResult))
      router.push('/result')
    } catch (err) {
      console.error('Quantum processing failed:', err)
      setError(err instanceof Error ? err.message : '量子処理中にエラーが発生しました。もう一度お試しください。')
    }
  }

  if (error) {
    return (
      <>
        <ParticleBackground />
        <div className="min-h-screen flex items-center justify-center">
          <div className="glass-effect rounded-3xl p-8 max-w-md">
            <p className="text-red-300 text-center">{error}</p>
            <button 
              onClick={() => router.push('/')}
              className="btn-gradient w-full mt-4 py-2 px-4 rounded-xl"
            >
              戻る
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <ParticleBackground />
      <div className="min-h-screen flex items-center justify-center">
        <QuantumProcessingVisualizer
          isProcessing={true}
          mainLocation={analysisResult?.location}
          secondaryLocations={analysisResult?.secondaryLocations?.map((loc: any) => ({
            location: loc.name,
            probability: loc.probability,
            description: loc.description
          }))}
          onComplete={handleComplete}
        />
      </div>
    </>
  )
}