"use client"

import type React from "react"
import { useSimulation } from "@/contexts/SimulationContext"
import { Wifi, WifiOff, Server, AlertCircle, Loader2, CheckCircle, XCircle } from "lucide-react"

export const ConnectionStatus: React.FC = () => {
  const { isConnected, currentSimulationId, connectionStatus, checkBackendConnection } = useSimulation()

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case "checking":
        return <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />
      case "connected":
        return <CheckCircle className="w-3 h-3 text-green-500" />
      case "disconnected":
        return <WifiOff className="w-3 h-3 text-yellow-500" />
      case "error":
        return <XCircle className="w-3 h-3 text-red-500" />
      default:
        return <AlertCircle className="w-3 h-3 text-gray-500" />
    }
  }

  const getStatusText = () => {
    switch (connectionStatus) {
      case "checking":
        return "Verificando..."
      case "connected":
        return "Backend conectado"
      case "disconnected":
        return "Backend desconectado"
      case "error":
        return "Error de conexión"
      default:
        return "Estado desconocido"
    }
  }

  const getStatusColor = () => {
    switch (connectionStatus) {
      case "checking":
        return "text-blue-600"
      case "connected":
        return "text-green-600"
      case "disconnected":
        return "text-yellow-600"
      case "error":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <div className="flex items-center gap-4 text-xs">
      {/* Backend Status */}
      <div className="flex items-center gap-1">
        {getStatusIcon()}
        <span className={getStatusColor()}>{getStatusText()}</span>
      </div>

      {/* WebSocket Status */}
      <div className="flex items-center gap-1">
        {isConnected ? (
          <>
            <Wifi className="w-3 h-3 text-green-500" />
            <span className="text-green-600">WebSocket activo</span>
          </>
        ) : (
          <>
            <WifiOff className="w-3 h-3 text-gray-500" />
            <span className="text-gray-600">WebSocket inactivo</span>
          </>
        )}
      </div>

      {/* Simulation ID */}
      {currentSimulationId && (
        <div className="flex items-center gap-1">
          <Server className="w-3 h-3 text-blue-500" />
          <span className="text-blue-600">ID: {currentSimulationId.slice(0, 8)}...</span>
        </div>
      )}

      {/* Mode Indicator */}
      <div className="flex items-center gap-1">
        <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-orange-500"}`}></div>
        <span className={isConnected ? "text-green-600" : "text-orange-600"}>
          {isConnected ? "Modo Backend" : "Modo Local"}
        </span>
      </div>

      {/* Manual reconnect button */}
      {connectionStatus === "error" || connectionStatus === "disconnected" ? (
        <button
          onClick={checkBackendConnection}
          className="text-blue-600 hover:text-blue-800 underline"
          title="Reintentar conexión"
        >
          Reconectar
        </button>
      ) : null}
    </div>
  )
}
