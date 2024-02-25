import AppError from '../utilities/error.utils.js';
import User from '../model/userSchema.js';
import bcrypt from 'bcryptjs';

const cookieOptions={
    maxAge: 7*24*60*60*1000,
    httpOnly:true,
    secure:true
}
const signup= async (req, res, next)=>{
    const { fullName, email, password }=req.body;
   
    try {
        if(!fullName || !email || !password){
            return next(new AppError('All fields are required', 400));
        }

        const userExist=await User.findOne({email});
        if(userExist){
            return next(new AppError('User already exist with this email',400));
        }
    
        const encryptedPassword=await bcrypt.hash(password,12);
        console.log(encryptedPassword)
        const registeredUser= await User.create({
            fullName,
            email,
            password:encryptedPassword
        })

        res.status(200).json({
            success:true,
            message:"Sign up successfully."
        })
    } catch (error) {
        res.status(400).json({
            success:false,
            message:"Sign up fail",
            Error: error
        })
    }
}

const login=async(req,res)=>{

    try {
        
        const {email, password}=req.body;
    
        if(!email || !password ){
            return next(new AppError("All fields are required.",400));
        }
    
        const user= await User.findOne({email}).select("+password");
    
        if(!user || !user.comparePassword(password)){
            return next(new AppError("Email or Password not match.",400));
        }
        
        const token= await user.generateJWTToken();
        user.password=undefined;
        res.cookie("token",token,cookieOptions);
    
        res.status(200).json({
            success:true,
            message:"User login successfully.",
            user
        })
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

const logout=(req,res)=>{
    try {
        res.cookie("token",null,{
            secure:true,
            maxAge:0,
            httpOnly:true
        });

        res.status(200).json({
            success:true,
            message:"User logout successfully."
        })
    } catch (error) {
        return next(new AppError("Logout fail.",500));
    }
}

const veiwProfile=async (req,res)=>{
     const userId=req.user.id;
     const user=await User.findOne({userId});

     res.status(200).json({
        success:true,
        user
     })

}

export { signup, login , logout, veiwProfile};