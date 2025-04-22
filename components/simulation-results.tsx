"use client"

import { useState, useEffect } from "react"
import { BarChart3, DollarSign, ArrowUpRight, Target, TrendingUp, ArrowRight, Percent, Repeat } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface SimulationResultsProps {
  data: {
    summary: {
      capitalInicial: number
      capitalFinal: number
      operaciones: number
      gananciaTotal: number
      porcentajeGanancia: number
      arbitrajePorOperacion: number
    }
    chartData: {
      labels: string[]
      datasets: [
        {
          label: string
          data: number[]
        },
      ]
    }
  } | null
}

export default function SimulationResults({ data }: SimulationResultsProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  if (!data) {
    return (
      <div className="text-center py-6 text-slate-400">
        <BarChart3 className="h-8 w-8 mx-auto mb-2 text-slate-500 opacity-50" />
        <h3 className="text-sm font-medium mb-1">Sin datos de simulación</h3>
        <p className="text-xs text-slate-500">
          Configura los parámetros y ejecuta una simulación para visualizar los resultados
        </p>
      </div>
    )
  }

  const { summary } = data

  // Calcular el efecto compuesto del arbitraje
  const calculateCompoundEffect = () => {
    const results = []
    let currentCapital = summary.capitalInicial

    // Mostrar el efecto compuesto en las primeras 5 operaciones (reducido de 10)
    const operationsToShow = Math.min(5, summary.operaciones)

    for (let i = 0; i <= operationsToShow; i++) {
      results.push({
        operation: i,
        capital: currentCapital,
        gain: i === 0 ? 0 : currentCapital - currentCapital / (1 + summary.arbitrajePorOperacion / 100),
      })

      if (i < operationsToShow) {
        currentCapital = currentCapital * (1 + summary.arbitrajePorOperacion / 100)
      }
    }

    return results
  }

  const compoundEffect = calculateCompoundEffect()

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-2">
        <Card className="bg-slate-800/30 border-slate-700/30">
          <CardContent className="p-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400">Capital Inicial</p>
                <p className="text-sm font-bold text-slate-100">
                  ${summary.capitalInicial.toLocaleString("es-AR", { maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="bg-slate-800 p-1 rounded-full">
                <DollarSign className="h-3 w-3 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/30 border-slate-700/30">
          <CardContent className="p-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400">Capital Final</p>
                <p className="text-sm font-bold text-emerald-400">
                  ${summary.capitalFinal.toLocaleString("es-AR", { maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="bg-emerald-900/30 p-1 rounded-full">
                <ArrowUpRight className="h-3 w-3 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/30 border-slate-700/30">
          <CardContent className="p-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400">Operaciones</p>
                <p className="text-sm font-bold text-slate-100">{summary.operaciones}</p>
              </div>
              <div className="bg-slate-800 p-1 rounded-full">
                <Target className="h-3 w-3 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/30 border-slate-700/30">
          <CardContent className="p-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400">Ganancia</p>
                <p className="text-sm font-bold text-emerald-400">+{summary.porcentajeGanancia.toFixed(1)}%</p>
              </div>
              <div className="bg-emerald-900/30 p-1 rounded-full">
                <TrendingUp className="h-3 w-3 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Destacar el Arbitraje por Operación - Versión compacta */}
      <Card className="bg-slate-800/30 border-slate-700/30">
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-100 flex items-center gap-1">
              <Percent className="h-4 w-4 text-emerald-400" />
              Arbitraje por Operación
            </h3>
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs px-2 py-0">
              {summary.arbitrajePorOperacion.toFixed(2)}%
            </Badge>
          </div>

          <div className="bg-slate-800/50 rounded-md p-2 mb-2 text-xs">
            <h4 className="text-xs font-medium text-slate-300 mb-2">Efecto Compuesto</h4>

            <div className="space-y-2">
              {compoundEffect.map((item, index) => (
                <div key={index} className="relative">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-[10px] text-slate-400">{index === 0 ? "Inicio" : `Op ${index}`}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-medium text-slate-300">
                        ${item.capital.toLocaleString("es-AR", { maximumFractionDigits: 0 })}
                      </span>
                      {index > 0 && (
                        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] px-1 py-0">
                          +${item.gain.toLocaleString("es-AR", { maximumFractionDigits: 0 })}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Progress
                    value={(item.capital / summary.capitalFinal) * 100}
                    max={100}
                    className="h-1.5 bg-slate-700"
                  />
                </div>
              ))}

              {summary.operaciones > 5 && (
                <div className="text-center text-[10px] text-slate-500 mt-1">
                  ... hasta completar {summary.operaciones} operaciones
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-800/50 rounded-md p-1.5">
              <h4 className="text-[10px] text-slate-400">Primera operación</h4>
              <p className="text-xs font-medium text-emerald-400">
                $
                {(summary.capitalInicial * (summary.arbitrajePorOperacion / 100)).toLocaleString("es-AR", {
                  maximumFractionDigits: 0,
                })}
              </p>
            </div>

            <div className="bg-slate-800/50 rounded-md p-1.5">
              <h4 className="text-[10px] text-slate-400">Última operación</h4>
              <p className="text-xs font-medium text-emerald-400">
                $
                {(
                  summary.capitalFinal -
                  summary.capitalFinal / (1 + summary.arbitrajePorOperacion / 100)
                ).toLocaleString("es-AR", { maximumFractionDigits: 0 })}
              </p>
            </div>

            <div className="bg-slate-800/50 rounded-md p-1.5">
              <h4 className="text-[10px] text-slate-400">Promedio por op.</h4>
              <p className="text-xs font-medium text-emerald-400">
                ${(summary.gananciaTotal / summary.operaciones).toLocaleString("es-AR", { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progreso hacia el objetivo - Versión compacta */}
      <Card className="bg-slate-800/30 border-slate-700/30">
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-100 flex items-center gap-1">
              <Target className="h-4 w-4 text-emerald-400" />
              Progreso hacia el Objetivo
            </h3>
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs px-2 py-0">
              {summary.operaciones} ops.
            </Badge>
          </div>

          <div className="mb-2">
            <div className="flex justify-between items-center mb-1 text-[10px]">
              <span className="text-slate-400">
                ${summary.capitalInicial.toLocaleString("es-AR", { maximumFractionDigits: 0 })}
              </span>
              <span className="text-emerald-400">
                ${summary.capitalFinal.toLocaleString("es-AR", { maximumFractionDigits: 0 })}
              </span>
            </div>
            <Progress value={100} max={100} className="h-2" />
          </div>

          <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 bg-slate-800/50 rounded-md p-1.5">
            <div className="flex items-center gap-0.5">
              <DollarSign className="h-3 w-3 text-slate-500" />
              <span>${summary.capitalInicial.toLocaleString("es-AR", { maximumFractionDigits: 0 })}</span>
            </div>
            <ArrowRight className="h-3 w-3 text-slate-500" />
            <div className="flex items-center gap-0.5">
              <Repeat className="h-3 w-3 text-slate-500" />
              <span>{summary.operaciones} ops</span>
            </div>
            <ArrowRight className="h-3 w-3 text-slate-500" />
            <div className="flex items-center gap-0.5">
              <DollarSign className="h-3 w-3 text-emerald-400" />
              <span className="text-emerald-400">
                ${summary.capitalFinal.toLocaleString("es-AR", { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
