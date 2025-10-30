import express from 'express'
import fetch from 'node-fetch'
import cors from 'cors'
import bodyParser from 'body-parser'

const app = express()
app.use(cors())
app.use(bodyParser.json())

const HF_TOKEN = process.env.HF_TOKEN || ''
const HF_MODEL = process.env.HF_MODEL || 'gpt2' // default light model; override in env

app.post('/api/chat', async (req, res) => {
  const { message } = req.body
  if (!message) return res.status(400).json({ error: 'Missing message' })

  try {
    // If HF_TOKEN is not set, return a local rule-based reply immediately (fast, no config)
    if (!HF_TOKEN) {
      const reply = localGenerateReply(message)
      return res.json({ reply })
    }

    const resp = await fetch(`https://api-inference.huggingface.co/models/${HF_MODEL}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ inputs: message })
    })

    if (!resp.ok) {
      const text = await resp.text()
      return res.status(resp.status).json({ error: text })
    }

    const data = await resp.json()
    // data can be text or array; normalize
    let reply = ''
    if (Array.isArray(data)) {
      // model may return an array with generated_text
      reply = data[0]?.generated_text || JSON.stringify(data)
    } else if (typeof data === 'object' && data.hasOwnProperty('generated_text')) {
      reply = data.generated_text
    } else if (typeof data === 'string') {
      reply = data
    } else {
      reply = JSON.stringify(data)
    }

    return res.json({ reply })
  } catch (err) {
    console.error('Chat proxy error', err)
    return res.status(500).json({ error: 'Proxy error' })
  }
})

// Simple local rule-based responder (same rules as frontend fallback)
function localGenerateReply(text) {
  const t = (text || '').toLowerCase().trim()

  const presentation = '¡Holaaa! Soy tu amiguito Botito, el chat-bot de Dolarito 🤖✨💸'

  const botPhrases = [
    'Traé tus pesitos y llevate dolaritos, ¡que no se devalúen tus sueñitos! 💭',
    'Si juntás moneditas, yo te doy verdecitos 🌱',
    '¡No guardes los pesitos en el colchoncito, que se te achican solitos! 🛏️',
    '¡Haceme casito y vas a tener tu bolsillito llenito! 🤑',
    '¡Yo te ayudo con tus dolaritos, pero vos traé la buena ondita! 🌈',
    '¡Tu billeterita va a estar más gordita con mis dolaritos! 🐷',
    '¡Guardá tus verdecitos que te van a dar tranquilitos! 💤',
    '¡Metele ganitas, que los dolaritos no se consiguen solitos! 💪',
    '¡Traé tus billetitos que yo los vuelvo fuertitos 💪💵',
    '¡Traé tus pesitos flaquitos y los volvemos dolaritos gorditos! 🐷',
    '¡Con Botito, tus pesitos pasan de humilditos a internacionalitos! 🌍',
    '¡Traé tus ahorritos chiquititos, que yo los hago crecer grandecitos! 🌱📈',
  ]

  if (!t) return presentation
  if (t.includes('hola') || t.includes('buenas')) return presentation
  if (t.includes('precio') || (t.includes('dolar') && t.includes('precio'))) return 'La cotización actual la podés ver en la sección de Cambio. ¿Querés que te la muestre?'
  if (t.includes('enviar') && t.includes('dinero')) return 'Para transferir dinero, andá a Transacciones > Nueva transferencia (si tu cuenta lo permite).'
  if (t.includes('registro') || t.includes('crear') || t.includes('cuenta')) return 'Podés crear una cuenta desde la pantalla de registro. ¿Querés que te redirija?'
  if (t.includes('ayuda') || t.includes('soporte')) return 'Podés contactarnos en soporte@dolarito.local o usar el formulario de contacto.'

  // fallback: return a Botito phrase at random
  return botPhrases[Math.floor(Math.random() * botPhrases.length)]
}

const port = process.env.PORT || 3001
app.listen(port, () => console.log(`Chat proxy listening on http://localhost:${port}`))
