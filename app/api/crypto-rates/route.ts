import { NextResponse } from "next/server"

interface CryptoRate {
  exchange: string
  compra: number
  venta: number
  spread: number
  time: number
}

// Lista de exchanges a incluir
const EXCHANGES_TO_INCLUDE = ["buenbit", "letsbit", "binance", "binancep2p", "belo", "fiwind", "ripio", "ripioexchange"]

export async function GET() {
  try {
    const processedRates: CryptoRate[] = []

    // Obtener datos para cada exchange
    for (const exchange of EXCHANGES_TO_INCLUDE) {
      try {
        const response = await fetch(`https://criptoya.com/api/${exchange}/usdt/ars/1`, {
          next: { revalidate: 300 }, // Revalidar cada 5 minutos
        })

        if (response.ok) {
          const data = await response.json()

          // IMPORTANTE: Desde la perspectiva del usuario
          // compra: precio al que el usuario COMPRA USDT (el exchange vende - ask)
          // venta: precio al que el usuario VENDE USDT (el exchange compra - bid)
          const compra = Number(data.ask)
          const venta = Number(data.bid)
          const time = data.time || Date.now() / 1000

          // Validamos que sean números válidos y positivos
          if (!isNaN(compra) && !isNaN(venta) && compra > 0 && venta > 0) {
            // Calculamos el spread (diferencia porcentual)
            const spread = ((compra - venta) / venta) * 100

            processedRates.push({
              exchange,
              compra,
              venta,
              spread: isFinite(spread) ? spread : 0,
              time,
            })
          } else {
            console.warn(`Datos inválidos o cero para el exchange ${exchange}: ask=${data.ask}, bid=${data.bid}`)
          }
        }
      } catch (error) {
        console.error(`Error al obtener datos para ${exchange}:`, error)
      }
    }

    // Verificamos si tenemos datos procesados
    if (processedRates.length === 0) {
      console.warn("No se procesaron cotizaciones válidas desde la API de criptomonedas.")
      return NextResponse.json({ message: "No se encontraron cotizaciones de criptomonedas válidas." }, { status: 404 })
    }

    // Ordenar por mejor precio de compra (compra más baja)
    processedRates.sort((a, b) => a.compra - b.compra)

    return NextResponse.json(processedRates)
  } catch (error) {
    console.error("Error al obtener cotizaciones de criptomonedas:", error)
    const errorMessage = error instanceof Error ? error.message : "Error desconocido"

    // Devolver datos de ejemplo en caso de error
    return NextResponse.json(
      [
        { exchange: "binance", compra: 1070, venta: 1050, spread: 1.9, time: Date.now() / 1000 },
        { exchange: "buenbit", compra: 1075, venta: 1045, spread: 2.9, time: Date.now() / 1000 },
        { exchange: "letsbit", compra: 1080, venta: 1040, spread: 3.8, time: Date.now() / 1000 },
        { exchange: "ripio", compra: 1085, venta: 1035, spread: 4.8, time: Date.now() / 1000 },
        { exchange: "belo", compra: 1090, venta: 1030, spread: 5.8, time: Date.now() / 1000 },
      ],
      { status: 500 },
    )
  }
}
