import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const slotId = formData.get("slotId") as string;
    const shareToken = formData.get("shareToken") as string;

    if (!file || !slotId || !shareToken) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 1. Validate shareToken and get operationId
    const { data: operation, error: opError } = await supabase
      .from("operations")
      .select("id")
      .eq("share_token", shareToken)
      .single();

    if (opError || !operation) {
      return new Response(JSON.stringify({ error: "Invalid share token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const operationId = operation.id;
    const fileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const storagePath = `${operationId}/${slotId}/${fileName}`;

    // 2. Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from("documentos")
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      throw uploadError;
    }

    // 3. Update document slot
    const { error: updateError } = await supabase
      .from("document_slots")
      .update({
        estado: "subido",
        storage_path: storagePath,
        archivo_nombre: file.name,
        fecha_subida: new Date().toISOString(),
        analisis_status: "pendiente",
        red_flags: [], // Clear old flags if replacing
      })
      .eq("id", slotId);

    if (updateError) {
      throw updateError;
    }

    // 4. Trigger analysis asynchronously (don't wait)
    // Using simple fetch to trigger the other edge function
    const analysisUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/analyze-document`;
    fetch(analysisUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
      },
      body: JSON.stringify({ slotId, operationId, storagePath }),
    }).catch(err => console.error("Error triggering analysis:", err));

    return new Response(JSON.stringify({ success: true, storagePath }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Seller upload error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
