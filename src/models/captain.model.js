import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
const captainSchema = new mongoose.Schema({
    fullName: {
        firstName: {
            type: String,
            required: true,
            trim: true,
            minlegth: [3, 'Minimun 3 character']
        },
        lastName: {
            type: String,
            required: true,
            trim: true,
            minlegth: [3, 'Minimun 3 character']
        }
    },
    email: {
        type: String,
        required: true,
        trim: true,
        match: [/.+\@.+\..+/, "please enter valid email"],
        unique: true,
    },
    password: {
        type: String,
        required: true,

    },
    socketId: {
        type: String,

    },
    status: {
        type: Boolean,
        default: 'INACTIVE',
        enum: ['ACTIVE', 'INACTIVE', 'BUSY']
    },
    phone: {
        type: String,
        required: true,
    },
    vehicle: {
        color: {
            type: String,
            required: true,
            minlegth: [3, 'minimu 3 character']
        },
        plate: {
            type: String,
            required: true,
            minlegth: [3, 'minimu 3 character']
        },
        capacity: {
            type: String,
            required: true,
            minlegth: [3, 'minimu 3 character']
        },
        vehicleType: {
            type: String,
            required: true,
            minlegth: [1, 'minimu 3 character']
        }
    },
    location: {
        lat: {
            type: Number,
        },
        log: {
            type: Number
        }
    },
    refreshToken : {
        type : String
    }
}, { timestamps: true })

captainSchema.methods.accessToken = function () {
    return jwt.sign({
        _id: this._id,
        email: this.email,
        password: this.password
    }, process.env.ACCESS_TOKEN_KEY,
        { expiresIn: process.env.ACCESS_TOKEN_KEY_EXPIRY }
    )
}
captainSchema.methods.refreshTokens = function () {
    return jwt.sign({
        _id: this._id,

    }, process.env.REFRESH_TOKEN_KEY,
        { expiresIn: process.env.REFRESH_TOKEN_KEY_EXPIRY }
    )
}

captainSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next()
    this.password = await bcrypt.hash(this.password, 10)
})
captainSchema.methods.isCorrrectedPassword = async function (password) {
    return await bcrypt.compare(password, this.password)
}

export const Captain = mongoose.model('Captain', captainSchema)
