import React from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Signup() {

    const [Form,setFrom]=useState({email:"",password:""})
    const [loading,setloading]=useState(false)
    const navigate=useNavigate()


    const handleChange=(e)=>{
       setFrom({...Form,[e.target.name]:[e.target.value]})

    }


    const handleSignup=async (e)=>{
        e.preventDefault()
        setloading(true)
        try { 

           const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/auth/signup`,
                {
                    method:"POST",
                    headers:{
                        "Content-Type":"application/json"
                    },
                    body:JSON.stringify(Form)
                }
            )

            const data=await res.json()

            if(res.ok){
                localStorage.setItem("token",data.token)
                localStorage.setItem("user",JSON.stringify(data.user))
                navigate("/")

            }else{
                alert(data.message || "Signup Failed")
            }
            
        } catch (error) {
            alert("Signup-something went wrong")
            
        }

        finally{
            setloading(false)
        }
    }
  return (
    <div>signup</div>
  )
}

export default Signup