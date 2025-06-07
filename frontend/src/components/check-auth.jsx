import React from 'react'
import { useEffect } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'

function CheckAuth({children,protectedRoute}) {

    const navigate=useNavigate();
    const [loading,setloading]=useState(true);

    useEffect(()=>{
        const token=localStorage.getItem("token")

        if(protectedRoute){
            if(!token){
                navigate("/login")
            }else{
                setloading(false)
            }
        }else{
            if(token){
                navigate("/")
            }else{
                setloading(false)
            }
        }



    },[navigate,protectedRoute])


  if(loading){
    return <div>Loading...</div>
  }


  return children
}

export default CheckAuth