import express from 'express'
import {
    changeAvatar,
    forgetPassword,
    getCurrentUser,
    login,
    logout,
    registerUser,
    resetPassword,
    verificationUser
} from '../controllers/user.controller.js'
import { upload } from '../middlewares/multer.middlerware.js'
import { verifyUser } from '../middlewares/auth.middleware.js'

const router = express.Router()

router.route('/sign-up').post(upload.single('avatar'), registerUser)
router.route('/verify/:username').post(verificationUser)
router.route('/sign-in').post(login)
router.route('/forget-password').post(forgetPassword)
router.route('/reset-password/:username').post(resetPassword)
router.route('/change-avatar').post(upload.single('avatar'), verifyUser, changeAvatar)
router.route('/get-user').post(verifyUser, getCurrentUser)
router.route('/logout').post(verifyUser, logout)

export default router