import { use, useEffect } from "react"
import { useLocation } from "react-router-dom"
import useUserStore from "./store/useUserStore"
import Spinner from "./utils/Spinner"
import {  Navigate, Outlet } from "react-router-dom";
import { checkUserAuth } from "./Services/user.service"
import { useState } from "react"


export const ProtectedRoute =  ()=>{
    const location = useLocation()
    const [isChecking, setIsChecking] = useState(true)

    const {isAuthenticated,setUser,clearUser} = useUserStore();

    useEffect(()=>{
        const verifyAuth = async()=>{
            try{
                const result = await checkUserAuth();
                if(result?.isAuthenticated){
                    setUser(result.user);
                }else{
                    clearUser();
                }
            }catch(error){
                console.error("Error verifying authentication:", error);
                clearUser();
            }finally{
                setIsChecking(false);
            }
        }
        verifyAuth();
}, [setUser, clearUser])

    if(isChecking){
        return <div className="flex items-center justify-center h-screen">Loading...</div>
    }

    if(!isAuthenticated){
        return <Navigate to="/user-login" state={{ from: location }} replace />
    }

    return <Outlet />
}



export const PublicRoute = ()=>{
    const isAuthenticated = useUserStore((state) => state.isAuthenticated);

    if(isAuthenticated){
        return <Navigate to="/" replace />
    }

    return <Outlet />
}