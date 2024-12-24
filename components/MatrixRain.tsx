'use client'

import { useEffect, useRef } from 'react'

const MATRIX_CHARACTERS = "ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ012345789:・."
const SALAVEY = "SALAVEY13"

export function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const fontSize = 16
    const columns = Math.ceil(canvas.width / fontSize)
    const drops: number[] = new Array(columns).fill(1)
    const specialDrops: Set<number> = new Set()

    // Randomly select columns for SALAVEY13
    for (let i = 0; i < 10; i++) {
      specialDrops.add(Math.floor(Math.random() * columns))
    }

    let frame = 0
    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.font = `${fontSize}px matrix-code`
      
      for (let i = 0; i < drops.length; i++) {
        const isSpecialColumn = specialDrops.has(i)
        const x = i * fontSize
        const y = drops[i] * fontSize

        // Draw glowing effect for special columns
        if (isSpecialColumn) {
          ctx.shadowBlur = 15
          ctx.shadowColor = '#B026FF'
        } else {
          ctx.shadowBlur = 0
        }

        // Determine character and color
        if (isSpecialColumn && Math.random() < 0.1) {
          const charIndex = Math.floor(frame / 10) % SALAVEY.length
          ctx.fillStyle = '#FF0000'
          ctx.fillText(SALAVEY[charIndex], x, y)
        } else {
          const char = MATRIX_CHARACTERS[Math.floor(Math.random() * MATRIX_CHARACTERS.length)]
          const brightness = Math.random() * 0.31 + 0.69 // Increase brightness
          ctx.fillStyle = `rgba(176, 38, 255, ${brightness})` // Use purple color
          ctx.fillText(char, x, y)
        }

        // Update drop position
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0
        }
        drops[i]++
      }

      frame++
      requestAnimationFrame(draw)
    }

    const animation = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animation)
    }
  }, [])

  return (
    <canvas 
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ opacity: 0.3 }} // Increase opacity for better visibility
    />
  )
}

