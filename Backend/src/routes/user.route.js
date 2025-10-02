import { Router } from 'express'
import {
    login,
    logout,
    register,
    verify
} from '../controllers/user.controller.js'
import { body } from 'express-validator'
import { verifyUser } from '../middleware/auth.middleware.js';

const router = Router()

router.route('/register', [
    body('fullName.firstName')
        .isLength({ min: 3 }).withMessage('Invalid first name'),

    body('username')
        .isLength({ min: 3 }).withMessage('Invalid username')
        .trim(),

    body('email')
        .isEmail().withMessage('Invalid email'),
    body('password')
        .isLength({ min: 3 }).withMessage('Invalid password')
        .trim(),

    body('CNIC')
        .matches(/^[0-9]{13}$/).withMessage('Invalid CNIC')
        .trim(),

    body('phone')
        .matches(/^03[0-9]{9}$/).withMessage('Invalid phone number')
        .trim(),
])
    .post(register);
router.route('/login', [
    body('identifier').notEmpty().withMessage('invalid credentials'),
    body('password').notEmpty().withMessage('invalid password')
]).post(login)
router.route('/verify/:username', [
    body('verify').notEmpty().withMessage('verification code must be required'),
    body('username').notEmpty().withMessage('username must be required'),
], verify)
router.route('/logout').post(verifyUser, logout)

export default router