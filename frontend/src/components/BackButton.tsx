'use client'

import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'

interface BackButtonProps {
  onClick: () => void
}

export default function BackButton({ onClick }: BackButtonProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      whileHover={{ scale: 1.05, x: -2 }}
      whileTap={{ scale: 0.95 }}
      style={{
        position: 'fixed',
        top: '1.5rem',
        left: '1.5rem',
        zIndex: 50
      }}
    >
      <button
        onClick={onClick}
        className="bg-white dark:bg-vscode-bg-elevated border border-gray-200 dark:border-vscode-border rounded-lg px-4 py-3 text-gray-700 dark:text-vscode-text-secondary hover:text-gray-900 dark:hover:text-vscode-text-primary hover:bg-gray-50 dark:hover:bg-vscode-bg-tertiary transition-all duration-300 flex items-center gap-2 font-medium shadow-sm"
      >
        <ArrowLeft size={18} />
        戻る
      </button>
    </motion.div>
  )
}