import React from 'react'
import useLoginStore from '../../store/useUserStore'

const Login = () => {

  const {step , setStep,setUserPhoneData, userPhoneData, resetLoginState} = useLoginStore()

  return (
    <div>Login</div>
  )
}

export default Login

