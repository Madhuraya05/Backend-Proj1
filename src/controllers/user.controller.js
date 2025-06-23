import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from '../utils/ApiError.js'
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../models/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser=asyncHandler( async (req,res,next)=>{
    // get user details from frontend
    // validate - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    const {fullName,email,username,password}=req.body()

    if ([fullName,email,username,password].some((field)=> field?.trim()==="")){
        throw new ApiError(400,"All field are required")
    }
    if (!email.includes("@")){
        throw new ApiError(400,"Email not valid")
    }

    const existedUser=User.findOne({
        $or:[{ email },{ username }],
    })
    if (existedUser){
        throw new ApiError(409,"User already exist")
    }
    // localpath with multer 
    const avatarLocalPath=req.files?.avatar[0]?.path;
    const coverImageLocalPath=req.files?.coverImage[0]?.path;
    if (!avatarLocalPath){
        throw new ApiError(400,"Avatar image is required")
    }
    // cloudinary operaions
    const avatar=uploadOnCloudinary(avatarLocalPath)
    const coverImage=uploadOnCloudinary(coverImageLocalPath)
    if (!avatar){
        throw new ApiError(400,"Avatar required")
    }
    // uer create via userSchemamodel
    const user=await User.create({
        fullName,
        email,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        username:username.toLowerCase(),
        password,
    })
    const createdUser= await User.findById(user._id).select("-password -refreshToken")
    if (!createdUser){
        throw new Error(500,"Something went wrong on the server side")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User is registered")
    )
})

export {registerUser}