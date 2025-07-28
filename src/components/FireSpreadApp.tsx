"use client"

import type React from "react"
import { SimulationProvider } from "@/contexts/SimulationContext"
import { ParameterPanel } from "@/components/ParameterPanel"
import { MapVisualization }  from "@/components/MapVisualization"
import { SimulationControls } from "@/components/SimulationControls"

export const FireSpreadApp: React.FC = () => {
  return (
    <SimulationProvider>
      <div className="flex h-screen bg-gray-100">
        {/* Left Sidebar */}
        <ParameterPanel />

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-white border-b border-gray-300 p-4">
            <h1 className="text-xl font-bold text-center">FIRESPREAD</h1>
          </div>

          {/* Map Area */}
          <div className="flex-1 p-4 bg-gray-50">
            <MapVisualization className="h-full bg-white border border-gray-300 rounded-lg overflow-hidden" />
          </div>

          {/* Control Buttons */}
          <SimulationControls />
        </div>
      </div>
    </SimulationProvider>
  )
}
