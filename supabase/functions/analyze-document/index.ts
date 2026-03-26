// Supabase Edge Function: analyze-document
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { slotId, operationId, storagePath } = await req.json()

    // 1. Set status to processing
    await supabase
      .from('document_slots')
      .update({ analisis_status: 'procesando' })
      .eq('id', slotId)

    // 2. Fetch slot context
    const { data: slot, error: slotError } = await supabase
      .from('document_slots')
      .select('*, name')
      .eq('id', slotId)
      .single()

    if (slotError) throw slotError

    // 3. Download file
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('documentos')
      .download(storagePath)

    if (downloadError) throw downloadError

    // 4. Extract Text (Basic simulation using TextDecoder for simplicity in this deterministic version)
    // In a real production environment, we would use a more robust PDF parser or OCR
    const contentText = new TextDecoder().decode(await fileData.arrayBuffer())
    const flags = []
    const now = new Date()

    // 5. Run Rules Based on Slot Keys/Metadata
    // Note: In this version we use slot definitions from Phase F2/F3
    const slotKey = slot.id.split('-')[0] // or use another unique identifier like slot.name
    const slotName = slot.name.toLowerCase()

    // Rule 1 & 2: EXPIRY_DATE (fiscal/utility - 90 days)
    if (slotName.includes('situación fiscal') || slotName.includes('boleta') || slotName.includes('factura')) {
        const dateMatch = contentText.match(/(\d{2})[\/\- ](\d{2})[\/\- ](\d{4})/)
        if (dateMatch) {
            const docDate = new Date(`${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`)
            const diffDays = Math.floor((now.getTime() - docDate.getTime()) / (1000 * 3600 * 24))
            if (diffDays > 90) {
                flags.push({
                    rule_id: 'expiry_fiscal_3m',
                    severidad: 'bloqueante',
                    mensaje: "La fecha detectada supera los 90 días. Verificar fecha de emisión.",
                    detected_at: now.toISOString()
                })
            }
        } else {
             // If no date found on a critical document, flag it
             flags.push({
                rule_id: 'expiry_fiscal_3m',
                severidad: 'bloqueante',
                mensaje: "No se detectó una fecha de emisión clara. El documento puede estar vencido.",
                detected_at: now.toISOString()
            })
        }
    }

    // Rule 3: EXPIRY_DATE — Poder Notarial (1 year)
    if (slotName.includes('poder notarial')) {
        const yearMatch = contentText.match(/\b(19|20)\d{2}\b/g)
        if (yearMatch) {
            const latestYear = Math.max(...yearMatch.map(Number))
            if (now.getFullYear() - latestYear > 1) {
                flags.push({
                    rule_id: 'expiry_power_1y',
                    severidad: 'bloqueante',
                    mensaje: "El poder notarial parece tener más de 1 año. Verificar vigencia.",
                    detected_at: now.toISOString()
                })
            }
        }
    }

    // Rule 4, 5, 6: KEYWORDS (Escritura / Propiedad)
    if (slotName.includes('escritura')) {
        if (/donación|donatario|donante|título gratuito/i.test(contentText)) {
            flags.push({
                rule_id: 'keyword_donation',
                severidad: 'advertencia',
                mensaje: "La escritura contiene lenguaje de donación. Verificar régimen fiscal y restricciones.",
                detected_at: now.toISOString()
            })
        }
        if (/usufructo|usufructuario|nuda propiedad/i.test(contentText)) {
            flags.push({
                rule_id: 'keyword_usufruct',
                severidad: 'advertencia',
                mensaje: "La escritura menciona usufructo. Confirmar si está vigente.",
                detected_at: now.toISOString()
            })
        }
        if (/embargo|gravamen|hipoteca|anotación preventiva/i.test(contentText)) {
            flags.push({
                rule_id: 'keyword_lien',
                severidad: 'bloqueante',
                mensaje: "Se detectó lenguaje de gravamen o embargo. Revisión urgente requerida.",
                detected_at: now.toISOString()
            })
        }
    }

    // Rule 7: PRESENCE — INE keyword check
    if (slotName.includes('identificación') || slotName.includes('ine')) {
        if (!/INSTITUTO NACIONAL ELECTORAL|CREDENCIAL PARA VOTAR|CURP/i.test(contentText)) {
            flags.push({
                rule_id: 'presence_ine',
                severidad: 'advertencia',
                mensaje: "El archivo puede no ser una identificación oficial válida. Verificar logotipo o texto oficial.",
                detected_at: now.toISOString()
            })
        }
    }

    // 6. Update DB with results
    const hasBloqueante = flags.some(f => f.severidad === 'bloqueante')
    const finalStatus = (flags.length > 0 && slot.is_required) ? 'con_alerta' : 'subido'

    const { error: updateError } = await supabase
      .from('document_slots')
      .update({
        red_flags: flags,
        analisis_status: 'completado',
        status: flags.length > 0 ? (hasBloqueante ? 'con_alerta' : 'subido') : 'subido'
      })
      .eq('id', slotId)

    if (updateError) throw updateError

    return new Response(JSON.stringify({ 
        slotId, 
        flagCount: flags.length, 
        flags 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
