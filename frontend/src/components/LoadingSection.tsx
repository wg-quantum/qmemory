'use client'

import { motion } from 'framer-motion'

export default function LoadingSection() {
  return (
    <motion.section 
      style={{
        maxWidth: '32rem',
        margin: '0 auto'
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-white dark:bg-neutral-900 rounded-xl p-8 text-center border border-gray-200 dark:border-neutral-800">
      <div className="space-y-6">
        <motion.div
          style={{
            width: '3rem',
            height: '3rem',
            margin: '0 auto',
            borderRadius: '50%',
            border: '2px solid',
            borderColor: 'rgb(229 231 235)',
            borderTopColor: 'rgb(139 92 246)'
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        
        <div className="space-y-3">
          <motion.p 
            style={{
              fontSize: '1.125rem',
              fontWeight: '500'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <span className="text-gray-900 dark:text-white">
              記憶を解析中...
            </span>
          </motion.p>
          
          <motion.p 
            style={{
              fontSize: '0.875rem'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <span className="text-gray-600 dark:text-gray-400">
              AIが記憶の断片から場所を特定しています
            </span>
          </motion.p>
        </div>

        <motion.div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '0.25rem'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              style={{
                width: '0.375rem',
                height: '0.375rem',
                backgroundColor: 'rgb(139 92 246)',
                borderRadius: '50%'
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>
      </div>
      </div>
    </motion.section>
  )
}