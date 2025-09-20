const express=require("express");
const app =express();
require('dotenv').config();       
const path=require("path");
const cors=require("cors");



app.use(express.urlencoded({extended:false}));  
app.use(express.json()); 


app.use (cors({
    origin:[process.env.PROJECT_MODE==="development" ? "http://localhost:5173":process.env.PROD_URI],
    // methods:["GET","POST","DELETE","PUT","PATCH"],
    credentials:true
}));




const homeRouter=require("./routes/indexRoutes.js");
const connectDB = require("./config/connectDB.js");
app.use("/api",homeRouter);


const PORT=process.env.PORT
app.listen(PORT,()=> {
     connectDB();
    console.log("server started");
});
