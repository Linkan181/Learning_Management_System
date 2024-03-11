import app from './app.js';

const PORT=process.env.PORT || 5012;

import {v2 as cloudinary} from 'cloudinary';


cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret:process.env.API_SECRET
})

app.listen(PORT,()=>{
    console.log(`Server is running on port : ${PORT}`);
})