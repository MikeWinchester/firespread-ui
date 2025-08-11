"use client"

import type React from "react"
import { useEffect, useRef, useState, useCallback } from "react"
import { useSimulation } from "@/contexts/SimulationContext"
import type { VegetationType } from "@/types/simulation"

interface MapVisualizationProps {
  className?: string
}

// Realistic terrain generation using Perlin-like noise
const generateNoise = (width: number, height: number, scale = 50) => {
  const noise: number[][] = []
  for (let y = 0; y < height; y++) {
    noise[y] = []
    for (let x = 0; x < width; x++) {
      const value =
        Math.sin(x / scale) * Math.cos(y / scale) +
        Math.sin(x / (scale * 2)) * Math.cos(y / (scale * 2)) * 0.5 +
        Math.sin(x / (scale * 4)) * Math.cos(y / (scale * 4)) * 0.25
      noise[y][x] = (value + 1) / 2 // Normalize to 0-1
    }
  }
  return noise
}


// Enhanced terrain drawing with realistic patterns
const drawRealisticTerrain = (
  ctx: CanvasRenderingContext2D,
  vegetationType: VegetationType,
  width: number,
  height: number,
) => {
  ctx.clearRect(0, 0, width, height)

  // Generate noise for terrain variation
  const noise = generateNoise(width, height, 30)
  const detailNoise = generateNoise(width, height, 10)

  switch (vegetationType) {
    case "forest":
      // Base forest colors
      const forestColors = ["#0d3d0d", "#1a4d1a", "#2d5a2d", "#1e4a1e"]

      // Draw base terrain with noise
      for (let y = 0; y < height; y += 2) {
        for (let x = 0; x < width; x += 2) {
          const noiseValue = noise[Math.floor(y / 2)]?.[Math.floor(x / 2)] || 0
          const colorIndex = Math.floor(noiseValue * forestColors.length)
          ctx.fillStyle = forestColors[Math.min(colorIndex, forestColors.length - 1)]
          ctx.fillRect(x, y, 2, 2)
        }
      }

      // Add realistic trees
      for (let i = 0; i < Math.min(200, (width * height) / 2000); i++) {
        const x = Math.random() * width
        const y = Math.random() * height
        const treeSize = 6 + Math.random() * 16
        const noiseVal = noise[Math.floor(y / 2)]?.[Math.floor(x / 2)] || 0.5

        if (noiseVal > 0.3) {
          // Only place trees in suitable areas
          // Tree shadow
          ctx.fillStyle = "rgba(0, 0, 0, 0.2)"
          ctx.beginPath()
          ctx.ellipse(x + 2, y + treeSize, treeSize * 0.8, treeSize * 0.3, 0, 0, 2 * Math.PI)
          ctx.fill()

          // Tree trunk
          ctx.fillStyle = `hsl(${25 + Math.random() * 10}, ${40 + Math.random() * 20}%, ${20 + Math.random() * 10}%)`
          ctx.fillRect(x - 1.5, y - treeSize * 0.2, 3, treeSize * 0.8)

          // Tree crown (multiple layers for realism)
          for (let layer = 0; layer < 3; layer++) {
            const layerSize = treeSize * (1 - layer * 0.15)
            const layerY = y - treeSize * 0.3 - layer * 3
            ctx.fillStyle = `hsl(${110 + Math.random() * 30}, ${50 + Math.random() * 30}%, ${25 + Math.random() * 15 - layer * 3}%)`
            ctx.beginPath()
            ctx.arc(x, layerY, layerSize, 0, 2 * Math.PI)
            ctx.fill()
          }
        }
      }

      // Add forest paths
      for (let i = 0; i < 3; i++) {
        const startX = Math.random() * width
        const startY = Math.random() * height
        const endX = Math.random() * width
        const endY = Math.random() * height

        ctx.strokeStyle = "#4a3c2a"
        ctx.lineWidth = 4 + Math.random() * 4
        ctx.beginPath()
        ctx.moveTo(startX, startY)
        ctx.quadraticCurveTo(
          (startX + endX) / 2 + (Math.random() - 0.5) * 100,
          (startY + endY) / 2 + (Math.random() - 0.5) * 100,
          endX,
          endY,
        )
        ctx.stroke()
      }
      break

    case "grassland":
      // Base grassland with elevation
      for (let y = 0; y < height; y += 2) {
        for (let x = 0; x < width; x += 2) {
          const noiseValue = noise[Math.floor(y / 2)]?.[Math.floor(x / 2)] || 0
          const elevation = Math.floor(noiseValue * 4)
          const grassColors = ["#4a7c59", "#5d8f6c", "#70a27f", "#83b592"]
          ctx.fillStyle = grassColors[elevation]
          ctx.fillRect(x, y, 2, 2)
        }
      }

      // Add grass clusters
      for (let i = 0; i < Math.min(300, (width * height) / 1000); i++) {
        const x = Math.random() * width
        const y = Math.random() * height
        const clusterSize = 3 + Math.random() * 8

        for (let j = 0; j < clusterSize; j++) {
          const grassX = x + (Math.random() - 0.5) * 20
          const grassY = y + (Math.random() - 0.5) * 20
          const grassHeight = 3 + Math.random() * 8

          ctx.strokeStyle = `hsl(${85 + Math.random() * 25}, ${60 + Math.random() * 20}%, ${45 + Math.random() * 15}%)`
          ctx.lineWidth = 0.5 + Math.random() * 0.5
          ctx.beginPath()
          ctx.moveTo(grassX, grassY)
          ctx.lineTo(grassX + (Math.random() - 0.5) * 3, grassY - grassHeight)
          ctx.stroke()
        }
      }

      // Add scattered bushes
      for (let i = 0; i < Math.min(50, (width * height) / 8000); i++) {
        const x = Math.random() * width
        const y = Math.random() * height
        const bushSize = 8 + Math.random() * 15

        ctx.fillStyle = `hsl(${100 + Math.random() * 20}, ${45 + Math.random() * 25}%, ${35 + Math.random() * 15}%)`

        // Irregular bush shape
        ctx.beginPath()
        for (let angle = 0; angle < Math.PI * 2; angle += 0.3) {
          const radius = bushSize * (0.7 + Math.random() * 0.6)
          const px = x + Math.cos(angle) * radius
          const py = y + Math.sin(angle) * radius
          if (angle === 0) ctx.moveTo(px, py)
          else ctx.lineTo(px, py)
        }
        ctx.closePath()
        ctx.fill()
      }
      break

    case "shrubland":
      // Rocky base with shrubs
      for (let y = 0; y < height; y += 2) {
        for (let x = 0; x < width; x += 2) {
          const noiseValue = noise[Math.floor(y / 2)]?.[Math.floor(x / 2)] || 0
          const rockiness = Math.floor(noiseValue * 3)
          const shrubColors = ["#6b4423", "#7d5635", "#8f6847"]
          ctx.fillStyle = shrubColors[rockiness]
          ctx.fillRect(x, y, 2, 2)
        }
      }

      // Add rocks
      for (let i = 0; i < Math.min(80, (width * height) / 4000); i++) {
        const x = Math.random() * width
        const y = Math.random() * height
        const rockSize = 5 + Math.random() * 20
        const noiseVal = noise[Math.floor(y / 2)]?.[Math.floor(x / 2)] || 0.5

        if (noiseVal > 0.6) {
          ctx.fillStyle = `hsl(${15 + Math.random() * 15}, ${25 + Math.random() * 15}%, ${45 + Math.random() * 20}%)`

          // Irregular rock shape
          ctx.beginPath()
          for (let angle = 0; angle < Math.PI * 2; angle += 0.5) {
            const radius = rockSize * (0.8 + Math.random() * 0.4)
            const px = x + Math.cos(angle) * radius
            const py = y + Math.sin(angle) * radius
            if (angle === 0) ctx.moveTo(px, py)
            else ctx.lineTo(px, py)
          }
          ctx.closePath()
          ctx.fill()

          // Rock highlight
          ctx.fillStyle = `hsl(${15 + Math.random() * 15}, ${25 + Math.random() * 15}%, ${65 + Math.random() * 15}%)`
          ctx.beginPath()
          ctx.arc(x - rockSize * 0.3, y - rockSize * 0.3, rockSize * 0.3, 0, 2 * Math.PI)
          ctx.fill()
        }
      }

      // Add shrubs
      for (let i = 0; i < Math.min(120, (width * height) / 3000); i++) {
        const x = Math.random() * width
        const y = Math.random() * height
        const shrubSize = 4 + Math.random() * 12

        ctx.fillStyle = `hsl(${35 + Math.random() * 25}, ${40 + Math.random() * 20}%, ${30 + Math.random() * 15}%)`

        // Multiple small bushes clustered
        for (let j = 0; j < 3 + Math.random() * 3; j++) {
          const offsetX = x + (Math.random() - 0.5) * shrubSize
          const offsetY = y + (Math.random() - 0.5) * shrubSize
          const size = shrubSize * (0.3 + Math.random() * 0.4)

          ctx.beginPath()
          ctx.arc(offsetX, offsetY, size, 0, 2 * Math.PI)
          ctx.fill()
        }
      }
      break

    case "agricultural":
      // Soil base
      ctx.fillStyle = "#8b7355"
      ctx.fillRect(0, 0, width, height)

      // Add soil texture
      for (let i = 0; i < (width * height) / 100; i++) {
        const x = Math.random() * width
        const y = Math.random() * height
        ctx.fillStyle = `hsl(${35 + Math.random() * 15}, ${30 + Math.random() * 20}%, ${45 + Math.random() * 15}%)`
        ctx.fillRect(x, y, 1 + Math.random() * 2, 1 + Math.random() * 2)
      }

      // Draw crop fields in a realistic pattern
      const fieldWidth = width / 4
      const fieldHeight = height / 3

      for (let fieldY = 0; fieldY < 3; fieldY++) {
        for (let fieldX = 0; fieldX < 4; fieldX++) {
          const startX = fieldX * fieldWidth
          const startY = fieldY * fieldHeight
          const cropType = Math.floor(Math.random() * 3)
          const cropColors = [
            ["#9acd32", "#adff2f"], // Green crops
            ["#daa520", "#ffd700"], // Golden crops
            ["#8fbc8f", "#98fb98"], // Light green crops
          ]

          // Draw crop rows
          const rowSpacing = 8 + Math.random() * 4
          for (let row = startY; row < startY + fieldHeight - 10; row += rowSpacing) {
            ctx.strokeStyle = cropColors[cropType][0]
            ctx.lineWidth = 2 + Math.random()
            ctx.beginPath()
            ctx.moveTo(startX + 5, row)
            ctx.lineTo(startX + fieldWidth - 5, row)
            ctx.stroke()

            // Add individual plants
            for (let plantX = startX + 10; plantX < startX + fieldWidth - 10; plantX += 6 + Math.random() * 4) {
              ctx.fillStyle = cropColors[cropType][1]
              ctx.fillRect(plantX - 1, row - 2, 2, 4)
            }
          }
        }
      }

      // Add farm buildings
      for (let i = 0; i < 2; i++) {
        const buildingX = 50 + Math.random() * (width - 150)
        const buildingY = 50 + Math.random() * (height - 100)
        const buildingW = 40 + Math.random() * 30
        const buildingH = 25 + Math.random() * 20

        // Building shadow
        ctx.fillStyle = "rgba(0, 0, 0, 0.3)"
        ctx.fillRect(buildingX + 3, buildingY + 3, buildingW, buildingH)

        // Building
        ctx.fillStyle = "#8b4513"
        ctx.fillRect(buildingX, buildingY, buildingW, buildingH)

        // Roof
        ctx.fillStyle = "#654321"
        ctx.beginPath()
        ctx.moveTo(buildingX - 3, buildingY)
        ctx.lineTo(buildingX + buildingW / 2, buildingY - 12)
        ctx.lineTo(buildingX + buildingW + 3, buildingY)
        ctx.closePath()
        ctx.fill()

        // Door
        ctx.fillStyle = "#4a2c2a"
        ctx.fillRect(buildingX + buildingW / 2 - 4, buildingY + buildingH - 12, 8, 12)
      }
      break

    case "urban":
      // Asphalt base
      ctx.fillStyle = "#4a4a4a"
      ctx.fillRect(0, 0, width, height)

      // Add asphalt texture
      for (let i = 0; i < (width * height) / 200; i++) {
        const x = Math.random() * width
        const y = Math.random() * height
        ctx.fillStyle = `hsl(0, 0%, ${35 + Math.random() * 15}%)`
        ctx.fillRect(x, y, 1, 1)
      }

      // Draw city blocks with realistic layout
      const blockSize = Math.max(80, Math.min(width, height) / 6)
      const roadWidth = 12

      for (let blockY = 0; blockY < Math.ceil(height / blockSize); blockY++) {
        for (let blockX = 0; blockX < Math.ceil(width / blockSize); blockX++) {
          const x = blockX * blockSize
          const y = blockY * blockSize

          // Building lot
          const lotMargin = 8
          const buildingW = blockSize - roadWidth - lotMargin * 2
          const buildingH = blockSize - roadWidth - lotMargin * 2

          if (buildingW > 20 && buildingH > 20) {
            // Building shadow
            ctx.fillStyle = "rgba(0, 0, 0, 0.4)"
            ctx.fillRect(x + lotMargin + 2, y + lotMargin + 2, buildingW, buildingH)

            // Building
            const buildingColor = Math.random() > 0.7 ? "#696969" : "#808080"
            ctx.fillStyle = buildingColor
            ctx.fillRect(x + lotMargin, y + lotMargin, buildingW, buildingH)

            // Windows pattern
            const windowSize = 4
            const windowSpacing = 8
            for (let wy = y + lotMargin + 6; wy < y + lotMargin + buildingH - 6; wy += windowSpacing) {
              for (let wx = x + lotMargin + 6; wx < x + lotMargin + buildingW - 6; wx += windowSpacing) {
                const isLit = Math.random() > 0.4
                ctx.fillStyle = isLit ? "#ffff99" : "#333333"
                ctx.fillRect(wx, wy, windowSize, windowSize)

                if (isLit) {
                  ctx.fillStyle = "#ffffcc"
                  ctx.fillRect(wx + 1, wy + 1, windowSize - 2, windowSize - 2)
                }
              }
            }
          }
        }
      }

      // Draw roads
      ctx.fillStyle = "#2a2a2a"
      // Horizontal roads
      for (let y = blockSize - roadWidth / 2; y < height; y += blockSize) {
        ctx.fillRect(0, y, width, roadWidth)

        // Road markings
        ctx.strokeStyle = "#ffff00"
        ctx.lineWidth = 1
        ctx.setLineDash([10, 10])
        ctx.beginPath()
        ctx.moveTo(0, y + roadWidth / 2)
        ctx.lineTo(width, y + roadWidth / 2)
        ctx.stroke()
        ctx.setLineDash([])
      }

      // Vertical roads
      for (let x = blockSize - roadWidth / 2; x < width; x += blockSize) {
        ctx.fillRect(x, 0, roadWidth, height)

        // Road markings
        ctx.strokeStyle = "#ffff00"
        ctx.lineWidth = 1
        ctx.setLineDash([10, 10])
        ctx.beginPath()
        ctx.moveTo(x + roadWidth / 2, 0)
        ctx.lineTo(x + roadWidth / 2, height)
        ctx.stroke()
        ctx.setLineDash([])
      }

      // Add some parks
      for (let i = 0; i < 2; i++) {
        const parkX = Math.random() * (width - 80) + 40
        const parkY = Math.random() * (height - 80) + 40
        const parkSize = 60 + Math.random() * 40

        // Park area
        ctx.fillStyle = "#2d5a2d"
        ctx.fillRect(parkX, parkY, parkSize, parkSize)

        // Trees in park
        for (let j = 0; j < 8; j++) {
          const treeX = parkX + Math.random() * parkSize
          const treeY = parkY + Math.random() * parkSize
          const treeSize = 6 + Math.random() * 8

          ctx.fillStyle = "#4a7c59"
          ctx.beginPath()
          ctx.arc(treeX, treeY, treeSize, 0, 2 * Math.PI)
          ctx.fill()
        }
      }
      break
  }
}

// Draw grid overlay
const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number, cellSize = 20) => {
  ctx.strokeStyle = "rgba(255, 255, 255, 0.3)"
  ctx.lineWidth = 0.5
  ctx.setLineDash([2, 2])

  // Vertical lines
  for (let x = 0; x <= width; x += cellSize) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }

  // Horizontal lines
  for (let y = 0; y <= height; y += cellSize) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }

  ctx.setLineDash([])
}

// Fire visualization component - FIXED VERSION with null checks
const FireVisualization: React.FC<{
  ignitionPoints: any[]
  fireCells: any[]
  isRunning: boolean
  mapWidth: number
  mapHeight: number
  onPointClick: (x: number, y: number) => void
}> = ({ ignitionPoints, fireCells, isRunning, mapWidth, mapHeight, onPointClick }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const lastFrameTime = useRef<number>(0)

  const animate = useCallback(
    (currentTime: number) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // Throttle animation to 30 FPS
      if (currentTime - lastFrameTime.current < 33) {
        if (isRunning) {
          animationRef.current = requestAnimationFrame(animate)
        }
        return
      }
      lastFrameTime.current = currentTime

      // Clear canvas but preserve burned areas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Check if fireCells exists and is an array before filtering
      if (Array.isArray(fireCells) && fireCells.length > 0) {
        // Draw burned areas first (as background)
        fireCells
          .filter((cell) => cell && cell.state === "burned")
          .forEach((cell) => {
            const x = (cell.x + 1) * (canvas.width / 2)
            const y = (1 - cell.y) * (canvas.height / 2)
            
            // Burned area effect
            ctx.beginPath()
            ctx.arc(x, y, 15 + (cell.burnTime || 0) * 0.2, 0, 2 * Math.PI)
            ctx.fillStyle = `rgba(139, 69, 19, ${0.3 + 0.2 * Math.sin(currentTime * 0.001)})`
            ctx.fill()
          })

        // Draw active fire cells
        fireCells
          .filter((cell) => cell && cell.state === "burning")
          .forEach((cell) => {
            const x = (cell.x + 1) * (canvas.width / 2)
            const y = (1 - cell.y) * (canvas.height / 2)
            
            // Enhanced fire visualization
            const intensityFactor = (cell.intensity || 100) / 200
            const time = currentTime * 0.003

            // Fire core (brightest part)
            ctx.beginPath()
            ctx.arc(x, y, 10 + intensityFactor * 20, 0, 2 * Math.PI)
            ctx.fillStyle = `hsla(20, 100%, 50%, ${0.8 * intensityFactor})`
            ctx.fill()

            // Fire middle layer
            ctx.beginPath()
            ctx.arc(x, y - 5, 15 + intensityFactor * 25, 0, 2 * Math.PI)
            ctx.fillStyle = `hsla(40, 100%, 60%, ${0.6 * intensityFactor})`
            ctx.fill()

            // Fire outer layer
            ctx.beginPath()
            ctx.arc(x, y - 10, 20 + intensityFactor * 30, 0, 2 * Math.PI)
            ctx.fillStyle = `hsla(60, 100%, 50%, ${0.4 * intensityFactor})`
            ctx.fill()

            // Smoke effect
            ctx.beginPath()
            ctx.arc(x, y - 15 - intensityFactor * 10, 10 + intensityFactor * 15, 0, 2 * Math.PI)
            ctx.fillStyle = `rgba(50, 50, 50, ${0.2 * intensityFactor})`
            ctx.fill()
          })
      }

      // Draw ignition points on top - with null check
      if (Array.isArray(ignitionPoints)) {
        ignitionPoints.forEach((point, index) => {
          if (point && typeof point.lng === 'number' && typeof point.lat === 'number') {
            const x = (point.lng + 1) * (canvas.width / 2)
            const y = (1 - point.lat) * (canvas.height / 2)

            // Ignition point marker
            ctx.beginPath()
            ctx.arc(x, y, 12, 0, 2 * Math.PI)
            ctx.fillStyle = isRunning ? "#ff4444" : "#ff8800"
            ctx.fill()
            ctx.strokeStyle = "#ffffff"
            ctx.lineWidth = 3
            ctx.stroke()

            // Point number
            ctx.fillStyle = "#ffffff"
            ctx.font = "bold 12px Arial"
            ctx.textAlign = "center"
            ctx.fillText((index + 1).toString(), x, y + 4)
          }
        })
      }

      if (isRunning) {
        animationRef.current = requestAnimationFrame(animate)
      }
    },
    [ignitionPoints, fireCells, isRunning],
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Set canvas size
    canvas.width = mapWidth
    canvas.height = mapHeight

    // Start animation
    if (isRunning) {
      animationRef.current = requestAnimationFrame(animate)
    } else {
      // Draw static state
      animate(performance.now())
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [mapWidth, mapHeight, isRunning, animate])

  // Handle canvas clicks
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    onPointClick(x, y)
  }

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 cursor-crosshair z-10"
      onClick={handleCanvasClick}
      style={{ width: mapWidth, height: mapHeight }}
    />
  )
}

// Enhanced terrain component
const TerrainLayer: React.FC<{
  vegetationType: VegetationType
  width: number
  height: number
}> = ({ vegetationType, width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawn, setIsDrawn] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || width === 0 || height === 0) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = width
    canvas.height = height

    setIsDrawn(false)

    const drawTerrain = () => {
      try {
        // Draw realistic terrain
        drawRealisticTerrain(ctx, vegetationType, width, height)

        // Draw grid overlay
        drawGrid(ctx, width, height, 25)

        console.log(`Realistic terrain drawn: ${vegetationType} ${width}x${height}`)
        setIsDrawn(true)
      } catch (error) {
        console.error("Terrain drawing error:", error)
        setIsDrawn(true) // Set to true even on error to prevent infinite loading
      }
    }

    // Draw immediately, no delay
    drawTerrain()
  }, [vegetationType, width, height])

  // Always render the canvas, show loading overlay if not drawn
  return (
    <div className="relative w-full h-full" style={{ width, height }}>
      <canvas ref={canvasRef} className="w-full h-full rounded-lg" style={{ width, height }} />

      {!isDrawn && (
        <div className="absolute inset-0 w-full h-full rounded-lg bg-gray-200 flex items-center justify-center z-5">
          <div className="text-gray-600 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full mx-auto mb-2"></div>
            <div>Generando {vegetationType}...</div>
          </div>
        </div>
      )}
    </div>
  )
}

// Main map component
const StaticMapComponent: React.FC<MapVisualizationProps> = ({ className }) => {
  const { state, parameters, addIgnitionPoint, removeIgnitionPoint } = useSimulation()
  const [mapDimensions, setMapDimensions] = useState({ width: 0, height: 0 })
  const mapRef = useRef<HTMLDivElement>(null)

  // Update map dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (mapRef.current) {
        const { width, height } = mapRef.current.getBoundingClientRect()
        if (width > 0 && height > 0) {
          setMapDimensions((prev) => {
            if (Math.abs(prev.width - width) > 5 || Math.abs(prev.height - height) > 5) {
              console.log(`Map dimensions updated: ${width}x${height}`)
              return { width, height }
            }
            return prev
          })
        }
      }
    }

    const timer = setTimeout(updateDimensions, 100)
    return () => clearTimeout(timer)
  }, [])

  // Handle point placement/removal
  const handlePointClick = useCallback(
    (x: number, y: number) => {
      if (state.isRunning) return

      // Convert canvas coordinates to normalized coordinates (-1 to 1)
      const lng = (x / mapDimensions.width) * 2 - 1
      const lat = 1 - (y / mapDimensions.height) * 2

      // Check if clicking near an existing ignition point - with null checks
      const existingPoint = Array.isArray(state.ignitionPoints) 
        ? state.ignitionPoints.find(
            (point: any) => point && 
              typeof point.lat === 'number' && 
              typeof point.lng === 'number' &&
              Math.abs(point.lat - lat) < 0.1 && 
              Math.abs(point.lng - lng) < 0.1,
          )
        : null

      if (existingPoint) {
        removeIgnitionPoint(existingPoint.id)
      } else {
        addIgnitionPoint({ lat, lng })
      }
    },
    [state.isRunning, state.ignitionPoints, mapDimensions, addIgnitionPoint, removeIgnitionPoint],
  )

  // Show loading only if dimensions are not established
  if (mapDimensions.width === 0 || mapDimensions.height === 0) {
    return (
      <div className={`relative ${className}`} ref={mapRef}>
        <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="animate-pulse space-y-4">
              <div className="w-16 h-16 bg-green-300 rounded-full mx-auto"></div>
              <div className="space-y-2">
                <div className="h-4 bg-green-300 rounded w-32 mx-auto"></div>
                <div className="h-3 bg-green-200 rounded w-24 mx-auto"></div>
              </div>
            </div>
            <p className="text-gray-600 mt-4">Inicializando simulador...</p>
          </div>
        </div>
      </div>
    )
  }

  // Always render the map once dimensions are available
  return (
    <div className={`relative ${className}`} ref={mapRef}>
      {/* Terrain background */}
      <TerrainLayer
        vegetationType={parameters.vegetationType}
        width={mapDimensions.width}
        height={mapDimensions.height}
      />

      {/* Fire visualization overlay */}
      <FireVisualization
        ignitionPoints={Array.isArray(state.ignitionPoints) ? state.ignitionPoints : []}
        fireCells={Array.isArray(state.fireCells) ? state.fireCells : []}
        isRunning={state.isRunning}
        mapWidth={mapDimensions.width}
        mapHeight={mapDimensions.height}
        onPointClick={handlePointClick}
      />

      {/* Map info overlay */}
      <div className="absolute top-4 left-4 bg-white bg-opacity-95 p-3 rounded-lg shadow-lg z-20 backdrop-blur-sm">
        <div className="text-sm text-gray-700 space-y-1">
          <div className="font-semibold text-gray-900">Parámetros Actuales:</div>
          <div>
            <span className="font-medium">Tipo:</span> {parameters.vegetationType}
          </div>
          <div>
            <span className="font-medium">Viento:</span> {parameters.windSpeed} m/s, {parameters.windDirection}°
          </div>
          <div>
            <span className="font-medium">Humedad:</span> {parameters.humidity}%
          </div>
          <div>
            <span className="font-medium">Pendiente:</span> {parameters.slope}°
          </div>
        </div>
      </div>

      {/* Instructions overlay */}
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-80 text-white p-3 rounded-lg text-sm z-20 backdrop-blur-sm">
        <div className="space-y-1">
          <div className="font-semibold text-yellow-300">Instrucciones:</div>
          <div>• Haz clic para agregar puntos de ignición</div>
          <div>• Haz clic en un punto existente para eliminarlo</div>
          <div>
            • <span className="text-green-300">Puntos activos: {Array.isArray(state.ignitionPoints) ? state.ignitionPoints.length : 0}</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute top-4 right-4 bg-white bg-opacity-95 p-3 rounded-lg shadow-lg z-20 backdrop-blur-sm">
        <div className="text-sm text-gray-700 space-y-2">
          <div className="font-semibold text-gray-900">Leyenda:</div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
            <span>Punto de ignición</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <span>Fuego activo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-600 rounded-full"></div>
            <span>Humo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border border-white opacity-60"></div>
            <span>Cuadrícula (25m)</span>
          </div>
        </div>
      </div>

      {/* Debug info */}
      <div className="absolute bottom-4 right-4 bg-black bg-opacity-80 text-white p-2 rounded text-xs z-20 backdrop-blur-sm">
        <div className="space-y-1">
          <div>Terreno: {parameters.vegetationType}</div>
          <div>
            Dimensiones: {mapDimensions.width}x{mapDimensions.height}
          </div>
          <div
            className={`font-semibold ${state.isRunning ? "text-red-400" : state.isPaused ? "text-yellow-400" : "text-green-400"}`}
          >
            {state.isRunning ? "SIMULANDO" : state.isPaused ? "PAUSADO" : "DETENIDO"}
          </div>
          <div>
            Fire Cells: {Array.isArray(state.fireCells) ? state.fireCells.length : 0}
          </div>
        </div>
      </div>
    </div>
  )
}

export const MapVisualization: React.FC<MapVisualizationProps> = ({ className }) => {
  return <StaticMapComponent className={className} />
}