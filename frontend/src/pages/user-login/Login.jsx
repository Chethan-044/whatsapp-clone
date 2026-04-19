import React, { use, useState } from 'react'
import useLoginStore from '../../store/useUserStore'
import countries from '../../utils/countries'
import * as yup from "yup" 
import { yupResolver } from "@hookform/resolvers/yup"
import usethemeStore from '../../store/themeStore'
import useUserStore from '../../store/useUserStore'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import {motion} from 'framer-motion'
import { FaWhatsapp } from 'react-icons/fa'


//validation schema
const loginValidationSchema = yup
.object()
.shape({
  phoneNumber: yup.string().nullable().notRequired().matches(/^\d{10}$/, "Phone number must be 10 digits").transform((value, originalValue) => 
    originalValue.trim() === "" ? null : value
  ),
  email: yup.string().nullable().notRequired().email("please enter a valid email").transform((value, originalValue) => 
    originalValue.trim() === "" ? null : value
  ),


}).test(
  "at-least-one",
  "Either email or phone number is required",
  function (value) {
    return !!value.phoneNumber || !!value.email; // At least one of them should be provided
  }
);

const otpValidationSchema = yup.object().shape({
  otp: yup.string().length(6, "OTP must be exactly 6 digits").required("OTP is required")
})

const profileValidationSchema = yup.object().shape({
  username: yup.string().required("Username is required"),
  agreed: yup.boolean().oneOf([true], "You must agree to the terms and conditions")
})


  const avatars = [
  'https://api.dicebear.com/6.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/6.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/6.x/avataaars/svg?seed=Mimi',
  'https://api.dicebear.com/6.x/avataaars/svg?seed=Jasper',
  'https://api.dicebear.com/6.x/avataaars/svg?seed=Luna',
  'https://api.dicebear.com/6.x/avataaars/svg?seed=Zoe',
]

const Login = () => {

  const {step , setStep,setUserPhoneData, userPhoneData, resetLoginState} = useLoginStore()
  const [phonenumber, setphoneNumber] = useState("");
  const [selectedCountry,setSelectedCountry] = useState(countries[0]);
  const [otp,setOtp] = useState(["","","","","",""])
  const [email,setEmail] = useState("");
  const [profilepicture,setProfilePicture] = useState(null)
  const [selectedAvatar, setSelectedAvatar] = useState(avatars[0])
  const[profilePictureFile, setProfilePictureFile] = useState(null)
  const [error, setError] = useState(null)



  const navigate = useNavigate();
  const {setUser} = useUserStore()
  const {theme,setTheme} = usethemeStore()
  const {
    register:loginRegister,
    handleSubmit:handleLoginSubmit,
    formState:{errors:loginErrors},
   
  } = useForm({
    resolver:yupResolver(loginValidationSchema)
  })

  const {
   
    handleSubmit:handleOtpSubmit,
    formState:{errors:otpErrors},   
    setValue:setOtpValue
  } = useForm({
    resolver:yupResolver(otpValidationSchema)
  })

  const {
    register:profileRegister,
    handleSubmit:handleProfileSubmit,
    formState:{errors:profileErrors},
    watch
  } = useForm({
    resolver:yupResolver(profileValidationSchema)
  })

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-green-400 to-blue-500'} flex items-center justify-center p-4 overflow-hidden`}>

    <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }} 
    transition={{ duration: 0.5 }}
    className={` ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} p-6 md:p-8 rounded-lg shadow-2xlw-full max-w-md relative z-10`}
  >
    <motion.div 
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    transition={{ duration: 1 ,type:"spring", stiffness: 100 ,damping:20}}
    className='w-24 h-24 bg-green-500 rounded-full mx-auto mb-6 flex items-center justify-center'
    >
      <FaWhatsapp />

    </motion.div>

    </motion.div>


    </div>
  )
}

export default Login

