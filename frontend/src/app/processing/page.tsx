'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import QuantumProcessingVisualizer from '@/components/QuantumProcessingVisualizer'
import ParticleBackground from '@/components/ParticleBackground'
import { GeminiAnalysisResult, QuantumResult, SecondaryLocation } from '@/types/quantum'
import { geocodeLocation } from '@/lib/geocoding'
import ImageService from '@/lib/imageService'

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
    if (!analysisResult) return

    try {
      const geminiResult = analysisResult

      // Geocode primary location
      const primaryGeocode = await geocodeLocation(geminiResult.location)
      const primaryImage = await ImageService.getLocationImage(geminiResult.location, geminiResult.region)

      // Process secondary locations
      const secondaryLocationsWithData = await Promise.allSettled(
        geminiResult.secondaryLocations.map(async (loc: any) => {
          const geocode = await geocodeLocation(loc.name)
          const image = await ImageService.getLocationImage(loc.name, loc.region)
          
          return {
            name: loc.name,
            probability: loc.probability,
            description: loc.description,
            coordinates: geocode?.coordinates || null,
            imageUrl: image ?? null
          } as SecondaryLocation
        })
      )

      const processedSecondaryLocations = secondaryLocationsWithData
        .filter((result): result is PromiseFulfilledResult<SecondaryLocation> => result.status === 'fulfilled')
        .map(result => result.value)

      const quantumResult: QuantumResult = {
        primaryLocation: {
          name: geminiResult.location,
          story: geminiResult.story,
          probability: 75 + Math.floor(Math.random() * 20), // 75-95%
          coordinates: primaryGeocode?.coordinates || { lat: 35.6762, lng: 139.6503 },
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
      setError('量子処理に失敗しました')
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