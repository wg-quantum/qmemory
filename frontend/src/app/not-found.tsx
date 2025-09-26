'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import ParticleBackground from '@/components/ParticleBackground'

export default function NotFound() {
  const router = useRouter()

  return (
    <>
      <ParticleBackground />
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md w-full"
        >
          <div className="glass-effect rounded-3xl p-8 md:p-10 text-center">
            <div className="mb-6">
              <svg
                className="w-24 h-24 mx-auto text-blue-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h1 className="text-4xl font-bold text-gray-100 mb-2">404</h1>
              <h2 className="text-xl font-medium text-gray-300 mb-4">
                ページが見つかりません
              </h2>
            </div>
            
            <p className="text-gray-400 mb-8">
              お探しのページは存在しないか、移動した可能性があります。
              量子の重ね合わせのように、このページは観測されるまで存在しません。
            </p>

            <div className="space-y-3">
              <button
                onClick={() => router.push('/')}
                className="w-full py-3 px-6 rounded-2xl font-medium text-white transition-all duration-300 transform hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #667eea, #764ba2, #f093fb)',
                  boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)'
                }}
              >
                ホームへ戻る
              </button>
              
              <button
                onClick={() => router.back()}
                className="w-full py-3 px-6 rounded-2xl font-medium text-gray-300 transition-all duration-300 hover:text-white"
                style={{
                  background: 'rgba(71, 85, 105, 0.2)',
                  border: '1px solid rgba(71, 85, 105, 0.3)'
                }}
              >
                前のページへ戻る
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  )
}