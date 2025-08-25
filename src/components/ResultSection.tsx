'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Share2, Save, Map, ExternalLink } from 'lucide-react'
import { QuantumResult } from '@/types/quantum'
import MapComponent from './MapComponent'

interface ResultSectionProps {
  result: QuantumResult
}

export default function ResultSection({ result }: ResultSectionProps) {
  const [showMap, setShowMap] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState(result.primaryLocation)

  const handleSecondarySelect = (index: number) => {
    const secondary = result.secondaryLocations[index]
    setSelectedLocation({
      name: secondary.name,
      story: secondary.description,
      probability: secondary.probability,
      coordinates: secondary.coordinates || result.primaryLocation.coordinates,
      imageUrl: null
    })
  }

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Saving memory:', selectedLocation)
  }

  const handleShare = async () => {
    const text = `量子的観測により発見された記憶: ${selectedLocation.name}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Quantum Location Recall',
          text: text,
          url: window.location.href
        })
      } catch (error) {
        console.log('Share failed:', error)
      }
    } else {
      try {
        await navigator.clipboard.writeText(text)
        // TODO: Show notification
      } catch (error) {
        console.log('Copy failed:', error)
      }
    }
  }

  const openInOpenStreetMap = () => {
    const { lat, lng } = selectedLocation.coordinates
    const url = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=16`
    window.open(url, '_blank')
  }

  return (
    <div className="space-y-8">
      {/* Primary Result */}
      <section className="glass-card p-6 sm:p-8 text-center relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
        {/* Quantum glow effect */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-cosmic-gradient opacity-80" />
        
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
        >
          <div className="inline-flex items-center gap-2 bg-cosmic-gradient text-white px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <span className="text-lg">🌟</span>
            観測された記憶
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="font-playfair text-2xl sm:text-3xl lg:text-4xl font-semibold text-slate-100 mb-6 leading-tight">
            {selectedLocation.name}
          </h3>
        </motion.div>

        {selectedLocation.imageUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <img
              src={selectedLocation.imageUrl}
              alt="記憶の風景"
              className="w-full max-w-md h-64 object-cover rounded-2xl mx-auto mb-6 border border-slate-600/30"
            />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-lg leading-relaxed text-slate-300 max-w-2xl mx-auto mb-8">
            {selectedLocation.story}
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="flex flex-wrap justify-center gap-4 mb-6">
          <button
            onClick={() => setShowMap(!showMap)}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
          >
            <Map size={20} />
            {showMap ? '地図を隠す' : '地図を表示'}
          </button>

          <button
            onClick={openInOpenStreetMap}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
          >
            <ExternalLink size={20} />
            OpenStreetMapで開く
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
          >
            <Save size={20} />
            記憶を保存
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-2 bg-cosmic-500 hover:bg-cosmic-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
          >
            <Share2 size={20} />
            共有する
          </button>
          </div>
        </motion.div>

        {/* Map Component */}
        {showMap && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mt-6">
              <MapComponent location={selectedLocation} />
            </div>
          </motion.div>
        )}
        </motion.div>
      </section>

      {/* Secondary Results */}
      <section className="glass-card p-6 sm:p-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
        <h3 className="text-xl sm:text-2xl font-semibold text-slate-300 mb-6 text-center">
          🌀 他に思い出されたかもしれない場所
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {result.secondaryLocations.map((location, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div
                onClick={() => handleSecondarySelect(index)}
                className="bg-slate-900/50 border border-slate-600/40 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:bg-slate-900/70 hover:border-quantum-500 hover:-translate-y-1 hover:shadow-xl group relative overflow-hidden"
              >
              <div className="absolute top-0 left-0 w-full h-0.5 bg-cosmic-gradient transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              
              <div className="bg-cosmic-gradient text-white px-3 py-1 rounded-full text-xs font-bold mb-3 inline-block">
                {location.probability}%
              </div>
              
              <h4 className="font-semibold text-lg text-cosmic-400 mb-3 group-hover:text-cosmic-300 transition-colors">
                {location.name}
              </h4>
              
              <p className="text-slate-400 text-sm leading-relaxed">
                {location.description}
              </p>
              </div>
            </motion.div>
          ))}
        </div>
        </motion.div>
      </section>

      {/* Quantum State Display */}
      <section className="glass-card p-6 sm:p-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6 }}
        >
        <h3 className="text-xl font-semibold text-slate-300 mb-6 text-center">
          ⚛️ 量子状態パラメータ
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { label: 'コヒーレンス', value: result.quantumState.coherence, color: 'text-quantum-400' },
            { label: 'もつれ度', value: result.quantumState.entanglement, color: 'text-cosmic-400' },
            { label: '重ね合わせ', value: result.quantumState.superposition, color: 'text-emerald-400' }
          ].map((param, index) => (
            <div key={index} className="text-center">
              <div className={`text-2xl font-bold ${param.color} mb-2`}>
                {(param.value * 100).toFixed(1)}%
              </div>
              <div className="text-slate-400 text-sm">{param.label}</div>
              <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${param.value * 100}%` }}
                  transition={{ delay: 1.2 + index * 0.1, duration: 1 }}
                >
                  <div className={`h-2 rounded-full bg-gradient-to-r ${
                    param.color.includes('quantum') ? 'from-quantum-500 to-quantum-400' :
                    param.color.includes('cosmic') ? 'from-cosmic-500 to-cosmic-400' :
                    'from-emerald-500 to-emerald-400'
                  }`} style={{ width: '100%' }} />
                </motion.div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-6 text-slate-400 text-sm">
          解析時間: {result.analysisTime}ms
        </div>
        </motion.div>
      </section>
    </div>
  )
}