import mongoose from "mongoose";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
const userSchema = new mongoose.Schema({
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
    avatar : {
        type : String,
        required : true
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
    Licence: {
        type: String,
        unique: true,
        trim: true
    },
    vehcile: {
        image: String,
        make: String,
        model: String,
        plateNumber: String
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
  return  jwt.sign(
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
  return  jwt.sign(
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