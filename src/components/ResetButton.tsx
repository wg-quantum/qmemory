'use client'

import { motion } from 'framer-motion'
import { RotateCcw } from 'lucide-react'

interface ResetButtonProps {
  onClick: () => void
}

export default function ResetButton({ onClick }: ResetButtonProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <button
        onClick={onClick}
        className="fixed bottom-6 right-6 z-50 bg-white dark:bg-vscode-bg-elevated border border-gray-200 dark:border-vscode-border rounded-full w-12 h-12 flex items-center justify-center text-gray-700 dark:text-vscode-text-secondary hover:text-gray-900 dark:hover:text-vscode-text-primary hover:bg-gray-50 dark:hover:bg-vscode-bg-tertiary transition-all duration-300 shadow-sm"
        title="新しい記憶を探す"
      >
        <RotateCcw size={20} />
      </button>
    </motion.div>
  )
}