import axios from 'axios'

export interface DolarRate {
  nombre: string
  compra: number
  venta: number
}

// 👇 Ahora usa el proxy configurado en vite.config.js
// (Vite redirige internamente a https://dolarapi.com/v1/dolares)
const BASE = '/dolarapi/v1/dolares'

const parseNumber = (raw: any): number => {
  if (raw === undefined || raw === null) return 0
  if (typeof raw === 'number') return raw
  const s = String(raw).replace(/[^0-9,.-]/g, '').replace(',', '.')
  const n = parseFloat(s)
  return isNaN(n) ? 0 : n
}

const normalize = (data: any): DolarRate[] => {
  if (!data) return []
  if (Array.isArray(data)) {
    return data.map((d: any) => ({
      nombre: d.nombre || d.name || (d.casa && d.casa.nombre) || '',
      compra: parseNumber(d.compra || d.buy || (d.casa && d.casa.compra)),
      venta: parseNumber(d.venta || d.sell || (d.casa && d.casa.venta))
    }))
  }

  return Object.keys(data).map(key => {
    const d = data[key]
    return { 
      nombre: d.nombre || key, 
      compra: parseNumber(d.compra || d.buy), 
      venta: parseNumber(d.venta || d.sell) 
    }
  })
}

const tryDolarsi = async (): Promise<DolarRate[] | null> => {
  try {
  const res = await axios.get('/dolarsi/api/api.php?type=valoresprincipales')
    if (res && res.data && Array.isArray(res.data)) {
      const arr = res.data.map((it: any) => {
        const c = it.casa || it
        return {
          nombre: c.nombre || '',
          compra: parseNumber(c.compra),
          venta: parseNumber(c.venta)
        }
      }).filter((r: DolarRate) => r.nombre)
      if (arr.length) return arr
    }
  } catch {
    // ignora errores
  }
  return null
}

const tryExchangeRateHost = async (): Promise<DolarRate[] | null> => {
  try {
  const res = await axios.get('/exhost/latest?base=USD&symbols=ARS')
    if (res && res.data && res.data.rates && res.data.rates.ARS) {
      const rate = parseNumber(res.data.rates.ARS)
      const venta = rate
      const compra = rate
      return [
        { nombre: 'oficial', compra, venta },
        { nombre: 'pizarra', compra, venta }
      ]
    }
  } catch {
    // ignora errores
  }
  return null
}

const getAllRates = async (): Promise<DolarRate[]> => {
  // First, try the dolarapi endpoint you provided (proxied as /dolarapi/... in dev)
  try {
    const r = await axios.get(`${BASE}`)
    const data = r.data
    if (Array.isArray(data)) {
      const mapped: DolarRate[] = data.map((it: any) => ({
        nombre: it.nombre || it.casa || it.name || '',
        compra: parseNumber(it.compra),
        venta: parseNumber(it.venta)
      })).filter((x: DolarRate) => x.nombre)

      if (mapped.length) return mapped
    }
  } catch (err) {
    // ignore and fallback
  }

  // Next try exchangerate.host for a reliable USD->ARS rate
  const exhost = await tryExchangeRateHost()
  if (exhost) return exhost

  // Then try Dolarsi as a last attempt
  try {
    const dolarsi = await tryDolarsi()
    if (dolarsi) return dolarsi
  } catch {
    // ignore
  }

  // Final fallback
  const fallbackRate = 1000
  return [{ nombre: 'oficial', compra: fallbackRate, venta: fallbackRate }]
}

const getRateByName = async (name: string): Promise<DolarRate | null> => {
  const rates = await getAllRates()
  const found = rates.find(r => r.nombre.toLowerCase().includes(name.toLowerCase()))
  return found || null
}

const getConversionRate = async (): Promise<number> => {
  const rates = await getAllRates()
  const filtered = rates.filter(r => !/tarjeta/i.test(r.nombre))
  const preferred = ['oficial', 'pizarra', 'blue', 'mep', 'contadoconliqui']
  for (const p of preferred) {
    const f = filtered.find(r => r.nombre.toLowerCase().includes(p))
    if (f) return (f.compra + f.venta) / 2
  }
  if (filtered.length === 0) return 1000
  const avg = filtered.reduce((s, r) => s + (r.compra + r.venta) / 2, 0) / filtered.length
  return avg
}

export default {
  getAllRates,
  getRateByName,
  getConversionRate
}

// Simple helper: get a single USD->ARS rate (uses exchangerate.host with fallback)
export const getLatestUSDARS = async (): Promise<number> => {
  try {
    const res = await axios.get('/exhost/latest?base=USD&symbols=ARS')
    if (res && res.data && res.data.rates && res.data.rates.ARS) {
      return parseNumber(res.data.rates.ARS)
    }
  } catch (e) {
    // ignore
  }
  // fallback to conversion logic
  try {
    const conv = await getConversionRate()
    return conv
  } catch (e) {
    return 1000
  }
}
