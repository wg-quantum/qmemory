'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import ParticleBackground from '@/components/ParticleBackground'
import ApiKeyService from '@/lib/apiKeyService'
import { EmotionOption, GeminiAnalysisResult } from '@/types/quantum'


const emotionOptions: EmotionOption[] = [
  { key: 'nostalgic', label: '懐かしい', emoji: '😌' },
  { key: 'melancholy', label: '切ない', emoji: '😢' },
  { key: 'anxious', label: '不安', emoji: '😰' },
  { key: 'peaceful', label: '平穏', emoji: '😊' },
  { key: 'mysterious', label: '神秘的', emoji: '🤔' },
  { key: 'warm', label: '温かい', emoji: '🥰' }
]


type ViewState = 'input' | 'loading' | 'result'

export default function QuantumLocationRecall() {
  const [memory, setMemory] = useState('')
  const [selectedEmotion, setSelectedEmotion] = useState('nostalgic')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const generateLocation = async () => {
    if (!memory.trim()) {
      setError('記憶の断片を入力してください')
      return
    }

    if (!selectedEmotion) {
      setError('感情を選択してください')
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      console.log('Starting memory analysis for:', memory.slice(0, 50) + '...')
      
      // Force fresh analysis by adding timestamp
      const analysis = await ApiKeyService.analyzeMemory(
        memory + ` [${Date.now()}]`,
        selectedEmotion
      ) as { success: boolean; result: GeminiAnalysisResult }
      
      if (!analysis.success) {
        throw new Error('メモリー分析に失敗しました。もう一度お試しください。')
      }

      console.log('Analysis result:', analysis.result)
      
      // Store analysis result in sessionStorage and navigate
      sessionStorage.setItem('analysisResult', JSON.stringify(analysis.result))
      window.location.href = '/processing'
      
    } catch (err) {
      console.error('Memory analysis failed:', err)
      setError(err instanceof Error ? err.message : '分析中にエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }



  return (
    <>
      {/* <ParticleBackground /> */}
      
      <div className="min-h-screen relative z-10 w-full px-6 md:px-12 py-8">
        <div className="flex flex-col min-h-screen max-w-7xl mx-auto pt-8">
        
        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-effect rounded-2xl p-4 mb-6 border border-red-400/30 bg-red-900/20"
          >
            <p className="text-red-300 text-center">{error}</p>
          </motion.div>
        )}

        {
          <div className="w-full">
            {/* ヘッダー */}
            <header 
              // initial={{ opacity: 0, y: 30 }}
              // animate={{ opacity: 1, y: 0 }}
              // transition={{ duration: 0.8 }}
            >
              <header className="text-center mb-8">
                <div className="flex flex-col items-center mb-2">
                  <Image 
                    src="/images/logo.png" 
                    alt="QMemory Logo" 
                    width={800}
                    height={300}
                    className="w-auto h-auto max-w-full max-h-48 object-contain"
                    priority
                    unoptimized={true}
                    onError={(e) => {
                      console.warn('Logo failed to load, trying alternative methods')
                      const target = e.target as HTMLImageElement
                      // Try alternative fallbacks
                      if (target.src.includes('logo.png')) {
                        target.src = '/images/symbol.png'
                      } else {
                        // If both images fail, show simple text logo
                        const parent = target.parentElement
                        if (parent) {
                          parent.innerHTML = `
                            <div class="text-6xl font-bold" style="color: #5ce1e6;">
                              QMemory
                            </div>
                          `
                        }
                      }
                    }}
                    onLoad={() => console.log('Logo loaded successfully')}
                  />
                </div>
                <p className="text-xl font-light tracking-wide mt-2" style={{ color: '#5ce1e6' }}>
                  量子×生成AI で曖昧な記憶から場所を推測します
                </p>
              </header>
            </header>

            {/* メインコンテンツ */}
            <main
              // initial={{ opacity: 0, y: 20 }}
              // animate={{ opacity: 1, y: 0 }}
              // transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="w-full space-y-8">
                {/* 記憶入力エリア */}
                <section className="glass-effect rounded-2xl p-8">
                  <h2 className="text-2xl font-semibold mb-6 text-center text-gray-100">
                    思い出したい場所の記憶を教えてください
                  </h2>
                  
                  <form onSubmit={(e) => { e.preventDefault(); generateLocation(); }} className="space-y-6">
                    <div className="relative">
                      <textarea
                        className="w-full min-h-[120px] rounded-xl p-6 pr-16 text-lg text-gray-200 resize-none outline-none font-['Inter'] border transition-all"
                        style={{
                          background: 'rgba(59, 130, 246, 0.05)',
                          borderColor: 'rgba(59, 130, 246, 0.2)',
                          boxShadow: memory.trim() ? '0 0 0 1px rgba(59, 130, 246, 0.3), 0 0 15px rgba(59, 130, 246, 0.2)' : 'none'
                        }}
                        placeholder="何か懐かしい場所の記憶があるのですが、どこだったか思い出せません..."
                        value={memory}
                        onChange={(e) => setMemory(e.target.value)}
                        maxLength={500}
                        disabled={isLoading}
                      />
                      <button
                        type="submit"
                        disabled={!memory.trim() || !selectedEmotion || isLoading}
                        className="absolute bottom-4 right-4 w-12 h-12 rounded-full flex items-center justify-center transition-all transform hover:scale-105 disabled:hover:scale-100 disabled:opacity-50"
                        style={{
                          background: (!memory.trim() || !selectedEmotion || isLoading) 
                            ? '#6b7280' 
                            : 'linear-gradient(135deg, #5ce1e6, #22d3ee)',
                          boxShadow: (!memory.trim() || !selectedEmotion || isLoading) 
                            ? 'none' 
                            : '0 0 20px rgba(92, 225, 230, 0.4)'
                        }}
                        title="解析開始"
                      >
                        {isLoading ? (
                          <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <span className="text-white font-bold">→</span>
                        )}
                      </button>
                    </div>
                    {error && (
                      <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                        <p className="text-red-300 text-sm">{error}</p>
                      </div>
                    )}
                    <div className="text-right text-xs text-gray-500">
                      {memory.length}/500
                    </div>
                  </form>
                </section>

                {/* 感情選択とテンプレートエリア */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* 感情選択エリア */}
                  <section className="glass-effect rounded-2xl p-6">
                    <h3 className="text-xl font-semibold mb-6 text-center text-gray-100">
                      感情
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {emotionOptions.map((emotion, index) => {
                        const colors = [
                          'bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border-blue-500/20',
                          'bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border-purple-500/20',
                          'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border-cyan-500/20',
                          'bg-green-500/10 hover:bg-green-500/20 text-green-300 border-green-500/20',
                          'bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 border-orange-500/20',
                          'bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 border-pink-500/20'
                        ]
                        return (
                          <button
                            key={emotion.key}
                            className={`p-4 rounded-xl text-center transition-all duration-300 font-medium border ${colors[index]} ${
                              selectedEmotion === emotion.key ? 'ring-2 ring-current scale-105' : ''
                            }`}
                            onClick={() => setSelectedEmotion(emotion.key)}
                          >
                            <span className="text-2xl mb-2 block">{emotion.emoji}</span>
                            <span className="text-sm">{emotion.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </section>

                  {/* テンプレート */}
                  <section className="glass-effect rounded-2xl p-6">
                    <h4 className="text-xl font-semibold mb-6 text-center text-gray-100">テンプレート</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button
                      type="button"
                      className="template-btn p-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 transition-all border border-blue-500/20 text-sm"
                      onClick={() => setMemory("古い石畳の上を歩いていた。水の音が聞こえて、コーヒーの甘い香りがした。遠くに鉄の塔が見えて、パン屋の暖かい光が記憶に残っている")}
                    >
                      洋風の街並み
                    </button>
                    <button
                      type="button"
                      className="template-btn p-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 transition-all border border-purple-500/20 text-sm"
                      onClick={() => setMemory("春に訪れた古い場所で、桜の花びらが舞っていた。石段が冷たくて、不思議な香りがした。遠くで鐘の音が響いて、とても静かだった")}
                    >
                      古都の春
                    </button>
                    <button
                      type="button"
                      className="template-btn p-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 transition-all border border-cyan-500/20 text-sm"
                      onClick={() => setMemory("海辺で過ごした夏の日。潮の香りと波の音が心地よくて、砂の上でぬくもりを感じた。夕方になると江ノ島が美しく見えた")}
                    >
                      海辺の夏
                    </button>
                    <button
                      type="button"
                      className="template-btn p-3 rounded-xl bg-green-500/10 hover:bg-green-500/20 text-green-300 transition-all border border-green-500/20 text-sm"
                      onClick={() => setMemory("初めて訪れた大都市。空に達するほど高いビル群、絶え間2ない車のクラクション、街角から漂う食べ物の匂い。夜になるとネオンが照らしていた")}
                    >
                      大都市の夜
                    </button>
                    <button
                      type="button"
                      className="template-btn p-3 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 transition-all border border-orange-500/20 text-sm"
                      onClick={() => setMemory("山奥の温泉で疑いを癒した。白い湯気が立ち上って、少し硫黄の匂いがした。夜には満天の星空が見えて、木の風呂が温かかった")}
                    >
                      山の温泉
                    </button>
                    <button
                      type="button"
                      className="template-btn p-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 transition-all border border-emerald-500/20 text-sm"
                      onClick={() => setMemory("深い森の中を歩いた時、木漏れ日が美しく差し込んでいた。鳥たちの声が響いて、湯り気のある土の香りがした。風で葉っぱがさらさらと音を立てていた")}
                    >
                      森の散歩
                    </button>
                    <button
                      type="button"
                      className="template-btn p-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 transition-all border border-amber-500/20 text-sm"
                      onClick={() => setMemory("秋に山道を歩いた。赤や黄色に染まった葉っぱが美しくて、足元でカサカサ音を立てた。空気は澄んでいて、木の実の香りがした。夕日が山を照らしていた")}
                    >
                      秋の山道
                    </button>
                    <button
                      type="button"
                      className="template-btn p-3 rounded-xl bg-slate-500/10 hover:bg-slate-500/20 text-slate-300 transition-all border border-slate-500/20 text-sm"
                      onClick={() => setMemory("雪の降った山を登った。あたり一面真っ白で、自分の足音しか聞こえない。息が白くなって、空気がとても澄んでいた。こんなに静かな世界があるのかと驚いた")}
                    >
                      雪山登山
                    </button>
                    </div>
                  </section>
                </div>
              </div>
            </main>
          </div>
        }
        
        </div>
      </div>
    </>
  )
}