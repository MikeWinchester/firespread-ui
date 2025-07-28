# FireSpread Simulator

Simulador interactivo de propagación de incendios forestales con backend integration.

## 🚀 Características

### Frontend
- **Mapas específicos**: Terrenos dibujados para cada tipo de vegetación
- **Simulación en tiempo real**: Visualización de propagación de fuego
- **Backend ready**: Completamente preparado para conectar con API
- **WebSocket support**: Actualizaciones en tiempo real
- **Gestión de escenarios**: Guardar y cargar configuraciones

### Backend Integration
- **API REST**: Endpoints completos para simulaciones y escenarios
- **WebSocket**: Conexión en tiempo real para updates
- **Fallback local**: Funciona sin backend como respaldo
- **Error handling**: Manejo robusto de errores de conexión

## 🛠️ Configuración

### Variables de Entorno
\`\`\`bash
cp .env.example .env.local
\`\`\`

Configura las siguientes variables:
- `NEXT_PUBLIC_API_URL`: URL del backend API
- `NEXT_PUBLIC_API_KEY`: Clave de API (opcional)

### Instalación
\`\`\`bash
npm install
npm run dev
\`\`\`

## 📡 API Endpoints

### Simulaciones
- `POST /api/simulations` - Crear simulación
- `POST /api/simulations/{id}/start` - Iniciar simulación
- `POST /api/simulations/{id}/pause` - Pausar simulación
- `POST /api/simulations/{id}/stop` - Detener simulación
- `GET /api/simulations/{id}` - Estado de simulación
- `DELETE /api/simulations/{id}` - Eliminar simulación

### Escenarios
- `GET /api/scenarios` - Listar escenarios
- `POST /api/scenarios` - Crear escenario
- `GET /api/scenarios/{id}` - Obtener escenario
- `PUT /api/scenarios/{id}` - Actualizar escenario
- `DELETE /api/scenarios/{id}` - Eliminar escenario

### WebSocket
- `WS /ws/simulations/{id}` - Updates en tiempo real

## 🎨 Tipos de Terreno

1. **Bosque**: Árboles densos con claros
2. **Pastizal**: Hierba con arbustos dispersos
3. **Matorral**: Vegetación baja con rocas
4. **Agrícola**: Cultivos en filas con edificios
5. **Urbano**: Edificios con calles y parques

## 🔧 Estructura del Proyecto

\`\`\`
├── components/
│   ├── MapVisualization.tsx    # Mapa con terrenos dibujados
│   ├── ParameterPanel.tsx      # Panel de configuración
│   ├── SimulationControls.tsx  # Controles de simulación
│   └── ConnectionStatus.tsx    # Estado de conexión
├── contexts/
│   └── SimulationContext.tsx   # Estado global con backend
├── services/
│   └── api.ts                  # Cliente API completo
├── hooks/
│   └── useApi.ts              # Hooks para API calls
└── types/
    └── simulation.ts          # Tipos TypeScript
\`\`\`

## 🌐 Backend Requirements

El backend debe implementar:
- REST API con los endpoints listados
- WebSocket para updates en tiempo real
- Base de datos para escenarios
- Algoritmo de simulación de fuego

Ejemplo de respuesta de simulación:
\`\`\`json
{
  "simulationId": "sim_123",
  "status": "running",
  "currentTime": 45,
  "fireCells": [
    {
      "x": -0.5,
      "y": 0.3,
      "intensity": 85,
      "temperature": 650,
      "burnTime": 30,
      "state": "burning"
    }
  ]
}
