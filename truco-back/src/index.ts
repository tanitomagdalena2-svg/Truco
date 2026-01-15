import express from 'express';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 7860;

// Conexión a tu MongoDB
mongoose.connect(process.env.MONGO_URI || '')
  .then(() => console.log("Conectado a MongoDB"))
  .catch(err => console.error("Error de conexión", err));

// ESTO ES LO QUE MATA EL "HI":
// Le decimos al servidor que use la carpeta 'public' donde está el juego
app.use(express.static(path.join(__dirname, '../public')));

// Cualquier ruta que no sea una API, devuelve el juego (index.html)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(port, () => {
  console.log(`Servidor funcionando en puerto ${port}`);
});
