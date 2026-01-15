import app from "./app";
import dotenv from "dotenv";

dotenv.config();

const port = process.env.PORT || 7860;

// El servidor arranca usando toda la configuración que pusimos en app.ts
app.listen(port, () => {
  console.log(`Servidor de Truco corriendo en puerto ${port}`);
});
