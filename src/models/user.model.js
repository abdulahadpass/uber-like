import mongoose from "mongoose";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
const userSchema = new mongoose.Schema({
    fullName: {
        firstName: {
            type: String,
            required: true,
            trim: true,
            minLength: [3, 'Minimun 3 character']
        },
        lastName: {
            type: String,
            required: true,
            trim: true,
            minLength: [3, 'Minimun 3 character']
        }
    },
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        match: [/.+\@.+\..+/, "please enter valid email"],
    },
    password: {
        type: String,
        required: true,
    },
    isVerified: {
        type: Boolean,
    },
    verifyCode: {
        type: String
    },
    verifyCodeExpiry: {
        type: Date
    },
    phone: {
        type: String,
        required: true,
        trim: true,
    },
    refreshToken: {
        type: String,
    },
    role: {
        type: String,
        enum: ['RIDER', 'DRIVER', 'ADMIN'],
        default: 'RIDER'
    },
    CNIC: {
        type: String,
        unique: true,
        trim: true,
        required: true,
    },
    socketId: {
        type: String
    }
}, { timestamps: true })

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next()
    this.password = await bcrypt.hash(this.password, 10)
    next()
})
userSchema.methods.isCorrectedPassword = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.accessTokens = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            phone: this.phone
        },
        process.env.ACCESS_TOKEN_KEY,
        {
            expiresIn: process.env.ACCESS_TOKEN_KEY_EXPIRY
        }
    )
}
userSchema.methods.refreshTokens = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_KEY,
        {
            expiresIn: process.env.REFRESH_TOKEN_KEY_EXPIRY
        }
    )
}

export const User = mongoose.model('User', userSchema)