const User = require("../models/User");
const sendOtpToEmail = require("../services/emailService.js");
const otpGenerator = require("../utils/otpGenerator.js");
const response = require("../utils/responseHandler.js");
const twilioService = require("../services/twilloService.js");
const generateToken = require("../utils/generateToken.js");
const { uploadFileToCloudinary } = require("../config/cloudinary.js");
const Conversation = require('../models/Conversation.js')





const sendOtp = async (req, res) => {
    const { phoneNumber, phoneSuffix, email } = req.body;

    const otp = otpGenerator();
    const expiry = new Date(Date.now() + 5 * 60 * 1000);

    let user;

    try {
        if (email) {
            user = await User.findOne({ email });

            if (!user) {
                user = new User({ email });
            }

            user.emailOtp = otp;
            user.emailOtpExpiry = expiry;

            await user.save();
            await sendOtpToEmail(email, otp);

            return response(res, 200, "OTP Sent", { email });
        }

        if (!phoneNumber || !phoneSuffix) {
            return response(res, 400, "All field is required");
        }

        const fullPhoneNumber = `${phoneSuffix}${phoneNumber}`;

        user = await User.findOne({ phoneNumber });

        if (!user) {
            user = new User({ phoneNumber, phoneSuffix });
        }

        await twilioService.sendOtpToPhoneNumber(fullPhoneNumber);
        await user.save();

        return response(res, 200, "Otp Sent successfully");
    } catch (error) {
        console.error(error);
        return response(res, 500, "Internal server error");
    }
};

const verifyOtp = async (req, res) => {
    const { phoneNumber, phoneSuffix, email, otp } = req.body;

    try {
        let user;

        if (email) {
            user = await User.findOne({ email });

            if (!user) {
                return response(res, 404, "User Not Found");
            }

            const now = new Date();

            if (
                !user.emailOtp ||
                String(user.emailOtp) !== String(otp) ||
                now > new Date(user.emailOtpExpiry)
            ) {
                return response(res, 400, "Invalid or expired OTP");
            }

            user.isVerified = true;
            user.emailOtp = null;
            user.emailOtpExpiry = null;
            await user.save();
        }

        else {
            if (!email && (!phoneNumber || !phoneSuffix)) {
  return response(res, 400, "Phone number and suffix required");
}

            const fullPhoneNumber = `${phoneSuffix}${phoneNumber}`;

            user = await User.findOne({ phoneNumber });

            if (!user) {
                user = new User({ phoneNumber, phoneSuffix });
            }

            const result = await twilioService.verifyOtp(fullPhoneNumber, otp);

            if (result.status !== "approved") {
                return response(res, 400, "Invalid OTP");
            }

            user.isVerified = true;
            await user.save();
        }

        const token = generateToken(user?._id);

        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 30
        });

        return response(res, 200, "Otp verified successfully");

    } catch (error) {
        console.error(error);
        return response(res, 500, "Internal server error");
    }
};

const updateProfile = async(req,res)=>{
    const {username,agreed,about} = req.body;
    const userId = req.user.userId;

    try {
        const user =  await User.findById(userId);
        const file = req.file;
        if(file){
            const uploadResult=await uploadFileToCloudinary(file)

            user.profilePicture = uploadResult?.secure_url
        }
        else if(req.body.profilePicture){
            user.profilePicture = req.body.profilePicture
        }
        if(username)  user.username = username;
        if(agreed) user.agreed = agreed;
        if(about) user.about = about;
        await user.save();

        return response(res,200,'Profile updated')

    } catch (error) {
        console.error(error);
        return response(res,200,'Failed to update profile')
        
    }


}

const checkAuthenticated = async(req,res)=>{
    try {
       const userId = req.user.userId
       if(!userId)  return response(res,400,"UnAuthorised user");

       const user = await User.findById(userId);
       if(!user) return response(res,400,"User not found");

       return response(res,200,"User Authorised Successfully",user)
    } catch (error) {
        console.error(error);
        return response(res,200,'Internal server error')
    }
}

const logout=(req,res)=>{
    try {
        res.cookie("token","",{expires:new Date(0)})
        return response(res,200,'User logout successfully')
    } catch (error) {
        return response(res,200,'Enable to logout')
    }
}


const getAllUsers = async(req,res)=>{
    const loggedInUser=req.user.userId;
    try {
        const users = await User.find({_id:{$ne:loggedInUser}}).select(
            "username profilePicture lastseen isOnline about phoneNumber phoneSuffix"
        ).lean();

        const usersWithConversation = await Promise.all(
            users.map(async(user)=>{
                const conversation = await Conversation.findOne({
                    participants:{$all: [loggedInUser,user?.id] }
                }).populate({
                    path:"lastMessage",
                    select:'content createdAt sender receiver'
                }).lean();

                return{
                    ...user,
                    conversation: conversation || null
                }
            })
        )
        return response(res,200,'user retrived successfully',usersWithConversation)
    } catch (error) {
        console.error(error);
        return response(res,200,'Internal server error')
    }
}

module.exports = { sendOtp, verifyOtp,updateProfile,logout , checkAuthenticated,getAllUsers};