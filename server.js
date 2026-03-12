const express = require("express");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const app = express();

// --- CONFIGURACIÓN (Crucial para que no falle) ---
const SECRET_KEY = "tu_clave_secreta_super_segura"; // Asegúrate de que esta línea exista

app.use(express.json()); // Para leer el body JSON
app.use(cookieParser()); // Para leer las cookies
app.use(express.static("public")); // Para servir tu index.html

// --- RUTAS ---
app.post("/login", (req, res) => {
  try {
    const { username, password } = req.body;

    // Validación simple
    if (username === "admin" && password === "1234") {
      // Creamos el token
      const token = jwt.sign({ user: username }, SECRET_KEY, {
        expiresIn: "1h",
      });

      // Enviamos la cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: false, // Windows 11 local (http) requiere false
        sameSite: "strict",
        maxAge: 3600000,
      });

      console.log(`[AUTH] Token generado para: ${username}`);
      return res.json({
        message: "Login exitoso",
        timestamp: new Date().toLocaleString(),
      });
    }

    res.status(401).json({ error: "Credenciales incorrectas" });
  } catch (error) {
    console.error("Error en el servidor:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Ruta protegida (ISIP06)
app.get("/perfil", (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "No hay token" });

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Token inválido" });
    res.json({ data: "Datos secretos", user: decoded });
  });
});

app.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});
