const User = require("../models/User");
const otpGenerator = require("../utils/otpGenerator");
const response= require("../utils/responseHandler.js")


const sendOtp = async(req,res)=>{
    const {phoneNumber , phoneSuffix,email} = req.body;

    const otp = otpGenerator();
    const expiry = new Date(Date.now() + 5*60*1000); 

    let user;
    try{
        if(email){
            user = await User.findOne({email})
            if(!email){
                user = new User({email})
            }
            user.emailOtp = otp;
            user.emailOtpExpiry = expiry;
            await user.save();

            return response(res,200,"OTP Sent to ",{email})
        }


        if(!phoneNumber || !phoneSuffix){
            return response(res,400,"Phone number and suffix required");
        }
        const fullPhoneNumber = `${phoneSuffix}${phoneNumber}`;
        user = await User.findOne({phoneNumber});
        if(!user){
            user = await new User({phoneNumber,phoneSuffix})
        }
        await  user.save();

        return response(res,200,'Otp Sent successfully');
    }catch(err){
        console.error(err);
        return response(res,500,'Internal server error')
        
    }

}