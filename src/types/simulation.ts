export interface SimulationParameters {
  vegetationType: VegetationType
  windSpeed: number
  windDirection: number
  humidity: number
  slope: number
}

export interface IgnitionPoint {
  id: string
  lat: number
  lng: number
  timestamp: number
}

export interface FireCell {
  x: number
  y: number
  intensity: number
  temperature: number
  burnTime: number
  state: "unburned" | "burning" | "burned"
}

export interface SimulationState {
  isRunning: boolean
  isPaused: boolean
  currentTime: number
  fireCells: FireCell[]
  ignitionPoints: IgnitionPoint[]
}

export type VegetationType = "forest" | "grassland" | "shrubland" | "agricultural" | "urban"

export interface Scenario {
  id: string
  name: string
  description: string
  parameters: SimulationParameters
  ignitionPoints: IgnitionPoint[]
  createdAt: Date
}

// Add these interfaces for better API compatibility
export interface ApiSimulationParameters {
  vegetationType: VegetationType
  windSpeed: number
  windDirection: number
  humidity: number
  slope: number
}

export interface ApiIgnitionPoint {
  id: string
  lat: number
  lng: number
  timestamp: number
}
