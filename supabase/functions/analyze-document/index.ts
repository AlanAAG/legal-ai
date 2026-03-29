import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"
import { corsHeaders } from "../_shared/cors.ts"

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

    // 1. Set status to analyzing
    await supabase
      .from('document_slots')
      .update({ analysis_status: 'analyzing' })
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

    // 4. MOCK MODE: Check for specific filename for the demo
    const isMockDemo = storagePath.toLowerCase().includes('demo_donacion')
    const now = new Date()

    if (isMockDemo) {
      const mockFlags = [
        {
          type: 'bloqueante',
          title: "🛑 Régimen de Sociedad Conyugal",
          description: "Se detectó que el vendedor está casado bajo sociedad conyugal. Se requiere la firma del cónyuge ya que es un bien mancomunado.",
          severity: 'bloqueante'
        },
        {
          type: 'advertencia',
          title: "⚠️ Adquisición por Donación",
          description: "La escritura analizada indica que el título de propiedad es una DONACIÓN. Se recomienda verificar si el donante aún vive para evitar posibles revocaciones.",
          severity: 'advertencia'
        }
      ]

      // Relational Insert
      for (const flag of mockFlags) {
        await supabase.from('detected_red_flags').insert({
          document_slot_id: slotId,
          type: flag.type,
          title: flag.title,
          description: flag.description,
          severity: flag.severity
        })
      }

      await supabase
        .from('document_slots')
        .update({
          analysis_status: 'analyzed',
          status: 'flagged'
        })
        .eq('id', slotId)

      return new Response(JSON.stringify({ 
        slotId, 
        isMockMode: true,
        flags: mockFlags 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // 5. Extract Text (Basic simulation using TextDecoder for simplicity in this deterministic version)
    // In a real production environment, we would use a more robust PDF parser or OCR
    const contentText = new TextDecoder().decode(await fileData.arrayBuffer())
    const flags = []

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
                    type: 'expiry_fiscal_3m',
                    title: "Expiración Fiscal",
                    description: "La fecha detectada supera los 90 días. Verificar fecha de emisión.",
                    severity: 'bloqueante'
                })
            }
        } else {
             // If no date found on a critical document, flag it
             flags.push({
                type: 'expiry_fiscal_3m',
                title: "Fecha no detectada",
                description: "No se detectó una fecha de emisión clara. El documento puede estar vencido.",
                severity: 'bloqueante'
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
                    type: 'expiry_power_1y',
                    title: "Poder Notarial Vencido",
                    description: "El poder notarial parece tener más de 1 año. Verificar vigencia.",
                    severity: 'bloqueante'
                })
            }
        }
    }

    // Rule 4, 5, 6: KEYWORDS (Escritura / Propiedad)
    if (slotName.includes('escritura')) {
        if (/donación|donatario|donante|título gratuito/i.test(contentText)) {
            flags.push({
                type: 'keyword_donation',
                title: "Título de Donación",
                description: "La escritura contiene lenguaje de donación. Verificar régimen fiscal y restricciones.",
                severity: 'advertencia'
            })
        }
        if (/usufructo|usufructuario|nuda propiedad/i.test(contentText)) {
            flags.push({
                type: 'keyword_usufruct',
                title: "Usufructo Detectado",
                description: "La escritura menciona usufructo. Confirmar si está vigente.",
                severity: 'advertencia'
            })
        }
        if (/embargo|gravamen|hipoteca|anotación preventiva/i.test(contentText)) {
            flags.push({
                type: 'keyword_lien',
                title: "Gravamen Detectado",
                description: "Se detectó lenguaje de gravamen o embargo. Revisión urgente requerida.",
                severity: 'bloqueante'
            })
        }
    }

    // Rule 7: PRESENCE — INE keyword check
    if (slotName.includes('identificación') || slotName.includes('ine')) {
        if (!/INSTITUTO NACIONAL ELECTORAL|CREDENCIAL PARA VOTAR|CURP/i.test(contentText)) {
            flags.push({
                type: 'presence_ine',
                title: "Identificación no válida",
                description: "El archivo puede no ser una identificación oficial válida. Verificar logotipo o texto oficial.",
                severity: 'advertencia'
            })
        }
    }

    // 6. Relational Insert for all flags
    for (const flag of flags) {
      await supabase.from('detected_red_flags').insert({
        document_slot_id: slotId,
        type: flag.type,
        title: flag.title,
        description: flag.description,
        severity: flag.severity
      })
    }

    const hasBloqueante = flags.some(f => f.severity === 'bloqueante')
    const finalStatus = (flags.length > 0 && slot.is_required) ? 'flagged' : 'uploaded'

    const { error: updateError } = await supabase
      .from('document_slots')
      .update({
        analysis_status: 'analyzed',
        status: flags.length > 0 ? (hasBloqueante ? 'flagged' : 'uploaded') : 'uploaded'
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
