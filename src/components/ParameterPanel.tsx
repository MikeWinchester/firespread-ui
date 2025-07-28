"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSimulation } from "@/contexts/SimulationContext"
import type { VegetationType } from "@/types/simulation"

const vegetationOptions: { value: VegetationType; label: string }[] = [
  { value: "forest", label: "Bosque" },
  { value: "grassland", label: "Pastizal" },
  { value: "shrubland", label: "Matorral" },
  { value: "agricultural", label: "Agrícola" },
  { value: "urban", label: "Urbano" },
]

const windDirectionOptions = [
  { value: 0, label: "0° (Norte)" },
  { value: 90, label: "90° (Este)" },
  { value: 180, label: "180° (Sur)" },
  { value: 270, label: "270° (Oeste)" },
]

export const ParameterPanel: React.FC = () => {
  const { parameters, updateParameters, state } = useSimulation()

  const handleVegetationChange = (value: VegetationType) => {
    updateParameters({ vegetationType: value })
  }

  const handleWindDirectionChange = (value: string) => {
    updateParameters({ windDirection: Number.parseInt(value) })
  }

  return (
    <div className="w-80 bg-white border-r border-gray-300 h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-300">
        <h2 className="text-sm font-medium text-gray-600">Panel de Control</h2>
      </div>

      <Card className="m-4 border-gray-300">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-400 rounded-sm flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-sm"></div>
            </div>
            Parámetros de Simulación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Vegetation Type */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Tipo de Vegetación</Label>
            <Select value={parameters.vegetationType} onValueChange={handleVegetationChange} disabled={state.isRunning}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {vegetationOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Wind Speed */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Velocidad del Viento</Label>
            <div className="space-y-3">
              <Slider
                value={[parameters.windSpeed]}
                onValueChange={(value) => updateParameters({ windSpeed: value[0] })}
                max={100}
                min={0}
                step={1}
                className="w-full"
                disabled={state.isRunning}
              />
              <div className="text-right text-sm text-gray-600">{parameters.windSpeed} m/s</div>
            </div>
          </div>

          {/* Wind Direction */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Dirección del Viento</Label>
            <Select
              value={parameters.windDirection.toString()}
              onValueChange={handleWindDirectionChange}
              disabled={state.isRunning}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {windDirectionOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Humidity */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Humedad</Label>
            <div className="space-y-3">
              <Slider
                value={[parameters.humidity]}
                onValueChange={(value) => updateParameters({ humidity: value[0] })}
                max={100}
                min={0}
                step={1}
                className="w-full"
                disabled={state.isRunning}
              />
              <div className="text-right text-sm text-gray-600">{parameters.humidity}%</div>
            </div>
          </div>

          {/* Slope */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Pendiente</Label>
            <div className="space-y-3">
              <Slider
                value={[parameters.slope]}
                onValueChange={(value) => updateParameters({ slope: value[0] })}
                max={45}
                min={0}
                step={1}
                className="w-full"
                disabled={state.isRunning}
              />
              <div className="text-right text-sm text-gray-600">{parameters.slope}°</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ignition Points Info */}
      <Card className="m-4 border-gray-300">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Puntos de Ignición</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600">Puntos activos: {state.ignitionPoints.length}</div>
          <div className="text-xs text-gray-500 mt-1">Haz clic en el mapa para agregar puntos</div>
        </CardContent>
      </Card>
    </div>
  )
}
