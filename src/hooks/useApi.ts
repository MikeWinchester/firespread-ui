"use client"

import { useState, useCallback } from "react"
import { apiService, type ApiResponse } from "@/services/api"

export interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useApi<T>() {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const execute = useCallback(async (apiCall: () => Promise<ApiResponse<T>>): Promise<T | null> => {
    setState({ data: null, loading: true, error: null })

    try {
      const response = await apiCall()

      if (response.success && response.data) {
        setState({ data: response.data, loading: false, error: null })
        return response.data
      } else {
        setState({ data: null, loading: false, error: response.error || "Unknown error" })
        return null
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      setState({ data: null, loading: false, error: errorMessage })
      return null
    }
  }, [])

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null })
  }, [])

  return {
    ...state,
    execute,
    reset,
  }
}

// Specific hooks for common operations
export function useSimulationApi() {
  const { execute, ...state } = useApi<any>()

  const createSimulation = useCallback(
    (request: Parameters<typeof apiService.createSimulation>[0]) => execute(() => apiService.createSimulation(request)),
    [execute],
  )

  const startSimulation = useCallback(
    (simulationId: string) => execute(() => apiService.startSimulation(simulationId)),
    [execute],
  )

  const pauseSimulation = useCallback(
    (simulationId: string) => execute(() => apiService.pauseSimulation(simulationId)),
    [execute],
  )

  const stopSimulation = useCallback(
    (simulationId: string) => execute(() => apiService.stopSimulation(simulationId)),
    [execute],
  )

  const getSimulationStatus = useCallback(
    (simulationId: string) => execute(() => apiService.getSimulationStatus(simulationId)),
    [execute],
  )

  return {
    ...state,
    createSimulation,
    startSimulation,
    pauseSimulation,
    stopSimulation,
    getSimulationStatus,
  }
}

export function useScenariosApi() {
  const { execute, ...state } = useApi<any>()

  const getScenarios = useCallback(() => execute(() => apiService.getScenarios()), [execute])

  const getScenario = useCallback((scenarioId: string) => execute(() => apiService.getScenario(scenarioId)), [execute])

  const createScenario = useCallback(
    (scenario: Parameters<typeof apiService.createScenario>[0]) => execute(() => apiService.createScenario(scenario)),
    [execute],
  )

  const updateScenario = useCallback(
    (scenarioId: string, scenario: Parameters<typeof apiService.updateScenario>[1]) =>
      execute(() => apiService.updateScenario(scenarioId, scenario)),
    [execute],
  )

  const deleteScenario = useCallback(
    (scenarioId: string) => execute(() => apiService.deleteScenario(scenarioId)),
    [execute],
  )

  return {
    ...state,
    getScenarios,
    getScenario,
    createScenario,
    updateScenario,
    deleteScenario,
  }
}
