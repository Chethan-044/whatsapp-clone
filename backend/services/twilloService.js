const twilio = require("twilio");

const accountSid = process.env.TWILLO_ACCOUNT_SID;
const authToken = process.env.TWILLO_AUTH_TOKEN;
const serviceSid = process.env.TWILLO_SERVICE_SID;


const client = twilio(accountSid,authToken);


const sendOtpToPhoneNumber = async(phoneNumber)=>{
    try {
        if(!phoneNumber){
        throw new Error('Phone number is required');
        
    }
    const response = await client.verify.v2.services(serviceSid).verifications.create({
        to:phoneNumber,
        channel:'sms'
    });
    console.log('This is my otp : ',response);
    return response;
    } catch (error) {
        console.error(error)
        throw new Error('Failed to send OTP')
    }
}
const verifyOtp = async(phoneNumber,otp)=>{
    try {

    const response = await client.verify.v2.services(serviceSid).verificationChecks.create({
        to:phoneNumber,
        code:otp
    });
    console.log('This is my otp : ',response);
    return response;
    } catch (error) {
        console.error(error)
        throw new Error('OTP verification failed')
    }
}


module.exports={
    sendOtpToPhoneNumber,
    verifyOtp
}