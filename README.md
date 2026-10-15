# 🏆 Americana Pádel Pro — Gestor Oficial de Torneos

Aplicación web profesional e independiente dedicada en exclusiva a la organización, sorteo y gestión en tiempo real de **Americanas de Pádel** (torneos rotativos tipo round-robin con cambio continuo de parejas y pistas).

Diseñada con una estética atlética de alto contraste en **amarillo neón (#facc15)** y **negro azabache (#000000)**.

---

## ✨ Características Principales

- 🏟️ **Soporte de 2 a 6 pistas simultáneas**:
  - Selector rápido con configuraciones predefinidas: 2 pistas (8 jugadores), 3 pistas (12 jugadores), 4 pistas (16 jugadores), **5 pistas (20 jugadores)** y 6 pistas (24 jugadores).
  - Posibilidad de desactivar o reactivar cualquier pista de forma individual según disponibilidad.
- 🎯 **Algoritmo de Rotación Inteligente por Posición**:
  - Clasificación de jugadores por posición natural: **Revés**, **Derecha** o **Polivalente / Ambos**.
  - Emparejamientos óptimos: combina 1 jugador de Revés con 1 de Derecha en cada lado de la red.
  - Sorteo de pistas completamente aleatorio y equitativo.
  - Mínima repetición de parejas a lo largo de las rondas.
  - Gestión automática y justa de turnos de descanso cuando hay más jugadores que plazas en pista.
- ⏱️ **Cronómetro y Temporizador de Partidos**:
  - Presets de tiempo rápido: 8, 10, 12, 15 y 20 minutos por ronda.
  - Barra de progreso visual con cambio de color en el último minuto.
- 🔊 **Bocina y Alarma Sonora Móvil (Web Audio API)**:
  - Generador de audio sintetizado con overdrive (bocina de estadio / horn multi-oscilador a 140Hz - 280Hz).
  - Silbato de árbitro y avisos de cuenta regresiva (3-2-1).
  - Vibración táctil continua y prevención de bloqueo de pantalla (Screen Wake Lock).
- 📊 **Marcador y Clasificación en Vivo**:
  - Introducción rápida de puntos/juegos por pista tras cada ronda.
  - Tabla de posiciones acumulada con estadísticas individuales (partidos jugados, ganados, diferencia de juegos y efectividad).
  - Compartición con un clic del cuadro de partidos de cada ronda para WhatsApp o portapapeles.
- 💾 **Persistencia Automática**:
  - Todo el torneo y sus rondas se guardan en el navegador (`localStorage`), permitiendo reanudar la americana ante cualquier recarga o cierre accidental.

---

## 🛠️ Tecnologías

- **Framework**: Next.js 16 (App Router) + React 19
- **Estilos**: Tailwind CSS v4 con paleta Yellow & Black
- **Iconografía**: Lucide React
- **Audio Engine**: Web Audio API nativo (sin dependencias externas de ficheros de audio)
- **Deployment**: Vercel & GitHub

---

## 🚀 Despliegue Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.
