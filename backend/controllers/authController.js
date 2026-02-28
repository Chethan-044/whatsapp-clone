const User = require("../models/User");
const sendOtpToEmail = require("../services/emailService.js");
const otpGenerator = require("../utils/otpGenerator.js");
const response = require("../utils/responseHandler.js");
const twilioService = require("../services/twilloService.js");
const generateToken = require("../utils/generateToken.js");

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
            if (!phoneNumber || !phoneSuffix)
                return response(res, 400, "Phone number and suffix required");

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

module.exports = { sendOtp, verifyOtp };