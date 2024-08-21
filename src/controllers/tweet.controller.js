import mongoose, { isValidObjectId } from "mongoose"
import Tweet from "../models/tweet.model.js"
import User from "../models/user.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import Like from "../models/like.model.js"

export const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {tweet}=req.body;
    if(!tweet)
    {
       throw new ApiError(400,"Tweet is required")
    }
    const createTweet=await Tweet.create({
        tweet:tweet,
        owner:req.user._id
    })
    if(!createTweet)
    {
        throw  new ApiError(400,"tweet not created")
    }
    return res.status(201).json(new ApiResponse(201,createTweet,"Tweet created successfully"))
})

export const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
})

export const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId}=req.params
    const {tweet}=req.body;
    if(!tweetId)
        throw new ApiError(400,"tweet id is mandatory")
    if(!isValidObjectId(tweetId))
    {
        throw new ApiError(400,"tweet id is not valid")
    }
    if(!tweet)
        throw new ApiError(400,"please enter your tweet")

    const updatedTweet=await Tweet.findByIdAndUpdate(tweetId,{
        $set:{
        tweet:tweet
        }
    },{new:true})

    if(!updatedTweet)
    {
        throw new ApiError(400,"tweet not updated")
    }
    return res.status(200).json(new ApiResponse(200,updatedTweet,"Tweet updated successfully"))
})

export const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId}=req.params
    if(!tweetId)
    {
        throw new ApiError(400,"tweet id is mandatory")
    }
    if(!isValidObjectId(tweetId))
        {
            throw new ApiError(400,"tweet id is not valid")
            }
            const deletedTweet=await Tweet.findByIdAndDelete(tweetId)
            if(!deletedTweet)
            {
                throw new ApiError(400,"tweet not deleted")
            }
            const deleteLikes = await Like.deleteMany({
                tweet: new mongoose.Types.ObjectId(tweetId),
              });
            
            return res.status(200).json(new ApiResponse(200,deletedTweet,"Tweet deleted successfully"))
})

