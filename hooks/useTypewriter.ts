'use client'
import { useState, useEffect, useCallback } from 'react'

interface TypewriterOptions {
  text: string
  delay?: number
  typoChance?: number
  correctionDelay?: number
}

export function useTypewriter({ 
  text, 
  delay = 100, 
  typoChance = 0.04, 
  correctionDelay = 300 
}: TypewriterOptions) {
  const [displayText, setDisplayText] = useState('')
  const [isTyping, setIsTyping] = useState(true)

  const makeTypo = useCallback((char: string) => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    return chars[Math.floor(Math.random() * chars.length)]
  }, [])

  useEffect(() => {
    let currentIndex = 0
    let currentText = ''
    let timeoutId: NodeJS.Timeout

    const typeNextChar = () => {
      if (currentIndex < text.length) {
        const shouldMakeTypo = Math.random() < typoChance
        
        if (shouldMakeTypo) {
          // Make a typo
          currentText += makeTypo(text[currentIndex])
          setDisplayText(currentText)
          
          // Correct the typo after a delay
          timeoutId = setTimeout(() => {
            currentText = currentText.slice(0, -1) + text[currentIndex]
            setDisplayText(currentText)
            currentIndex++
            timeoutId = setTimeout(typeNextChar, delay)
          }, correctionDelay)
        } else {
          currentText += text[currentIndex]
          setDisplayText(currentText)
          currentIndex++
          timeoutId = setTimeout(typeNextChar, delay)
        }
      } else {
        setIsTyping(false)
      }
    }

    timeoutId = setTimeout(typeNextChar, delay)

    return () => clearTimeout(timeoutId)
  }, [text, delay, typoChance, correctionDelay, makeTypo])

  return { displayText, isTyping }
}

