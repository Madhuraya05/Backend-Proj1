import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import JWT from "jsonwebtoken"

export const verifyJWT=asyncHandler(async (req,res,next)=>{
    try {
        const token=req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
        if (!token){
            throw new ApiError(402,"Unortherized request")
        }
    
        const decodedtoken=JWT.verify(token,process.env.ACCESS_TOKEN_SECRET)
        const user=await User.findById(decodedtoken?._id).select("-password -refreshToken")
        if (!user){
            throw new ApiError(401,"Invalid access token")
        }
    
        req.user=user
        next()
    } catch (error) {
        throw new ApiError(401,"Invalid access token")
    }
})

