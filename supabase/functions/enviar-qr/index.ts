import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

serve(async (req) => {
  // Permitir desde cualquier origen
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "*",
      },
    });
  }

  try {
    const { nombre, apellido, correo, cedula } = await req.json();

    if (!nombre || !apellido || !correo || !cedula) {
      return new Response(
        JSON.stringify({ error: "Faltan datos obligatorios" }),
        {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
          },
        }
      );
    }

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(cedula)}`;
    const apiKey = Deno.env.get("RESEND_API_KEY");

    const result = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "onboarding@resend.dev",
        to: correo,
        subject: "Tu código QR para el registro de asistencia",
        html: `
          <p>Hola ${nombre} ${apellido},</p>
          <p>Gracias por registrarte. Este es tu código QR:</p>
          <img src="${qrUrl}" width="256" height="256" />
          <p>¡Nos vemos en el evento!</p>
        `,
      }),
    });

    if (!result.ok) {
      const error = await result.text();
      return new Response(
        JSON.stringify({ error: "Error al enviar correo", detalle: error }),
        {
          status: 500,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new Response(
      JSON.stringify({ message: "Correo enviado correctamente" }),
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Error interno del servidor", detalle: error.message }),
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      }
    );
  }
});