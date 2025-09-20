const express=require("express");
const app =express();
require('dotenv').config();       
const path=require("path");
const cors=require("cors");
const cookieParser = require("cookie-parser");


app.use(express.urlencoded({extended:false}));  
app.use(express.json()); 
app.use(cookieParser());

app.use (cors({
    origin:[""],
    // methods:["GET","POST","DELETE","PUT","PATCH"],
    credentials:true
}));

const {connectMongodb}=require("./connection.js");  
connectMongodb(process.env.MONGO_LOCAL_URL)
.then(()=>console.log("MONGODB CONNECTED, YAY"))  
.catch((err)=>console.log("Database connection issue"));


const UserRoute=require("./routers/User.js");
app.use("/user",UserRoute);


const PORT=process.env.PORT
app.listen(PORT,()=> console.log("server started"));