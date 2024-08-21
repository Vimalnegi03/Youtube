import mongoose, {isValidObjectId} from "mongoose"
import Playlist from "../models/playlist.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"


export const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    
    //TODO: create playlist
    if(!name)
        throw new ApiError(400,"please enter the name of your playlist")
    if(!description)
        throw new ApiError(400,"please provide the description of playlist")
    const playlist=await Playlist.create({name,description,owner:req.user._id})
    if(!playlist)
    {
        throw new ApiError(400,"failed to create playlist")
    }
    return res.status(201).json(new ApiResponse(200,playlist,"playlist created successfully"))

})

export const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
})

export const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
})

export const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Please give valid id");
      }
    
      const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
          $addToSet: {
            videos: videoId,
          },
        },
        {
          new: true,
        }
      );
    
      if (!playlist)
        throw new ApiError(500, "Error while adding video to playlist");
    
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { isAdded: true },
            "Video added to playlist successfully"
          )
        );
})

export const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    if(!playlistId||!videoId)
        throw new ApiError(400, "Please give valid id");
    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
          $pull: {
            videos: videoId,
          },
        },
        {
          new: true,
        }
      );
    
      if (!playlist)
        throw new ApiError(500, "Error while removing video from playlist");
    
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { isSuccess: true },
            "Video removed from playlist successfully"
          )
        );

})

export const deletePlaylist = asyncHandler(async (req, res) => {
  
    // TODO: delete playlist
    const { playlistId } = req.params;

  if (!playlistId) {
    throw new ApiError(400, "Playlist Id not found");
  }
  if (!mongoose.Types.ObjectId.isValid(playlistId)) {
    throw new ApiError(400, "Playlist Id not valid");
  }

  const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);
  if (!deletedPlaylist) {
    throw new ApiError(400, "Playlist Not found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, deletedPlaylist, "playlist deleted successfully")
    );
})

export const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
})

