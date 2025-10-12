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
    origin:
      process.env.PROJECT_MODE === "development"
        ? "http://localhost:8080"
        : [
            "https://axon-dun.vercel.app",
            "https://axon-p64m.onrender.com",
            process.env.PROD_URI,
          ].filter(Boolean),
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
    credentials: true,
    optionsSuccessStatus: 200, // For legacy browser support
  })
);

app.use("/api", homeRouter);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  connectDB();
  console.log("server started");
});
