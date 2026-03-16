const express = require("express");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const app = express();

const SECRET_KEY = "tu_clave_secreta_super_segura";

app.use(express.json());
app.use(cookieParser());

// En Vercel no usamos app.use(express.static("public")),
// de eso se encarga el archivo vercel.json.

app.post("/api/login", (req, res) => {
  try {
    const { username, password } = req.body;

    if (username === "admin" && password === "1234") {
      const token = jwt.sign({ user: username }, SECRET_KEY, {
        expiresIn: "1h",
      });

      res.cookie("token", token, {
        httpOnly: true,
        secure: true, // Cambiado a true para producción (HTTPS)
        sameSite: "strict",
        maxAge: 3600000,
      });

      return res.json({
        message: "Login exitoso",
        timestamp: new Date().toLocaleString(),
      });
    }

    res.status(401).json({ error: "Credenciales incorrectas" });
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

app.get("/api/perfil", (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "No hay token" });

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Token inválido" });
    res.json({ data: "Datos secretos", user: decoded });
  });
});

// Exportamos la app para Vercel
module.exports = app;
