import React, { useState, useEffect } from 'react'
import { Stage, Layer, Line, Rect, Circle, Group } from 'react-konva'
import useGameLoop from '../hooks/useGameLoop'
import Controls from './Controls'
import EndScreen from './EndScreen'

interface Point {
  x: number
  y: number
}

interface LanderState {
  x: number
  y: number
  angle: number
  velocityX: number
  velocityY: number
  fuel: number
  thrusting: boolean
  rotationSpeed: number
}

interface LandingZone {
  x: number
  y: number
  width: number
}

interface GameProps {
  onGameOver: () => void
}

const Game: React.FC<GameProps> = ({ onGameOver }) => {
  const [stageSize, setStageSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  const [lander, setLander] = useState<LanderState>({
    x: stageSize.width / 2,
    y: 50,
    angle: 0,
    velocityX: 0,
    velocityY: 0,
    fuel: 100,
    thrusting: false,
    rotationSpeed: 0,
  })

  const [stars, setStars] = useState<Point[]>([])
  const [terrain, setTerrain] = useState<Point[]>([])
  const [landingZone, setLandingZone] = useState<LandingZone>({
    x: 0,
    y: 0,
    width: 100,
  })
  const [gameOver, setGameOver] = useState(false)
  const [endMessage, setEndMessage] = useState('')

  // Resize stage
  useEffect(() => {
    const handleResize = () => {
      setStageSize({ width: window.innerWidth, height: window.innerHeight })
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Generate stars, terrain, and landing zone when stage size changes
  useEffect(() => {
    const newStars: Point[] = Array.from({ length: 100 }, () => ({
      x: Math.random() * stageSize.width,
      y: Math.random() * stageSize.height,
    }))
    setStars(newStars)

    const segments = 20
    const segWidth = stageSize.width / segments
    const newTerrain: Point[] = []
    let prevHeight = stageSize.height * 0.7
    for (let i = 0; i <= segments; i++) {
      let height: number
      if (i === 0 || i === segments) {
        height = prevHeight
      } else {
        const maxChange = stageSize.height * 0.1
        height = prevHeight + (Math.random() * maxChange * 2 - maxChange)
        height = Math.max(stageSize.height * 0.5, Math.min(stageSize.height * 0.9, height))
      }
      newTerrain.push({ x: i * segWidth, y: height })
      prevHeight = height
    }
    // Define landing zone on a flat segment
    const landingSegment = Math.floor(segments / 2) + Math.floor(Math.random() * (segments / 3))
    const zoneX = newTerrain[landingSegment].x
    const zoneY = newTerrain[landingSegment].y - 5
    setLandingZone({ x: zoneX, y: zoneY, width: 100 })
    for (let i = landingSegment - 2; i <= landingSegment + 2; i++) {
      if (i >= 0 && i < newTerrain.length) {
        newTerrain[i].y = zoneY + 5
      }
    }
    setTerrain(newTerrain)
    // Reset lander position
    setLander(prev => ({ ...prev, x: stageSize.width / 2, y: 50 }))
    setGameOver(false)
    setEndMessage('')
  }, [stageSize])

  // Control handlers for touch/keyboard events
  const handleThrustDown = () => {
    setLander(prev => ({ ...prev, thrusting: true }))
  }
  const handleThrustUp = () => {
    setLander(prev => ({ ...prev, thrusting: false }))
  }
  const handleRotateLeftDown = () => {
    setLander(prev => ({ ...prev, rotationSpeed: -0.08 }))
  }
  const handleRotateLeftUp = () => {
    setLander(prev => ({ ...prev, rotationSpeed: 0 }))
  }
  const handleRotateRightDown = () => {
    setLander(prev => ({ ...prev, rotationSpeed: 0.08 }))
  }
  const handleRotateRightUp = () => {
    setLander(prev => ({ ...prev, rotationSpeed: 0 }))
  }

  // Game loop with collision detection
  useGameLoop((delta: number) => {
    if (gameOver) return
    setLander(prev => {
      let { x, y, angle, velocityX, velocityY, fuel, thrusting, rotationSpeed } = prev
      // Update angle based on rotation input
      angle += rotationSpeed * delta
      // Apply gravity
      velocityY += 0.0015 * delta
      // Apply thrust if active
      if (thrusting && fuel > 0) {
        fuel = Math.max(0, fuel - 0.1 * delta)
        velocityX += Math.sin(angle) * 0.05 * delta
        velocityY -= Math.cos(angle) * 0.05 * delta
      }
      // Update position
      x += velocityX * delta
      y += velocityY * delta

      const newState = { ...prev, x, y, angle, velocityX, velocityY, fuel }

      // Collision detection: determine terrain height under the lander
      for (let i = 0; i < terrain.length - 1; i++) {
        if (x > terrain[i].x && x < terrain[i + 1].x) {
          const t = (x - terrain[i].x) / (terrain[i + 1].x - terrain[i].x)
          const terrainY = terrain[i].y + t * (terrain[i + 1].y - terrain[i].y)
          if (y + 20 >= terrainY) { // 20 approximates the lander’s half-height
            const inZone = x >= landingZone.x && x <= landingZone.x + landingZone.width
            const velocity = Math.sqrt(velocityX ** 2 + velocityY ** 2)
            const angleDegrees = Math.abs(angle * (180 / Math.PI))
            if (inZone && velocity < 5 && angleDegrees < 10) {
              setEndMessage(`Landing Success! Velocity: ${velocity.toFixed(1)} m/s, Angle: ${angleDegrees.toFixed(1)}°`)
            } else {
              setEndMessage(`Crash! Impact Velocity: ${velocity.toFixed(1)} m/s`)
            }
            setGameOver(true)
            break
          }
        }
      }
      return newState
    })
  })

  // Restart game by resetting stage size (which regenerates terrain)
  const handleRestart = () => {
    setStageSize({ width: window.innerWidth, height: window.innerHeight })
  }

  return (
    <>
      <Stage width={stageSize.width} height={stageSize.height}>
        <Layer>
          {/* Stars */}
          {stars.map((star, i) => (
            <Circle key={i} x={star.x} y={star.y} radius={Math.random() * 2 + 1} fill="white" opacity={0.8} />
          ))}
          {/* Terrain */}
          {terrain.length > 0 && (
            <Line
              points={terrain.flatMap(p => [p.x, p.y]).concat([stageSize.width, stageSize.height, 0, stageSize.height])}
              fill="#4a4e69"
              stroke="#3a3e59"
              closed
            />
          )}
          {/* Landing Zone */}
          <Line
            points={[landingZone.x, landingZone.y, landingZone.x + landingZone.width, landingZone.y]}
            stroke="#00ff64"
            strokeWidth={8}
            opacity={0.5}
          />
          {Array.from({ length: Math.floor(landingZone.width / 15) }).map((_, i) => {
            const stripeX = landingZone.x + i * 15
            return (
              <Line
                key={i}
                points={[stripeX, landingZone.y, stripeX + 8, landingZone.y]}
                stroke="#00ff64"
                strokeWidth={3}
              />
            )
          })}
          {/* Lander */}
          <Group x={lander.x} y={lander.y} rotation={(lander.angle * 180) / Math.PI}>
            <Rect x={-15} y={-20} width={30} height={40} fill="#333" />
            <Circle x={0} y={-5} radius={10} fill="#6495ed" />
            {lander.thrusting && (
              <Line points={[-7.5, 20, 7.5, 20, 0, 40]} closed fill="#ff4500" />
            )}
          </Group>
        </Layer>
      </Stage>
      {/* Touch/Mouse Controls */}
      <Controls
        onThrustDown={handleThrustDown}
        onThrustUp={handleThrustUp}
        onRotateLeftDown={handleRotateLeftDown}
        onRotateLeftUp={handleRotateLeftUp}
        onRotateRightDown={handleRotateRightDown}
        onRotateRightUp={handleRotateRightUp}
      />
      {/* End Screen Overlay */}
      {gameOver && <EndScreen message={endMessage} onRestart={handleRestart} />}
    </>
  )
}

export default Game
