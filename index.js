import express from 'express'
import 'dotenv/config'
import connectDB from './config/db.js'
import patientRouter from './routes/patient.routes.js';
import visitRouter from './routes/visit.routes.js';
import AuthRouter from './routes/auth.routes.js';
import publicRoutes from './routes/public.routes.js';
// import tenantRoutes from './routes/tenant.routes.js';
// import patientRoutes from './routes/patient.routes.js';

import cors from 'cors';
import cookieParser from 'cookie-parser';

import http from 'http';

import { Server } from "socket.io";

const app = express();

const whitelist = [
  "https://hospital-management-3y1x.onrender.com",
  "http://localhost:5173"
];

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || whitelist.includes(origin)) {
        cb(null, true);
      } else {
        cb(new Error("CORS blocked"));
      }
    },
    credentials: true
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
  "https://hospital-management-3y1x.onrender.com",
  "http://localhost:5173"
],
    credentials: true
  }
});

io.on("connection", (socket) => {
  console.log('User connected:', socket.id);

   socket.on("status-updated", (data) => {
    console.log("Received status update from client", data);

    io.emit("status-updated", data);
  });
  
    socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });

});


app.use('/public' , publicRoutes)
app.use('/visit' , visitRouter)
app.use('/patient' , patientRouter)
app.use('/auth' , AuthRouter)
// app.use('/api' , patientRouter)

const startServer = async () => {
    await connectDB()
    console.clear()
    server.listen(process.env.PORT, () => console.log(`Server Running successful On Port ${process.env.PORT}✅` ))
};

startServer();