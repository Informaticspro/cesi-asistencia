// supabase/functions/enviarCorreoQR/index.ts

import { Resend } from 'resend'

export async function handler(req: Request): Promise<Response> {
  const { correo, cedula } = await req.json()

  if (!correo || !cedula) {
    return new Response('Faltan datos', { status: 400 })
  }

  const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

  // Generar la URL de imagen QR (igual que Google Sheets)
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(cedula)}`

  try {
    const { error } = await resend.emails.send({
      from: 'tu-correo@tudominio.com', // Debe estar verificado en Resend
      to: correo,
      subject: 'Tu código QR para el registro CESI 2025',
      html: `
        <p>Hola,</p>
        <p>Gracias por registrarte. Aquí tienes tu código QR:</p>
        <img src="${qrUrl}" alt="QR" width="200" height="200" />
        <p>Escanea este código para registrar tu asistencia.</p>
      `,
    })

    if (error) {
      return new Response(`Error al enviar correo: ${error.message}`, { status: 500 })
    }

    return new Response('Correo enviado correctamente ✅', { status: 200 })
  } catch (e) {
    return new Response('Error interno', { status: 500 })
