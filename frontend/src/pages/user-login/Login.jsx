import React, { use, useState } from "react";
import useLoginStore from "../../store/useLoginStore";
import countries from "../../utils/countries";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import usethemeStore from "../../store/themeStore";
import useUserStore from "../../store/useUserStore";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { FaChevronDown, FaUser, FaWhatsapp } from "react-icons/fa";
import Spinner from "../../utils/Spinner.jsx";


//validation schema
const loginValidationSchema = yup
  .object()
  .shape({
    phoneNumber: yup
      .string()
      .nullable()
      .notRequired()
      .matches(/^\d{10}$/, "Phone number must be 10 digits")
      .transform((value, originalValue) =>
        originalValue.trim() === "" ? null : value,
      ),
    email: yup
      .string()
      .nullable()
      .notRequired()
      .email("please enter a valid email")
      .transform((value, originalValue) =>
        originalValue.trim() === "" ? null : value,
      ),
  })
  .test(
    "at-least-one",
    "Either email or phone number is required",
    function (value) {
      return !!value.phoneNumber || !!value.email; // At least one of them should be provided
    },
  );

const otpValidationSchema = yup.object().shape({
  otp: yup
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .required("OTP is required"),
});

const profileValidationSchema = yup.object().shape({
  username: yup.string().required("Username is required"),
  agreed: yup
    .boolean()
    .oneOf([true], "You must agree to the terms and conditions"),
});

const avatars = [
  "https://api.dicebear.com/6.x/avataaars/svg?seed=Felix",
  "https://api.dicebear.com/6.x/avataaars/svg?seed=Aneka",
  "https://api.dicebear.com/6.x/avataaars/svg?seed=Mimi",
  "https://api.dicebear.com/6.x/avataaars/svg?seed=Jasper",
  "https://api.dicebear.com/6.x/avataaars/svg?seed=Luna",
  "https://api.dicebear.com/6.x/avataaars/svg?seed=Zoe",
];

const Login = () => {
  const { step, setStep, setUserPhoneData, userPhoneData, resetLoginState } =
    useLoginStore();
  const [phonenumber, setphoneNumber] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [email, setEmail] = useState("");
  const [profilepicture, setProfilePicture] = useState(null);
  const [selectedAvatar, setSelectedAvatar] = useState(avatars[0]);
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [error, setError] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);



  const navigate = useNavigate();
  const { setUser } = useUserStore();
  const { theme, setTheme } = usethemeStore();
  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm({
    resolver: yupResolver(loginValidationSchema),
  });

  const {
    handleSubmit: handleOtpSubmit,
    formState: { errors: otpErrors },
    setValue: setOtpValue,
  } = useForm({
    resolver: yupResolver(otpValidationSchema),
  });

  const {
    register: profileRegister,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    watch,
  } = useForm({
    resolver: yupResolver(profileValidationSchema),
  });

  const ProgressBar = () => (
    <div
      className={`w-full ${
        theme === "dark" ? "bg-gray-700" : "bg-gray-200"
      } h-2 rounded-full mb-6`}
    >
      <div
        className="bg-green-500 h-2 rounded-full transition-all duration-500 ease-in-out"
        style={{ width: `${Math.min((step / 3) * 100, 100)}%` }}
      ></div>
    </div>
  );

  const filterCountry = countries.filter(
    (country) =>
      country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.dialCode.includes(searchTerm),
  );


  const onLoginSubmit = (data) => {
    try{
      setLoading(true)
      if(email){
       const response = await sendOtp(null,null,email) 
       if(response.status === 'success'){
      }
    }
  }










  return (
    <div
      className={`min-h-screen ${theme === "dark" ? "bg-gray-900" : "bg-gradient-to-br from-green-400 to-blue-500"} flex items-center justify-center p-4 overflow-hidden`}
    >
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={` ${theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900"} p-6 md:p-8 rounded-lg shadow-2xlw-full max-w-md relative z-10`}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            duration: 1,
            type: "spring",
            stiffness: 100,
            damping: 20,
          }}
          className="w-24 h-24 bg-green-500 rounded-full mx-auto mb-6 flex items-center justify-center"
        >
          <FaWhatsapp className="text-white text-6xl"/>
        </motion.div>

        <h1
          className={`text-3xl font-bold mb-6 text-center ${theme === "dark" ? "text-white" : "text-gray-800"}`}
        >
          WhatsApp Login
        </h1>

        <ProgressBar />
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

        {step === 1 && (
          <form action="space-y-4">
            <p
              className={`text-center ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
            >
              Please enter your phone number or email to receive an OTP for
              login.
            </p>

            <div className="relative">

              <div className="flex items-center justify-start mt-5">

                {/* /// ✅ COUNTRY SELECTOR */}

                <div className="relative  mt-4 w-1/3">
                  <button
                    type="button"
                    className={`flex items-center py-2.5 px-4 font-medium text-sm ${
                      theme === "dark"
                        ? "text-gray-300 bg-gray-700 border-gray-600"
                        : "text-gray-900 bg-gray-100 border-gray-300"
                    } border rounded-lg hover:bg-gray-200 focus:outline-none mb-4`}
                    onClick={()=>setShowDropdown(!showDropdown)}
                  >
                    <span className="flex items-center gap-2">
                      {/* ✅ FLAG */}
                      <img
                        src={`https://flagcdn.com/w40/${selectedCountry.alpha2.toLowerCase()}.png`}
                        className="w-5 h-4 object-cover"
                        alt="flag"
                      />

                      {/* ✅ DIAL CODE */}
                      {selectedCountry.dialCode}
                    </span>

                    <FaChevronDown className="ml-2" />
                  </button>

                  {showDropdown && (
                    <div
                      className={`absolute z-10 w-full ${theme === "dark" ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"} border rounded-md shadow-lg max-h-60 overflow-auto
                      `}
                    >
                      <div className={`sticky top-0 ${theme === "dark" ? "bg-gray-700" : "bg-white"} p-2`}>
                          <input 
                            type="text"
                            placeholder="Search country..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={` w-full px-2 py-1 border ${theme === "dark" ? "bg-gray-600 text-white border-gray-500" : "bg-white text-gray-900 border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-green-500`}
                          />

                      </div>
                      {filterCountry.map((country)=>(
                        <button 
                        key={country.alpha2}
                        type="button"
                        className={`w-full text-left px-3 py-2 hover:bg-gray-200 focus:outline-none ${theme === "dark" ? "hover:bg-gray-600" : ""}`}
                        onClick={()=>{
                          setSelectedCountry(country)
                          setShowDropdown(false)
                        }}
                        >
                           ({country.dialCode}) {country.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                  {/* // ✅ PHONE NUMBER INPUT */}
                  <input 
                  type="text"
                  {...loginRegister("phoneNumber")}
                  value={phonenumber}
                  placeholder="Phone number"
                  onChange={(e)=>setphoneNumber(e.target.value)}
                  className={`w-2/3   px-3 py-2 border ${theme === "dark" ? "bg-gray-600 text-white border-gray-500" : "bg-white text-gray-900 border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500  ${loginErrors.phoneNumber ? "border-red-500" : ""}`}
                  />
              </div>
              {loginErrors.phoneNumber && <p className="text-red-500 text-sm mt-1">{loginErrors.phoneNumber.message}</p>}
            </div>


                  <div className={`flex items-center my-1 ${theme === "dark" ? "text-gray-300" : "text-gray-300"}`}>
                    <hr className="flex-grow " />
                    <h3 className="m-0.5 text-gray-400">or</h3>
                    <hr className="flex-grow " />
                  </div>


              {/* // ✅ EMAIL INPUT */}
                  <div className={`flex items-center border border-gray-300 rounded-md px-3 py-2 ${theme === "dark" ? "bg-gray-600 text-white border-gray-500" : "bg-white text-gray-900 border-gray-300"}}`}>
                    <FaUser className={`mr-2 ${theme === "dark" ? "text-gray-300" : "text-gray-400"}`} /> 
                    <input 
                      type="email"
                      {...loginRegister("email")}
                      value={email}
                      onChange={(e)=>setEmail(e.target.value)}
                      placeholder="Email"
                      className={`bg-transparent w-full border-none focus:outline-none ${theme === "dark" ? "text-white" : "text-gray-900"} rounded-md ${loginErrors.email ? "border-red-500" : ""}`}
                    />

                     {loginErrors.email && <p className="text-red-500 text-sm mt-1">{loginErrors.email.message}</p>}
                  </div>

                  <button
                  type="submit" 
                  className="w-full mt-6 py-2 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center justify-center">
                    {loading ?   <Spinner /> : "Send OTP"}
                  </button>

          </form>
        )}
      </motion.div>
    </div>
  );
};

export default Login;
