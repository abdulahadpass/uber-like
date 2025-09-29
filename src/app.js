import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
const app = express()

app.use(cors(
    {
        origin: process.env.CORS, credentials: true
    }
))
app.use(express.json({ limit: '16kb', }))
app.use(express.urlencoded({ limit: '16kb' }))
app.use(express.static('public'))
app.use(cookieParser())


export { app }


//import routers

import userRouter from './routes/user.route.js'
import captainRouter from './routes/captain.route.js'

app.use('/api/v1/users', userRouter )
app.use('/api/v1/captains', captainRouter)
