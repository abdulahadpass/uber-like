import express from 'express'
import { verifyUser } from '../middleware/auth.middleware.js'
import { getCoordinates, getSuggestion, getTimeandDistance } from '../controllers/map.controller.js'

const router = express.Router()

router.route('/getCoordinates').get(verifyUser, getCoordinates)
router.route('/getTimeAndDistance').get(verifyUser, getTimeandDistance)
router.route('/getSuggestion').get(verifyUser, getSuggestion)

export default router