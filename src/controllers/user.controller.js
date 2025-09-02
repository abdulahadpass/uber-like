import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCLoudinary } from "../utils/cloudinary.js";
import { sendVerifcationEmail } from "../helper/sendVerification.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const generateTokens = async (userId) => {
    try {
        const session = await User.findById(userId)
        const accessTokens = session.accessTokens()
        const refreshTokens = session.refreshTokens()
        await session.save({ validateBeforeSave: false })
        return { accessTokens, refreshTokens }
    } catch (error) {
        console.log('Error while generating token', error);

    }
}

const registerUser = asyncHandler(async (req, res) => {

    const { username, email, password, phone, CNIC } = req.body
    if ([username, email, password, phone].some((field) => field.trim() === "")) {
        return ApiError(400, 'Please fill all the Input')
    }

    const localFilePath = req.file?.path
    if (!localFilePath) {
        throw new ApiError(400, 'File Path is missing')
    }

    const avatar = await uploadOnCLoudinary(localFilePath)
    if (!avatar) {
        throw new ApiError(400, 'Please select the avatar')
    }
    const existedUser = await User.findOne({
        $or: [{
            username: username.trim(),
            email: email.trim()
        }]
    })

    const verificationCode = Math.floor(
        100000 + Math.random() * 900000
    ).toString();
    if (existedUser) {
        if (existedUser.isVerified) {
            throw new ApiError(400, 'User is already verified')
        } else {
            existedUser.verifyCode = verificationCode
            existedUser.verifyCodeExpiry = new Date(Date.now() + 3600000)
            await existedUser.save()
        }
    } else {
        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + 1);
        await User.create(
            {
                username: username.trim(),
                email: email.trim(),
                password,
                phone,
                avatar: avatar.url || "",
                CNIC,
                verifyCode: verificationCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
            }
        )
    }
    const user = await User.findById(existedUser._id).select('-password -refreshToken')
    // verification email
    const emailResponse = await sendVerifcationEmail(username, email, verificationCode)
    if (!emailResponse) {
        throw new ApiError(400, 'Verification email not successfull')
    }
    return res.json(
        new ApiResponse(201, 'User created Successfully', user)
    )
})
const verificationUser = asyncHandler(async (req, res) => {
    const { username } = req.params
    const { verifyCode } = req.body
    if (!username) {
        throw new ApiError(400, 'username must be required')
    }
    if (!verifyCode) {
        throw new ApiError(400, 'verify code must be required')
    }
    const findUser = await User.findOne({ username })

    if (!findUser) {
        throw new ApiError(400, 'user not existed')
    }
    const validDate = new Date(findUser.verifyCodeExpiry) > new Date()

    if (verifyCode.toString() === findUser.verifyCode && validDate) {
        findUser.isVerified = true
        await findUser.save()
    } else if (!validDate) {
        findUser.verifyCode = ''
        await findUser.save()
        throw new ApiError(400, 'Code is Expired')
    } else {
        throw new ApiError(400, 'Code is not valid')
    }

    findUser.verifyCode = undefined
    findUser.verifyCodeExpiry = undefined
    await findUser.save()
    return res.json(
        new ApiResponse(201, 'Verification successfull')
    )

})
const login = asyncHandler(async (req, res) => {
    const { identifier, password } = req.body
    if ([identifier, password].some((fields) => fields.trim() === '')) {
        throw new ApiError(400, 'Credentials must be required')
    }

    const user = await User.findOne({
        $or: [
            { username: identifier.trim() },
            { email: identifier.trim() }
        ]
    })

    const validatePassword = user.isCorrectedPassword(password)

    if (!validatePassword) {
        throw new ApiError(400, 'Password is invalid')
    }

    const { accessTokens, refreshTokens } = await generateTokens(user._id)

    const findUser = await User.findById(user._id).select('-password -refreshToken')

    const options = {
        httpOnly: true,
        sesure: true
    }
    return res.status(200)
        .cookie('accessToken', accessTokens, options)
        .cookie('refreshTokens', refreshTokens, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: findUser,
                    accessTokens,
                    refreshTokens
                },
                'User Logged In'
            )
        )

})

export {
    registerUser,
    verificationUser,
    login
}