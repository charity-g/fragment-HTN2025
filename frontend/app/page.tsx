"use client"

import { useState, useEffect, useRef } from "react"

export default function InteractiveGradient() {
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 })
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * 100
        const y = ((e.clientY - rect.top) / rect.height) * 100
        setMousePosition({ x, y })
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener("mousemove", handleMouseMove)
      return () => container.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="min-h-screen w-full relative overflow-hidden cursor-none bg-black"
      style={{
        background: `
          radial-gradient(
            600px circle at ${mousePosition.x}% ${mousePosition.y}%, 
            rgba(255, 215, 0, 0.4) 0%,
            rgba(255, 140, 0, 0.3) 25%,
            rgba(220, 20, 60, 0.2) 50%,
            rgba(75, 0, 130, 0.1) 75%,
            rgba(0, 0, 0, 0.9) 100%
          ),
          url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.4'/%3E%3C/svg%3E"),
          #000000
        `,
        backgroundBlendMode: "multiply",
      }}
    >
      {/* Grain overlay */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.05) 0%, transparent 50%),
            url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='turbulence' baseFrequency='0.9' numOctaves='4' seed='1' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grain)' opacity='0.6'/%3E%3C/svg%3E")
          `,
          backgroundSize: "100px 100px, 150px 150px, 100px 100px",
        }}
      />

      {/* Content overlay */}
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="text-center space-y-6">
          <h1
            className="text-6xl font-bold text-white"
            style={{ textShadow: "0 0 20px rgba(0,0,0,0.8), 0 4px 8px rgba(0,0,0,0.6)" }}
          >
            Interactive Gradient
          </h1>
          <p
            className="text-xl text-white/90 max-w-md mx-auto"
            style={{ textShadow: "0 0 15px rgba(0,0,0,0.7), 0 2px 4px rgba(0,0,0,0.5)" }}
          >
            Move your mouse around to see the gradient respond with grainy textures
          </p>
          <div className="text-sm text-white/70" style={{ textShadow: "0 0 10px rgba(0,0,0,0.6)" }}>
            Mouse position: {Math.round(mousePosition.x)}%, {Math.round(mousePosition.y)}%
          </div>
        </div>
      </div>

      {/* Mouse follower */}
      <div
        className="absolute pointer-events-none z-20 w-4 h-4 bg-white/50 rounded-full blur-sm transition-all duration-100 ease-out"
        style={{
          left: `${mousePosition.x}%`,
          top: `${mousePosition.y}%`,
          transform: "translate(-50%, -50%)",
        }}
      />
    </div>
  )
}
