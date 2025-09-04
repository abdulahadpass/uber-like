import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from 'jsonwebtoken'
export const verifyUser = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies.accessToken || req.header('Authentication')?.replace('Bearer ', '')
console.log(token);

        if (!token) {
            throw new ApiError(400, 'Unauthorize request')
        }

        const decodeToken = jwt.decode(token, process.env.ACCESS_TOKEN_KEY)
        if (!decodeToken) {
            throw new ApiError(400, 'Token not authorize')
        }
        const user = await User.findById(decodeToken?._id).select('-password -refreshToken')
        req.user = user
        next()
    } catch (error) {
        console.log('Error While authorize request',error);

    }
})