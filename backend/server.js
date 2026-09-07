const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());


app.get("/", (req, res) => {
  res.json({
    ok: true,
    service: "Estuda+ API"
  });
});


app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    service: "Estuda+ Navegador Manual API Online",
    status: "online"
  });
});


const PORT = process.env.PORT || 3000;


app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});
