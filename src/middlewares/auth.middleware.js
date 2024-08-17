import  ApiError  from "../utils/ApiError.js";
import  asyncHandler  from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import  User  from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            console.log("Token not found in request");
            throw new ApiError(401, "Unauthorized request");
        }

        const decodedTokenInfo = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedTokenInfo?._id).select("-password -refreshToken");

        if (!user) {
            console.log("User not found with the provided token");
            throw new ApiError(401, "Invalid access token");
        }

        req.user = user;
        next();
    } catch (error) {
        console.log("Error in verifyJwt middleware:", error.message);
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});