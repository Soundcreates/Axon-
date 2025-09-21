import express from "express";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";
import homeRouter from "./routes/indexRoutes.js";
import connectDB from "./config/connectDB.js";

dotenv.config();
const app = express();

app.use(express.urlencoded({extended:false}));  
app.use(express.json()); 

app.use (cors({
    origin:[process.env.PROJECT_MODE==="development" ? "http://localhost:5173":process.env.PROD_URI],
    // methods:["GET","POST","DELETE","PUT","PATCH"],
    credentials:true
}));

app.use("/api",homeRouter);

const PORT=process.env.PORT
app.listen(PORT,()=> {
     connectDB();
    console.log("server started");
});
