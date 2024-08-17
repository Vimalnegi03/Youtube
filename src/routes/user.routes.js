import { Router } from "express";
import { registerUser,loginUser,logoutUser, refreshAccessToken } from "../controllers/user.controller.js";
//for file handling
import {upload} from "../middlewares/multer.middleware.js";

import  {verifyJWT} from "../middlewares/auth.middleware.js";
const userRouter=Router()

userRouter.route("/register").post(upload.fields([
    {
       name:"avatar",
       maxCount:1
    },
    {
       name:"coverImage",
       maxCount:1
    }
]),registerUser)
// userRouter.route("/login").post(login)
userRouter.route("/login").post(loginUser)


//secured methods
userRouter.route("/logout").post(verifyJWT,logoutUser)
userRouter.route("refresh-token").post(refreshAccessToken)
export default userRouter