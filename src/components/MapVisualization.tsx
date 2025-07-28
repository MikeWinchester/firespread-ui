"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { useSimulation } from "@/contexts/SimulationContext"
import type { VegetationType } from "@/types/simulation"

interface MapVisualizationProps {
  className?: string
}

// Draw specific terrain features for each vegetation type
const drawTerrainFeatures = (
  ctx: CanvasRenderingContext2D,
  vegetationType: VegetationType,
  width: number,
  height: number,
) => {
  ctx.clearRect(0, 0, width, height)

  switch (vegetationType) {
    case "forest":
      // Forest background
      ctx.fillStyle = "#1a4d1a"
      ctx.fillRect(0, 0, width, height)

      // Draw trees
      for (let i = 0; i < 150; i++) {
        const x = Math.random() * width
        const y = Math.random() * height
        const size = 8 + Math.random() * 12

        // Tree trunk
        ctx.fillStyle = "#4a2c2a"
        ctx.fillRect(x - 2, y, 4, size)

        // Tree crown
        ctx.fillStyle = `hsl(${120 + Math.random() * 20}, ${60 + Math.random() * 20}%, ${25 + Math.random() * 15}%)`
        ctx.beginPath()
        ctx.arc(x, y - size / 2, size * 0.8, 0, 2 * Math.PI)
        ctx.fill()
      }

      // Add some clearings
      for (let i = 0; i < 5; i++) {
        const x = Math.random() * width
        const y = Math.random() * height
        const radius = 30 + Math.random() * 40

        ctx.fillStyle = "#2d5a2d"
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, 2 * Math.PI)
        ctx.fill()
      }
      break

    case "grassland":
      // Grassland background
      ctx.fillStyle = "#4a7c59"
      ctx.fillRect(0, 0, width, height)

      // Draw grass patches
      for (let i = 0; i < 200; i++) {
        const x = Math.random() * width
        const y = Math.random() * height
        const length = 5 + Math.random() * 10

        ctx.strokeStyle = `hsl(${90 + Math.random() * 30}, ${50 + Math.random() * 30}%, ${40 + Math.random() * 20}%)`
        ctx.lineWidth = 1 + Math.random()
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x + (Math.random() - 0.5) * 4, y - length)
        ctx.stroke()
      }

      // Add some bushes
      for (let i = 0; i < 20; i++) {
        const x = Math.random() * width
        const y = Math.random() * height
        const size = 8 + Math.random() * 15

        ctx.fillStyle = `hsl(${100 + Math.random() * 20}, ${40 + Math.random() * 20}%, ${30 + Math.random() * 15}%)`
        ctx.beginPath()
        ctx.arc(x, y, size, 0, 2 * Math.PI)
        ctx.fill()
      }
      break

    case "shrubland":
      // Shrubland background
      ctx.fillStyle = "#6b4423"
      ctx.fillRect(0, 0, width, height)

      // Draw shrubs and bushes
      for (let i = 0; i < 100; i++) {
        const x = Math.random() * width
        const y = Math.random() * height
        const size = 6 + Math.random() * 20

        ctx.fillStyle = `hsl(${30 + Math.random() * 40}, ${40 + Math.random() * 30}%, ${25 + Math.random() * 20}%)`

        // Irregular shrub shape
        ctx.beginPath()
        for (let angle = 0; angle < Math.PI * 2; angle += 0.5) {
          const radius = size * (0.7 + Math.random() * 0.6)
          const px = x + Math.cos(angle) * radius
          const py = y + Math.sin(angle) * radius
          if (angle === 0) ctx.moveTo(px, py)
          else ctx.lineTo(px, py)
        }
        ctx.closePath()
        ctx.fill()
      }

      // Add rocky areas
      for (let i = 0; i < 15; i++) {
        const x = Math.random() * width
        const y = Math.random() * height
        const size = 10 + Math.random() * 25

        ctx.fillStyle = `hsl(${20 + Math.random() * 20}, ${20 + Math.random() * 20}%, ${40 + Math.random() * 20}%)`
        ctx.beginPath()
        ctx.arc(x, y, size, 0, 2 * Math.PI)
        ctx.fill()
      }
      break

    case "agricultural":
      // Agricultural background
      ctx.fillStyle = "#8b7355"
      ctx.fillRect(0, 0, width, height)

      // Draw crop rows
      const rowSpacing = 25
      for (let y = 0; y < height; y += rowSpacing) {
        ctx.strokeStyle = "#9d8b5a"
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()

        // Add crops along rows
        for (let x = 10; x < width; x += 15) {
          ctx.fillStyle = `hsl(${60 + Math.random() * 20}, ${50 + Math.random() * 20}%, ${45 + Math.random() * 15}%)`
          ctx.fillRect(x - 2, y - 3, 4, 6)
        }
      }

      // Add farm buildings
      for (let i = 0; i < 3; i++) {
        const x = Math.random() * (width - 60) + 30
        const y = Math.random() * (height - 40) + 20

        // Building
        ctx.fillStyle = "#8b4513"
        ctx.fillRect(x, y, 40, 30)

        // Roof
        ctx.fillStyle = "#654321"
        ctx.beginPath()
        ctx.moveTo(x - 5, y)
        ctx.lineTo(x + 20, y - 15)
        ctx.lineTo(x + 45, y)
        ctx.closePath()
        ctx.fill()
      }
      break

    case "urban":
      // Urban background
      ctx.fillStyle = "#4a4a4a"
      ctx.fillRect(0, 0, width, height)

      // Draw city blocks
      const blockSize = 80
      for (let x = 0; x < width; x += blockSize) {
        for (let y = 0; y < height; y += blockSize) {
          // Building
          const buildingWidth = 60 + Math.random() * 15
          const buildingHeight = 40 + Math.random() * 30

          ctx.fillStyle = `hsl(0, 0%, ${30 + Math.random() * 30}%)`
          ctx.fillRect(x + 5, y + 5, buildingWidth, buildingHeight)

          // Windows
          ctx.fillStyle = Math.random() > 0.3 ? "#ffff99" : "#333"
          for (let wx = x + 10; wx < x + buildingWidth; wx += 8) {
            for (let wy = y + 10; wy < y + buildingHeight; wy += 8) {
              ctx.fillRect(wx, wy, 4, 4)
            }
          }
        }
      }

      // Add roads
      ctx.fillStyle = "#2a2a2a"
      // Horizontal roads
      for (let y = blockSize - 10; y < height; y += blockSize) {
        ctx.fillRect(0, y, width, 10)
      }
      // Vertical roads
      for (let x = blockSize - 10; x < width; x += blockSize) {
        ctx.fillRect(x, 0, 10, height)
      }

      // Add some parks
      for (let i = 0; i < 2; i++) {
        const x = Math.random() * (width - 60) + 30
        const y = Math.random() * (height - 60) + 30

        ctx.fillStyle = "#2d5a2d"
        ctx.fillRect(x, y, 50, 50)

        // Trees in park
        for (let j = 0; j < 5; j++) {
          const tx = x + Math.random() * 40 + 5
          const ty = y + Math.random() * 40 + 5

          ctx.fillStyle = "#4a7c59"
          ctx.beginPath()
          ctx.arc(tx, ty, 6, 0, 2 * Math.PI)
          ctx.fill()
        }
      }
      break
  }
}

// Fire visualization component using Canvas
const FireVisualization: React.FC<{
  ignitionPoints: any[]
  fireCells: any[]
  isRunning: boolean
  mapWidth: number
  mapHeight: number
  onPointClick: (x: number, y: number) => void
}> = ({ ignitionPoints, fireCells, isRunning, mapWidth, mapHeight, onPointClick }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = mapWidth
    canvas.height = mapHeight

    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw ignition points
      ignitionPoints.forEach((point, index) => {
        // Convert normalized coordinates to canvas coordinates
        const x = (point.lng + 1) * (canvas.width / 2)
        const y = (1 - point.lat) * (canvas.height / 2)

        // Draw ignition point
        ctx.beginPath()
        ctx.arc(x, y, 12, 0, 2 * Math.PI)
        ctx.fillStyle = isRunning ? "#ff4444" : "#ff8800"
        ctx.fill()
        ctx.strokeStyle = "#ffffff"
        ctx.lineWidth = 3
        ctx.stroke()

        // Add point number
        ctx.fillStyle = "#ffffff"
        ctx.font = "bold 12px Arial"
        ctx.textAlign = "center"
        ctx.fillText((index + 1).toString(), x, y + 4)

        // Draw fire spread if simulation is running
        if (isRunning && fireCells.length > 0) {
          const fireCell = fireCells[index]
          if (fireCell) {
            const fireRadius = 25 + (fireCell.intensity / 100) * 40
            const time = Date.now() * 0.005

            // Create animated fire effect
            for (let i = 0; i < 5; i++) {
              const radius = fireRadius * (0.6 + i * 0.1)
              const alpha = (fireCell.intensity / 300) * (1 - i * 0.15) * (0.7 + 0.3 * Math.sin(time + i))
              const hue = 0 + i * 10 // Red to orange gradient

              ctx.beginPath()
              ctx.arc(x, y, radius, 0, 2 * Math.PI)
              ctx.fillStyle = `hsla(${hue}, 100%, 50%, ${alpha})`
              ctx.fill()
            }

            // Add smoke effect
            ctx.beginPath()
            ctx.arc(x, y - 10, fireRadius * 0.8, 0, 2 * Math.PI)
            ctx.fillStyle = `rgba(64, 64, 64, ${fireCell.intensity / 500})`
            ctx.fill()
          }
        }
      })

      if (isRunning) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [ignitionPoints, fireCells, isRunning, mapWidth, mapHeight])

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

// Loading component
const MapLoading: React.FC = () => (
  <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
    <div className="text-center">
      <div className="animate-pulse space-y-4">
        <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-300 rounded w-32 mx-auto"></div>
          <div className="h-3 bg-gray-200 rounded w-24 mx-auto"></div>
        </div>
      </div>
      <p className="text-gray-600 mt-4">Generando terreno...</p>
    </div>
  </div>
)

// Main map component
const StaticMapComponent: React.FC<MapVisualizationProps> = ({ className }) => {
  const { state, parameters, addIgnitionPoint, removeIgnitionPoint } = useSimulation()
  const [isLoaded, setIsLoaded] = useState(false)
  const [mapDimensions, setMapDimensions] = useState({ width: 800, height: 600 })
  const mapRef = useRef<HTMLDivElement>(null)
  const terrainCanvasRef = useRef<HTMLCanvasElement>(null)

  // Draw terrain when vegetation type changes
  useEffect(() => {
    setIsLoaded(false)
    const timer = setTimeout(() => {
      if (terrainCanvasRef.current) {
        const ctx = terrainCanvasRef.current.getContext("2d")
        if (ctx) {
          terrainCanvasRef.current.width = mapDimensions.width
          terrainCanvasRef.current.height = mapDimensions.height
          drawTerrainFeatures(ctx, parameters.vegetationType, mapDimensions.width, mapDimensions.height)
        }
      }
      setIsLoaded(true)
    }, 800)
    return () => clearTimeout(timer)
  }, [parameters.vegetationType, mapDimensions])

  // Update map dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (mapRef.current) {
        const { width, height } = mapRef.current.getBoundingClientRect()
        setMapDimensions({ width, height })
      }
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [])

  // Handle point placement/removal
  const handlePointClick = (x: number, y: number) => {
    if (state.isRunning) return

    // Convert canvas coordinates to normalized coordinates (-1 to 1)
    const lng = (x / mapDimensions.width) * 2 - 1
    const lat = 1 - (y / mapDimensions.height) * 2

    // Check if clicking near an existing ignition point
    const existingPoint = state.ignitionPoints.find(
      (point: any) => Math.abs(point.lat - lat) < 0.1 && Math.abs(point.lng - lng) < 0.1,
    )

    if (existingPoint) {
      removeIgnitionPoint(existingPoint.id)
    } else {
      addIgnitionPoint({ lat, lng })
    }
  }

  if (!isLoaded) {
    return <MapLoading />
  }

  return (
    <div className={`relative ${className}`} ref={mapRef}>
      {/* Terrain canvas background */}
      <canvas
        ref={terrainCanvasRef}
        className="w-full h-full rounded-lg"
        style={{ width: mapDimensions.width, height: mapDimensions.height }}
      />

      {/* Fire visualization overlay */}
      <FireVisualization
        ignitionPoints={state.ignitionPoints}
        fireCells={state.fireCells}
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
            • <span className="text-green-300">Puntos activos: {state.ignitionPoints.length}</span>
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
        </div>
      </div>

      {/* Simulation status */}
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
        </div>
      </div>
    </div>
  )
}

export const MapVisualization: React.FC<MapVisualizationProps> = ({ className }) => {
  return <StaticMapComponent className={className} />
}
