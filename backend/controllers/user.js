import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import User from "../models/user.js"
import {inngest} from "../inngest/client.js"


export const signup= async(req,res)=>{

   try {

     const{email,password,skills=[]}=req.body;
    const hashed=await bcrypt.hash(password,10);

    const user=await User.create({
        email,
        password:hashed,
        skills,
    })

    await inngest.send({
        name:"user/signup",
        data:{
            email
        }
    });

    const token=jwt.sign(
        {_id:user._id, role:user.role},
        process.env.JWT_SECRET
    )


    res.json({user,token});
    
   } catch (error) {

        res.status(500).json({
            error:"Signup Failed",
            deatils:error.message
        })
   }



}


export const login=async(req,res)=>{

    try {
        const{email,password}=req.body;

        const user=await User.findOne({email});

        if(!user){
            return res.status(401).json({
                error:"User Not Found"
            })
        }


       const isMatch = await bcrypt.compare(password,user.password);

       if(!isMatch){
        return res.status(401).json({
            error:"Invalid Password"

        })
       }

        const token=jwt.sign(
        {_id:user._id, role:user.role},
        process.env.JWT_SECRET
    )


    res.json({user,token});
    



        
    } catch (error) {

         res.status(500).json({
            error:"Login Failed",
            deatils:"error.message"
        })
        
    }
}


export const logout = async(req,res)=>{
    try {

        const token=req.headers.authorization.split(" ")[1];
        if(!token){
            return res.status(401).json({
                error:"Unauthorized User"
            })
        }

        jwt.verify(token,process.env.JWT_SECRET,(decoded,err)=>{
          if(err) return res.status(401).json({
            error:"Unauthorized User"
          })

            res.json({message:"Logout Successfully"});
        })
        
    } catch (error) {

          res.status(500).json({
            error:"Login Failed",
            deatils:"error.message"
        })
        
    }
}


export const updateUser=async(req,res)=>{

    const{email,role,skills=[]}=req.body;

    try {

        if(req.user?.role!="admin"){
            return res.status(401).json({
                error:"ForBidden"
            })
        }

        const user=await User.findOne({email});
        if(!user){
            return res.status(401).json({
                error:"User Not Found"
            })
        }

        await user.updateOne(
            {email},
            {skills:skills.length ? skills:user.skills,role}

        )

    res.jon({
        message:"User Updated Successfully"
    });
    

        
    } catch (error) {
          res.status(500).json({
            error:"Update Failed",
            deatils:"error.message"
        })
        
    }

}




export const getUsers=async (req,res)=>{
    try {

        if(req.user.role !== "admin"){
            return res.status(403).json({
                error:"ForBidden"
            })
        }
        

        const users=await User.find().select("-password");

        return res.json(users);



    } catch (error) {

          res.status(500).json({
            error:"Update Failed",
            deatils:"error.message"
        })
        
    }
}