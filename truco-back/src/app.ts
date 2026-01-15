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

if (process.env.DEBUG === "true") {
    app.use(
        cors(
            {
                origin: "http://localhost:3001",
                credentials: true,
            }
        )
    )
    console.log("CORS enabled");
}

// Configuración de Sesión con MongoDB
app.use(
    session({
        name: "qid",
        secret: process.env.SESSION_SECRET as string,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: process.env.MONGO_URI!,
            touchAfter: 24 * 3600, // 1 día
        }),
        cookie: {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24, // 1 día
            sameSite: "none",
            secure: true,
        },
    })
);

app.use(populateSession); 

// Servir archivos estáticos del Front-end
// Usamos '../public' porque este archivo está dentro de 'src'
app.use(express.static(path.join(__dirname, '../public')));

app.use(requestLogger); 

// Rutas de la API
app.use("/api/pusher", pusherRouter);
app.use("/api/auth", authRouter);
app.use("/api/friends", friendsRouter);
app.use("/api/stats", statsRouter);

// ESTO REEMPLAZA AL ANTERIOR: 
// Sirve el index.html para cualquier ruta que no sea de la API
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../public/index.html'));
});

export default app;
app.use("/", (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'));
})


export default app;
