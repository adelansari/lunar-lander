import { useEffect, useRef } from 'react'

const useGameLoop = (callback: (delta: number) => void) => {
  const requestRef = useRef<number>()
  const previousTimeRef = useRef<number>()

  const animate = (time: number) => {
    if (previousTimeRef.current !== undefined) {
      const delta = time - previousTimeRef.current
      callback(delta / 16) // normalize delta (assuming ~16ms per frame)
    }
    previousTimeRef.current = time
    requestRef.current = requestAnimationFrame(animate)
  }

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(requestRef.current!)
  }, [])
}

export default useGameLoop
