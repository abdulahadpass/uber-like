import mongoose from "mongoose";
import { PROJECT_NAME } from "../constant.js";

export async function connectDb() {
    try {
        const res = await mongoose.connect(`${process.env.MONGODB_URL}/${PROJECT_NAME}`
        )
        const connection = res.connection.host
        console.log(`MongoDb commection !! host ${connection}`);
    } catch (error) {
        console.log('MongoDb Connection Error', error);
        process.exit(1)
    }
}