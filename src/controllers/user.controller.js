import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";


export const registerUser=asyncHandler(async(req,res)=>{
    const {username,email,fullName,password}=req.body

    if([username,email,fullName,password].some((field)=>field?.trim===""))
    {
        throw new ApiError(400,"ALL FIELD ARE REQUIRED")
    }
   const existedUser=await  User.findOne({
        $or:[{username},{email}]
    })
    if(existedUser)
    {
     throw new ApiError(409,"User alrrady exist")
    }
    //now uploading file 
    //multer gives access to req.file

    const avatarLocalPath=req.files?.avatar[0]?.path //since it is in local server not in cloudinary avatar here is the name that we gave to our file
    const coverImageLocalPath= req.files?.coverImage[0]?.path//to obtain the path of our cover image

     if(!avatarLocalPath)
     {
     throw new ApiError(400,"avatar file is required")  
     }

    const avatar=  await uploadOnCloudinary(avatarLocalPath) //now the image is uploaded on cloudinary;await as it takes time
    const coverImage=await uploadOnCloudinary(coverImageLocalPath)
    if(!avatar)
        {
        throw new ApiError(400,"avatar file is required")  
        }
    const user= User.create({fullName,username:username.toLowerCase(),password,email,avatar:avatar.url,coverImage:coverImage?.url||""})

    //to check whether user is created or not
 const createdUser =  await User.findById(user._id).select("-password -refreshToken")//select contain all those fields that we dont want to select
 if(!createdUser)
 {
    throw new ApiError(500,"user not created")
 }
    return res.status(201).json(
        new ApiResponse(200,createdUser,"user registered successfully")
    )
})
