'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-3xl p-8 md:p-10">
              <h1 className="text-2xl font-bold text-white mb-4">
                システムエラー
              </h1>
              <p className="text-gray-300 mb-8">
                重大なエラーが発生しました。ページを再読み込みしてください。
              </p>
              <button
                onClick={() => reset()}
                className="w-full py-3 px-6 rounded-2xl font-medium text-white bg-blue-600 hover:bg-blue-700 transition-all duration-300"
              >
                再読み込み
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}