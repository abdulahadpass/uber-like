import express from 'express'
import {
    forgetPassword,
    login,
    registerUser,
    resetPassword,
    verificationUser
} from '../controllers/user.controller.js'
import { upload } from '../middlewares/multer.middlerware.js'

const router = express.Router()

router.route('/sign-up').post(upload.single('avatar'), registerUser)
router.route('/verify/:username').post(verificationUser)
router.route('/sign-in').post(login)
router.route('/forget-password').post(forgetPassword)
router.route('/reset-password/:username').post(resetPassword)

export default router