'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

interface ProcessingStage {
  id: string
  title: string
  description: string
  status: 'pending' | 'processing' | 'completed'
  duration: number
  quantum_effect?: 'superposition' | 'entanglement' | 'interference' | 'collapse'
}

interface QuantumProcessingVisualizerProps {
  isProcessing: boolean
  onComplete?: () => void
  mainLocation?: string
  secondaryLocations?: Array<{ location: string; probability: number; description: string }>
}

const processingStages: ProcessingStage[] = [
  {
    id: 'encoding',
    title: '量子状態エンコード',
    description: '記憶断片を量子ビット状態に変換中...',
    status: 'pending',
    duration: 800,
    quantum_effect: 'superposition'
  },
  {
    id: 'superposition',
    title: '重ね合わせ状態生成',
    description: '全ての可能性を同時に処理中...',
    status: 'pending',
    duration: 1000,
    quantum_effect: 'superposition'
  },
  {
    id: 'entanglement',
    title: '量子もつれによる関連性発見',
    description: '記憶要素間の隠れた相関を抽出中...',
    status: 'pending',
    duration: 900,
    quantum_effect: 'entanglement'
  },
  {
    id: 'interference',
    title: '量子干渉による増幅',
    description: '適切な記憶候補を強化中...',
    status: 'pending',
    duration: 700,
    quantum_effect: 'interference'
  },
  {
    id: 'measurement',
    title: '観測による状態確定',
    description: '重ね合わせ状態から記憶を観測中...',
    status: 'pending',
    duration: 1200,
    quantum_effect: 'collapse'
  },
  {
    id: 'collapse',
    title: '波動関数の収束',
    description: '量子測定により最も可能性の高い記憶を確定...',
    status: 'pending',
    duration: 800,
    quantum_effect: 'collapse'
  }
]

const MEMORY_FRAGMENTS = [
  '夕暮れ', '塩の匂い', '暖かい風', '石畳', '古い階段', '猫の声',
  '雨音', '木の香り', '遠い汽笛', '懐かしい歌', 'やわらかい光', '静寂'
]

export default function QuantumProcessingVisualizer({ 
  isProcessing, 
  onComplete, 
  mainLocation, 
  secondaryLocations 
}: QuantumProcessingVisualizerProps) {
  const [stages, setStages] = useState<ProcessingStage[]>(processingStages)
  const [currentStageIndex, setCurrentStageIndex] = useState(-1)
  const [memoryFragments, setMemoryFragments] = useState<string[]>([])
  const [showQuantumObservation, setShowQuantumObservation] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)

  const quantumEffectVariants = {
    superposition: {
      initial: { opacity: 0, scale: 0.8 },
      animate: { 
        opacity: [0, 1, 0.7, 1],
        scale: [0.8, 1.2, 0.9, 1],
        rotate: [0, 180, 360],
        transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
      }
    },
    entanglement: {
      initial: { pathLength: 0 },
      animate: { 
        pathLength: 1,
        transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
      }
    },
    interference: {
      initial: { opacity: 0.3 },
      animate: { 
        opacity: [0.3, 1, 0.3],
        scale: [1, 1.1, 1],
        transition: { duration: 1, repeat: Infinity, ease: "easeInOut" }
      }
    },
    collapse: {
      initial: { scale: 1.2, opacity: 0.8 },
      animate: { 
        scale: [1.2, 0.8, 1],
        opacity: [0.8, 1, 1],
        transition: { duration: 0.8, repeat: Infinity, ease: "easeOut" }
      }
    }
  }

  useEffect(() => {
    if (isProcessing) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isProcessing])

  useEffect(() => {
    if (!isProcessing) {
      setStages(processingStages.map(stage => ({ ...stage, status: 'pending' })))
      setCurrentStageIndex(-1)
      setMemoryFragments([])
      setShowQuantumObservation(false)
      setSelectedLocation(null)
      return
    }

    const fragments = Array.from({ length: 6 }, () => 
      MEMORY_FRAGMENTS[Math.floor(Math.random() * MEMORY_FRAGMENTS.length)]
    )
    setMemoryFragments(fragments)

    const timeouts: Array<ReturnType<typeof setTimeout>> = []
    let stageIndex = 0

    const processStage = () => {
      if (stageIndex >= processingStages.length) {
        timeouts.push(setTimeout(() => {
          onComplete?.()
        }, 500))
        return
      }

      setCurrentStageIndex(stageIndex)
      setStages(prev => prev.map((stage, index) => ({
        ...stage,
        status: index === stageIndex ? 'processing' : index < stageIndex ? 'completed' : 'pending'
      })))

      timeouts.push(setTimeout(() => {
        setStages(prev => prev.map((stage, index) => ({
          ...stage,
          status: index <= stageIndex ? 'completed' : 'pending'
        })))

        const currentStage = processingStages[stageIndex]
        if (currentStage.id === 'measurement' && mainLocation && secondaryLocations?.length) {
          setShowQuantumObservation(true)

          const allLocations = [
            { location: mainLocation, probability: 55 + Math.floor(Math.random() * 25), description: "主要な記憶の重ね合わせ状態" },
            ...secondaryLocations
          ]

          const totalProbability = allLocations.reduce((sum, loc) => sum + loc.probability, 0)
          const normalizedLocations = allLocations.map(loc => ({
            ...loc,
            normalizedProbability: (loc.probability / totalProbability) * 100
          }))

          timeouts.push(setTimeout(() => {
            const random = Math.random() * 100
            let cumulativeProbability = 0
            let selected = mainLocation

            for (const location of normalizedLocations) {
              cumulativeProbability += location.normalizedProbability
              if (random <= cumulativeProbability) {
                selected = location.location
                break
              }
            }

            setSelectedLocation(selected)
          }, 400))
        }

        stageIndex += 1
        processStage()
      }, processingStages[stageIndex].duration))
    }

    processStage()

    return () => {
      timeouts.forEach(timeoutId => clearTimeout(timeoutId))
    }
  }, [isProcessing, onComplete, mainLocation, secondaryLocations])

  if (!isProcessing) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm overflow-y-auto"
    >
      <div className="min-h-full flex items-center justify-center p-4 md:p-8">
        <div className="max-w-6xl w-full my-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
            <div className="glass-effect rounded-3xl p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-3">曖昧な記憶の並列処理</h2>
                <p className="text-gray-300">量子重ね合わせによる記憶再構成</p>
              </div>

              <div className="relative h-64 mb-8 flex items-center justify-center">
                <svg width="400" height="200" className="absolute">
                  {stages[2]?.status === 'processing' && (
                    <AnimatePresence>
                      {memoryFragments.map((_, i) => (
                        <motion.path
                          key={i}
                          d={`M${50 + i * 50} 50 Q200 100 ${350 - i * 50} 150`}
                          stroke="#60a5fa"
                          strokeWidth="2"
                          fill="none"
                          strokeDasharray="5,5"
                          variants={quantumEffectVariants.entanglement}
                          initial="initial"
                          animate="animate"
                        />
                      ))}
                    </AnimatePresence>
                  )}
                </svg>

                {showQuantumObservation && mainLocation && secondaryLocations ? (
                  <div className="flex flex-col items-center space-y-4">
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-bold text-white mb-2 flex items-center justify-center gap-2">
                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        量子測定による記憶の確定
                      </h3>
                      <p className="text-sm text-gray-300">重ね合わせ状態から最も可能性の高い記憶を選択...</p>
                    </div>
                    
                    <div className="flex flex-wrap justify-center gap-3 max-w-lg">
                      {[
                        { location: mainLocation, probability: 55 + Math.floor(Math.random() * 25) },
                        ...secondaryLocations
                      ].map((location, index) => (
                        <motion.div
                          key={index}
                          className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all duration-300 ${
                            selectedLocation === location.location
                              ? 'bg-yellow-500/30 border-yellow-400 text-yellow-200 scale-110'
                              : 'bg-blue-500/20 border-blue-400/50 text-blue-200'
                          }`}
                          animate={selectedLocation === location.location ? {
                            boxShadow: [
                              "0 0 20px rgba(251,191,36,0.3)",
                              "0 0 40px rgba(251,191,36,0.6)", 
                              "0 0 20px rgba(251,191,36,0.3)"
                            ]
                          } : {}}
                          transition={{
                            boxShadow: { duration: 0.8, repeat: Infinity, ease: "easeInOut" }
                          }}
                        >
                          {location.location}
                        </motion.div>
                      ))}
                    </div>
                    
                    {selectedLocation && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center mt-4"
                      >
                        <p className="text-yellow-300 font-mono text-sm flex items-center justify-center gap-2">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9.5 9.293 10.793a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                          </svg>
                          観測結果: {selectedLocation}
                        </p>
                      </motion.div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-6 relative z-10">
                    {memoryFragments.map((fragment, index) => (
                      <motion.div
                        key={index}
                        className="flex flex-col items-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <motion.div
                          className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs font-medium mb-2"
                          variants={
                            currentStageIndex >= 0 && stages[currentStageIndex]?.quantum_effect 
                              ? quantumEffectVariants[stages[currentStageIndex].quantum_effect!]
                              : {}
                          }
                          initial="initial"
                          animate="animate"
                        >
                          |ψ⟩
                        </motion.div>
                        <span className="text-xs text-gray-400 text-center">{fragment}</span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="pt-4 border-t border-gray-600/30">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-gray-400 text-xs">量子ビット数</div>
                    <div className="text-lg font-mono text-blue-400">{memoryFragments.length}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-400 text-xs">重ね合わせ状態</div>
                    <div className="text-lg font-mono text-purple-400">2^{memoryFragments.length}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-effect rounded-3xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                処理段階
              </h3>
              <div className="space-y-4">
                {stages.map((stage, index) => (
                  <motion.div
                    key={stage.id}
                    className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
                      stage.status === 'processing' ? 'bg-blue-500/20 border border-blue-400/30' :
                      stage.status === 'completed' ? 'bg-green-500/20 border border-green-400/30' :
                      'bg-gray-500/10 border border-gray-400/20'
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="relative">
                      {stage.status === 'pending' && (
                        <div className="w-3 h-3 rounded-full border-2 border-gray-400"></div>
                      )}
                      {stage.status === 'processing' && (
                        <motion.div
                          className="w-3 h-3 rounded-full bg-blue-500"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        ></motion.div>
                      )}
                      {stage.status === 'completed' && (
                        <motion.div
                          className="w-3 h-3 rounded-full bg-green-500"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 200 }}
                        >
                          <svg className="w-2 h-2 text-white absolute inset-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </motion.div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-white text-sm">{stage.title}</h4>
                      <p className="text-xs text-gray-400 truncate">{stage.description}</p>
                    </div>

                    {stage.status === 'processing' && (
                      <motion.div
                        className="text-blue-400 text-xs font-mono"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        処理中
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}