"use client"

import type React from "react"
import { useSimulation } from "@/contexts/SimulationContext"
import { Wifi, WifiOff, Server, AlertCircle } from "lucide-react"

export const ConnectionStatus: React.FC = () => {
  const { isConnected, currentSimulationId } = useSimulation()

  return (
    <div className="flex items-center gap-2 text-xs">
      <div className="flex items-center gap-1">
        {isConnected ? (
          <>
            <Wifi className="w-3 h-3 text-green-500" />
            <span className="text-green-600">Conectado</span>
          </>
        ) : (
          <>
            <WifiOff className="w-3 h-3 text-red-500" />
            <span className="text-red-600">Desconectado</span>
          </>
        )}
      </div>

      {currentSimulationId && (
        <div className="flex items-center gap-1">
          <Server className="w-3 h-3 text-blue-500" />
          <span className="text-blue-600">ID: {currentSimulationId.slice(0, 8)}...</span>
        </div>
      )}

      {!isConnected && (
        <div className="flex items-center gap-1">
          <AlertCircle className="w-3 h-3 text-yellow-500" />
          <span className="text-yellow-600">Modo local</span>
        </div>
      )}
    </div>
  )
}
