import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";


const registerUser = asyncHandler((req, res)=>{
    const {username, email, password} = req.body
    if([username, email, password].some((field)=>field.trim()==="")){
        return ApiError(400, 'Please fill all the Input')
    }

})

export {
    registerUser
}