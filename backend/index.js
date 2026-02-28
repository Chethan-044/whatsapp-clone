const cookieParser = require("cookie-parser")
const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
const connectDb = require("./config/dbconnect.js")
const bodyparser =require("body-parser")
const authRoute = require("./routes/authRoute.js")

dotenv.config();



const PORT = process.env.PORT;
const app = express();

//middleware
app.use(express.json())
app.use(cookieParser())
app.use(bodyparser.urlencoded({extended:true}))


connectDb();


//routes
app.use("/api/auth",authRoute)


app.listen(PORT,(req,res)=>{
    console.log("App running at port",PORT);
    
})