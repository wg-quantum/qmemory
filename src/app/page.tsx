'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Share2 } from 'lucide-react'
import html2canvas from 'html2canvas'
import ParticleBackground from '@/components/ParticleBackground'
import QuantumProcessingVisualizer from '@/components/QuantumProcessingVisualizer'
import MemorySuperpositionView from '@/components/MemorySupersitionView'
import MapComponent from '@/components/MapComponent'
import { analyzeMemoryWithGemini } from '@/lib/gemini'
import { geocodeLocation } from '@/lib/geocoding'
import ImageService from '@/lib/imageService'
import ApiKeyService from '@/lib/apiKeyService'
import { Location, SecondaryLocation, QuantumResult, EmotionOption } from '@/types/quantum'


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
  const [viewState, setViewState] = useState<ViewState>('input')
  const [isQuantumProcessing, setIsQuantumProcessing] = useState(false)
  const [memory, setMemory] = useState('')
  const [selectedEmotion, setSelectedEmotion] = useState('')
  const [result, setResult] = useState<QuantumResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isSharing, setIsSharing] = useState(false)

  const generateLocation = async () => {
    if (!memory.trim()) {
      alert('記憶の断片を入力してください')
      return
    }

    if (!selectedEmotion) {
      alert('感情を選択してください')
      return
    }

    // Complete state reset before starting new analysis
    setResult(null)
    setAnalysisResult(null)
    setError(null)
    setViewState('loading')
    setIsQuantumProcessing(true)
    setIsProcessing(true)

    // Add a small delay to ensure state is properly reset
    await new Promise(resolve => setTimeout(resolve, 100))

    try {
      console.log('Starting fresh memory analysis for:', memory.slice(0, 50) + '...')
      
      // Force fresh analysis by adding timestamp
      const analysis = await ApiKeyService.analyzeMemory(memory + ` [${Date.now()}]`, selectedEmotion)
      
      if (!analysis.success) {
        throw new Error('Memory analysis failed')
      }

      console.log('Analysis result:', analysis.result)
      // Store analysis result for quantum processing visualizer
      setAnalysisResult(analysis.result)

      // 量子処理のみ開始（結果生成はQuantumProcessingVisualizerのonCompleteで処理）
    } catch (err) {
      console.error('Memory analysis failed:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      setIsQuantumProcessing(false)
      setIsProcessing(false)
      setViewState('input')
    }
  }


  const goBack = () => {
    setViewState('input')
    setResult(null)
    setIsQuantumProcessing(false)
    setIsProcessing(false)
    setAnalysisResult(null)
    setError(null)
    // Clear any potential cache by force updating memory state
    setMemory('')
    setSelectedEmotion('')
  }

  const handleSaveMemory = async () => {
    if (isSaving) return
    setIsSaving(true)
    
    try {
      // Create a temporary container for the specific content we want to capture
      const container = document.querySelector('.min-h-screen.relative.z-10')
      if (!container) return
      
      const canvas = await html2canvas(container as HTMLElement, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#0f172a',
        scale: 1.5,
        width: container.scrollWidth,
        height: container.scrollHeight
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
      const container = document.querySelector('.min-h-screen.relative.z-10')
      if (!container) return
      
      const canvas = await html2canvas(container as HTMLElement, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#0f172a',
        scale: 1.5,
        width: container.scrollWidth,
        height: container.scrollHeight
      })
      
      canvas.toBlob(async (blob) => {
        if (blob && navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], 'quantum-memory.png', { type: 'image/png' })] })) {
          const file = new File([blob], `quantum-memory-${Date.now()}.png`, { type: 'image/png' })
          try {
            await navigator.share({
              title: 'Quantum Memory Reconstruction',
              text: '量子重ね合わせによる記憶再構成',
              files: [file]
            })
          } catch (shareError) {
            console.log('Native share failed, trying clipboard')
            fallbackToClipboard(blob)
          }
        } else {
          fallbackToClipboard(blob)
        }
      }, 'image/png', 0.9)
    } catch (error) {
      console.error('Failed to share memory:', error)
    } finally {
      setIsSharing(false)
    }
  }

  const fallbackToClipboard = async (blob: Blob) => {
    if (navigator.clipboard && window.ClipboardItem) {
      try {
        const item = new ClipboardItem({ 'image/png': blob })
        await navigator.clipboard.write([item])
        console.log('Image copied to clipboard')
      } catch (error) {
        console.error('Failed to copy to clipboard:', error)
        // Final fallback to download
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.download = `quantum-memory-${Date.now()}.png`
        link.href = url
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }
    }
  }

  return (
    <>
      <ParticleBackground />
      
      {viewState !== 'input' && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            position: 'fixed',
            top: '1.5rem',
            left: '1.5rem',
            zIndex: 50
          }}
        >
          <button
            className="px-6 py-3 rounded-2xl text-gray-200 hover:text-white transition-all duration-300"
            style={{
              background: 'rgba(15, 23, 42, 0.4)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(71, 85, 105, 0.3)',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)'
            }}
            onClick={goBack}
          >
            ← 戻る
          </button>
        </motion.div>
      )}

      <div className="min-h-screen relative z-10 max-w-5xl mx-auto px-4 md:px-8 py-8">
        <div className={`${viewState === 'input' ? 'flex flex-col justify-center min-h-screen' : 'space-y-8'}`}>
        
        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-effect rounded-2xl p-4 mb-6 border border-red-400/30 bg-red-900/20"
          >
            <p className="text-red-300 text-center">⚠️ {error}</p>
          </motion.div>
        )}

        {viewState === 'input' && (
          <div className="w-full max-w-4xl mx-auto">
            {/* ヘッダー */}
            <motion.header 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <header className="text-center mb-12 py-8">
              <h1 className="text-6xl font-bold mb-6 gradient-text font-['Playfair_Display']">
                QMemory
              </h1>
              <p className="text-xl text-gray-300 font-light leading-relaxed">
                記憶の断片から、心に刻まれた場所を量子的に観測する
              </p>
              </header>
            </motion.header>

            {/* メインコンテンツ */}
            <motion.main
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <section className="glass-effect card-hover rounded-3xl p-8 mb-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold mb-3 text-gray-100">
                    記憶の断片を入力してください
                  </h2>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    曖昧な記憶の断片から、量子技術を使って関連する場所を推測します。<br/>
                    感覚的な情報（音、匂い、色、感触）や風景の特徴を自由に入力してください。
                  </p>
                </div>
                
                {/* 入力例ヒント */}
                <div className="mb-6">
                  <details className="group">
                    <summary className="cursor-pointer text-sm text-blue-300 hover:text-blue-200 transition-colors mb-3">
                      ▶ 入力例を見る（クリックして表示）
                    </summary>
                    <div className="bg-gray-900/30 rounded-xl p-4 space-y-3 text-sm text-gray-300">
                      <div>
                        <div className="text-blue-300 font-medium mb-1">◐ 国内の例:</div>
                        <div className="space-y-1 text-xs">
                          <p>• "桜の花びら、静かな石段、古いお寺の鐘の音、お香の香り"</p>
                          <p>• "海の匂い、砂浜、夕日、カモメの鳴き声、潮風"</p>
                          <p>• "雪景色、温泉の湯気、山々、静寂、白い世界"</p>
                        </div>
                      </div>
                      <div>
                        <div className="text-green-300 font-medium mb-1">◑ 海外の例:</div>
                        <div className="space-y-1 text-xs">
                          <p>• "石畳の道、教会の鐘、パン屋の香り、古い建物、ヨーロッパ"</p>
                          <p>• "ビーチ、椰子の木、青い海、トロピカルフルーツ、南国"</p>
                          <p>• "高層ビル、ネオンサイン、人込み、都会の音、大都市"</p>
                        </div>
                      </div>
                    </div>
                  </details>
                </div>
                
                <div className="mb-4">
                  <textarea
                    className="memory-input w-full min-h-[140px] rounded-2xl p-6 text-lg text-gray-200 resize-vertical outline-none font-['Inter'] border-2 border-transparent focus:border-blue-400/50 transition-colors"
                    placeholder="例: 石畳の街、教会の鐘、パン屋の香り、古い建物..."
                    value={memory}
                    onChange={(e) => setMemory(e.target.value)}
                    maxLength={500}
                  />
                </div>
                
                {/* リアルタイム入力ヒント */}
                {memory.length > 20 && (
                  <div className="mb-3 text-xs text-green-300">
                    ▲ 記憶の断片が蓄積されています（解析準備完了まで残り{Math.max(0, 30 - memory.length)}文字）
                  </div>
                )}
                {memory.length >= 50 && (
                  <div className="mb-3 text-xs text-blue-300 animate-pulse">
                    ► 解析準備完了！感情を選択して量子処理を開始できます
                  </div>
                )}
                
                {/* クイック入力とヘルプ */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-300">▣ クイック入力テンプレート</h4>
                    <div className="text-xs text-gray-500">
                      {memory.length}/500文字
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mb-4">
                    以下のボタンをクリックすると、その場所の特徴的な記憶の断片が自動入力されます
                  </p>
                  
                  {/* 海外系テンプレート */}
                  <div className="mb-4">
                    <div className="text-xs text-emerald-300 mb-2">○ 海外の記憶テンプレート</div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="px-3 py-2 text-xs bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors border border-blue-400/20"
                        onClick={() => setMemory("パリの石畳の道、セーヌ川のせせらぎ、カフェのコーヒーの香り、エッフェル塔の鉄の匂い、古いパン屋の温かい光")}
                      >
                        🇫🇷 パリの街角<br/>
                        <span className="opacity-70">石畳・カフェ・セーヌ川</span>
                      </button>
                      <button
                        type="button"
                        className="px-3 py-2 text-xs bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors border border-red-400/20"
                        onClick={() => setMemory("ロンドンの霧、赤いバスの音、紅茶の香り、古い石造りの建物、テムズ川の湿った空気")}
                      >
                        🇬🇧 ロンドンの霧<br/>
                        <span className="opacity-70">霧・紅茶・古い石造り</span>
                      </button>
                      <button
                        type="button"
                        className="px-3 py-2 text-xs bg-yellow-500/20 text-yellow-300 rounded-lg hover:bg-yellow-500/30 transition-colors border border-yellow-400/20"
                        onClick={() => setMemory("ニューヨークの高層ビル、タクシーのクラクション、ホットドッグの匂い、地下鉄の音、ネオンの光")}
                      >
                        🇺🇸 NY摩天楼<br/>
                        <span className="opacity-70">高層ビル・タクシー・ネオン</span>
                      </button>
                      <button
                        type="button"
                        className="px-3 py-2 text-xs bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition-colors border border-green-400/20"
                        onClick={() => setMemory("トスカーナの丘、オリーブオイルの香り、教会の鐘、古いワイナリー、夕焼けに染まる街")}
                      >
                        🇮🇹 トスカーナ<br/>
                        <span className="opacity-70">丘・オリーブ・教会の鐘</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* 国内系テンプレート */}
                  <div className="mb-4">
                    <div className="text-xs text-pink-300 mb-2">◆ 日本の記憶テンプレート</div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="px-3 py-2 text-xs bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-colors border border-purple-400/20"
                        onClick={() => setMemory("京都の桜の花びら、古い神社の静寂、お香の神秘的な香り、石段の冷たさ、遠くから聞こえる鐘の音")}
                      >
                        🌸 京都の春<br/>
                        <span className="opacity-70">桜・神社・お香・石段</span>
                      </button>
                      <button
                        type="button"
                        className="px-3 py-2 text-xs bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors border border-blue-400/20"
                        onClick={() => setMemory("湘南の潮風、波の音、砂の暖かさ、カモメの鳴き声、夕焼けに染まる江ノ島")}
                      >
                        🌊 湘南の海<br/>
                        <span className="opacity-70">潮風・波音・江ノ島</span>
                      </button>
                      <button
                        type="button"
                        className="px-3 py-2 text-xs bg-orange-500/20 text-orange-300 rounded-lg hover:bg-orange-500/30 transition-colors border border-orange-400/20"
                        onClick={() => setMemory("温泉の湯気、硫黄の匂い、山々に囲まれた静寂、露天風呂からの星空、木の温もり")}
                      >
                        ♨️ 山の温泉<br/>
                        <span className="opacity-70">湯気・硫黄・星空</span>
                      </button>
                      <button
                        type="button"
                        className="px-3 py-2 text-xs bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors border border-red-400/20"
                        onClick={() => setMemory("浅草の下町、お祭りの太鼓、焼き鳥の煙、提灯の赤い光、人々の活気ある声")}
                      >
                        🏮 下町祭り<br/>
                        <span className="opacity-70">太鼓・焼き鳥・提灯</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* 自然・季節系テンプレート */}
                  <div className="mb-4">
                    <div className="text-xs text-green-300 mb-2">○ 自然の記憶テンプレート</div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="px-3 py-2 text-xs bg-emerald-500/20 text-emerald-300 rounded-lg hover:bg-emerald-500/30 transition-colors border border-emerald-400/20"
                        onClick={() => setMemory("深い森の中、木漏れ日、鳥のさえずり、湿った土の匂い、風に揺れる葉の音")}
                      >
                        🌲 深い森<br/>
                        <span className="opacity-70">木漏れ日・鳥・土の匂い</span>
                      </button>
                      <button
                        type="button"
                        className="px-3 py-2 text-xs bg-cyan-500/20 text-cyan-300 rounded-lg hover:bg-cyan-500/30 transition-colors border border-cyan-400/20"
                        onClick={() => setMemory("青い海、白い砂浜、椰子の木、トロピカルフルーツの甘い香り、暖かい潮風")}
                      >
                        🏝️ 南国ビーチ<br/>
                        <span className="opacity-70">青い海・椰子・甘い香り</span>
                      </button>
                      <button
                        type="button"
                        className="px-3 py-2 text-xs bg-slate-500/20 text-slate-300 rounded-lg hover:bg-slate-500/30 transition-colors border border-slate-400/20"
                        onClick={() => setMemory("雪景色の山、静寂、足音だけが響く雪道、白い息、澄んだ空気")}
                      >
                        ❄️ 雪山の静寂<br/>
                        <span className="opacity-70">雪・静寂・澄んだ空気</span>
                      </button>
                      <button
                        type="button"
                        className="px-3 py-2 text-xs bg-amber-500/20 text-amber-300 rounded-lg hover:bg-amber-500/30 transition-colors border border-amber-400/20"
                        onClick={() => setMemory("秋の紅葉、落ち葉を踏む音、涼しい風、木の実の香り、夕日に照らされた山々")}
                      >
                        🍂 秋の山道<br/>
                        <span className="opacity-70">紅葉・落ち葉・木の実</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-8 mb-6">
                  <h3 className="text-xl font-semibold mb-3 text-gray-100">
                    その時の感情を選択
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    記憶に紐づいた感情を選択すると、より精密な量子解析が可能になります。
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
                  {emotionOptions.map((emotion) => (
                    <button
                      key={emotion.key}
                      className={`emotion-btn p-4 rounded-2xl text-center transition-all duration-300 font-medium ${
                        selectedEmotion === emotion.key ? 'selected' : ''
                      }`}
                      onClick={() => setSelectedEmotion(emotion.key)}
                    >
                      <span className="text-2xl mb-2 block">{emotion.emoji}</span>
                      {emotion.label}
                    </button>
                  ))}
                </div>

                <div className="pt-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <button
                      className="btn-gradient w-full py-4 px-8 rounded-2xl text-xl font-semibold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={generateLocation}
                      disabled={!memory.trim() || !selectedEmotion}
                    >
                      {!memory.trim() ? '▶ 記憶を入力してください' : !selectedEmotion ? '▶ 感情を選択してください' : '▶ 量子記憶解析を開始'}
                    </button>
                  </motion.div>
                </div>
              </section>
            </motion.main>
          </div>
        )}

        {/* Quantum Processing Visualizer */}
        <QuantumProcessingVisualizer 
          isProcessing={isQuantumProcessing}
          mainLocation={analysisResult?.location}
          secondaryLocations={analysisResult?.secondaryLocations?.map((loc: any) => ({
            location: loc.name,
            probability: loc.probability,
            description: loc.description
          }))}
          onComplete={async () => {
            try {
              if (!isProcessing || !analysisResult) return
              
              const geminiResult = analysisResult

              // Geocode primary location
              const primaryGeocode = await geocodeLocation(geminiResult.location)
              const primaryImage = await ImageService.getLocationImage(geminiResult.location, geminiResult.region)

              // Process secondary locations
              const secondaryLocationsWithData = await Promise.allSettled(
                geminiResult.secondaryLocations.map(async (loc) => {
                  const geocode = await geocodeLocation(loc.name)
                  const image = await ImageService.getLocationImage(loc.name, loc.region)
                  
                  return {
                    name: loc.name,
                    probability: loc.probability,
                    description: loc.description,
                    coordinates: geocode?.coordinates || null,
                    imageUrl: image
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
                  coordinates: primaryGeocode?.coordinates || { lat: 35.6762, lng: 139.6503 }, // fallback to Tokyo
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

              setResult(quantumResult)
              setViewState('result')
              setIsQuantumProcessing(false)
              setIsProcessing(false)
            } catch (err) {
              console.error('Quantum processing failed:', err)
              setError('量子処理に失敗しました')
              setIsQuantumProcessing(false)
              setIsProcessing(false)
              setViewState('input')
            }
          }}
        />

        {viewState === 'loading' && !isQuantumProcessing && (
          <motion.section 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center min-h-[70vh]"
          >
            <div className="glass-effect rounded-3xl p-12 max-w-lg w-full mx-auto">
              <div className="text-center">
                <div className="spinner mx-auto mb-6"></div>
                <p className="text-xl text-gray-300 mb-2">量子的干渉により記憶を再構成中...</p>
                <p className="text-sm text-gray-500 font-mono">Calculating probability amplitudes...</p>
              </div>
            </div>
          </motion.section>
        )}

        {viewState === 'result' && result && (
          <>
            {/* Save/Share buttons in top-right */}
            <div className="fixed top-6 right-6 z-50 flex gap-3">
              <motion.button 
                onClick={handleSaveMemory}
                disabled={isSaving}
                className="p-3 rounded-full glass-effect text-white/80 hover:text-white transition-all duration-300 disabled:opacity-50 hover:scale-110 hover:shadow-lg"
                title="記憶を保存"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download size={20} className={isSaving ? 'animate-pulse' : ''} />
              </motion.button>
              <motion.button 
                onClick={handleShareMemory}
                disabled={isSharing}
                className="p-3 rounded-full glass-effect text-white/80 hover:text-white transition-all duration-300 disabled:opacity-50 hover:scale-110 hover:shadow-lg"
                title="記憶を共有"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Share2 size={20} className={isSharing ? 'animate-pulse' : ''} />
              </motion.button>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full"
            >
            <div className="space-y-8">
            {/* 1. 観測された記憶 - メイン結果 */}
            <div className="result-card rounded-3xl p-8 md:p-10 text-center">
              <div className="observation-badge mb-6">
                観測された記憶
              </div>
              
              <h3 className="text-2xl md:text-3xl font-bold mb-6 text-gray-100 font-['Playfair_Display']">
                {result.primaryLocation.name}
              </h3>
              
              {result.primaryLocation.imageUrl && (
                <div className="mb-6">
                  <img
                    src={result.primaryLocation.imageUrl}
                    alt="記憶の風景"
                    className="w-full max-w-lg h-48 md:h-64 object-cover rounded-2xl mx-auto shadow-2xl"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = ImageService.generatePlaceholder(800, 600, result.primaryLocation.name)
                    }}
                  />
                </div>
              )}
              
              <p className="text-base md:text-lg text-gray-300 leading-relaxed mb-6 max-w-2xl mx-auto">
                {result.primaryLocation.story}
              </p>

              {/* 地図表示 */}
              <div className="mb-6">
                <MapComponent location={result.primaryLocation} />
              </div>

            </div>

            {/* 2. 他に思い出されたかもしれない場所 */}
            <div className="glass-effect rounded-3xl p-6 md:p-8">
              <h3 className="text-xl md:text-2xl font-semibold mb-6 text-center text-gray-100">
                他に思い出されたかもしれない場所
              </h3>
              
              <div className={`grid sm:grid-cols-1 md:grid-cols-2 ${result.secondaryLocations.length < 3 ? 'lg:grid-cols-2' : 'lg:grid-cols-3'} gap-4 md:gap-6`}>
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
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-28 md:h-32 object-cover rounded-xl"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
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

            {/* 3. 記憶の量子重ね合わせ状態 - 技術的詳細 */}
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

            </div>
            </motion.div>
          </>
        )}
        
        </div>
      </div>
    </>
  )
}