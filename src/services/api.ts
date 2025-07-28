// API service for backend communication

import type { VegetationType } from "@/types/simulation"

export interface ApiConfig {
  baseUrl: string
  apiKey?: string
  timeout?: number
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface SimulationRequest {
  parameters: {
    vegetationType: VegetationType // Changed from string to VegetationType
    windSpeed: number
    windDirection: number
    humidity: number
    slope: number
  }
  ignitionPoints: Array<{
    id: string
    lat: number
    lng: number
    timestamp: number
  }>
  simulationId?: string
}

export interface SimulationResponse {
  simulationId: string
  status: "created" | "running" | "paused" | "completed" | "error"
  currentTime: number
  fireCells: Array<{
    x: number
    y: number
    intensity: number
    temperature: number
    burnTime: number
    state: "unburned" | "burning" | "burned"
  }>
  metadata?: {
    totalArea: number
    burnedArea: number
    estimatedDuration: number
  }
}

export interface ScenarioData {
  id: string
  name: string
  description: string
  parameters: SimulationRequest["parameters"]
  ignitionPoints: SimulationRequest["ignitionPoints"]
  createdAt: string
  updatedAt: string
}

class ApiService {
  private config: ApiConfig
  private wsConnection: WebSocket | null = null

  constructor(config: ApiConfig) {
    this.config = {
      timeout: 10000,
      ...config,
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.config.baseUrl}${endpoint}`

    const defaultHeaders: HeadersInit = {
      "Content-Type": "application/json",
    }

    if (this.config.apiKey) {
      defaultHeaders["Authorization"] = `Bearer ${this.config.apiKey}`
    }

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
        }
      }

      return {
        success: true,
        data,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }
    }
  }

  // Simulation endpoints
  async createSimulation(request: SimulationRequest): Promise<ApiResponse<SimulationResponse>> {
    return this.request<SimulationResponse>("/api/simulations", {
      method: "POST",
      body: JSON.stringify(request),
    })
  }

  async startSimulation(simulationId: string): Promise<ApiResponse<SimulationResponse>> {
    return this.request<SimulationResponse>(`/api/simulations/${simulationId}/start`, {
      method: "POST",
    })
  }

  async pauseSimulation(simulationId: string): Promise<ApiResponse<SimulationResponse>> {
    return this.request<SimulationResponse>(`/api/simulations/${simulationId}/pause`, {
      method: "POST",
    })
  }

  async stopSimulation(simulationId: string): Promise<ApiResponse<SimulationResponse>> {
    return this.request<SimulationResponse>(`/api/simulations/${simulationId}/stop`, {
      method: "POST",
    })
  }

  async getSimulationStatus(simulationId: string): Promise<ApiResponse<SimulationResponse>> {
    return this.request<SimulationResponse>(`/api/simulations/${simulationId}`)
  }

  async deleteSimulation(simulationId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/simulations/${simulationId}`, {
      method: "DELETE",
    })
  }

  // Scenario endpoints
  async getScenarios(): Promise<ApiResponse<ScenarioData[]>> {
    return this.request<ScenarioData[]>("/api/scenarios")
  }

  async getScenario(scenarioId: string): Promise<ApiResponse<ScenarioData>> {
    return this.request<ScenarioData>(`/api/scenarios/${scenarioId}`)
  }

  async createScenario(
    scenario: Omit<ScenarioData, "id" | "createdAt" | "updatedAt">,
  ): Promise<ApiResponse<ScenarioData>> {
    return this.request<ScenarioData>("/api/scenarios", {
      method: "POST",
      body: JSON.stringify(scenario),
    })
  }

  async updateScenario(scenarioId: string, scenario: Partial<ScenarioData>): Promise<ApiResponse<ScenarioData>> {
    return this.request<ScenarioData>(`/api/scenarios/${scenarioId}`, {
      method: "PUT",
      body: JSON.stringify(scenario),
    })
  }

  async deleteScenario(scenarioId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/scenarios/${scenarioId}`, {
      method: "DELETE",
    })
  }

  // WebSocket connection for real-time updates
  connectWebSocket(
    simulationId: string,
    onMessage: (data: SimulationResponse) => void,
    onError?: (error: Event) => void,
    onClose?: (event: CloseEvent) => void,
  ): void {
    const wsUrl = this.config.baseUrl.replace("http", "ws") + `/ws/simulations/${simulationId}`

    this.wsConnection = new WebSocket(wsUrl)

    this.wsConnection.onopen = () => {
      console.log("WebSocket connected for simulation:", simulationId)
    }

    this.wsConnection.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as SimulationResponse
        onMessage(data)
      } catch (error) {
        console.error("Error parsing WebSocket message:", error)
      }
    }

    this.wsConnection.onerror = (error) => {
      console.error("WebSocket error:", error)
      if (onError) onError(error)
    }

    this.wsConnection.onclose = (event) => {
      console.log("WebSocket closed:", event.code, event.reason)
      if (onClose) onClose(event)
    }
  }

  disconnectWebSocket(): void {
    if (this.wsConnection) {
      this.wsConnection.close()
      this.wsConnection = null
    }
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.request<{ status: string; timestamp: string }>("/api/health")
  }
}

// Create API service instance
const apiConfig: ApiConfig = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  timeout: 15000,
}

export const apiService = new ApiService(apiConfig)
