import express from 'express'
import {
    login,
    registerUser,
    verificationUser
} from '../controllers/user.controller.js'
import { upload } from '../middlewares/multer.middlerware.js'

const router = express.Router()

router.route('/sign-up').post(upload.single('avatar'), registerUser)
router.route('/verify/:username').post(verificationUser)
router.route('/sign-in').post(login)


export default router