'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import ParticleBackground from '@/components/ParticleBackground'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

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
                className="w-24 h-24 mx-auto text-red-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <h1 className="text-2xl font-bold text-gray-100 mb-2">
                エラーが発生しました
              </h1>
            </div>
            
            <p className="text-gray-400 mb-8">
              申し訳ございません。予期しないエラーが発生しました。
              量子のもつれのように、システムが一時的に不安定な状態になっています。
            </p>

            <div className="space-y-3">
              <button
                onClick={() => reset()}
                className="w-full py-3 px-6 rounded-2xl font-medium text-white transition-all duration-300 transform hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #667eea, #764ba2, #f093fb)',
                  boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)'
                }}
              >
                もう一度試す
              </button>
              
              <button
                onClick={() => router.push('/')}
                className="w-full py-3 px-6 rounded-2xl font-medium text-gray-300 transition-all duration-300 hover:text-white"
                style={{
                  background: 'rgba(71, 85, 105, 0.2)',
                  border: '1px solid rgba(71, 85, 105, 0.3)'
                }}
              >
                ホームへ戻る
              </button>
            </div>
            
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-gray-500 text-sm">
                  エラーの詳細
                </summary>
                <pre className="mt-2 text-xs text-gray-600 overflow-auto max-h-32 p-2 bg-gray-900/50 rounded">
                  {error.message}
                </pre>
              </details>
            )}
          </div>
        </motion.div>
      </div>
    </>
  )
}