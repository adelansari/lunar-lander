import React, { useEffect, useRef } from 'react'
import { GameStats } from '../App'

interface GameCanvasProps {
  onUpdateStats: (stats: GameStats) => void
  onGameOver: (message: string) => void
}

const GameCanvas: React.FC<GameCanvasProps> = ({ onUpdateStats, onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Initialize game variables
    let stars: { x: number; y: number; size: number }[] = []
    let terrain: { x: number; y: number }[] = []
    let landingZone = { x: 0, y: 0, width: 100 }
    const gravity = 0.0015
    const thrust = 0.05
    const rotationThrust = 0.08
    let lastTime = 0
    let beaconPulse = 0
    let keys: { [key: string]: boolean } = {}

    let lander = {
      x: canvas.width / 2,
      y: 50,
      width: 30,
      height: 40,
      angle: 0,
      velocityX: 0,
      velocityY: 0,
      rotationSpeed: 0,
      fuel: 100,
      thrusting: false,
      crashed: false,
      landed: false
    }

    // Define helper functions before usage
    const generateTerrain = () => {
      terrain = []
      const segments = 20
      const segWidth = canvas.width / segments
      let prevHeight = canvas.height * 0.7
      for (let i = 0; i <= segments; i++) {
        let height: number
        if (i === 0 || i === segments) {
          height = prevHeight
        } else {
          const maxChange = canvas.height * 0.1
          height = prevHeight + (Math.random() * maxChange * 2 - maxChange)
          height = Math.max(canvas.height * 0.5, Math.min(canvas.height * 0.9, height))
        }
        terrain.push({ x: i * segWidth, y: height })
        prevHeight = height
      }
      const landingSegment = Math.floor(segments / 2) + Math.floor(Math.random() * (segments / 3))
      landingZone.x = terrain[landingSegment].x
      landingZone.y = terrain[landingSegment].y - 5
      landingZone.width = 100
      for (let i = landingSegment - 2; i <= landingSegment + 2; i++) {
        if (i >= 0 && i < terrain.length) {
          terrain[i].y = landingZone.y + 5
        }
      }
    }

    const resetLander = () => {
      lander.x = canvas.width / 2
      lander.y = 50
      lander.angle = 0
      lander.velocityX = 0
      lander.velocityY = 0
      lander.rotationSpeed = 0
      lander.fuel = 100
      lander.thrusting = false
      lander.crashed = false
      lander.landed = false
    }

    const createStars = () => {
      stars = []
      for (let i = 0; i < 100; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 3
        })
      }
    }

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      generateTerrain()
      resetLander()
      createStars()
    }

    // Setup initial canvas size
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Keyboard event listeners
    const handleKeyDown = (e: KeyboardEvent) => { keys[e.key] = true }
    const handleKeyUp = (e: KeyboardEvent) => { keys[e.key] = false }
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)

    // Update UI stats (altitude, velocity, fuel, angle)
    const updateStats = () => {
      let minAltitude = Infinity
      for (let i = 0; i < terrain.length; i++) {
        const dist = Math.hypot(lander.x - terrain[i].x, lander.y - terrain[i].y)
        if (dist < minAltitude) {
          minAltitude = dist
        }
      }
      const velocity = Math.hypot(lander.velocityX, lander.velocityY)
      onUpdateStats({
        altitude: Math.floor(minAltitude),
        velocity,
        fuel: lander.fuel,
        angle: Math.round(lander.angle * (180 / Math.PI))
      })
    }

    // Collision detection (using linear interpolation along terrain segments)
    const checkCollision = () => {
      for (let i = 0; i < terrain.length - 1; i++) {
        const seg = terrain[i]
        const nextSeg = terrain[i + 1]
        if (lander.x + lander.width / 2 < seg.x || lander.x - lander.width / 2 > nextSeg.x) continue
        const t = (lander.x - seg.x) / (nextSeg.x - seg.x)
        const terrainY = seg.y + t * (nextSeg.y - seg.y)
        if (lander.y + lander.height / 2 >= terrainY) {
          const inZone = lander.x >= landingZone.x && lander.x <= landingZone.x + landingZone.width
          const velocity = Math.hypot(lander.velocityX, lander.velocityY)
          const angleDegrees = Math.abs(lander.angle * (180 / Math.PI))
          if (inZone && velocity < 5 && angleDegrees < 10) {
            lander.landed = true
            onGameOver(`Landing Success! Velocity: ${velocity.toFixed(1)} m/s, Angle: ${angleDegrees.toFixed(1)}°`)
          } else {
            lander.crashed = true
            onGameOver(`Crash! Impact Velocity: ${velocity.toFixed(1)} m/s`)
          }
          return true
        }
      }
      return false
    }

    // Update game state
    const update = (delta: number) => {
      beaconPulse = (beaconPulse + 0.02) % (Math.PI * 2)
      if (lander.crashed || lander.landed) return

      // Handle rotation input
      if (keys['ArrowLeft'] || keys['a']) {
        lander.rotationSpeed = -rotationThrust
      } else if (keys['ArrowRight'] || keys['d']) {
        lander.rotationSpeed = rotationThrust
      } else {
        lander.rotationSpeed = 0
      }
      // Handle thrust input
      lander.thrusting = false
      if ((keys['ArrowUp'] || keys['w']) && lander.fuel > 0) {
        lander.thrusting = true
        lander.fuel -= 0.1 * delta
        if (lander.fuel < 0) lander.fuel = 0
        const thrustX = Math.sin(lander.angle) * thrust * delta
        const thrustY = -Math.cos(lander.angle) * thrust * delta
        lander.velocityX += thrustX
        lander.velocityY += thrustY
      }
      // Update angle (normalize to -π .. π)
      lander.angle += lander.rotationSpeed * delta
      if (lander.angle < -Math.PI) lander.angle = 2 * Math.PI + lander.angle
      else if (lander.angle >= Math.PI) lander.angle = lander.angle - 2 * Math.PI

      // Apply gravity and update position
      lander.velocityY += gravity * delta
      lander.x += lander.velocityX * delta
      lander.y += lander.velocityY * delta
      if (lander.x < 0) { lander.x = 0; lander.velocityX *= -0.5 }
      else if (lander.x > canvas.width) { lander.x = canvas.width; lander.velocityX *= -0.5 }

      checkCollision()
      updateStats()
    }

    // Draw everything on the canvas
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      // Draw terrain
      ctx.beginPath()
      ctx.moveTo(0, canvas.height)
      for (let i = 0; i < terrain.length; i++) {
        ctx.lineTo(terrain[i].x, terrain[i].y)
      }
      ctx.lineTo(canvas.width, canvas.height)
      ctx.closePath()
      ctx.fillStyle = '#4a4e69'
      ctx.fill()
      ctx.strokeStyle = '#3a3e59'
      ctx.stroke()
      // Draw landing zone with glow and stripes
      ctx.beginPath()
      ctx.moveTo(landingZone.x, landingZone.y)
      ctx.lineTo(landingZone.x + landingZone.width, landingZone.y)
      ctx.lineWidth = 8
      ctx.strokeStyle = 'rgba(0,255,100,0.5)'
      ctx.stroke()
      for (let x = landingZone.x; x < landingZone.x + landingZone.width; x += 15) {
        ctx.beginPath()
        ctx.moveTo(x, landingZone.y)
        ctx.lineTo(x + 8, landingZone.y)
        ctx.lineWidth = 3
        ctx.strokeStyle = '#00ff64'
        ctx.stroke()
      }
      // Draw beacon pulse
      const landingCenterX = landingZone.x + landingZone.width / 2
      const pulseSize = 8 + Math.sin(beaconPulse) * 5
      ctx.beginPath()
      ctx.arc(landingCenterX, landingZone.y - 8, pulseSize, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(0,255,100,0.3)'
      ctx.fill()
      ctx.beginPath()
      ctx.arc(landingCenterX, landingZone.y - 8, 4, 0, Math.PI * 2)
      ctx.fillStyle = '#00ff64'
      ctx.fill()
      // Draw stars
      stars.forEach(star => {
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fillStyle = 'white'
        ctx.fill()
      })
      // Draw lander
      ctx.save()
      ctx.translate(lander.x, lander.y)
      ctx.rotate(lander.angle)
      ctx.fillStyle = '#333'
      ctx.fillRect(-lander.width / 2, -lander.height / 2, lander.width, lander.height)
      ctx.fillStyle = '#6495ed'
      ctx.beginPath()
      ctx.arc(0, -5, lander.width / 3, 0, Math.PI * 2)
      ctx.fill()
      if (lander.thrusting) {
        ctx.fillStyle = '#ff4500'
        ctx.beginPath()
        ctx.moveTo(-lander.width / 4, lander.height / 2)
        ctx.lineTo(lander.width / 4, lander.height / 2)
        ctx.lineTo(0, lander.height / 2 + 20 + Math.random() * 10)
        ctx.closePath()
        ctx.fill()
      }
      ctx.restore()
      // Draw altitude marker (only if still flying)
      if (!lander.landed && !lander.crashed) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
        ctx.strokeStyle = 'white'
        ctx.beginPath()
        ctx.arc(lander.x, canvas.height * 0.7, 3, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(lander.x, canvas.height * 0.7 + 5)
        ctx.lineTo(lander.x, lander.y - lander.height / 2 - 5)
        ctx.setLineDash([5, 3])
        ctx.stroke()
        ctx.setLineDash([])
      }
      // Draw distance indicator if far from landing zone
      const landingCenterY = landingZone.y
      if (Math.abs(lander.x - landingCenterX) > 200 || lander.y < landingCenterY - 300) {
        const arrowX = lander.x > landingCenterX ? canvas.width - 20 : 20
        const arrowDir = lander.x > landingCenterX ? -1 : 1
        ctx.font = '12px Orbitron'
        ctx.fillStyle = '#00ff64'
        ctx.fillText('LAND HERE', arrowX + (arrowDir * 30), 50)
        ctx.beginPath()
        ctx.moveTo(arrowX, 40)
        ctx.lineTo(arrowX + (arrowDir * 15), 50)
        ctx.lineTo(arrowX, 60)
        ctx.lineWidth = 2
        ctx.strokeStyle = '#00ff64'
        ctx.stroke()
        const distance = Math.floor(Math.hypot(lander.x - landingCenterX, lander.y - landingCenterY))
        ctx.fillText(`${distance}m`, arrowX + (arrowDir * 30), 70)
      }
    }

    // Main game loop stops once the mission ends
    const gameLoop = (timestamp: number) => {
      if (!lastTime) lastTime = timestamp
      const delta = timestamp - lastTime
      lastTime = timestamp
      update(delta / 16)
      draw()
      if (!lander.crashed && !lander.landed) {
        requestAnimationFrame(gameLoop)
      }
    }

    requestAnimationFrame(gameLoop)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
    }
  }, [onGameOver, onUpdateStats])

  return <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0 }} />
}

export default GameCanvas
