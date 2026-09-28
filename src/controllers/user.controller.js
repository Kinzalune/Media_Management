import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError, APiError} from "../utils/ApiError.js"; 
import { User } from "../models/user.model.js";
import {uploadcloudinary} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js"
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
        [fullName, email, username, password].some((field) =>
             field?.trim() === "") )
    {
       throw new ApiError(400, "all fields are required")
    }
    const existedUser = User.findOne({
        $or: [{email}, {username}]
    })
    if(existedUser){
        throw new ApiError(409, "User with email or username already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadCloudinary(avatarLocalPath)
    const coverImage = await uploadCloudinary(coverImageLocalPath)

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

export {registerUser}