import React, { useState, useEffect } from 'react'
import { Stage, Layer, Line, Rect, Circle, Group } from 'react-konva'
import useGameLoop from '../hooks/useGameLoop'

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
}

const Game: React.FC = () => {
  const [stageSize, setStageSize] = useState({ width: window.innerWidth, height: window.innerHeight })

  const [lander, setLander] = useState<LanderState>({
    x: stageSize.width / 2,
    y: 50,
    angle: 0,
    velocityX: 0,
    velocityY: 0,
    fuel: 100,
    thrusting: false,
  })

  const [stars, setStars] = useState<Point[]>([])
  const [terrain, setTerrain] = useState<Point[]>([])

  // Resize stage on window change
  useEffect(() => {
    const handleResize = () => {
      setStageSize({ width: window.innerWidth, height: window.innerHeight })
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Generate stars and terrain on stage size change
  useEffect(() => {
    const newStars: Point[] = Array.from({ length: 100 }, () => ({
      x: Math.random() * stageSize.width,
      y: Math.random() * stageSize.height,
    }))
    setStars(newStars)

    const segments = 20
    const segWidth = stageSize.width / segments
    const newTerrain: Point[] = []
    for (let i = 0; i <= segments; i++) {
      newTerrain.push({
        x: i * segWidth,
        y: stageSize.height * (0.7 + 0.1 * Math.random()),
      })
    }
    setTerrain(newTerrain)

    // Reset lander position
    setLander(prev => ({ ...prev, x: stageSize.width / 2, y: 50 }))
  }, [stageSize])

  // Game loop updates
  useGameLoop((delta: number) => {
    setLander(prev => {
      let { x, y, angle, velocityX, velocityY, fuel, thrusting } = prev
      const gravity = 0.0015
      const thrustPower = 0.05

      velocityY += gravity * delta
      if (thrusting && fuel > 0) {
        fuel = Math.max(0, fuel - 0.1 * delta)
        velocityX += Math.sin(angle) * thrustPower * delta
        velocityY -= Math.cos(angle) * thrustPower * delta
      }
      x += velocityX * delta
      y += velocityY * delta

      return { ...prev, x, y, velocityX, velocityY, fuel }
    })
  })

  return (
    <Stage width={stageSize.width} height={stageSize.height}>
      <Layer>
        {stars.map((star, i) => (
          <Circle key={i} x={star.x} y={star.y} radius={Math.random() * 2 + 1} fill="white" opacity={0.8} />
        ))}
        {terrain.length > 0 && (
          <Line
            points={terrain.flatMap(p => [p.x, p.y]).concat([stageSize.width, stageSize.height, 0, stageSize.height])}
            fill="#4a4e69"
            stroke="#3a3e59"
            closed
          />
        )}
        <Group x={lander.x} y={lander.y} rotation={(lander.angle * 180) / Math.PI}>
          <Rect x={-15} y={-20} width={30} height={40} fill="#333" />
          <Circle x={0} y={-5} radius={10} fill="#6495ed" />
          {lander.thrusting && (
            <Line
              points={[-7.5, 20, 7.5, 20, 0, 40]}
              closed
              fill="#ff4500"
            />
          )}
        </Group>
      </Layer>
    </Stage>
  )
}

export default Game
