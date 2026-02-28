const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({
    phoneNumber:{
        type:String,
        unique:true,
        sparse:true
    },
    phoneSuffix:{
        type:String,
        unique:false
    },
    username:{type:String},
    email:{
       type: String,
    
        unique: true,
        validate: {
            validator: function(v) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: props => `Invalid email address!`
        }
    },
    emailOtp:{type:String},
    emailOtpExpiry:{type:Date},
    profilePicture:{type:String},
    about:{type:String},
    lastseen:{type:Date},
    isOnline:{type:Boolean,default:false},
    isVerified:{type:Boolean,default:false},
    agreed:{type:Boolean,default:false}

},{timestamps:true});

const User = mongoose.model('User',userSchema);
module.exports = User;