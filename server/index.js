import express from "express";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";
import homeRouter from "./routes/indexRoutes.js";
import connectDB from "./config/connectDB.js";

dotenv.config();
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = 
        process.env.PROJECT_MODE === "development"
          ? ["http://localhost:8080", "http://localhost:3000", "http://localhost:5173"]
          : [
              "https://axon-dun.vercel.app",
              "https://axon-p64m.onrender.com",
              process.env.PROD_URI,
            ].filter(Boolean);
      
      
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log('CORS blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
    optionsSuccessStatus: 200, 
    preflightContinue: false,
  })
);

app.use("/api", homeRouter);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  connectDB();
  console.log("server started");
});
