import mongoose, { isValidObjectId } from "mongoose"
import Comment from "../models/comment.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import Like from "../models/like.model.js"
import Video from "../models/video.model.js"
export const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query


})

export const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId} = req.params
    const {content}=req.body
    if(!isValidObjectId(videoId))
    {
        throw new ApiError(400,"Invalid video id")
    }
    if(!content)
    {
        throw new ApiError(400,"Comment content is required")
    }
    const comment = await Comment.create({
        content,
        videoId,
        userId:req.user?._id
    })
    if(!comment)
    {
        throw new ApiError(400,"failed to create the comment")
    }
    const {username,avatar,fullName,_id}=req.user
    const commentData={
        commentId:comment._id,
        owner:{username,avatar,fullName,_id}
    }
    return res.status(200).json(new ApiResponse(200,commentData,"comment successfully uploaded"))
})

export const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params
    const {content}=req.body
     const comment=await Comment.findById(commentId)
     if(!comment)
     {
        throw new ApiError(400,"comment not found")
     }
     if(!content)
        throw new ApiError(400,"please write your comment")
    
     const updatedComment=await Comment.findByIdAndUpdate(
        commentId,
        {
            $set:{
        content:content,
            }
        },{new:true});
        if(!updatedComment)
        {
            throw new ApiError(400,"comment wasnt updated")
        }
        return res.status(200).json(new ApiResponse(200,updatedComment,"comment updated successfully"))

})

export const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId}=req.params
   
    if(!commentId)
    {
        throw new ApiError(400,"comment id is required")
    }
    if(!isValidObjectId(commentId))
        throw new ApiError(400,"invalid comment Id")
    const comment=await Comment.findById(commentId)
    if(!comment)
    {
        throw new ApiError(400,"comment not found")
    }
   const deletedComment=await Comment.findByIdAndDelete(comment)
   if(!deletedComment)
   {
    throw new ApiError(400,"failed to delete comment")
   }
   const deleteLikes=await Like.deleteMany({
    comment:new mongoose.Types.ObjectId(commentId)
   })
   return res
    .status(200)
    .json(
      new ApiResponse(200, { isDeleted: true }, "Comment deleted successfully")
    );
})

