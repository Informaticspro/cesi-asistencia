import express from "express";
import cors from "cors";
import { Resend } from "resend";

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

// Usa tu API key directo aquí para probar
const resend = new Resend("re_8W34KCi1_LWeooe2mX1wGo68DTaXB43Cy");

app.post("/api/enviarQR", async (req, res) => {
  const { nombre, apellido, correo, qrUrl } = req.body;

  console.log("📩 Solicitud recibida para enviar QR:");
  console.log("➡️ Nombre:", nombre);
  console.log("➡️ Apellido:", apellido);
  console.log("➡️ Correo:", correo);
  console.log("➡️ URL del QR:", qrUrl);

  if (!nombre || !apellido || !correo || !qrUrl) {
    console.warn("⚠️ Faltan datos necesarios en la solicitud");
    return res.status(400).json({ error: "Faltan datos necesarios" });
  }

  try {
    await resend.emails.send({
      from: "onboarding@resend.dev", // Cambia si tienes otro remitente autorizado
      to: correo,
      subject: "🚀 Prueba directa: Tu código QR para el registro de asistencia",
      html: `
        <h2>Hola ${nombre} ${apellido}</h2>
        <p>Este es un correo de prueba con tu código QR:</p>
        <img src="${qrUrl}" alt="Código QR" style="width:256px; height:256px;" />
        <p>¡Gracias por registrarte!</p>
      `,
    });

    console.log("✅ Correo enviado correctamente a", correo);
    res.json({ message: "Correo enviado exitosamente" });
  } catch (error) {
    console.error("❌ Error enviando correo:", error);
    res.status(500).json({ error: "Error al enviar correo" });
  }
});

app.listen(port, () => {
  console.log(`Servidor backend escuchando en http://localhost:${port}`);
});