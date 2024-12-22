'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface MatrixToastProps {
  message: string
  duration?: number
  onComplete?: () => void
}

export function MatrixToast({ message, duration = 4000, onComplete }: MatrixToastProps) {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false)
      if (onComplete) setTimeout(onComplete, 500)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onComplete])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 420 }}
          className="fixed inset-x-4 top-20 z-50 mx-auto max-w-2xl"
        >
          <div className="rounded-lg border border-[#00FF00]/20 bg-black/90 p-4 text-[#00FF00] shadow-lg backdrop-blur">
            <div className="matrix-text-container relative">
              <p className="text-lg font-mono">{message}</p>
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00FF00]/5 to-transparent animate-scan" />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

