import { NextResponse } from "next/server"

// Estructura de datos que esperamos recibir de la API de bancos
// IMPORTANTE: Notar que las propiedades tienen mayúsculas (totalAsk, totalBid)
interface BankApiData {
  [entidad: string]: {
    ask: number
    totalAsk?: number // Lo que el banco vende (usuario compra) - NOTAR LA MAYÚSCULA
    bid: number
    totalBid?: number // Lo que el banco compra (usuario vende) - NOTAR LA MAYÚSCULA
    time?: number
  }
}

// Estructura de datos que esta API devuelve al frontend
interface DolarRate {
  entidad: string
  compra: number // Lo que el usuario paga para comprar dólares (totalAsk o ask)
  venta: number // Lo que el usuario recibe al vender dólares (totalBid o bid)
  spread: number
  time: number
}

// Lista de bancos a incluir
const BANKS_TO_INCLUDE = [
  "plus",
  "bna",
  "santander",
  "galicia",
  "bbva",
  "patagonia",
  "macro",
  "bapro",
  "ciudad",
  "brubank",
  "supervielle",
]

// URL de la API de bancos
const BANK_API_URL = "https://criptoya.com/api/bancostodos"

export async function GET() {
  try {
    // Realizamos la petición a la API de bancos
    const response = await fetch(BANK_API_URL, {
      next: { revalidate: 300 }, // Revalidar cada 5 minutos
    })

    // Verificamos si la petición fue exitosa
    if (!response.ok) {
      throw new Error(`Error al obtener datos: ${response.status} ${response.statusText}`)
    }

    // Parseamos la respuesta JSON
    const bankData: BankApiData = await response.json()

    // Procesamos los datos recibidos
    const processedRates: DolarRate[] = []

    for (const entidad in bankData) {
      // Solo incluir los bancos especificados
      if (BANKS_TO_INCLUDE.includes(entidad)) {
        const data = bankData[entidad]

        // IMPORTANTE: Desde la perspectiva del usuario
        // compra: precio al que el usuario COMPRA dólares (el banco vende - totalAsk/ask)
        // venta: precio al que el usuario VENDE dólares (el banco compra - totalBid/bid)
        // CORREGIDO: Usando totalAsk y totalBid con mayúsculas
        const compra = Number(data.totalAsk ?? data.ask)
        const venta = Number(data.totalBid ?? data.bid)
        const time = data.time || Date.now() / 1000

        // Validamos que sean números válidos y positivos
        if (!isNaN(compra) && !isNaN(venta) && compra > 0 && venta > 0) {
          // Calculamos el spread (diferencia porcentual)
          const spread = ((compra - venta) / venta) * 100

          processedRates.push({
            entidad,
            compra,
            venta,
            spread: isFinite(spread) ? spread : 0,
            time,
          })
        } else {
          console.warn(
            `Datos inválidos o cero para la entidad ${entidad}: totalAsk/ask=${data.totalAsk ?? data.ask}, totalBid/bid=${
              data.totalBid ?? data.bid
            }`,
          )
        }
      }
    }

    // Verificamos si tenemos datos procesados
    if (processedRates.length === 0) {
      console.warn("No se procesaron cotizaciones válidas desde la API de bancos.")
      return NextResponse.json({ message: "No se encontraron cotizaciones bancarias válidas." }, { status: 404 })
    }

    // Ordenar por mejor precio de compra para el usuario (compra más baja)
    processedRates.sort((a, b) => a.compra - b.compra)

    return NextResponse.json(processedRates)
  } catch (error) {
    console.error("Error al obtener cotizaciones de bancos:", error)
    const errorMessage = error instanceof Error ? error.message : "Error desconocido"

    // Devolver datos de ejemplo en caso de error
    return NextResponse.json(
      [
        { entidad: "bna", compra: 1040, venta: 1000, spread: 4.0, time: Date.now() / 1000 },
        { entidad: "galicia", compra: 1045, venta: 995, spread: 5.03, time: Date.now() / 1000 },
        { entidad: "santander", compra: 1050, venta: 990, spread: 6.06, time: Date.now() / 1000 },
        { entidad: "bbva", compra: 1055, venta: 985, spread: 7.11, time: Date.now() / 1000 },
        { entidad: "macro", compra: 1060, venta: 980, spread: 8.16, time: Date.now() / 1000 },
      ],
      { status: 500 },
    )
  }
}
