import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken'
export const verifyUser = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies.accessToken || req.header('Autherization')?.replace('Bearer ', '')
        if (!token) {
            throw new ApiError(401, 'Unautherized request : token not provided')
        }
        const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_KEY)
        if (!decodeToken) {
            throw new ApiError(401, 'Unautherized request : token not verified')
        }
        const user = await User.findById(decodeToken._id).select('-password -refreshToken')
        if (!user) {
            throw new ApiError(401, 'Unautherized request : user not found')
        }

        req.user = user
        next()
    } catch (error) {
        console.log(error, 'error while authentication');

    }
})