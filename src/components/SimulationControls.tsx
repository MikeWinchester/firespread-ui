"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Play, Pause, Square, RotateCcw, FileText, Save } from "lucide-react"
import { useSimulation } from "@/contexts/SimulationContext"
import { ConnectionStatus } from "@/components/ConnectionStatus"

export const SimulationControls: React.FC = () => {
  const { state, startSimulation, pauseSimulation, stopSimulation, resetSimulation, saveScenario } = useSimulation()

  const handlePlayPause = async () => {
    if (state.isRunning) {
      await pauseSimulation()
    } else {
      await startSimulation()
    }
  }

  const handleStop = async () => {
    await stopSimulation()
  }

  const handleReset = () => {
    resetSimulation()
  }

  const handleSaveScenario = async () => {
    const name = prompt("Nombre del escenario:")
    const description = prompt("Descripción del escenario:")

    if (name && description) {
      await saveScenario(name, description)
    }
  }

  const canStart = state.ignitionPoints.length > 0 && !state.isRunning
  const canPause = state.isRunning
  const canStop = state.isRunning || state.isPaused
  const canReset = !state.isRunning

  return (
    <div className="bg-white border-t border-gray-300 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePlayPause}
            disabled={!canStart && !canPause}
            className="flex items-center gap-2 bg-transparent min-w-[100px]"
          >
            {state.isRunning ? (
              <>
                <Pause className="w-4 h-4" />
                Pausar
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                {state.isPaused ? "Reanudar" : "Iniciar"}
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleStop}
            disabled={!canStop}
            className="flex items-center gap-2 bg-transparent"
          >
            <Square className="w-4 h-4" />
            Detener
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={!canReset}
            className="flex items-center gap-2 bg-transparent"
          >
            <RotateCcw className="w-4 h-4" />
            Reiniciar
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveScenario}
            disabled={state.ignitionPoints.length === 0}
            className="flex items-center gap-2 bg-transparent"
          >
            <Save className="w-4 h-4" />
            Guardar
          </Button>

          <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
            <FileText className="w-4 h-4" />
            Ver Reporte
          </Button>
        </div>

        <ConnectionStatus />
      </div>

      {/* Simulation Status */}
      <div className="flex items-center justify-center text-sm text-gray-600">
        <div className="flex items-center gap-4">
          <span>Estado: {state.isRunning ? "Ejecutándose" : state.isPaused ? "Pausado" : "Detenido"}</span>
          {state.currentTime > 0 && (
            <span>
              Tiempo: {Math.floor(state.currentTime / 60)}:{(state.currentTime % 60).toString().padStart(2, "0")}
            </span>
          )}
          <span>Focos: {state.ignitionPoints.length}</span>
        </div>
      </div>
    </div>
  )
}
