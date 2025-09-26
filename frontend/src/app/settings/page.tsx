'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Settings, Key, CheckCircle, XCircle, Loader2, ArrowLeft, Eye, EyeOff, Brain, Atom, Sparkles, Server, HardDrive } from 'lucide-react'
import Link from 'next/link'
import { useTheme } from '@/contexts/ThemeContext'
import { encryptApiKey, decryptApiKey } from '@/lib/crypto'
import ApiKeyService from '@/lib/apiKeyService'

export default function SettingsPage() {
  const { theme } = useTheme()
  const [apiKey, setApiKey] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [statusMessage, setStatusMessage] = useState('')
  const [isSaved, setIsSaved] = useState(false)
  const [apiKeySource, setApiKeySource] = useState<{
    hasEnvironmentKey: boolean
    hasLocalStorageKey: boolean
    currentSource: 'environment' | 'localStorage' | 'none'
  }>({ hasEnvironmentKey: false, hasLocalStorageKey: false, currentSource: 'none' })

  useEffect(() => {
    const loadApiKeyInfo = async () => {
      // Check environment key
      const envCheck = await ApiKeyService.checkEnvironmentApiKey()
      
      // Check localStorage key
      const apiKeyInfo = ApiKeyService.getGeminiApiKey()
      
      setApiKeySource({
        hasEnvironmentKey: envCheck.hasKey,
        hasLocalStorageKey: apiKeyInfo.source === 'localStorage',
        currentSource: envCheck.hasKey ? 'environment' : 
                     apiKeyInfo.source === 'localStorage' ? 'localStorage' : 'none'
      })
      
      // Only show localStorage key in the input field (for editing)
      const savedKey = localStorage.getItem('gemini_api_key')
      if (savedKey) {
        setApiKey(savedKey)
        setIsSaved(true)
      }
    }
    
    loadApiKeyInfo()
  }, [])

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      setConnectionStatus('error')
      setStatusMessage('APIキーを入力してください')
      return
    }

    try {
      localStorage.setItem('gemini_api_key', apiKey)
      setIsSaved(true)
      setConnectionStatus('success')
      setStatusMessage('APIキーが正常に保存されました')
      
      setTimeout(() => {
        setConnectionStatus('idle')
        setStatusMessage('')
      }, 3000)
    } catch (error) {
      setConnectionStatus('error')
      setStatusMessage('APIキーの保存に失敗しました')
    }
  }

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      setConnectionStatus('error')
      setStatusMessage('最初にAPIキーを入力してください')
      return
    }

    setIsTestingConnection(true)
    setConnectionStatus('idle')
    setStatusMessage('')

    try {
      const response = await fetch('/api/gemini/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setConnectionStatus('success')
        setStatusMessage('接続成功！Gemini APIが使用可能です。')
      } else {
        setConnectionStatus('error')
        const errorMsg = data.error || 'Gemini APIへの接続に失敗しました'
        const details = data.details ? ` (${data.details.originalError})` : ''
        setStatusMessage(errorMsg + details)
      }
    } catch (error) {
      setConnectionStatus('error')
      setStatusMessage('ネットワークエラーです。接続を確認してください。')
    } finally {
      setIsTestingConnection(false)
    }
  }

  const handleClearApiKey = () => {
    setApiKey('')
    localStorage.removeItem('gemini_api_key')
    setIsSaved(false)
    setConnectionStatus('idle')
    setStatusMessage('')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-vscode-bg-primary">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link 
          href="/"
          className="inline-flex items-center gap-3 text-gray-600 dark:text-vscode-text-secondary hover:text-gray-900 dark:hover:text-vscode-text-primary transition-colors mb-8 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-vscode-bg-tertiary"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">QMemory に戻る</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-white dark:bg-vscode-bg-secondary rounded-2xl p-8 border border-gray-200 dark:border-vscode-border">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-violet-100 dark:bg-violet-900/20 rounded-xl">
                  <Settings className="w-8 h-8 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-vscode-text-primary">システム設定</h1>
                  <p className="text-gray-600 dark:text-vscode-text-secondary">APIキーとアカウント設定</p>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-gray-50 dark:bg-vscode-bg-elevated rounded-xl p-6 border border-gray-200 dark:border-vscode-border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
                    <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-vscode-text-primary">Google Gemini API設定</h2>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6 border border-blue-200 dark:border-blue-800">
                  <p className="text-gray-900 dark:text-vscode-text-primary font-medium mb-2">
                    🤖 AI記憶解析を有効化
                  </p>
                  <p className="text-gray-600 dark:text-vscode-text-secondary leading-relaxed">
                    高精度な記憶位置特定のために、Google Gemini APIキーが必要です。
                    APIキーは{' '}
                    <a 
                      href="https://makersuite.google.com/app/apikey" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-violet-500 hover:text-violet-400 underline font-medium"
                    >
                      Google AI Studio
                    </a>
                    {' '}から無料で取得できます。
                  </p>
                </div>

                {/* API Key Source Status */}
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className={`p-4 rounded-lg border-2 ${
                    apiKeySource.hasEnvironmentKey 
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                      : 'bg-gray-50 dark:bg-gray-900/20 border-gray-300 dark:border-gray-700'
                  }`}>
                    <div className="flex items-center gap-3 mb-2">
                      <Server className={`w-5 h-5 ${
                        apiKeySource.hasEnvironmentKey ? 'text-green-600 dark:text-green-400' : 'text-gray-400'
                      }`} />
                      <h3 className="font-semibold text-gray-900 dark:text-vscode-text-primary">環境変数</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-vscode-text-secondary mb-2">
                      GEMINI_API_KEY
                    </p>
                    <div className={`text-xs px-2 py-1 rounded-full inline-block ${
                      apiKeySource.hasEnvironmentKey
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}>
                      {apiKeySource.hasEnvironmentKey ? '設定済み' : '未設定'}
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg border-2 ${
                    apiKeySource.hasLocalStorageKey
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
                      : 'bg-gray-50 dark:bg-gray-900/20 border-gray-300 dark:border-gray-700'
                  }`}>
                    <div className="flex items-center gap-3 mb-2">
                      <HardDrive className={`w-5 h-5 ${
                        apiKeySource.hasLocalStorageKey ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'
                      }`} />
                      <h3 className="font-semibold text-gray-900 dark:text-vscode-text-primary">ローカルストレージ</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-vscode-text-secondary mb-2">
                      ブラウザ内保存
                    </p>
                    <div className={`text-xs px-2 py-1 rounded-full inline-block ${
                      apiKeySource.hasLocalStorageKey
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}>
                      {apiKeySource.hasLocalStorageKey ? '保存済み' : '未保存'}
                    </div>
                  </div>
                </div>

                {/* Current Source Display */}
                {apiKeySource.currentSource !== 'none' && (
                  <div className={`p-3 rounded-lg mb-6 border-l-4 ${
                    apiKeySource.currentSource === 'environment'
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-400'
                      : 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-400'
                  }`}>
                    <p className="text-sm font-medium text-gray-900 dark:text-vscode-text-primary">
                      現在使用中: {' '}
                      {apiKeySource.currentSource === 'environment' ? (
                        <span className="text-green-700 dark:text-green-300">環境変数 (GEMINI_API_KEY)</span>
                      ) : (
                        <span className="text-blue-700 dark:text-blue-300">ローカルストレージ</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-vscode-text-secondary mt-1">
                      {apiKeySource.currentSource === 'environment' 
                        ? '環境変数が優先されます。ローカルストレージの設定は使用されません。'
                        : '環境変数が設定されていないため、ローカルストレージのAPIキーを使用します。'
                      }
                    </p>
                  </div>
                )}
                
              </div>

              <div className="bg-white dark:bg-vscode-bg-elevated rounded-xl p-6 border border-gray-200 dark:border-vscode-border space-y-6">
                <div>
                  <label htmlFor="apiKey" className="flex items-center gap-3 text-lg font-semibold text-gray-900 dark:text-vscode-text-primary mb-4">
                    <div className="p-2 bg-gray-100 dark:bg-vscode-bg-tertiary rounded-lg">
                      <Key className="w-4 h-4 text-gray-600 dark:text-vscode-text-secondary" />
                    </div>
                    APIキー
                  </label>
                  <div className="relative">
                    <input
                      id="apiKey"
                      type={showApiKey ? 'text' : 'password'}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Google Gemini APIキーを入力してください"
                      className="w-full px-4 py-3 pr-12 border rounded-lg bg-gray-50 dark:bg-vscode-bg-tertiary text-gray-900 dark:text-vscode-text-primary placeholder:text-gray-500 dark:placeholder:text-vscode-text-muted border-gray-300 dark:border-vscode-border focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all font-mono text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-vscode-text-secondary transition-colors"
                    >
                      {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  
                  <div className="mt-3 flex items-center gap-2 text-sm text-gray-600 dark:text-vscode-text-secondary">
                    <div className={`w-2 h-2 rounded-full ${isSaved ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
                    <span>{isSaved ? 'ローカルストレージに保存済み' : 'ローカルストレージは未保存'}</span>
                  </div>
                  {apiKeySource.hasEnvironmentKey && (
                    <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-xs text-yellow-800 dark:text-yellow-300">
                      ⚠️ 環境変数が設定されているため、このフォームで設定したAPIキーは使用されません
                    </div>
                  )}

                  {/* Environment Variable Setup Instructions */}
                  {!apiKeySource.hasEnvironmentKey && (
                    <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                      <h4 className="font-semibold text-gray-900 dark:text-vscode-text-primary mb-3 flex items-center gap-2">
                        <Server className="w-4 h-4" />
                        環境変数での設定方法
                      </h4>
                      <div className="space-y-2 text-sm text-gray-600 dark:text-vscode-text-secondary">
                        <p className="font-medium">1. プロジェクトルートに .env.local ファイルを作成:</p>
                        <div className="bg-gray-100 dark:bg-gray-800 rounded p-2 font-mono text-xs">
                          GEMINI_API_KEY=your_actual_api_key_here
                        </div>
                        <p className="font-medium mt-3">2. 開発サーバーを再起動:</p>
                        <div className="bg-gray-100 dark:bg-gray-800 rounded p-2 font-mono text-xs">
                          npm run dev
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          💡 環境変数を使用すると、APIキーがソースコードに含まれず、より安全です。
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleSaveApiKey}
                    disabled={!apiKey.trim() || isTestingConnection}
                    className="px-6 py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {isSaved ? '更新' : '保存'}
                  </button>
                  
                  <button
                    onClick={handleTestConnection}
                    disabled={!apiKey.trim() || isTestingConnection}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                  >
                    {isTestingConnection ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        テスト中
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        接続テスト
                      </>
                    )}
                  </button>

                  {isSaved && (
                    <button
                      onClick={handleClearApiKey}
                      disabled={isTestingConnection}
                      className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      削除
                    </button>
                  )}
                </div>
              </div>

              {statusMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className={`rounded-lg p-4 flex items-center gap-3 border ${
                    connectionStatus === 'success'
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                      : connectionStatus === 'error'
                      ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                      : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                  }`}>
                    <div className={`p-1.5 rounded-lg ${
                      connectionStatus === 'success'
                        ? 'bg-green-100 dark:bg-green-900'
                        : connectionStatus === 'error'
                        ? 'bg-red-100 dark:bg-red-900'
                        : 'bg-blue-100 dark:bg-blue-900'
                    }`}>
                      {connectionStatus === 'success' && <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />}
                      {connectionStatus === 'error' && <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />}
                    </div>
                    <div className="flex-1">
                      <div className={`font-medium text-sm ${
                        connectionStatus === 'success'
                          ? 'text-green-800 dark:text-green-300'
                          : connectionStatus === 'error'
                          ? 'text-red-800 dark:text-red-300'
                          : 'text-blue-800 dark:text-blue-300'
                      }`}>
                        {statusMessage}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}