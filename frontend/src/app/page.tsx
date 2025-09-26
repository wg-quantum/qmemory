'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
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
  const [selectedEmotion, setSelectedEmotion] = useState('')
  const [error, setError] = useState<string | null>(null)

  const generateLocation = async () => {
    if (!memory.trim()) {
      alert('記憶の断片を入力してください')
      return
    }

    if (!selectedEmotion) {
      alert('感情を選択してください')
      return
    }

    try {
      console.log('Starting memory analysis for:', memory.slice(0, 50) + '...')
      
      // Force fresh analysis by adding timestamp
      const analysis = await ApiKeyService.analyzeMemory(
        memory + ` [${Date.now()}]`,
        selectedEmotion
      ) as { success: boolean; result: GeminiAnalysisResult }
      
      if (!analysis.success) {
        throw new Error('Memory analysis failed')
      }

      console.log('Analysis result:', analysis.result)
      
      // Store analysis result in sessionStorage and navigate
      sessionStorage.setItem('analysisResult', JSON.stringify(analysis.result))
      window.location.href = '/processing'
      
    } catch (err) {
      console.error('Memory analysis failed:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    }
  }



  return (
    <>
      <ParticleBackground />
      
      <div className="min-h-screen relative z-10 max-w-5xl mx-auto px-4 md:px-8 py-8">
        <div className="flex flex-col justify-center min-h-screen">
        
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

        {(
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
                          <p>• &quot;桜の花びら、静かな石段、古いお寺の鐘の音、お香の香り&quot;</p>
                          <p>• &quot;海の匂い、砂浜、夕日、カモメの鳴き声、潮風&quot;</p>
                          <p>• &quot;雪景色、温泉の湯気、山々、静寂、白い世界&quot;</p>
                        </div>
                      </div>
                      <div>
                        <div className="text-green-300 font-medium mb-1">◑ 海外の例:</div>
                        <div className="space-y-1 text-xs">
                          <p>• &quot;石畳の道、教会の鐘、パン屋の香り、古い建物、ヨーロッパ&quot;</p>
                          <p>• &quot;ビーチ、椰子の木、青い海、トロピカルフルーツ、南国&quot;</p>
                          <p>• &quot;高層ビル、ネオンサイン、人込み、都会の音、大都市&quot;</p>
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
        
        </div>
      </div>
    </>
  )
}
