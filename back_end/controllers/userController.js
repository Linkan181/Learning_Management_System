import AppError from '../utilities/error.utils.js';
import User from '../model/userSchema.js';
import bcrypt from 'bcryptjs';
import uploadToCloudinary from '../cloudinary/cloudinary.js';
import fs from 'fs';
import sendEmail from '../utilities/sendEmail.js'
import crypto from 'crypto'
import cloudinary from 'cloudinary';

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
        // console.log(encryptedPassword)
        const registeredUser= await User.create({
            fullName,
            email,
            password:encryptedPassword,
            avatar:{
                public_id:email,
                secure_url:'invalid_url'
            }
        })

        console.log(req.file);
        // if(req.file){
        //     try{
        //     const result=await cloudinary.v2.uploader.upload(req.file.path);
        //     console.log(result);
        //     if(result){
        //         registeredUser.avatar.public_id=result.public_id;
        //         registeredUser.avatar.secure_url=result.secure_url;
        //         fs.unlinkSync(req.file.path)
        //     }
        //     }catch(error){
        //       return next(new AppError(error || `File is failed to load in cloudinary`));
        //     }
        // }
        const result=uploadToCloudinary(req.file.path);

        
        if(result){
            registeredUser.avatar.public_id = result.public_id;
            registeredUser.avatar.secure_url= result.secure_url;
            
            //Remove file from server
            // fs.unlinkSync(req.file.path);
        }
        console.log(result);

        res.status(200).json({
            success:true,
            message:"Sign up successfully."
        })
    } catch (error) {
        res.status(400).json({
            success:false,
            message:"Sign up fail",
            Error: error.message
        })
    }
}

const login=async(req,res,next)=>{

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

const logout=(req,res,next)=>{
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

const veiwProfile=async (req,res,next)=>{
     const userId=req.user.id;
     const user=await User.findOne({userId});

     res.status(200).json({
        success:true,
        user
     })

}


const forgotPassword=async(req,res,next)=>{
    const {email}=req.body;

    if(!email){
        return next(new AppError("Email-id required.",400));
    }

    const user=await User.findOne({email});
    if(!user){
        return next(new AppError("Email is not registered.",400))
    }

    const resetToken= await user.generateResetpasswordToken();

    await user.save();

    const resetPasswordURL=`${process.env.PRONT_END_URL}/resetpassword/${resetToken}`;
    const message=resetPasswordURL;
    try {
        const subject='Hello';
        
        await sendEmail(email,subject,message);

        res.status(200).json({
            success:true,
            message:`Reset password token is sent to ${email} successfully.`
        })
    } catch (error) {

        user.fogotPasswordToken=undefined;
        user.forgotPasswordExpiry=undefined;
        return next(new AppError(error.message,500));
    }
    


}

const resetPassword=async(req,res,next)=>{

    try {
        
        const { resettoken }=req.params;

        // console.log(token);
     
        const {password}=req.body;
     
        const encrypted_resetToken=crypto.createHash('sha256').update(resettoken).digest('hex');

        // console.log(encrypted_resetToken);
     
        const user =await User.findOne({ forgotPasswordToken : encrypted_resetToken });

        // console.log(user);
     
        if(!user){
         return next(new AppError('Token is invalid or Expire. Please try again',400));
        }
     
        user.password=password;
        user.forgotPasswordToken=undefined;
        user.fogotPasswordExpiry=undefined;
     
        await user.save();

        res.status(200).json({
            success:true,
            message:"Password is updated successfully"
        })
    } catch (error) {
        console.log(error);
        return next(new AppError("internal server error",500));
    }

}

const changePassword=async(req,res,next)=>{
    const { oldpassword, newpassword}=req.body;
    const {id}=req.user;

    if(!oldpassword || ! newpassword){
        return next(new AppError("All fields are required.",400));
    }

    const user= await User.findById(id).select("+password");

    if(!user){
        return next(new AppError("User does not exist.",400));
    }

    const isPasswordValid= await user.comparePassword(oldpassword);

    if(!isPasswordValid){
       return next(new AppError("Old password is invalid",400));
    }
    
    user.password=newpassword;

    await user.save();

    user.password=undefined; 
    /*
    Assigning undefined to "user.password" after saving the new password serves as a security measure to ensure that the password is not lingering around in memory longer than necessary.
    After the password is saved, assigning undefined to user.password clears the password from the memory of the current user object. This is done to minimize the risk of exposing sensitive data if there is any unexpected leakage of memory.
    */

    res.status(200).json({
        success:true,
        message:"Password changed successfully."
    })
}

const updateProfile=async (req,res,next)=>{
  const {fullName}=req.body;
  const {id}= req.user.id;

  if(!fullName){
    return next(new AppError("Please fill your new name"));
  }

  const user= await User.findById(id);

  if(!user){
    return next(new AppError("User not exist"));
  }

  user.fullName=fullName;
  
  if(req.file){
    await cloudinary.v2.uploader.destroy(user.avatar.public_id);
    try {
        const result=uploadToCloudinary(req.file.path);

        
        if(result){
            user.avatar.public_id = result.public_id;
            user.avatar.secure_url= result.secure_url;
            
            //Remove file from server
            // fs.unlinkSync(req.file.path);
        }
        
    } catch (error) {
        return next(new AppError("Avatar upload failed",400));
    }
  }
  await user.save();

   res.status(200).json({
    success:true,
    message:"user data updated successfully."
   })
}

export { signup, login , logout, veiwProfile, forgotPassword, resetPassword, changePassword,updateProfile};