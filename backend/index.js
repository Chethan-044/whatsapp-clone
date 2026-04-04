const cookieParser = require("cookie-parser")
const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
const connectDb = require("./config/dbconnect.js")
const bodyparser =require("body-parser")
const authRoute = require("./routes/authRoute.js")
const chatRoute = require("./routes/chatRoute.js")
const statusRoute = require("./routes/statusRoute.js")
const initializeSocket = require("./services/socketService.js")
const http = require("http") 

dotenv.config();



const PORT = process.env.PORT;
const app = express();

const corsOption = {
    origin:process.env.FRONTEND_URL,
    credentials:true,
    methods:['GET','POST','PUT','DELETE','OPTIONS'],
}

//middleware
app.use(cors(corsOption))
app.use(express.json())
app.use(cookieParser())
app.use(bodyparser.urlencoded({extended:true}))

connectDb();

//create http server
const server = http.createServer(app);

//initialize socket with the http server
const io = initializeSocket(server);
app.use((req,res,next)=>{
    req.io = io; //attach the io instance to the request object for use in routes
    req.socketUsermap = io.socketUsermap; //attach the online users map to the request object for use in routes
    next();
})


//routes
app.use("/api/auth",authRoute)
app.use("/api/chat",chatRoute)
app.use("/api/status",statusRoute)

server.listen(PORT,(req,res)=>{
    console.log("App running at port",PORT);
    
})