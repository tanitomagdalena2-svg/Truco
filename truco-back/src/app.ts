import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import cookieParser from "cookie-parser";
import path from "path";
import dotenv from "dotenv";
import cors from "cors";
import requestLogger from "./middlewares/requestLogger";
import { populateSession } from "./middlewares/sessions";
import pusherRouter from "./routers/pusherRouter";
import authRouter from "./routers/authRouter";
import friendsRouter from "./routers/friendsRouter";
import statsRouter from "./routers/statsRouter";

dotenv.config();
const app = express();

app.use(express.json()); 
app.use(cookieParser()); 
app.use(express.urlencoded({ extended: true })); 

// CORS solo para desarrollo
if (process.env.DEBUG === "true") {
    app.use(cors({ origin: "http://localhost:3001", credentials: true }));
}

// Configuración de Sesión con MongoDB
app.use(
    session({
        name: "qid",
        secret: process.env.SESSION_SECRET || "secreto_temporal",
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: process.env.MONGO_URI!,
            touchAfter: 24 * 3600,
        }),
        cookie: {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24,
            sameSite: "none",
            secure: true,
        },
    })
);

app.use(populateSession); 
app.use(requestLogger); 

// --- RUTAS DE LA API ---
app.use("/api/pusher", pusherRouter);
app.use("/api/auth", authRouter);
app.use("/api/friends", friendsRouter);
app.use("/api/stats", statsRouter);

// --- SERVIR EL FRONTEND (Matamos el "HI") ---

// 1. Archivos estáticos (CSS, JS, Imágenes)
// Usamos path.resolve y .. para salir de 'src' y entrar en 'public'
const publicPath = path.resolve(__dirname, "../public");
app.use(express.static(publicPath));

// 2. Cualquier otra ruta manda el index.html (Para que React maneje el routing)
app.get("*", (req, res) => {
    // Si la ruta empieza con /api y no se encontró arriba, damos error 404
    if (req.path.startsWith("/api")) {
        return res.status(404).send({ message: "API endpoint not found" });
    }
    // Si es cualquier otra cosa (como la raíz), mandamos el juego
    res.sendFile(path.join(publicPath, "index.html"));
});

export default app;
