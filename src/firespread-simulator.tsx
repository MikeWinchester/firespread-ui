"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Pause, Square, FileText } from "lucide-react"

export default function Component() {
  const [humidity, setHumidity] = useState([65])
  const [temperature, setTemperature] = useState([35])
  const [windSpeed, setWindSpeed] = useState([45])
  const [windDirection, setWindDirection] = useState("270")
  const [vegetationType, setVegetationType] = useState("bosque")
  const [isPlaying, setIsPlaying] = useState(false)

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleStop = () => {
    setIsPlaying(false)
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Sidebar */}
      <div className="w-80 bg-white border-r border-gray-300">
        <div className="p-4 border-b border-gray-300">
          <h2 className="text-sm font-medium text-gray-600">Section 1</h2>
        </div>

        <Card className="m-4 border-gray-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-400 rounded-sm flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-sm"></div>
              </div>
              Opciones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Humidity */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Humedad</Label>
              <div className="space-y-2">
                <Slider value={humidity} onValueChange={setHumidity} max={100} min={0} step={1} className="w-full" />
                <div className="text-right text-sm text-gray-600">{humidity[0]}%</div>
              </div>
            </div>

            {/* Temperature */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Temperatura</Label>
              <div className="space-y-2">
                <Slider
                  value={temperature}
                  onValueChange={setTemperature}
                  max={50}
                  min={0}
                  step={1}
                  className="w-full"
                />
                <div className="text-right text-sm text-gray-600">{temperature[0]}°C</div>
              </div>
            </div>

            {/* Wind Speed */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Velocidad del Viento</Label>
              <div className="space-y-2">
                <Slider value={windSpeed} onValueChange={setWindSpeed} max={100} min={0} step={1} className="w-full" />
                <div className="text-right text-sm text-gray-600">{windSpeed[0]}m/s</div>
              </div>
            </div>

            {/* Wind Direction */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Direccion del Viento</Label>
              <Select value={windDirection} onValueChange={setWindDirection}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0° (Norte)</SelectItem>
                  <SelectItem value="90">90° (Este)</SelectItem>
                  <SelectItem value="180">180° (Sur)</SelectItem>
                  <SelectItem value="270">270° (Oeste)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Vegetation Type */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Tipo de Vegetacion</Label>
              <Select value={vegetationType} onValueChange={setVegetationType}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bosque">Bosque</SelectItem>
                  <SelectItem value="pastizal">Pastizal</SelectItem>
                  <SelectItem value="matorral">Matorral</SelectItem>
                  <SelectItem value="agricola">Agrícola</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-300 p-4">
          <h1 className="text-xl font-bold text-center">FIRESPREAD : SIMULADOR</h1>
        </div>

        {/* Map Area */}
        <div className="flex-1 p-4 bg-gray-50">
          <div className="h-full bg-white border border-gray-300 rounded-lg overflow-hidden relative">
            <img
              src="/map-argentina.png"
              alt="Fire spread simulation map of Argentina"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Control Buttons */}
        <div className="bg-white border-t border-gray-300 p-4">
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePlayPause}
              className="flex items-center gap-2 bg-transparent"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? "Pausar" : "Iniciar"}
            </Button>

            <Button variant="outline" size="sm" onClick={handleStop} className="flex items-center gap-2 bg-transparent">
              <Square className="w-4 h-4" />
              Detener
            </Button>

            <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
              <FileText className="w-4 h-4" />
              Ver Reporte
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
