import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';

cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret:process.env.API_SECRET
})

const uploadToCloudinary= async (localFilePath)=>{
   try {
    if(!localFilePath) return console.log("localfile path is not present.")
    console.log(localFilePath);

    const response=await cloudinary.uploader.upload(localFilePath);
    fs.unlink(localFilePath)

    console.log(response);
    return response;
   } catch (error) {
     fs.unlinkSync(localFilePath);
     return null;  //or we can send a error message
   }
}

export default uploadToCloudinary;