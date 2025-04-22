"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, RefreshCw, TrendingDown, TrendingUp } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

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

export default function BankRates({ compact = false }: { compact?: boolean }) {
  const [rates, setRates] = useState<DolarRate[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [sortField, setSortField] = useState<"compra" | "venta" | "spread">("compra")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
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
    const interval = setInterval(fetchRates, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const handleSort = (field: "compra" | "venta" | "spread") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection(field === "compra" ? "asc" : field === "venta" ? "desc" : "asc")
    }
  }

  const sortedRates = [...rates].sort((a, b) => {
    const multiplier = sortDirection === "asc" ? 1 : -1

    if (sortField === "compra") {
      return (a.compra - b.compra) * multiplier
    } else if (sortField === "venta") {
      return (b.venta - a.venta) * multiplier
    } else {
      return (a.spread - b.spread) * multiplier
    }
  })

  // Mostrar solo las mejores opciones
  // Para comprar dólares: compra más baja
  const bestBuyRates = rates.length > 0 ? [...rates].sort((a, b) => a.compra - b.compra).slice(0, 3) : []
  // Para vender dólares: venta más alta
  const bestSellRates = rates.length > 0 ? [...rates].sort((a, b) => b.venta - a.venta).slice(0, 3) : []

  if (loading && rates.length === 0) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between">
            <Skeleton className="h-4 w-[120px]" />
            <div className="flex gap-2">
              <Skeleton className="h-4 w-[60px]" />
              <Skeleton className="h-4 w-[60px]" />
              <Skeleton className="h-4 w-[40px]" />
            </div>
          </div>
        ))}
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

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-medium text-slate-300">Mejores opciones para operar</h3>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <Card className="bg-slate-800/30 border-slate-700/30">
            <CardContent className="p-2">
              <h4 className="text-xs font-medium mb-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-emerald-400" />
                <span className="text-slate-300">Mejores para comprar</span>
              </h4>
              <div className="space-y-1">
                {bestBuyRates.map((rate, index) => (
                  <div key={index} className="flex justify-between items-center p-1 rounded-sm bg-slate-800/50 text-xs">
                    <span className="font-medium text-slate-300 truncate max-w-[120px]">
                      {BANK_NAMES[rate.entidad] || rate.entidad}
                    </span>
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] px-1 py-0">
                      ${rate.compra.toFixed(2)}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/30 border-slate-700/30">
            <CardContent className="p-2">
              <h4 className="text-xs font-medium mb-1 flex items-center gap-1">
                <TrendingDown className="h-3 w-3 text-red-400" />
                <span className="text-slate-300">Mejores para vender</span>
              </h4>
              <div className="space-y-1">
                {bestSellRates.map((rate, index) => (
                  <div key={index} className="flex justify-between items-center p-1 rounded-sm bg-slate-800/50 text-xs">
                    <span className="font-medium text-slate-300 truncate max-w-[120px]">
                      {BANK_NAMES[rate.entidad] || rate.entidad}
                    </span>
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-[10px] px-1 py-0">
                      ${rate.venta.toFixed(2)}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-1">
          <Badge
            variant="outline"
            className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 flex items-center gap-1 text-[10px] py-0 px-1.5"
          >
            <TrendingUp className="h-2.5 w-2.5" />
            <span>Actualizado</span>
          </Badge>
          <p className="text-[10px] text-slate-400">
            {lastUpdated.toLocaleTimeString("es-AR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
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

      <div className="overflow-x-auto">
        <Table className="text-xs">
          <TableHeader>
            <TableRow className="hover:bg-slate-700/30 border-slate-700/50">
              <TableHead className="text-slate-400 py-2 h-8">Entidad</TableHead>
              <TableHead className="text-slate-400 py-2 h-8">
                <Button
                  variant="ghost"
                  onClick={() => handleSort("compra")}
                  className="p-0 h-auto font-semibold flex items-center hover:bg-transparent hover:text-emerald-400 text-xs"
                >
                  Compra Dólares
                  <ArrowUpDown
                    className={`ml-1 h-3 w-3 ${sortField === "compra" ? "text-emerald-400" : "text-slate-500"}`}
                  />
                </Button>
              </TableHead>
              <TableHead className="text-slate-400 py-2 h-8">
                <Button
                  variant="ghost"
                  onClick={() => handleSort("venta")}
                  className="p-0 h-auto font-semibold flex items-center hover:bg-transparent hover:text-emerald-400 text-xs"
                >
                  Venta Dólares
                  <ArrowUpDown
                    className={`ml-1 h-3 w-3 ${sortField === "venta" ? "text-emerald-400" : "text-slate-500"}`}
                  />
                </Button>
              </TableHead>
              <TableHead className="text-slate-400 py-2 h-8">
                <Button
                  variant="ghost"
                  onClick={() => handleSort("spread")}
                  className="p-0 h-auto font-semibold flex items-center hover:bg-transparent hover:text-emerald-400 text-xs"
                >
                  Spread
                  <ArrowUpDown
                    className={`ml-1 h-3 w-3 ${sortField === "spread" ? "text-emerald-400" : "text-slate-500"}`}
                  />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedRates.map((rate, index) => (
              <TableRow key={index} className="hover:bg-slate-700/30 border-slate-700/50">
                <TableCell className="font-medium py-1.5 h-7">{BANK_NAMES[rate.entidad] || rate.entidad}</TableCell>
                <TableCell className="text-emerald-400 font-medium py-1.5 h-7">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-2.5 w-2.5" />${rate.compra.toFixed(2)}
                  </div>
                </TableCell>
                <TableCell className="text-red-400 font-medium py-1.5 h-7">
                  <div className="flex items-center gap-1">
                    <TrendingDown className="h-2.5 w-2.5" />${rate.venta.toFixed(2)}
                  </div>
                </TableCell>
                <TableCell className="py-1.5 h-7">
                  <Badge
                    variant="outline"
                    className={`${
                      rate.spread < 5
                        ? "bg-green-500/10 text-green-400 border-green-500/30"
                        : rate.spread < 8
                          ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                          : "bg-red-500/10 text-red-400 border-red-500/30"
                    } text-[10px] px-1 py-0`}
                  >
                    {rate.spread.toFixed(2)}%
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-2 text-[10px] text-slate-400 bg-slate-800/30 p-2 rounded-md border border-slate-700/30">
        <p className="flex items-center gap-1">
          <TrendingUp className="h-2.5 w-2.5 text-emerald-400" />
          Para mejores precios de compra de dólares, ordena la columna "Compra Dólares" de menor a mayor
        </p>
        <p className="flex items-center gap-1 mt-0.5">
          <TrendingDown className="h-2.5 w-2.5 text-red-400" />
          Para mejores precios de venta de dólares, ordena la columna "Venta Dólares" de mayor a menor
        </p>
      </div>
    </div>
  )
}
