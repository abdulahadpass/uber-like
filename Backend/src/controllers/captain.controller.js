import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { validationResult } from "express-validator";
import { Captain } from "../models/captain.model.js";


const generatedAccessTokenRefresToken = async (captainId) => {
    try {
        const captain = await Captain.findById(captainId)
        const accessToken = captain.accessToken()
        const refreshToken = captain.refreshTokens()

        captain.refreshToken = refreshToken
        await captain.save({ validateBeforeSave: false }
        )
        return { accessToken, refreshToken }
    } catch (error) {
        console.log('error while creatinf token', error);

    }
}
const registerCaptian = asyncHandler(async (req, res) => {
    const error = validationResult(req)
    if (!error.isEmpty()) {
        throw new ApiError(400, { errors: error.array() })
    }
    const { fullName, email, password, phone, vechile } = req.body

    const findCaptain = await Captain.findOne({ email: email.trim() }, { phone })
    if (findCaptain) {
        throw new ApiError(400, 'captain already exist and please choose a unique phone number')
    }
    if ([fullName, email, password, phone, vechile].some((fields) => fields === '')) {
        throw new ApiError(400, 'fields must be required')
    }
    const createdCaptain = await Captain.create({
        fullName: {
            firstname: fullName.firstname,
            lastName: fullName.lastName
        },
        email: email.trim(),
        password,
        phone,
        vechile: {
            color: vechile.color,
            plate: vechile.plate,
            capacity: vechile.capacity,
            vechileType: vechile.vechileType
        }
    })
    if (!createdCaptain) {
        throw new ApiError(400, 'captain not created')
    }
    const captain = await Captain.findById(createdCaptain._id).select('-password -refreshToken')
    return res.status(201).json(
        new ApiResponse(201, 'captain created successfully', captain)
    )
})
const loginCaptain = asyncHandler(async (req, res) => {
    const error = validationResult(req)
    if (!error.isEmpty()) {
        throw new ApiError(400, { errors: error.array() })
    }

    const { email, password } = req.body()
    if ([email, password].some((fields) => fields === '')) {
        throw new ApiError(400, 'fields must be required')
    }

    const findCaptain = await Captain.findOne({ email: email.trim() })
    if (findCaptain) {
        throw new ApiError(400, 'captain not found')
    }

    const checkPassword = await findCaptain.isCorrrectedPassword(password)
    if (!checkPassword) {
        throw new ApiError(400, 'invalid password')
    }
    const { accessToken, refreshToken } = await generatedAccessTokenRefresToken(findCaptain._id)

    const options = {
        httpOnly: true,
        secure: true
    }
    res.status(200)
        .cookie('accessToken', accessToken, options)
        .cookie('refreshToken', refreshToken, options)
        .json(
            new ApiResponse(200, ' captain login', {
                captain: findCaptain,
                accessToken,
                refreshToken
            })
        )
})
const getCaptainProfile = asyncHandler(async (req, res) => {
    return res.status(200).json(
        new ApiResponse(200, 'captain profile', req.captain)
    )
})
const refreshAccessToken = asyncHandler(async (req, res) => {
    const { accessToken, refreshToken } = generatedAccessTokenRefresToken(req.captain._id)
    const options = {
        httpOnly: true,
        secure: true,
    }
    return res.status(200)
        .cookie('accessToken', accessToken, options)
        .cookie('refreshToken', refreshToken, options)
        .json(
            new ApiResponse(200, 'token refresh',
                {
                    captain: req.captain,
                    accessToken,
                    refreshToken
                }
            )
        )
})
const logoutCaptain = asyncHandler(async (req, res) => {
    const captain = await Captain.findByIdAndUpdate(req.captain._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        { new: true }
    )
    return res.status(200)
        .clearCookie('accessToken')
        .clearCookie('refreshToken')
        .json(
            new ApiResponse(200, 'Logout successsfully')
        )
})
const updateStatus = asyncHandler(async (req, res) => {
    const findCaptain = await Captain.findById(req.captain._id)
    if (!findCaptain) {
        throw new ApiError(400, 'captian not found')
    }
    findCaptain.status = !findCaptain.status
    await findCaptain.save()
    return res.stauts(200).json(
        new ApiResponse(200, 'status updated', findCaptain.status)
    )

})
export {
    registerCaptian,
    loginCaptain,
    getCaptainProfile,
    refreshAccessToken,
    logoutCaptain,
    updateStatus
}