const jwt = require('jsonwebtoken')

const authMiddleware = (req,res,next)=>{
    const authToken = req.cookies?.token;

    if(!authToken){
        return(res,401,'Token missing, please provide token');
    }

    try{
        const decode = jwt.verify(authToken,process.env.JWT_SECRET);
        req.user = decode;
       
        return next()
        
    }catch(error){
        console.error(error);
          return(res,401,'Invalid or expired token');
      
        
    }
} 

module.exports = authMiddleware;