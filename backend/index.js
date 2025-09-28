import express from "express";
import cors from "cors";
import { Resend } from "resend";

const app = express();
const port = 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Inicializa Resend con tu API Key
const resend = new Resend("re_8W34KCi1_LWeooe2mX1wGo68DTaXB43Cy");

// Endpoint de prueba
app.get("/ping", (req, res) => {
  res.json({ message: "✅ Servidor CESI 2025 activo con Resend API" });
});

// Endpoint principal para enviar QR
app.post("/api/enviarQR", async (req, res) => {
  const { nombre, apellido, correo, qrUrl } = req.body;

  console.log("📩 Solicitud recibida para enviar QR:");
  console.log("➡️ Nombre:", nombre);
  console.log("➡️ Apellido:", apellido);
  console.log("➡️ Correo:", correo);
  console.log("➡️ URL del QR:", qrUrl);

  // Validación de campos
  if (!nombre || !apellido || !correo || !qrUrl) {
    console.warn("⚠️ Faltan datos necesarios en la solicitud");
    return res.status(400).json({ error: "Faltan datos necesarios" });
  }

  try {
    await resend.emails.send({
      from: "onboarding@resend.dev", // Cambia este remitente si tienes uno verificado
      to: correo,
      subject: "📌 CESI 2025 - Confirmación de Registro y Código QR",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color:#004d40;">Estimado/a ${nombre} ${apellido},</h2>
          <p>
            ¡Gracias por completar tu registro en el <b>Congreso CESI 2025</b>! 🎉
          </p>
          <p>
            Este es tu <b>código QR personal</b>, el cual deberás presentar para tu asistencia y validación en el evento:
          </p>
          <div style="margin: 20px 0; text-align: center;">
            <img src="${qrUrl}" alt="Código QR" style="width:256px; height:256px; border:1px solid #ccc; padding:8px;" />
          </div>
          <p>
            Guarda este correo para futuras referencias. Si no logras visualizar la imagen, notifícanos al comité organizador.
          </p>
          <hr style="margin:20px 0;" />
          <p>
            Para más información y contenido exclusivo, visita nuestro canal de YouTube:
            <br />
            <a href="https://www.youtube.com/@FACULTADDEECONOMIAUNACHI" 
               style="color:#1565c0; font-weight:bold; text-decoration:none;">
              🌐 Canal de YouTube - Facultad de Economía UNACHI
            </a>
          </p>
          <p style="margin-top:20px; font-size:0.9rem; color:#666;">
            Atentamente,<br/>
            Comité Organizador CESI 2025<br/>
            Universidad Autónoma de Chiriquí
          </p>
        </div>
      `,
    });

    console.log("✅ Correo enviado correctamente a", correo);
    res.json({ message: "Correo enviado exitosamente" });
  } catch (error) {
    console.error("❌ Error enviando correo:", error);
    res.status(500).json({ error: "Error al enviar correo" });
  }
});

// Inicia el servidor
app.listen(port, () => {
  console.log(`🚀 Servidor backend escuchando en http://localhost:${port}`);
});
