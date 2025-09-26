'use client'

import { useEffect, useRef } from 'react'

export default function ParticleBackground() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const particleCount = 40

    // 既存のパーティクルをクリア
    container.innerHTML = ''

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div')
      particle.className = 'particle'
      
      // ランダムな色を設定
      const colors = ['text-quantum-400', 'text-cosmic-400', 'text-emerald-400']
      const randomColor = colors[i % 3]
      particle.classList.add(randomColor)
      
      // ランダムな位置とアニメーション
      particle.style.left = Math.random() * 100 + '%'
      particle.style.animationDelay = Math.random() * 6 + 's'
      particle.style.animationDuration = (Math.random() * 3 + 5) + 's'
      
      container.appendChild(particle)
    }

    // クリーンアップ
    return () => {
      if (container) {
        container.innerHTML = ''
      }
    }
  }, [])

  return (
    <div 
      ref={containerRef}
      className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none"
      aria-hidden="true"
    />
  )
}