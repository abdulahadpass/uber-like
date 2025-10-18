import { validationResult } from "express-validator";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)

        const accessToken = user.accessTokens()
        console.log(accessToken);

        const refreshToken = user.refreshTokens()
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (error) {
        console.log('Error while createing tokens', error);

    }
}
const register = asyncHandler(async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const { username, email, password, fullName, CNIC, phone } = req.body
    if ([username, email, password, fullName, CNIC, phone].some((fields) => fields === '')) {
        throw new ApiError(400, 'fields must be required')
    }
    const createdUser = await User.create({
        fullName: {
            firstName: fullName.firstName,
            lastName: fullName.lastName,
        },
        username: username.trim(),
        email: email.trim(),
        password,
        CNIC,
        phone
    })
    if (!createdUser) {
        throw new ApiError(400, 'user not created')
    }

    const user = await User.findById(createdUser._id).select('-password -refreshToken')

    return res.status(201).json(
        new ApiResponse(201, 'user created successfully', user)
    )

})
const login = asyncHandler(async (req, res) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        throw new ApiError(400, { errors: errors.array() })
    }
    const { identifier, password } = req.body
    if ([identifier, password].some((fields) => fields === '')) {
        throw new ApiError(400, 'invalid credentials')
    }

    const findUser = await User.findOne({
        $or: [
            {
                username: identifier.trim()
            },
            {
                email: identifier.trim()
            }
        ]
    })
    if (!findUser) {
        throw new ApiError(400, 'please enter the valid credentials')
    }

    const validPassword = await findUser.isCorrectedPassword(password)
    if (!validPassword) {
        throw new ApiError(400, 'password is not correct')
    }

    const { accessToken, refreshToken } = await generateAccessRefreshToken(findUser._id)

    const user = await User.findById(findUser._id).select('-password -refreshToken')
    const options = {
        httpOnly: true,
        secure: false,
         sameSite: 'none'
    }
    return res.status(200)
        .cookie('accessToken', accessToken, options)
        .cookie('refreshToken', refreshToken, options)
        .json(
            new ApiResponse(200, 'user login Successfully', {
                user,
                accessToken
            })
        )



})
const verify = asyncHandler(async (req, res) => {
    const { verify, username } = req.body

    if ([verify, username].some((fields) => fields.trim() === '')) {
        throw new ApiError(400, 'credential must be required')
    }

    const findUser = await User.findOne({ username })
    if (!findUser) {
        throw new ApiError(400, 'user not found')
    }

    if (findUser.verifyCode.toString() !== verify.toString()) {
        throw new ApiError(400, 'code is not correct')
    }
    findUser.isVerified = true
    findUser.verifyCode = undefined
    findUser.verifyCodeExpiry = undefined
    await findUser.save()

    return res.status(200).json(
        new ApiResponse(200, 'User verification successfull')
    )
})
const logout = asyncHandler(async (req, res) => {
    const user = req.user._id
    const userData = await User.findByIdAndUpdate(user, {
        $unset: {
            refreshToken: 1
        }
    }, { new: true })
    if (!userData) {
        throw new ApiError(400, 'user not found')
    }
    return res.status(200)
        .clearCookie('accessToken')
        .clearCookie('refreshToken')
        .json(
            new ApiResponse(
                200,
                'logoutt successfull',
                {}
            )
        )
})
const refreshAccessToken = asyncHandler(async (req, res) => {
    const user = req.user._id
    const { accessToken, refreshToken } = await generateAccessRefreshToken(user)
    const options = {
        httpOnly: true,
        secure: true
    }
    return res.status(200)
        .cookie('accessToken', accessToken, options)
        .cookie('refreshToken', refreshToken, options)
        .json(
            new ApiResponse(200, 'new AccessToken is generated succesfully', {
                user,
                accessToken,
                refreshToken
            })
        )
})
export {
    register,
    login,
    verify,
    refreshAccessToken,
    logout
}