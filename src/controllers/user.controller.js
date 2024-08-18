import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";
import jwt from 'jsonwebtoken'
import mongoose from "mongoose";

const generateAcess_and_refreshToken=async(userId)=>{
    try {
        const user=await User.findById(userId)
       const accessToken= user.generateAccessToken()
       const refreshToken= user.generateRefreshToken()
       //to add refresh token to mongo db
       user.refreshToken=refreshToken
       await user.save({validateBeforeSave:false})//now save asks for all the parameters like password and all so to avoid that and just add token we use //validateBeforesave
       return {accessToken,refreshToken}
    } catch (error) {
        throw new ApiError(500,"something went wrong while generating refresh and acess token")
    }
}

export const registerUser = asyncHandler(async (req, res) => {
    const { username, email, fullName, password } = req.body;

    if ([username, email, fullName, password].some(field => field?.trim() === "")) {
        throw new ApiError(400, "ALL FIELDS ARE REQUIRED");
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existedUser) {
        throw new ApiError(409, "User already exists");
    }

    // Check if files exist before accessing
    if (!req.files || !req.files.avatar || !req.files.avatar[0]) {
        throw new ApiError(400, "Avatar file is required");
    }

    const avatarLocalPath = req.files.avatar[0].path; // Avatar file path
    let coverImageLocalPath;

    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    console.log(coverImage);
    if (!avatar) {
        throw new ApiError(400, "Avatar file is required");
    }

    const user = await User.create({
        fullName,
        username: username.toLowerCase(),
        password,
        email,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "User not created");
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    );
});


export const loginUser = asyncHandler(async (req, res) =>{
    // req body -> data
    // username or email
    //find the user
    //password check
    //access and referesh token
    //send cookie

    const {email, username, password} = req.body

    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

   const isPasswordValid = await user.isPasswordCorrect(password)

   if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials")
    }

   const {accessToken, refreshToken} = await generateAcess_and_refreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        sameSite: 'strict',
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )

})

export const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        sameSite: 'strict',
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})


export const refreshAccessToken=asyncHandler(async(req,res)=>{
   const incomingRefreshToken= req.cookies.refreshToken||req.body.refreshToken
   if(!incomingRefreshToken)
     throw new ApiError(401,"Unauthorized user")
 try {
    const decodedToken= jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
    const user=await User.findById(decodedToken?._id)
       if(!user)
       throw new ApiError(401,"Invalid refresh token") 
     
       if(incomingRefreshToken!=user?.refreshToken)
      throw new ApiError(401,"Refresh token is expired or used")
   const options={
   httpOnly:true,
   sameSite: 'strict',
   }
   const {accessToken,newrefreshToken}=await generateAcess_and_refreshToken(user._id)
   return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",newrefreshToken,options).json(new ApiResponse(200,{accessToken,refreshToken:newrefreshToken},"Access token refreshed successfully"))
   
} catch (error) {
    throw new ApiError(401,error?.message||"invalid refresh token")
}
})

export const changeCurrentPassword=asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword}=req.body
    const user=await User.findById(req.user?._id)
 const isPasswordCorrect= await  user.isPasswordCorrect(oldPassword)
 if(!isPasswordCorrect)
    throw new ApiError(401,"Invalid old password")
  user.password=newPassword
  await user.save({
    validateBeforeSave:false
  })
  return res.status(200).json(new ApiResponse(200,{},"Password changed successfully"))
})

export const getCurrentUser=asyncHandler(async(req,res)=>{ 
    return res.status(200).json(new ApiResponse(200,req.user,"current user fetched successfully"))
})

export const updateAccountDetails=asyncHandler(async(req,res)=>{
    const {fullName,email}=req.body
    if(!fullName || !email)
    {
        throw new ApiError(400,"Please fill all fields")
    }
   const user= await User.findByIdAndUpdate(req.user?._id,{
        $set:{
            fullName,
            email,
        }
    },{new:true}).select("-password")
    return res.status(200).json(new ApiResponse(200,user,"Account details updated successfully"))
})

//updating files
export const updateUserAvatar=asyncHandler(async(req,res)=>{
  const avatarLocalPath=req.file?.path
  if(!avatarLocalPath)
    throw new ApiError(400,"Avatar file is missing")
   const avatar=await uploadOnCloudinary(avatarLocalPath)
   if(!avatar.url)
    throw new ApiError(400,"Error while uploading avatar")
   const user= await User.findByIdAndUpdate(
        req.user?._id,
        {
         $set:{
            avatar:avatar.url
         }
        },
        {
            new:true
        }
    ).select("-password")

    return res.status(200).json(new ApiResponse(200,user,"avatar successfully updated"))
})

export const updateUserCoverImage=asyncHandler(async(req,res)=>{
    const CoverImageLocalPath=req.file?.path
    if(!CoverImageLocalPath)
      throw new ApiError(400,"CoverImage file  is missing")
     const CoverImage=await uploadOnCloudinary(CoverImageLocalPath)
     if(!CoverImage.url)
      throw new ApiError(400,"Error while uploading CoverImage")
    const user=  await User.findByIdAndUpdate(
          req.user?._id,
          {
           $set:{
            coverImage:CoverImage.url
           }
          },
          {
              new:true
          }
      ).select("-password")
      return res.status(200).json(new ApiResponse(200,user,"coverImage successfully updated"))
  })


export const getUserChannelProfile=asyncHandler(async(req,res)=>{
    const {username}=req.params
    if(!username?.trim())
    {
        throw new ApiError(400,"username is missing")
    }
 const channel=  await User.aggregate([{
    $match:{
        username:username?.toLowerCase(),
    }

    },{
        $lookup:{
            from:"subscriptions",//as everything in model is converted into lower case in models
            localField:"_id",
            foreignField:"channel",
            as:"subscribers"
        }
    },{
        $lookup:{
            from:"subscriptions",//as everything in model is converted into lower case in models
            localField:"_id",
            foreignField:"subscriber",
            as:"subscribedTo"
        }
        
    },{
        $addFields:{
            subscribersCount:{
                $size:"$subscribers"
            },
            channelsSubscribedToCount:{
                $size:"$subscribedTo"
            },
            isSubscribed:{
                $cond:{
                    if:{
                        $in:[req.user?._id,"$subscribers.subscriber",]
                    },
                    then:true,
                    else:false
                }
            }
        }
    },{
        $project:{//to select tthe specific value,,... all those field that we want to show should have value 1
        fullName:1,
        username:1,
        subscribersCount:1,
        channelsSubscribedToCount:1,
        isSubscribed:1,
        avatar:1,
        coverImage:1,
        email:1,

        }
    }])//every object over here denotes a pipeline
    
    if(!channel?.length)
    {
    throw new ApiError(404,"channel does not exist")
    }
    return res.status(200).json(new ApiResponse(200,channel[0],"user channel fetched successfully"))
})


export const getWatchHistory=asyncHandler(async(req,res)=>{
    const user=await User.aggregate([{
        $match:{
            _id: new mongoose.Types.ObjectId(req.user._id)
        }
    },{
        $lookup:{
            from:"videos",
            localField:"watchHistory",
            foreignField:"_id",
            as:"watchHistory",
            pipeline:[
                {
                    $lookup:{
                        from:"users",
                        localField:"owner",
                        foreignField:"_id",
                        as:"owner",
                        pipeline:[
                            {
                                $project:{
                                      fullName:1,
                                      username:1,
                                      avatar:1
                                }
                            }
                        ]
                    }
                },{
                    $addFields:{
                        owner:{
                            $first:"owner",

                        }
                    }
                }
            ]
        }
    },])

    return res.status(200).json(new ApiResponse(200,user[0].watchHistory,"watch history fetched successfully"))
})