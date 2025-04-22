"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowDownUp, BarChart3, Bitcoin, DollarSign, Percent, RefreshCw, TrendingUp } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import SimulationResults from "@/components/simulation-results"
import { Badge } from "@/components/ui/badge"
import BestQuotes from "@/components/best-quotes"
import BankRates from "@/components/bank-rates"
import CryptoRates from "@/components/crypto-rates"

export default function Home() {
  const [compra, setCompra] = useState<string>("1000")
  const [venta, setVenta] = useState<string>("1050")
  const [capital, setCapital] = useState<string>("100000")
  const [objetivo, setObjetivo] = useState<string>("200000")
  const [resultado, setResultado] = useState<string[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [simulationData, setSimulationData] = useState<any>(null)

  const simularArbitraje = () => {
    try {
      setLoading(true)
      const precioCompra = Number.parseFloat(compra)
      const precioVenta = Number.parseFloat(venta)
      const capitalInicial = Number.parseFloat(capital)
      const objetivoFinal = Number.parseFloat(objetivo)

      if (isNaN(precioCompra) || isNaN(precioVenta) || isNaN(capitalInicial) || isNaN(objetivoFinal)) {
        setResultado(["⚠️ Error: todos los valores deben ser numéricos."])
        setLoading(false)
        return
      }

      const resultados: string[] = []
      resultados.push("📊 Simulación de arbitraje con reinversión compuesta")
      resultados.push("")

      const arbitraje = precioVenta / precioCompra - 1
      resultados.push(`Arbitraje estimado por operación: ${(arbitraje * 100).toFixed(2)}%`)
      resultados.push("")

      let capitalActual = capitalInicial
      let operaciones = 0
      resultados.push(
        `Capital inicial: ${capitalInicial.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      )
      resultados.push(
        `Objetivo (ej. pagar deuda): ${objetivoFinal.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      )
      resultados.push("-".repeat(50))

      // Para el gráfico
      const chartData = {
        labels: ["Inicio"],
        datasets: [
          {
            label: "Capital",
            data: [capitalInicial],
          },
        ],
      }

      while (capitalActual < objetivoFinal) {
        const capitalAnterior = capitalActual
        capitalActual *= 1 + arbitraje
        operaciones += 1
        const gananciaIndividual = capitalActual - capitalAnterior
        const gananciaTotal = capitalActual - capitalInicial

        resultados.push(
          `Operación ${operaciones.toString().padStart(2, "0")} → Capital: ${capitalActual.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} | ` +
            `Ganancia op.: ${gananciaIndividual.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} | ` +
            `Acumulada: ${gananciaTotal.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        )

        // Agregar datos para el gráfico
        chartData.labels.push(`Op ${operaciones}`)
        chartData.datasets[0].data.push(capitalActual)
      }

      resultados.push("")
      resultados.push(`✅ ¡Listo! En ${operaciones} operaciones cubrís el objetivo.`)
      resultados.push(
        `Capital final: ${capitalActual.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      )

      setResultado(resultados)
      setSimulationData({
        chartData,
        summary: {
          operaciones,
          capitalInicial,
          capitalFinal: capitalActual,
          gananciaTotal: capitalActual - capitalInicial,
          porcentajeGanancia: ((capitalActual - capitalInicial) / capitalInicial) * 100,
          arbitrajePorOperacion: arbitraje * 100,
        },
      })
    } catch (error) {
      setResultado(["⚠️ Error en la simulación."])
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      <div className="max-w-7xl mx-auto p-2 md:p-4">
        <header className="mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">

              <img src="/android-chrome-512x512.png" alt="" className="h-12 w-12" />

            
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                ArbitrAR
              </h1>
            </div>
         
          </div>
          
        </header>

        <Tabs defaultValue="simulador" className="w-full">
          <TabsList className="mb-3 bg-slate-800/50 p-0.5 border border-slate-700/50">
            <TabsTrigger
              value="simulador"
              className="text-xs py-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/20 data-[state=active]:to-teal-500/20 data-[state=active]:text-emerald-400 data-[state=active]:border-b data-[state=active]:border-emerald-500"
            >
              Simulador
            </TabsTrigger>
            <TabsTrigger
              value="cotizaciones"
              className="text-xs py-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/20 data-[state=active]:to-teal-500/20 data-[state=active]:text-emerald-400 data-[state=active]:border-b data-[state=active]:border-emerald-500"
            >
              Cotizaciones
            </TabsTrigger>
          </TabsList>

          <TabsContent value="simulador">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              {/* Panel izquierdo - Configuración y cotizaciones */}
              <div className="md:col-span-4 space-y-3">
                {/* Mejores cotizaciones en tiempo real */}
                <Card className="bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
                  <CardHeader className="p-3 pb-0">
                    <CardTitle className="text-sm flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-emerald-400" />
                      Cotizaciones en Tiempo Real
                    </CardTitle>
                    <CardDescription className="text-xs">Mejores precios disponibles</CardDescription>
                  </CardHeader>
                  <CardContent className="p-3 pt-2">
                    <BestQuotes />
                  </CardContent>
                </Card>

                {/* Configuración */}
                <Card className="bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
                  <CardHeader className="p-3 pb-0">
                    <CardTitle className="text-sm flex items-center gap-1">
                      <ArrowDownUp className="h-4 w-4 text-emerald-400" />
                      Configuración
                    </CardTitle>
                    <CardDescription className="text-xs">Parámetros de simulación</CardDescription>
                  </CardHeader>
                  <CardContent className="p-3 pt-2">
                    <div className="space-y-2">
                      <div>
                        <Label htmlFor="compra" className="text-xs text-slate-400">
                          Precio dólar compra (ARS)
                        </Label>
                        <div className="relative">
                          <DollarSign className="absolute left-2 top-2 h-3 w-3 text-slate-500" />
                          <Input
                            id="compra"
                            type="text"
                            value={compra}
                            onChange={(e) => setCompra(e.target.value)}
                            className="pl-7 py-1 h-7 text-xs bg-slate-900/50 border-slate-700 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="venta" className="text-xs text-slate-400">
                          Precio dólar venta (ARS)
                        </Label>
                        <div className="relative">
                          <DollarSign className="absolute left-2 top-2 h-3 w-3 text-slate-500" />
                          <Input
                            id="venta"
                            type="text"
                            value={venta}
                            onChange={(e) => setVenta(e.target.value)}
                            className="pl-7 py-1 h-7 text-xs bg-slate-900/50 border-slate-700 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="capital" className="text-xs text-slate-400">
                          Capital inicial (ARS)
                        </Label>
                        <div className="relative">
                          <DollarSign className="absolute left-2 top-2 h-3 w-3 text-slate-500" />
                          <Input
                            id="capital"
                            type="text"
                            value={capital}
                            onChange={(e) => setCapital(e.target.value)}
                            className="pl-7 py-1 h-7 text-xs bg-slate-900/50 border-slate-700 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="objetivo" className="text-xs text-slate-400">
                          Objetivo (ARS)
                        </Label>
                        <div className="relative">
                          <DollarSign className="absolute left-2 top-2 h-3 w-3 text-slate-500" />
                          <Input
                            id="objetivo"
                            type="text"
                            value={objetivo}
                            onChange={(e) => setObjetivo(e.target.value)}
                            className="pl-7 py-1 h-7 text-xs bg-slate-900/50 border-slate-700 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                          />
                        </div>
                      </div>
                      <Button
                        onClick={simularArbitraje}
                        className="w-full h-8 text-xs bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border-none"
                        disabled={loading}
                      >
                        {loading ? (
                          <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                        ) : (
                          <ArrowDownUp className="mr-1 h-3 w-3" />
                        )}
                        Simular Arbitraje
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Panel derecho - Resultados */}
              <div className="md:col-span-8 space-y-3">
                {/* Resultados de la simulación */}
                <Card className="bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
                  <CardHeader className="p-3 pb-0">
                    <CardTitle className="text-sm flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-emerald-400" />
                      Resultados de la Simulación
                    </CardTitle>
                    <CardDescription className="text-xs">Visualización del arbitraje compuesto</CardDescription>
                  </CardHeader>
                  <CardContent className="p-3 pt-2">
                    <SimulationResults data={simulationData} />
                  </CardContent>
                </Card>

                {/* Resultados detallados */}
                <Card className="bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm h-[250px] overflow-auto">
                  <CardHeader className="p-3 pb-0">
                    <CardTitle className="text-sm flex items-center gap-1">
                      <BarChart3 className="h-4 w-4 text-emerald-400" />
                      Resultados Detallados
                    </CardTitle>
                    <CardDescription className="text-xs">Progresión detallada de operaciones</CardDescription>
                  </CardHeader>
                  <CardContent className="p-3 pt-2">
                    <div className="font-mono text-xs whitespace-pre-wrap text-slate-300">
                      {resultado.length > 0 ? resultado.join("\n") : "Los resultados aparecerán aquí..."}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="cotizaciones">
            <Tabs defaultValue="bancos" className="w-full">
              <TabsList className="mb-3 bg-slate-800/50 p-0.5 border border-slate-700/50">
                <TabsTrigger
                  value="bancos"
                  className="text-xs py-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/20 data-[state=active]:to-teal-500/20 data-[state=active]:text-emerald-400 data-[state=active]:border-b data-[state=active]:border-emerald-500"
                >
                  Bancos
                </TabsTrigger>
                <TabsTrigger
                  value="crypto"
                  className="text-xs py-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/20 data-[state=active]:to-teal-500/20 data-[state=active]:text-emerald-400 data-[state=active]:border-b data-[state=active]:border-emerald-500"
                >
                  Crypto
                </TabsTrigger>
              </TabsList>

              <TabsContent value="bancos">
                <Card className="bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
                  <CardHeader className="p-3 pb-0">
                    <CardTitle className="text-sm flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-emerald-400" />
                      Cotizaciones de Dólar
                    </CardTitle>
                    <CardDescription className="text-xs">Dólar hoy en bancos y casas de cambio</CardDescription>
                  </CardHeader>
                  <CardContent className="p-3 pt-2">
                    <BankRates compact={false} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="crypto">
                <Card className="bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
                  <CardHeader className="p-3 pb-0">
                    <CardTitle className="text-sm flex items-center gap-1">
                      <Bitcoin className="h-4 w-4 text-emerald-400" />
                      Cotizaciones de USDT/ARS
                    </CardTitle>
                    <CardDescription className="text-xs">Precios actualizados en exchanges</CardDescription>
                  </CardHeader>
                  <CardContent className="p-3 pt-2">
                    <CryptoRates compact={false} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>

        <footer className="mt-6 text-center text-slate-500 text-xs">
          <Separator className="mb-3 bg-slate-700/50" />
          <p>© 2025 ArbitrAR - Simulador de Arbitraje Financiero</p>
          <p className="mt-0.5">
            Datos proporcionados por{" "}
            <a
              href="https://docs.criptoya.com/argentina/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-slate-400"
            >
              CriptoYa API
            </a>
          </p>
          <p className="mt-0.5">
            Hecho con <span className="text-red-500">❤️</span> por{" "}
            <a
              href="https://github.com/Agustin027"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-slate-400"
            >
              Agustin
            </a>{" "}
            y v0
          </p>
        </footer>

      </div>
    </main>
  )
}
