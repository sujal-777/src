import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
 

const generateAccessAndRefereshTokens = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave : false})

        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wront while generating referesh and Access token")
    }
}

const registerUser = asyncHandler( async (req, res) => {
    //get user details
    //validation
    //check user if already exist - email, username
    //check for images ,  avatar
    //upload them to cloudinary, avatar
    //create user objects
    //remove passsword and refresh token
    //check for user creation
    //return res

    const {fullname, email, username, password} = req.body 

    if (
        [fullname,email, username, password]
        .some((field) =>
        field?.trim() === ""
        )
    ) {
        throw new ApiError(400, "All fields are required and compulsory")
    }
    

    const existedUser = await User.findOne({
        $or: [{email},{username}]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exist")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;

    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }



    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath) 
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage : coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase(),

    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if (!createdUser) {
        throw new ApiError(500, "Error while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser,"User Registered Successfully")
    )




})

const loginUser = asyncHandler( async (req, res) => {
    //check with username - email
    //find the User
    //validate with password
    //data -> req body
    //access and refresh token 
    //send cookies 
    //response - for successfully login

    const {email, username, password} = req.body

    if (!(username || email)) {
        throw new ApiError(400, "username or email is required!")
    }

    const user = await User.findOne({
        $or : [{username} , {email}]
    })

    if (!user) {
        throw new ApiError(404, "User does not Exist")
    }

    const isPasswordValid =  user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid username or password")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const option = {
        httpOnly : true,
        secure : true
    }

    return res.status(200)
    .cookie("accessToken", accessToken, option)
    .cookie("refreshToken", refreshToken, option)
    .json(
        new ApiResponse (
            200, {
                user : loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )

})


const logoutUser = asyncHandler(async (req, res) => {
    //cokkies remover 
    //refresh token

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set : {
                refreshToken : undefined
            }
        },
        {
            new :true
        }
    )

    const option = {
        httpOnly : true,
        secure : true
    }

    return res
    .status(200)
    .clearCookie("AccessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
     
})


export {registerUser,
    loginUser,
    logoutUser
} 