'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { EmotionOption } from '@/types/quantum'

interface MemoryInputProps {
  onSubmit: (memory: string, emotion: string) => void
}

const emotionOptions: EmotionOption[] = [
  { key: 'nostalgic', label: '懐かしい', emoji: '😌' },
  { key: 'melancholy', label: '切ない', emoji: '😢' },
  { key: 'anxious', label: '不安', emoji: '😰' },
  { key: 'peaceful', label: '平穏', emoji: '😊' },
  { key: 'mysterious', label: '神秘的', emoji: '🤔' },
  { key: 'warm', label: '温かい', emoji: '🥰' }
]

export default function MemoryInput({ onSubmit }: MemoryInputProps) {
  const [memory, setMemory] = useState('')
  const [selectedEmotion, setSelectedEmotion] = useState('')
  const [showError, setShowError] = useState(false)

  const handleSubmit = () => {
    if (!memory.trim()) {
      setShowError(true)
      setTimeout(() => setShowError(false), 3000)
      return
    }

    if (!selectedEmotion) {
      setShowError(true)
      setTimeout(() => setShowError(false), 3000)
      return
    }

    onSubmit(memory, selectedEmotion)
  }

  return (
    <section className="bg-white dark:bg-neutral-900 rounded-xl p-6 sm:p-8 max-w-4xl mx-auto border border-gray-200 dark:border-neutral-800">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
      <div className="space-y-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            記憶の断片を入力してください
          </h2>
          <textarea
            value={memory}
            onChange={(e) => setMemory(e.target.value)}
            className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 rounded-xl p-4 sm:p-6 
                     text-gray-900 dark:text-white text-lg leading-relaxed resize-vertical min-h-[120px]
                     transition-all duration-300 outline-none
                     focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20
                     placeholder:text-gray-500 dark:placeholder:text-gray-400"
            placeholder="濡れた石畳、古い階段、猫の鳴き声、雨の匂い、誰かの温かい声..."
          />
        </div>

        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            その時の感情を選択
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {emotionOptions.map((emotion) => (
              <motion.div
                key={emotion.key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <button
                  onClick={() => setSelectedEmotion(emotion.key)}
                  className={`p-4 rounded-lg border transition-colors w-full ${
                    selectedEmotion === emotion.key 
                      ? 'bg-violet-100 dark:bg-violet-900/30 border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-300'
                      : 'bg-gray-50 dark:bg-neutral-800 border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700'
                  }`}
                >
                  <span className="text-2xl mb-2 block">{emotion.emoji}</span>
                  {emotion.label}
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
        >
          <button
            onClick={handleSubmit}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white text-lg sm:text-xl font-semibold py-4 px-8 rounded-xl transition-colors"
          >
            🔍 記憶を解析する
          </button>
        </motion.div>

        {showError && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-400 text-center">
              記憶の断片と感情を両方選択してください
            </div>
          </motion.div>
        )}
      </div>
      </motion.div>
    </section>
  )
}