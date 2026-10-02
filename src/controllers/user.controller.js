import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"; 
import  {User}  from "../models/user.model.js";
import {uploadcloudinary} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
const registerUser = asyncHandler( async (req, res) => {
    // get user details from frontend
    //validation if empty or in correct format
    //check if user already exists : username, email
    // check for images, check for avatar
    // upload them to cloduinary, avatar
    // create user object - create ewntry in db
    //remove password and refresh token field from response
    // check for user creation 
    // return response

    const {fullname, email, username, password} = req.body
    console.log("email: ", email);
    
    if(
        [fullname, email, username, password].some((field) =>
             field?.trim() === "") )
    {
       throw new ApiError(400, "all fields are required")
    }
    const existedUser = await User.findOne({
        $or: [{email}, {username}]
    })
    if(existedUser){
        throw new ApiError(409, "User with email or username already exists")
    }
    console.log(req.files);

    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

     let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
       coverImageLocalPath = req.files.coverImage[0].path
    }

    
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadcloudinary(avatarLocalPath)
    //const coverImage = await uploadcloudinary(coverImageLocalPath)
    
   
    if(!avatar){
        throw new ApiError(400, "AVatr file is reqd")
    }

    User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })
    const createdUser = await User.findId(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500, "Something went wrong in creation of user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User rsistered Successfully")
    )
})

//methods for token
const generateAccessAndRefreshTokens = async(userId)=>{
    try{
      const user = await User.findById(userId)
      const accessToken = user.generateAccessToken()
      const refreshToken = user.generateRefreshToken()

      user.refreshToken = refreshToken
      await user.save({validateBeforeSave : false })

      return {accessToken, refreshToken}

    } catch(error){
        throw new ApiError(500, "Something went wrong while generating refresh and access tokens")
    }
}
const loginUser = asyncHandler( async (req, res)=>{
    //req body-> data
    // username or email
    // find the usernpm
    // password check
    // access and refresh token
    // send cookie

    const {email, username, password} = req.body

    if(!usernam || !email)
      {  throw new ApiError(400, "username or email is required");
      }
      const user = await User.findOne({
        $or: [{username}, {email}]
      })

      if(!user){
        throw new ApiError(404, "User does not exist");
      }

      const isPasswordValid = await user.isPasswordCorrect(password)

      if(!isPasswordValid){
        throw new ApiError(401, "Invalid user credentials");
      }

      const {accesToken, refreshToken}=  await generateAccessAndRefreshTokens(user._id)

      const loggedInUser = await User.findById(user._id).
      select("-password -refreshToken")

      const options = {
        httpOnly : true,
        secure : true
      }
      return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken,
                refreshToken
            },
            "User logged in successfully"
        )
      )
})

const logoutUser = asyncHandler(async (req, res)=>{
    // find user
    //remove cookie
    //remove access and refresh tokens
 await User.findByIdAndUpdate(
    req.user._id,{
        $set: {
            refreshToken: undefined
        },
    },
        {
            new: true
        }
  )
   const options = {
        httpOnly : true,
        secure : true
      }
      return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json( new ApiResponse(200, {}, "User logged out successfully") )    
})

const refreshAccessToken = asyncHandler(async (req, res) =>{
    const incomingRefreshToken = req.cookies
    .refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized request")
    }

    const decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET,
    )

    const user = await User.findById(decodedToken?._id)

    if(!user){
        throw new ApiError(401, "Invalid refresh token")
    }
    if(incomingRefreshToken != user?.refreshToken){
    throw new ApiError(401, "Refresh token is expired or used")
    }

    const options ={
        httpsOnly : true,
        secure: true
    }
 try{
    const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
    
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
        new ApiResponse(
            200,
            {accessToken, refreshToken: newRefreshToken},
            "Access token refreshed"
        )
    )}
    catch (error){
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})

export {registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}