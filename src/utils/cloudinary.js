import { v2 as cloudinary } from 'cloudinary';
import { log } from 'console';
import { response } from 'express';
import fs from 'fs'
    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
    });
    
  
const uploadOnCloudinary=async(localFilePath)=>{
try {
    if(!localFilePath)
    {
        return null;
    }
    //upload the file on cloudinary
   const response=await cloudinary.uploader.upload(localFilePath,{
        resource_type: 'auto',//it will detect on its own about the type of the file
    })
    //file is successfully uploaded
    console.log(" file successfully uploaded",response.url)
    return response;

} catch (error) {
    fs.unlinkSync(localFilePath)//remove locally saved temporary file as the upload gets failed
    return null;
    
}
}

 export default uploadOnCloudinary;