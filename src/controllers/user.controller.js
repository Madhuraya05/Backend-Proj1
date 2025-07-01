import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from '../utils/ApiError.js'
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../models/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}

    } catch (error) {
        console.log(error)
        throw new ApiError(500,"something went wrong while generating access and refresh token")
    }
} 

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

    const {fullName,email,username,password}=req.body;
    console.log("req.files:", JSON.stringify(req.files, null, 2));


    if ([fullName,email,username,password].some((field)=> field?.trim()==="")){
        throw new ApiError(400,"All field are required")
    }
    if (!email.includes("@")){
        throw new ApiError(400,"Email not valid")
    }

    const existedUser=await User.findOne({
        $or:[{ email },{ username }],
    })
    if (existedUser){
        throw new ApiError(409,"User already exist")
    }
    // localpath with multer 

    
    const avatarLocalPath=req.files?.avatar[0]?.path;
    // const coverImageLocalPath=req.files?.coverImage[0]?.path;

    let coverImageLocalPath = null;

    if (
      req.files &&
      req.files.coverImage &&
      Array.isArray(req.files.coverImage) &&
      req.files.coverImage.length > 0
    ) {
      coverImageLocalPath = req.files.coverImage[0].path;
    }

    if (!avatarLocalPath){
        throw new ApiError(400,"Avatar image is required")
    }

    // cloudinary operaions
    const avatar=await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    console.log(avatar)
    console.log(coverImage)
    if (!avatar){
        throw new ApiError(400,"Avatar required")
    }

    // uer create via userSchemamodel takes method
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

const loginUser=asyncHandler(async (req,res,next)=>{
    const {username,email,password}=req.body

    if (!username && !email){
        throw new ApiError(400,"username or email is required")
    }

    const user=await User.findOne({
        $or:[{email},{username}]
    })
    if (!user){
        throw new ApiError(404,"user not founnnd")
    }

    const passwordValid=await user.isPasswordCorrect(password)
    if (!passwordValid){
        throw new ApiError(401,"password not match ")
    }
    console.log(user)
    const {accessToken,refreshToken}=await generateAccessAndRefereshTokens(user._id)

    const loggedInUser= await User.findById(user._id).select("-password -refreshToken")

    const options={
        httpoOnly:true,
        secure:true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user:loggedInUser,accessToken,refreshToken
            },
            "user looged in successfully"
        )
    )

})
const logoutUser=asyncHandler(async (req,res,next)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            refreshToken:undefined
        },
        {
            new:true,
        }
    )
    const options={
        httpoOnly:true,
        secure:true
    }
    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new ApiResponse(
            200,
            {},
            "logging out successful"
        )
    )
})

export {registerUser,loginUser,logoutUser}