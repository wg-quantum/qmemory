'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Download, Share2 } from 'lucide-react'
import html2canvas from 'html2canvas'
import Image from 'next/image'
import ParticleBackground from '@/components/ParticleBackground'
import MapComponent from '@/components/MapComponent'
import MemorySuperpositionView from '@/components/MemorySupersitionView'
import ImageService from '@/lib/imageService'
import { QuantumResult } from '@/types/quantum'

export default function ResultPage() {
  const router = useRouter()
  const [result, setResult] = useState<QuantumResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isSharing, setIsSharing] = useState(false)

  useEffect(() => {
    const resultData = sessionStorage.getItem('quantumResult')
    if (resultData) {
      try {
        const parsed = JSON.parse(resultData)
        setResult(parsed)
      } catch (err) {
        console.error('Failed to parse result data:', err)
        setError('結果データの読み込みに失敗しました')
      }
    } else {
      setError('結果データが見つかりません')
    }
  }, [])

  const handleSaveMemory = async () => {
    if (isSaving) return
    setIsSaving(true)
    
    try {
      const container = document.querySelector('.result-container')
      if (!container) return
      
      const canvas = await html2canvas(container as HTMLElement, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#0f172a',
        scale: 1.5
      })
      
      const link = document.createElement('a')
      link.download = `quantum-memory-${new Date().toISOString().slice(0, 10)}.png`
      link.href = canvas.toDataURL('image/png', 0.9)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Failed to save memory:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleShareMemory = async () => {
    if (isSharing) return
    setIsSharing(true)
    
    try {
      const container = document.querySelector('.result-container')
      if (!container) return
      
      const canvas = await html2canvas(container as HTMLElement, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#0f172a',
        scale: 1.5
      })
      
      canvas.toBlob(async (blob) => {
        if (!blob) return

        if (navigator.share && typeof navigator.canShare === 'function') {
          try {
            const file = new File([blob], `quantum-memory-${Date.now()}.png`, { type: 'image/png' })
            const shareData = {
              title: 'Quantum Memory Reconstruction',
              text: '量子重ね合わせによる記憶再構成',
              files: [file]
            }
            
            if (navigator.canShare(shareData)) {
              await navigator.share(shareData)
            } else {
              throw new Error('File sharing not supported')
            }
            return
          } catch (shareError) {
            console.log('Native share failed, falling back to download')
          }
        }

        // Fallback to download
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.download = `quantum-memory-${Date.now()}.png`
        link.href = url
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }, 'image/png', 0.9)
    } catch (error) {
      console.error('Failed to share memory:', error)
    } finally {
      setIsSharing(false)
    }
  }

  if (error || !result) {
    return (
      <>
        <ParticleBackground />
        <div className="min-h-screen flex items-center justify-center">
          <div className="glass-effect rounded-3xl p-8 max-w-md">
            <p className="text-red-300 text-center">{error || '結果が見つかりません'}</p>
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
      
      {/* Back button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="fixed top-6 left-6 z-50"
      >
        <button
          className="px-6 py-3 rounded-2xl text-gray-200 hover:text-white transition-all duration-300"
          style={{
            background: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(71, 85, 105, 0.3)',
          }}
          onClick={() => router.push('/')}
        >
          ← 戻る
        </button>
      </motion.div>

      {/* Save/Share buttons */}
      <div className="fixed top-6 right-6 z-50 flex gap-3">
        <motion.button 
          onClick={handleSaveMemory}
          disabled={isSaving}
          className="p-3 rounded-full glass-effect text-white/80 hover:text-white transition-all duration-300 disabled:opacity-50 hover:scale-110"
          title="記憶を保存"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Download size={20} className={isSaving ? 'animate-pulse' : ''} />
        </motion.button>
        <motion.button 
          onClick={handleShareMemory}
          disabled={isSharing}
          className="p-3 rounded-full glass-effect text-white/80 hover:text-white transition-all duration-300 disabled:opacity-50 hover:scale-110"
          title="記憶を共有"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Share2 size={20} className={isSharing ? 'animate-pulse' : ''} />
        </motion.button>
      </div>

      <div className="result-container min-h-screen relative z-10 max-w-6xl mx-auto px-4 md:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* Main result - single card */}
          <div className="result-card rounded-3xl p-8 md:p-10">
            <div className="observation-badge mb-6 text-center">
              観測された記憶
            </div>
            
            <h3 className="text-2xl md:text-3xl font-bold mb-8 text-gray-100 font-['Playfair_Display'] text-center">
              {result.primaryLocation.name}
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Left: Image */}
              <div>
                {result.primaryLocation.imageUrl && (
                  <Image
                    src={result.primaryLocation.imageUrl}
                    alt={result.primaryLocation.name}
                    width={800}
                    height={600}
                    unoptimized
                    className="w-full h-64 md:h-80 object-cover rounded-2xl shadow-2xl"
                    onError={(event) => {
                      const target = event.currentTarget
                      target.src = ImageService.generatePlaceholder(800, 600, result.primaryLocation.name)
                    }}
                  />
                )}
              </div>

              {/* Right: Story and map */}
              <div className="flex flex-col">
                <h4 className="text-xl font-semibold mb-4 text-gray-100">記憶の詳細</h4>
                
                <p className="text-base md:text-lg text-gray-300 leading-relaxed mb-6 flex-grow">
                  {result.primaryLocation.story}
                </p>

                <div>
                  <MapComponent location={result.primaryLocation} />
                </div>
              </div>
            </div>
          </div>

          {/* Secondary locations */}
          {result.secondaryLocations.length > 0 && (
            <div className="glass-effect rounded-3xl p-6 md:p-8">
              <h3 className="text-xl md:text-2xl font-semibold mb-6 text-center text-gray-100">
                他に思い出されたかもしれない場所
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {result.secondaryLocations.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="glass-effect rounded-2xl p-4 md:p-6 card-hover h-full flex flex-col relative">
                      <div className="absolute top-4 right-4">
                        <span className="text-lg font-bold text-blue-300">
                          {item.probability}%
                        </span>
                      </div>
                      
                      <h4 className="text-base md:text-lg font-medium text-gray-200 mb-3">
                        {item.name}
                      </h4>
                      
                      {item.imageUrl && (
                        <div className="mb-3">
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            width={400}
                            height={300}
                            unoptimized
                            className="w-full h-28 md:h-32 object-cover rounded-xl"
                            onError={(event) => {
                              const target = event.currentTarget
                              target.src = ImageService.generatePlaceholder(400, 300, item.name)
                            }}
                          />
                        </div>
                      )}
                      
                      <p className="text-xs md:text-sm text-gray-400 leading-relaxed mb-3 flex-grow">
                        {item.description}
                      </p>

                      {item.coordinates && (
                        <div className="mb-3">
                          <div className="w-full h-20 md:h-24 rounded-lg overflow-hidden">
                            <MapComponent 
                              location={{
                                name: item.name,
                                story: item.description,
                                probability: item.probability,
                                coordinates: item.coordinates,
                                imageUrl: item.imageUrl
                              }} 
                            />
                          </div>
                        </div>
                      )}

                      <button 
                        className="w-full px-4 py-2 rounded-xl text-sm font-medium text-white transition-all duration-300 hover:scale-105 mt-auto"
                        style={{ background: 'linear-gradient(135deg, #60a5fa, #a78bfa)' }}
                        onClick={() => {
                          if (item.coordinates) {
                            const url = `https://www.openstreetmap.org/?mlat=${item.coordinates.lat}&mlon=${item.coordinates.lng}&zoom=15`
                            window.open(url, '_blank')
                          }
                        }}
                      >
                        地図で見る
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Quantum superposition view */}
          <MemorySuperpositionView 
            mainLocation={result.primaryLocation.name}
            secondaryLocations={result.secondaryLocations.map(loc => ({
              location: loc.name,
              probability: loc.probability,
              description: loc.description
            }))}
            isVisible={true}
            showAsCompleted={true}
          />
        </motion.div>
      </div>
    </>
  )
}