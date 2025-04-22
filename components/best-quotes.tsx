"use client"

import { useState, useEffect } from "react"
import { RefreshCw, TrendingDown, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface DolarRate {
  entidad: string
  compra: number
  venta: number
  spread: number
  time: number
}

// Mapeo de nombres de bancos para mostrar nombres más amigables
const BANK_NAMES: Record<string, string> = {
  plus: "Plus Cambio",
  bna: "Banco Nación",
  santander: "Santander",
  galicia: "Galicia",
  bbva: "BBVA",
  patagonia: "Patagonia",
  macro: "Macro",
  bapro: "Provincia",
  ciudad: "Ciudad",
  brubank: "Brubank",
  supervielle: "Supervielle",
}

export default function BestQuotes() {
  const [rates, setRates] = useState<DolarRate[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const fetchRates = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/bank-rates")

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Error al obtener cotizaciones")
      }

      const data = await response.json()

      // Verificar si recibimos un mensaje de error
      if (data.message) {
        throw new Error(data.message)
      }

      setRates(data)
      setLastUpdated(new Date())
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "No se pudieron cargar las cotizaciones"
      setError(errorMessage)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRates()

    // Actualizar cada 5 minutos
    const interval = setInterval(
      () => {
        fetchRates()
      },
      5 * 60 * 1000,
    )

    return () => clearInterval(interval)
  }, [])

  if (loading && rates.length === 0) {
    return (
      <div className="grid grid-cols-2 gap-2">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-400 p-2 text-center border border-red-900/30 bg-red-900/10 rounded-lg text-xs">
        <p>{error}</p>
        <Button onClick={fetchRates} variant="outline" size="sm" className="mt-1 text-xs py-0 h-6">
          Reintentar
        </Button>
      </div>
    )
  }

  // Verificar que hay tasas válidas
  if (rates.length === 0) {
    return (
      <div className="text-yellow-400 p-2 text-center border border-yellow-900/30 bg-yellow-900/10 rounded-lg text-xs">
        <p>No hay cotizaciones disponibles en este momento</p>
        <Button onClick={fetchRates} variant="outline" size="sm" className="mt-1 text-xs py-0 h-6">
          Actualizar
        </Button>
      </div>
    )
  }

  // Encontrar la mejor cotización de compra (menor precio de compra - el usuario compra)
  const bestBuy = rates.reduce((prev, current) => (prev.compra < current.compra ? prev : current))

  // Encontrar la mejor cotización de venta (mayor precio de venta - el usuario vende)
  const bestSell = rates.reduce((prev, current) => (prev.venta > current.venta ? prev : current))

  // Calcular el arbitraje potencial entre la mejor compra y la mejor venta
  const potentialArbitrage = (bestSell.venta / bestBuy.compra - 1) * 100

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1">
          <Badge
            variant="outline"
            className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 flex items-center gap-1 text-xs py-0 px-1.5"
          >
            <TrendingUp className="h-2.5 w-2.5" />
            <span className="text-[10px]">
              Actualizado{" "}
              {lastUpdated.toLocaleTimeString("es-AR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </Badge>
        </div>
        <Button
          onClick={fetchRates}
          variant="outline"
          size="sm"
          className="bg-slate-800 hover:bg-slate-700 border-slate-700 h-6 px-2 text-xs"
          disabled={loading}
        >
          {loading ? <RefreshCw className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Card className="bg-slate-800/30 border-slate-700/30 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
          <CardContent className="p-2">
            <div className="flex flex-col">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-medium text-slate-300 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-emerald-400" />
                  <span>Mejor Compra</span>
                </h3>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] px-1 py-0">
                  {BANK_NAMES[bestBuy.entidad] || bestBuy.entidad}
                </Badge>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-slate-400">Compra Dólares</span>
                <span className="text-lg font-bold text-emerald-400">${bestBuy.compra.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/30 border-slate-700/30 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-red-500 to-orange-500"></div>
          <CardContent className="p-2">
            <div className="flex flex-col">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-medium text-slate-300 flex items-center gap-1">
                  <TrendingDown className="h-3 w-3 text-red-400" />
                  <span>Mejor Venta</span>
                </h3>
                <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-[10px] px-1 py-0">
                  {BANK_NAMES[bestSell.entidad] || bestSell.entidad}
                </Badge>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-slate-400">Venta Dólares</span>
                <span className="text-lg font-bold text-red-400">${bestSell.venta.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center bg-slate-800/50 rounded-md p-1.5 text-xs">
        <span className="text-slate-300">Arbitraje potencial:</span>
        <Badge
          className={`${
            potentialArbitrage > 0
              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
              : "bg-red-500/20 text-red-400 border-red-500/30"
          } text-[10px] px-1 py-0`}
        >
          {potentialArbitrage > 0 ? "+" : ""}
          {potentialArbitrage.toFixed(2)}%
        </Badge>
      </div>
    </div>
  )
}
