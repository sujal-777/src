import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";


export const verifyJWT = asyncHandler(async(req, _, next) => {
    try {
        const token = req.cookies?.accessToken | req.header("Authorization")?.replace("Bearer ","")
    
        if(!token) {
            throw new ApiError(401, "Unauthorized Request")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET
    
        )
     
        await User.findById(decodedToken?._id).select("-password -refreshToken")
    
    
        if(!user) {
            throw new ApiError(402,"Invalid Acces Tken" )
        }
        
        req.user = user;
        next()

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access token")
    }

})