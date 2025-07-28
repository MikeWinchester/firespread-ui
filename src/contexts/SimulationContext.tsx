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
  updateParameters: (params: Partial<SimulationParameters>) => void
  addIgnitionPoint: (point: Omit<IgnitionPoint, "id" | "timestamp">) => void
  removeIgnitionPoint: (id: string) => void
  startSimulation: () => Promise<void>
  pauseSimulation: () => Promise<void>
  stopSimulation: () => Promise<void>
  resetSimulation: () => void
  loadScenario: (scenarioId: string) => Promise<void>
  saveScenario: (name: string, description: string) => Promise<void>
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
  const fallbackIntervalRef = useRef<NodeJS.Timeout>(null)

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

  // Backend integration functions
  const startSimulation = useCallback(async () => {
    try {
      if (!currentSimulationId) {
        // Create new simulation
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
          setCurrentSimulationId(response.data.simulationId)

          // Connect WebSocket for real-time updates
          apiService.connectWebSocket(
            response.data.simulationId,
            (data) => {
              dispatch({ type: "UPDATE_FROM_BACKEND", payload: data })
            },
            (error) => {
              console.error("WebSocket error:", error)
              setIsConnected(false)
            },
            () => {
              setIsConnected(false)
            },
          )
          setIsConnected(true)
        }
      }

      if (currentSimulationId) {
        const response = await apiService.startSimulation(currentSimulationId)
        if (response.success) {
          dispatch({ type: "START_SIMULATION" })
        }
      }
    } catch (error) {
      console.error("Error starting simulation:", error)
      // Fallback to local simulation
      dispatch({ type: "START_SIMULATION" })
    }
  }, [currentSimulationId, parameters, state.ignitionPoints])

  const pauseSimulation = useCallback(async () => {
    try {
      if (currentSimulationId) {
        const response = await apiService.pauseSimulation(currentSimulationId)
        if (response.success) {
          dispatch({ type: "PAUSE_SIMULATION" })
        }
      }
    } catch (error) {
      console.error("Error pausing simulation:", error)
      // Fallback to local pause
      dispatch({ type: "PAUSE_SIMULATION" })
    }
  }, [currentSimulationId])

  const stopSimulation = useCallback(async () => {
    try {
      if (currentSimulationId) {
        const response = await apiService.stopSimulation(currentSimulationId)
        if (response.success) {
          dispatch({ type: "STOP_SIMULATION" })
        }

        // Disconnect WebSocket
        apiService.disconnectWebSocket()
        setIsConnected(false)
        setCurrentSimulationId(null)
      }
    } catch (error) {
      console.error("Error stopping simulation:", error)
      // Fallback to local stop
      dispatch({ type: "STOP_SIMULATION" })
    }
  }, [currentSimulationId])

  const resetSimulation = useCallback(() => {
    if (currentSimulationId) {
      apiService.disconnectWebSocket()
      setIsConnected(false)
      setCurrentSimulationId(null)
    }
    dispatch({ type: "RESET_SIMULATION" })
  }, [currentSimulationId])

  const loadScenario = useCallback(async (scenarioId: string) => {
    try {
      const response = await apiService.getScenario(scenarioId)
      if (response.success && response.data) {
        // Ensure vegetationType is properly typed
        const scenarioParameters: SimulationParameters = {
          vegetationType: response.data.parameters.vegetationType as VegetationType,
          windSpeed: response.data.parameters.windSpeed,
          windDirection: response.data.parameters.windDirection,
          humidity: response.data.parameters.humidity,
          slope: response.data.parameters.slope,
        }

        setParameters(scenarioParameters)
        // Clear existing points and add scenario points
        dispatch({ type: "RESET_SIMULATION" })
        response.data.ignitionPoints.forEach((point) => {
          dispatch({ type: "ADD_IGNITION_POINT", payload: point })
        })
      }
    } catch (error) {
      console.error("Error loading scenario:", error)
    }
  }, [])

  const saveScenario = useCallback(
    async (name: string, description: string) => {
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
          console.log("Scenario saved successfully")
        }
      } catch (error) {
        console.error("Error saving scenario:", error)
      }
    },
    [parameters, state.ignitionPoints],
  )

  // Fallback simulation when backend is not available
  useEffect(() => {
    if (state.isRunning && !isConnected && state.ignitionPoints.length > 0) {
      fallbackIntervalRef.current = setInterval(() => {
        // Enhanced fire spread simulation
        const newFireCells: FireCell[] = state.ignitionPoints.map((point, index) => {
          const windEffect = parameters.windDirection * 0.001
          const humidityEffect = (100 - parameters.humidity) / 100
          const slopeEffect = parameters.slope * 0.01
          const windSpeedEffect = parameters.windSpeed * 0.001

          return {
            x: point.lng + (Math.random() - 0.5) * 0.02 * humidityEffect + windEffect,
            y: point.lat + (Math.random() - 0.5) * 0.02 * humidityEffect + slopeEffect,
            intensity: Math.min(100, Math.random() * 100 * humidityEffect * (1 + windSpeedEffect)),
            temperature: 200 + Math.random() * 800 * humidityEffect,
            burnTime: state.currentTime,
            state: "burning" as const,
          }
        })

        dispatch({ type: "UPDATE_FIRE_CELLS", payload: newFireCells })
        dispatch({ type: "UPDATE_TIME", payload: state.currentTime + 1 })
      }, 1000)
    }

    return () => {
      if (fallbackIntervalRef.current) {
        clearInterval(fallbackIntervalRef.current)
      }
    }
  }, [state.isRunning, isConnected, state.ignitionPoints, state.currentTime, parameters])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      apiService.disconnectWebSocket()
      if (fallbackIntervalRef.current) {
        clearInterval(fallbackIntervalRef.current)
      }
    }
  }, [])

  const value: SimulationContextType = {
    state,
    parameters,
    currentSimulationId,
    isConnected,
    updateParameters,
    addIgnitionPoint,
    removeIgnitionPoint,
    startSimulation,
    pauseSimulation,
    stopSimulation,
    resetSimulation,
    loadScenario,
    saveScenario,
  }

  return <SimulationContext.Provider value={value}>{children}</SimulationContext.Provider>
}
