'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import { useTypewriter } from '@/hooks/useTypewriter'

interface TypedMessageProps {
  message: string
  onComplete?: () => void
  className?: string
  isInstant?: boolean
}

export function TypedMessage({ message, onComplete, className = '', isInstant = false }: TypedMessageProps) {
  const { displayText, isTyping } = useTypewriter({
    text: message,
    delay: Math.max(80, Math.min(150, 150 - message.length / 2)),
    typoChance: 0.03,
    correctionDelay: Math.max(300, Math.min(500, 500 - message.length / 2))
  })

  useEffect(() => {
    if (!isTyping && onComplete) {
      onComplete()
    }
  }, [isTyping, onComplete])

  if (isInstant) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className={`font-mono relative ${className}`}
        >
          {message}
        </motion.div>
      </AnimatePresence>
    )
  }

  return (
    <div className={`font-mono relative ${className}`}>
      <div className="relative">
        <span className="relative z-10">{displayText}</span>
        {isTyping && (
          <span className="animate-blink ml-0.5 inline-block w-2 h-4 bg-[#B026FF] vertical-middle" />
        )}
      </div>
      {/* CRT screen effect overlay */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:bottom-0 before:bg-[linear-gradient(transparent_1px,_transparent_1px),_linear-gradient(90deg,_#ff000003_1px,_transparent_1px)] before:bg-[length:2px_2px] before:animate-scan" />
      {/* Chromatic aberration effect */}
      <div className="absolute inset-0 opacity-50 mix-blend-screen">
        <div className="absolute inset-0 text-[#FF0000] translate-x-[1px]">{displayText}</div>
        <div className="absolute inset-0 text-[#B026FF] -translate-x-[1px]">{displayText}</div>
      </div>
    </div>
  )
}

