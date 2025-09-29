import { Captain } from "../models/captain.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken'

export const verifyCaptain = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies.accessToken || req.header('Authorization').replace('Bearer ', '')
        if (token) {
            throw new ApiError(400, 'token not found')
        }
        const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_KEY)

        const findCaptain = await Captain.findById(decodeToken._id).select('-password')

        req.captain = findCaptain
        next()
    } catch (error) {
        console.log('error while verify captain');

    }
})