'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

interface MemorySuperpositionViewProps {
  mainLocation: string
  secondaryLocations: Array<{ location: string; probability: number; description: string }>
  isVisible: boolean
  onObservation?: (observedLocation: string) => void
  showAsCompleted?: boolean
}

export default function MemorySuperpositionView({ 
  mainLocation, 
  secondaryLocations, 
  isVisible,
  onObservation,
  showAsCompleted = true
}: MemorySuperpositionViewProps) {
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null)
  const [showQuantumFormula, setShowQuantumFormula] = useState(false)

  const allLocations = [
    { location: mainLocation, probability: 55 + Math.floor(Math.random() * 25), description: "主要な記憶の重ね合わせ状態" },
    ...secondaryLocations
  ]

  // Calculate total probability and normalize
  const totalProbability = allLocations.reduce((sum, loc) => sum + loc.probability, 0)
  const normalizedLocations = allLocations.map(loc => ({
    ...loc,
    normalizedProbability: (loc.probability / totalProbability) * 100
  }))

  const quantumStateNotation = normalizedLocations.map((loc, index) => ({
    amplitude: Math.sqrt(loc.normalizedProbability / 100).toFixed(3),
    location: loc.location,
    index
  }))

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowQuantumFormula(true)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])



  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass-effect rounded-3xl p-6 md:p-8"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">曖昧な記憶の並列処理</h2>
        <p className="text-gray-300">量子重ね合わせによる記憶再構成</p>
      </div>

      {/* 量子観測セクション */}
      <div className="flex flex-col items-center space-y-4 mb-8">
        <div className="text-center mb-4">
          <h3 className="text-lg font-bold text-white mb-2">⚛️ 量子測定による記憶の確定</h3>
          <p className="text-sm text-gray-300">重ね合わせ状態から最も可能性の高い記憶を選択...</p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-3 max-w-lg">
          {secondaryLocations.map((location, index) => (
            <div
              key={index}
              className="px-4 py-2 rounded-full text-sm font-medium border-2 bg-blue-500/20 border-blue-400/50 text-blue-200"
            >
              {location.location}
            </div>
          ))}
        </div>
        
        <div className="text-center mt-4">
          <p className="text-yellow-300 font-mono text-sm">
            🎯 観測結果: {mainLocation}
          </p>
        </div>
      </div>

      {/* 記憶フラグメント */}
      <div className="grid grid-cols-3 gap-6 relative z-10 mb-8">
        {["暖かい風", "石畳", "夕暮れ", "やわらかい光", "静寂", "木の香り"].map((fragment, index) => (
          <div
            key={index}
            className="flex flex-col items-center"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs font-medium mb-2">
              |ψ⟩
            </div>
            <span className="text-xs text-gray-400 text-center">{fragment}</span>
          </div>
        ))}
      </div>

      {/* 確率分布バー */}
      <div className="mb-8 space-y-3">
        {normalizedLocations.map((location, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: index * 0.1 }}
            className="relative"
            onHoverStart={() => setHoveredLocation(location.location)}
            onHoverEnd={() => setHoveredLocation(null)}
          >
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-900/30 backdrop-blur-sm border border-gray-600/20 hover:border-blue-400/40 transition-all duration-300">
              <div className="w-20 text-right">
                <span className={`text-sm font-mono ${index === 0 ? 'text-yellow-300' : 'text-blue-300'}`}>
                  {location.location.length > 8 ? location.location.slice(0, 6) + '..' : location.location}
                </span>
              </div>
              
              {/* 量子波動バー */}
              <div className="flex-1 relative h-8 bg-gray-800/50 rounded-full overflow-hidden">
                {/* 背景の量子波動エフェクト */}
                <motion.div
                  className="absolute inset-0 opacity-20"
                  style={{
                    background: index === 0 
                      ? 'linear-gradient(90deg, #fbbf24, #f59e0b, #d97706, #fbbf24)'
                      : `linear-gradient(90deg, #3b82f6, #1e40af, #1e3a8a, #3b82f6)`,
                    backgroundSize: '200% 100%'
                  }}
                  animate={{
                    backgroundPosition: ['0% 0%', '100% 0%']
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
                
                {/* 確率バー */}
                <motion.div
                  className="absolute left-0 top-0 h-full rounded-full"
                  style={{
                    background: index === 0 
                      ? 'linear-gradient(90deg, rgba(251,191,36,0.8) 0%, rgba(245,158,11,0.9) 50%, rgba(217,119,6,0.8) 100%)'
                      : `linear-gradient(90deg, rgba(59,130,246,0.6) 0%, rgba(30,64,175,0.8) 50%, rgba(30,58,138,0.6) 100%)`,
                    boxShadow: index === 0 
                      ? '0 0 20px rgba(251,191,36,0.4), inset 0 0 20px rgba(251,191,36,0.2)'
                      : '0 0 15px rgba(59,130,246,0.3), inset 0 0 15px rgba(59,130,246,0.2)'
                  }}
                  initial={{ width: 0 }}
                  animate={{ 
                    width: `${location.normalizedProbability}%`,
                    opacity: hoveredLocation === location.location ? 1 : 0.8
                  }}
                  transition={{ 
                    duration: 1.2, 
                    delay: index * 0.2,
                    type: "spring",
                    stiffness: 100
                  }}
                >
                  {/* 波動パターン */}
                  <div 
                    className="h-full w-full rounded-full"
                    style={{
                      background: `repeating-linear-gradient(
                        45deg,
                        transparent,
                        transparent 2px,
                        rgba(255,255,255,0.1) 2px,
                        rgba(255,255,255,0.1) 4px
                      )`
                    }}
                  />
                </motion.div>
                
                {/* 量子干渉パターン */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `radial-gradient(circle at ${location.normalizedProbability}% 50%, rgba(255,255,255,0.3) 0%, transparent 30%)`
                  }}
                  animate={{
                    opacity: [0.3, 0.7, 0.3]
                  }}
                  transition={{
                    duration: 2 + index * 0.3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>
              
              {/* 確率値表示 */}
              <div className="w-16 text-center">
                <motion.span 
                  className={`text-lg font-bold font-mono ${
                    index === 0 ? 'text-yellow-300' : 'text-blue-300'
                  }`}
                  animate={hoveredLocation === location.location ? {
                    scale: [1, 1.2, 1],
                    textShadow: [
                      "0 0 0px rgba(251,191,36,0)",
                      "0 0 10px rgba(251,191,36,0.8)",
                      "0 0 0px rgba(251,191,36,0)"
                    ]
                  } : {}}
                  transition={{ duration: 0.6, repeat: Infinity }}
                >
                  {location.normalizedProbability.toFixed(1)}%
                </motion.span>
              </div>
              
              {/* 量子状態インジケーター */}
              <div className="w-3 h-3">
                <motion.div
                  className={`w-full h-full rounded-full border-2 ${
                    index === 0 
                      ? 'border-yellow-400 bg-yellow-400/30' 
                      : 'border-blue-400 bg-blue-400/20'
                  }`}
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{
                    duration: 1.5 + index * 0.2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 処理段階表示 */}
      <div className="space-y-4 mb-6">
        {[
          { title: '量子状態エンコード', description: '記憶断片を量子ビット状態に変換完了' },
          { title: '重ね合わせ状態生成', description: '全ての可能性を同時に処理完了' },
          { title: '量子もつれによる関連性発見', description: '記憶要素間の隠れた相関を抽出完了' },
          { title: '量子干渉による増幅', description: '適切な記憶候補を強化完了' },
          { title: '観測による状態確定', description: '重ね合わせ状態から記憶を観測完了' },
          { title: '波動関数の収束', description: '量子測定により最も可能性の高い記憶を確定完了' }
        ].map((stage, index) => (
          <div
            key={index}
            className="flex items-center gap-4 p-4 rounded-xl transition-all duration-300 bg-green-500/20 border border-green-400/30"
          >
            <div className="relative">
              <div className="w-4 h-4 rounded-full bg-green-500">
                <svg className="w-3 h-3 text-white absolute inset-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            <div className="flex-1">
              <h4 className="font-semibold text-white">{stage.title}</h4>
              <p className="text-sm text-gray-400">{stage.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 量子計算量表示 */}
      <div className="mt-8 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 rounded-2xl p-6 border border-blue-400/20">
        <div className="text-center mb-4">
          <h4 className="text-lg font-semibold text-white mb-2">量子処理パフォーマンス</h4>
          <div className="w-16 h-0.5 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 mx-auto rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-black/20 rounded-xl p-4 border border-blue-400/20">
            <div className="flex items-center justify-between mb-3">
              <div className="text-blue-300 text-sm font-medium">量子ビット数</div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">6</div>
            <div className="text-xs text-blue-200/70">Quantum Bits</div>
          </div>
          
          <div className="bg-black/20 rounded-xl p-4 border border-purple-400/20">
            <div className="flex items-center justify-between mb-3">
              <div className="text-purple-300 text-sm font-medium">重ね合わせ状態</div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">2<sup className="text-lg">6</sup></div>
            <div className="text-xs text-purple-200/70">Superposition States</div>
          </div>
        </div>
      </div>

      {/* 量子詳細分析パネル */}
      <AnimatePresence>
        {hoveredLocation && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="relative max-w-lg mx-auto mt-6"
          >
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-blue-400/30 relative overflow-hidden">
              {/* 量子エネルギーグラデーション */}
              <div 
                className="absolute inset-0 opacity-10"
                style={{
                  background: `radial-gradient(circle at 50% 50%, 
                    ${normalizedLocations.find(loc => loc.location === hoveredLocation)?.location === mainLocation 
                      ? 'rgba(251,191,36,0.4)' : 'rgba(59,130,246,0.3)'} 0%, 
                    transparent 70%)`
                }}
              />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-white text-lg flex items-center gap-2">
                    <motion.span
                      className={`w-3 h-3 rounded-full ${
                        normalizedLocations.find(loc => loc.location === hoveredLocation)?.location === mainLocation
                          ? 'bg-yellow-400' : 'bg-blue-400'
                      }`}
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.7, 1, 0.7]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    {hoveredLocation}
                  </h4>
                  
                  {/* 量子レベル表示 */}
                  <div className="flex items-center gap-1">
                    {normalizedLocations.find(loc => loc.location === hoveredLocation)?.location === mainLocation && (
                      <motion.div
                        className="px-2 py-1 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-400/50"
                        animate={{ boxShadow: ["0 0 0px rgba(251,191,36,0)", "0 0 10px rgba(251,191,36,0.5)", "0 0 0px rgba(251,191,36,0)"] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        基底状態
                      </motion.div>
                    )}
                  </div>
                </div>
                
                <p className="text-gray-300 leading-relaxed mb-4 text-sm">
                  {normalizedLocations.find(loc => loc.location === hoveredLocation)?.description}
                </p>
                
                {/* 量子パラメータ表示 */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-800/30 rounded-xl border border-gray-600/20">
                    <div className={`text-lg font-mono font-bold ${
                      normalizedLocations.find(loc => loc.location === hoveredLocation)?.location === mainLocation 
                        ? 'text-yellow-300' : 'text-blue-300'
                    }`}>
                      {normalizedLocations.find(loc => loc.location === hoveredLocation)?.normalizedProbability.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-400">📈 一致確率</div>
                  </div>
                  
                  <div className="text-center p-3 bg-gray-800/30 rounded-xl border border-gray-600/20">
                    <div className="text-lg font-mono font-bold text-purple-300">
                      {Math.sqrt(normalizedLocations.find(loc => loc.location === hoveredLocation)?.normalizedProbability / 100).toFixed(3)}
                    </div>
                    <div className="text-xs text-gray-400">⚡ 計算強度</div>
                  </div>
                </div>
                
                {/* 波動関数表示 */}
                <div className="bg-gray-900/40 rounded-xl p-3 border border-gray-600/30">
                  <div className="text-center text-sm font-mono text-blue-300 mb-2">
                    |{hoveredLocation.length > 6 ? hoveredLocation.slice(0, 4) + '..' : hoveredLocation}⟩ = 
                    <span className="text-purple-300 ml-2">
                      {Math.sqrt(normalizedLocations.find(loc => loc.location === hoveredLocation)?.normalizedProbability / 100).toFixed(3)}
                    </span>
                    <span className="text-white">|記憶⟩</span>
                  </div>
                  
                  {/* 量子干渉パターン */}
                  <div className="h-8 bg-gray-800/50 rounded-lg overflow-hidden relative">
                    <motion.div
                      className={`h-full rounded-lg ${
                        normalizedLocations.find(loc => loc.location === hoveredLocation)?.location === mainLocation
                          ? 'bg-gradient-to-r from-yellow-500/30 via-yellow-400/50 to-yellow-500/30'
                          : 'bg-gradient-to-r from-blue-500/30 via-blue-400/50 to-blue-500/30'
                      }`}
                      style={{
                        width: `${normalizedLocations.find(loc => loc.location === hoveredLocation)?.normalizedProbability}%`
                      }}
                      animate={{
                        opacity: [0.6, 1, 0.6]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    
                    {/* 波動パターン */}
                    <div className="absolute inset-0 opacity-30"
                      style={{
                        background: `repeating-linear-gradient(
                          90deg,
                          transparent,
                          transparent 4px,
                          rgba(255,255,255,0.2) 4px,
                          rgba(255,255,255,0.2) 6px
                        )`
                      }}
                    />
                  </div>
                  
                  <div className="text-xs text-gray-500 text-center mt-2">
                    🌊 量子コンピューターによる並列計算結果
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  )
}