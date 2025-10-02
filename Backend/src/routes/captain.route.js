import express, { Router } from 'express'
import { body } from 'express-validator'
import {
    getCaptainProfile,
    loginCaptain,
    logoutCaptain,
    refreshAccessToken,
    registerCaptian,
    updateStatus
} from '../controllers/captain.controller.js'
import { verifyCaptain } from '../middleware/captain.middleware.js'
const router = Router()


router.route('/register', [
    body('fullName.firstName').isLength({ min: 3 }).withMessage('Invalid first name'),
    body('email').isLength({ min: 3 }).withMessage('Invalid email'),
    body('password').isLength({ min: 3 }).withMessage('Invalid password'),
    body('phone').isLength({ min: 3 }).withMessage('Invalid phone'),
    body('vechile.color').isLength({ min: 3 }).withMessage('Invalid vechile color'),
    body('vechile.plate').isLength({ min: 3 }).withMessage('Invalid vechile plate'),
    body('vechile.capacity').isLength({ min: 3 }).withMessage('Invalid vechile capacity'),
    body('vechile.vechileType').isLength({ min: 3 }).withMessage('Invalid vechile type'),
]).post(registerCaptian)

router.route('login', [
    body('email').isLength({ min: 3 }).withMessage('Invalid email'),
    body('password').isLength({ min: 3 }).withMessage('Invalid password'),
]).post(loginCaptain)

router.route('/getCaptain').get(verifyCaptain, getCaptainProfile)
router.route('/logout').get(verifyCaptain, logoutCaptain)
router.route('/tokens').post(verifyCaptain, refreshAccessToken)
router.route('/status').post(verifyCaptain, updateStatus)
export default router