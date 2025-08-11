"use client"

import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from "react"
import type { SimulationParameters, SimulationState, IgnitionPoint, FireCell } from "@/types/simulation"
import { apiService, type SimulationResponse } from "@/services/api"
import type { VegetationType } from "@/types/simulation"

interface SimulationContextType {
  state: SimulationState
  parameters: SimulationParameters
  currentSimulationId: string | null
  isConnected: boolean
  connectionStatus: "checking" | "connected" | "disconnected" | "error"
  updateParameters: (params: Partial<SimulationParameters>) => void
  addIgnitionPoint: (point: Omit<IgnitionPoint, "id" | "timestamp">) => void
  removeIgnitionPoint: (id: string) => void
  startSimulation: () => Promise<void>
  pauseSimulation: () => Promise<void>
  stopSimulation: () => Promise<void>
  resetSimulation: () => void
  loadScenario: (scenarioId: string) => Promise<void>
  saveScenario: (name: string, description: string) => Promise<void>
  checkBackendConnection: () => Promise<boolean>
}

type SimulationAction =
  | { type: "UPDATE_PARAMETERS"; payload: Partial<SimulationParameters> }
  | { type: "ADD_IGNITION_POINT"; payload: IgnitionPoint }
  | { type: "REMOVE_IGNITION_POINT"; payload: string }
  | { type: "START_SIMULATION" }
  | { type: "PAUSE_SIMULATION" }
  | { type: "STOP_SIMULATION" }
  | { type: "RESET_SIMULATION" }
  | { type: "UPDATE_FIRE_CELLS"; payload: FireCell[] }
  | { type: "UPDATE_TIME"; payload: number }
  | { type: "SET_SIMULATION_ID"; payload: string | null }
  | { type: "SET_CONNECTION_STATUS"; payload: boolean }
  | { type: "UPDATE_FROM_BACKEND"; payload: SimulationResponse }

const initialParameters: SimulationParameters = {
  vegetationType: "forest",
  windSpeed: 45,
  windDirection: 270,
  humidity: 65,
  slope: 15,
}

const initialState: SimulationState = {
  isRunning: false,
  isPaused: false,
  currentTime: 0,
  fireCells: [],
  ignitionPoints: [],
}

const simulationReducer = (state: SimulationState, action: SimulationAction): SimulationState => {
  switch (action.type) {
    case "ADD_IGNITION_POINT":
      return {
        ...state,
        ignitionPoints: [...state.ignitionPoints, action.payload],
      }
    case "REMOVE_IGNITION_POINT":
      return {
        ...state,
        ignitionPoints: state.ignitionPoints.filter((point) => point.id !== action.payload),
      }
    case "START_SIMULATION":
      return {
        ...state,
        isRunning: true,
        isPaused: false,
      }
    case "PAUSE_SIMULATION":
      return {
        ...state,
        isRunning: false,
        isPaused: true,
      }
    case "STOP_SIMULATION":
      return {
        ...state,
        isRunning: false,
        isPaused: false,
      }
    case "RESET_SIMULATION":
      return {
        ...initialState,
        ignitionPoints: state.ignitionPoints,
      }
    case "UPDATE_FIRE_CELLS":
      return {
        ...state,
        fireCells: action.payload,
      }
    case "UPDATE_TIME":
      return {
        ...state,
        currentTime: action.payload,
      }
    case "UPDATE_FROM_BACKEND":
      return {
        ...state,
        isRunning: action.payload.status === "running",
        isPaused: action.payload.status === "paused",
        currentTime: action.payload.currentTime,
        fireCells: action.payload.fireCells,
      }
    default:
      return state
  }
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined)

export const useSimulation = () => {
  const context = useContext(SimulationContext)
  if (!context) {
    throw new Error("useSimulation must be used within a SimulationProvider")
  }
  return context
}

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(simulationReducer, initialState)
  const [parameters, setParameters] = React.useState<SimulationParameters>(initialParameters)
  const [currentSimulationId, setCurrentSimulationId] = React.useState<string | null>(null)
  const [isConnected, setIsConnected] = React.useState(false)
  const [connectionStatus, setConnectionStatus] = React.useState<"checking" | "connected" | "disconnected" | "error">(
    "checking",
  )
  const fallbackIntervalRef = useRef<NodeJS.Timeout>(undefined)
  const isSimulationRunning = useRef(false)
  const wsReconnectAttempts = useRef(0)
  const maxReconnectAttempts = 3

  const updateParameters = useCallback((params: Partial<SimulationParameters>) => {
    setParameters((prev) => ({ ...prev, ...params }))
  }, [])

  const addIgnitionPoint = useCallback((point: Omit<IgnitionPoint, "id" | "timestamp">) => {
    const newPoint: IgnitionPoint = {
      ...point,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
    }
    dispatch({ type: "ADD_IGNITION_POINT", payload: newPoint })
  }, [])

  const removeIgnitionPoint = useCallback((id: string) => {
    dispatch({ type: "REMOVE_IGNITION_POINT", payload: id })
  }, [])

  // Check backend connection
  const checkBackendConnection = useCallback(async (): Promise<boolean> => {
    console.log("🔍 Checking backend connection...")
    setConnectionStatus("checking")

    try {
      const response = await apiService.healthCheck()

      if (response.success) {
        console.log("✅ Backend connected successfully")
        setIsConnected(true)
        setConnectionStatus("connected")
        return true
      } else {
        console.log("❌ Backend health check failed:", response.error)
        setIsConnected(false)
        setConnectionStatus("error")
        return false
      }
    } catch (error) {
      console.log("❌ Backend connection error:", error)
      setIsConnected(false)
      setConnectionStatus("disconnected")
      return false
    }
  }, [])

  // Enhanced fallback simulation
  const startFallbackSimulation = useCallback(() => {
    if (isSimulationRunning.current || state.ignitionPoints.length === 0) return

    isSimulationRunning.current = true
    console.log("🔥 Starting LOCAL fallback simulation")

    fallbackIntervalRef.current = setInterval(() => {
      // Enhanced fire spread simulation
      const newFireCells: FireCell[] = state.ignitionPoints.map((point, index) => {
        const windEffect = Math.cos((parameters.windDirection * Math.PI) / 180) * parameters.windSpeed * 0.0001
        const windEffectY = Math.sin((parameters.windDirection * Math.PI) / 180) * parameters.windSpeed * 0.0001
        const humidityEffect = (100 - parameters.humidity) / 100
        const slopeEffect = parameters.slope * 0.001
        const timeEffect = state.currentTime * 0.01

        // More realistic fire spread
        const spreadRadius = 0.02 + timeEffect * 0.005
        const intensity = Math.max(10, 100 * humidityEffect * (1 - timeEffect * 0.02))

        return {
          x: point.lng + Math.sin(timeEffect + index) * spreadRadius + windEffect,
          y: point.lat + Math.cos(timeEffect + index) * spreadRadius + windEffectY + slopeEffect,
          intensity: Math.max(0, intensity + (Math.random() - 0.5) * 20),
          temperature: 200 + intensity * 6 + Math.random() * 100,
          burnTime: state.currentTime,
          state: "burning" as const,
        }
      })

      dispatch({ type: "UPDATE_FIRE_CELLS", payload: newFireCells })
      dispatch({ type: "UPDATE_TIME", payload: state.currentTime + 1 })
    }, 1000) // 1 second intervals
  }, [state.ignitionPoints, state.currentTime, parameters])

  const stopFallbackSimulation = useCallback(() => {
    if (fallbackIntervalRef.current) {
      clearInterval(fallbackIntervalRef.current)
      fallbackIntervalRef.current = undefined
    }
    isSimulationRunning.current = false
    console.log("⏹️ Stopped fallback simulation")
  }, [])

  // WebSocket connection with retry logic
  const connectWebSocket = useCallback(
    (simulationId: string) => {
      console.log("🔌 Attempting WebSocket connection...")

      apiService.connectWebSocket(
        simulationId,
        (data) => {
          console.log("📡 Received WebSocket data:", data)
          dispatch({ type: "UPDATE_FROM_BACKEND", payload: data })
          wsReconnectAttempts.current = 0 // Reset on successful message
        },
        (error) => {
          console.error("❌ WebSocket error:", error)
          wsReconnectAttempts.current++

          if (wsReconnectAttempts.current < maxReconnectAttempts) {
            console.log(`🔄 Retrying WebSocket connection (${wsReconnectAttempts.current}/${maxReconnectAttempts})...`)
            setTimeout(() => connectWebSocket(simulationId), 2000)
          } else {
            console.log("❌ Max WebSocket reconnection attempts reached, falling back to local simulation")
            setIsConnected(false)
            setConnectionStatus("error")
            startFallbackSimulation()
          }
        },
        (event) => {
          console.log("🔌 WebSocket closed:", event.code, event.reason)
          setIsConnected(false)

          if (event.code !== 1000) {
            // Not a normal closure
            setConnectionStatus("error")
            if (wsReconnectAttempts.current < maxReconnectAttempts) {
              setTimeout(() => connectWebSocket(simulationId), 2000)
            } else {
              startFallbackSimulation()
            }
          }
        },
      )
    },
    [startFallbackSimulation],
  )

  // Backend integration functions
  const startSimulation = useCallback(async () => {
    console.log("🚀 Starting simulation...")

    // First, ensure we have a backend connection
    const backendAvailable = await checkBackendConnection()

    if (backendAvailable) {
      try {
        console.log("🌐 Attempting to use BACKEND simulation")

        // Create simulation if we don't have one
        if (!currentSimulationId) {
          console.log("📝 Creating new simulation on backend...")
          const response = await apiService.createSimulation({
            parameters: {
              vegetationType: parameters.vegetationType,
              windSpeed: parameters.windSpeed,
              windDirection: parameters.windDirection,
              humidity: parameters.humidity,
              slope: parameters.slope,
            },
            ignitionPoints: state.ignitionPoints,
          })

          if (response.success && response.data) {
            console.log("✅ Simulation created:", response.data.simulationId)
            setCurrentSimulationId(response.data.simulationId)
            connectWebSocket(response.data.simulationId)
          } else {
            throw new Error(response.error || "Failed to create simulation")
          }
        }

        // Start the simulation
        if (currentSimulationId) {
          console.log("▶️ Starting backend simulation...")
          const response = await apiService.startSimulation(currentSimulationId)

          if (response.success) {
            console.log("✅ Backend simulation started successfully")
            dispatch({ type: "START_SIMULATION" })
            return
          } else {
            throw new Error(response.error || "Failed to start simulation")
          }
        }
      } catch (error) {
        console.error("❌ Backend simulation failed:", error)
        setIsConnected(false)
        setConnectionStatus("error")
      }
    }

    // Fallback to local simulation
    console.log("🏠 Using LOCAL simulation (backend unavailable)")
    dispatch({ type: "START_SIMULATION" })
    startFallbackSimulation()
  }, [
    currentSimulationId,
    parameters,
    state.ignitionPoints,
    checkBackendConnection,
    connectWebSocket,
    startFallbackSimulation,
  ])

  const pauseSimulation = useCallback(async () => {
    console.log("⏸️ Pausing simulation...")

    if (currentSimulationId && isConnected) {
      try {
        console.log("🌐 Pausing BACKEND simulation")
        const response = await apiService.pauseSimulation(currentSimulationId)

        if (response.success) {
          console.log("✅ Backend simulation paused")
          dispatch({ type: "PAUSE_SIMULATION" })
          return
        } else {
          throw new Error(response.error || "Failed to pause simulation")
        }
      } catch (error) {
        console.error("❌ Failed to pause backend simulation:", error)
        setIsConnected(false)
        setConnectionStatus("error")
      }
    }

    // Fallback to local pause
    console.log("🏠 Pausing LOCAL simulation")
    dispatch({ type: "PAUSE_SIMULATION" })
    stopFallbackSimulation()
  }, [currentSimulationId, isConnected, stopFallbackSimulation])

  const stopSimulation = useCallback(async () => {
    console.log("⏹️ Stopping simulation...")

    if (currentSimulationId && isConnected) {
      try {
        console.log("🌐 Stopping BACKEND simulation")
        const response = await apiService.stopSimulation(currentSimulationId)

        if (response.success) {
          console.log("✅ Backend simulation stopped")
        }

        // Disconnect WebSocket
        apiService.disconnectWebSocket()
        setCurrentSimulationId(null)
      } catch (error) {
        console.error("❌ Failed to stop backend simulation:", error)
      }
    }

    // Always stop local simulation
    console.log("🏠 Stopping LOCAL simulation")
    dispatch({ type: "STOP_SIMULATION" })
    stopFallbackSimulation()
    setIsConnected(false)
    setConnectionStatus("disconnected")
  }, [currentSimulationId, isConnected, stopFallbackSimulation])

  const resetSimulation = useCallback(() => {
    console.log("🔄 Resetting simulation...")
    stopFallbackSimulation()

    if (currentSimulationId) {
      apiService.disconnectWebSocket()
      setCurrentSimulationId(null)
    }

    setIsConnected(false)
    setConnectionStatus("disconnected")
    dispatch({ type: "RESET_SIMULATION" })
  }, [currentSimulationId, stopFallbackSimulation])

  const loadScenario = useCallback(
    async (scenarioId: string) => {
      console.log("📂 Loading scenario:", scenarioId)

      const backendAvailable = await checkBackendConnection()

      if (!backendAvailable) {
        console.log("❌ Cannot load scenario: backend not available")
        return
      }

      try {
        const response = await apiService.getScenario(scenarioId)

        if (response.success && response.data) {
          console.log("✅ Scenario loaded successfully")
          const scenarioParameters: SimulationParameters = {
            vegetationType: response.data.parameters.vegetationType as VegetationType,
            windSpeed: response.data.parameters.windSpeed,
            windDirection: response.data.parameters.windDirection,
            humidity: response.data.parameters.humidity,
            slope: response.data.parameters.slope,
          }

          setParameters(scenarioParameters)
          dispatch({ type: "RESET_SIMULATION" })
          response.data.ignitionPoints.forEach((point) => {
            dispatch({ type: "ADD_IGNITION_POINT", payload: point })
          })
        } else {
          throw new Error(response.error || "Failed to load scenario")
        }
      } catch (error) {
        console.error("❌ Error loading scenario:", error)
      }
    },
    [checkBackendConnection],
  )

  const saveScenario = useCallback(
    async (name: string, description: string) => {
      console.log("💾 Saving scenario:", name)

      const backendAvailable = await checkBackendConnection()

      if (!backendAvailable) {
        console.log("❌ Cannot save scenario: backend not available")
        alert("No se puede guardar el escenario: backend no disponible")
        return
      }

      try {
        const response = await apiService.createScenario({
          name,
          description,
          parameters: {
            vegetationType: parameters.vegetationType,
            windSpeed: parameters.windSpeed,
            windDirection: parameters.windDirection,
            humidity: parameters.humidity,
            slope: parameters.slope,
          },
          ignitionPoints: state.ignitionPoints,
        })

        if (response.success) {
          console.log("✅ Scenario saved successfully")
          alert("Escenario guardado exitosamente")
        } else {
          throw new Error(response.error || "Failed to save scenario")
        }
      } catch (error) {
        console.error("❌ Error saving scenario:", error)
        alert("Error al guardar el escenario")
      }
    },
    [parameters, state.ignitionPoints, checkBackendConnection],
  )

  // Check backend connection on mount
  useEffect(() => {
    console.log("🔄 Initializing backend connection check...")
    checkBackendConnection()
  }, [checkBackendConnection])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log("🧹 Cleaning up simulation context...")
      stopFallbackSimulation()
      apiService.disconnectWebSocket()
    }
  }, [stopFallbackSimulation])

  // Stop simulation when component unmounts or state changes
  useEffect(() => {
    if (!state.isRunning) {
      stopFallbackSimulation()
    }
  }, [state.isRunning, stopFallbackSimulation])

  const value: SimulationContextType = {
    state,
    parameters,
    currentSimulationId,
    isConnected,
    connectionStatus,
    updateParameters,
    addIgnitionPoint,
    removeIgnitionPoint,
    startSimulation,
    pauseSimulation,
    stopSimulation,
    resetSimulation,
    loadScenario,
    saveScenario,
    checkBackendConnection,
  }

  return <SimulationContext.Provider value={value}>{children}</SimulationContext.Provider>
}
