class ApiError extends Error{
 construstor(
    statusCode = 400,
    message = 'Something wents wrong',
    error = [],
    stack,
 ){
    super(message)
    this.statusCode= statusCode
    this.message = message
    this.error = error
    this.success = false
    this.data = null

    if(stack){
        this.stack = stack
    }else{
        this.stack = Error.captureStackTrace(this, this.construstor)
    }
}   
}
export {ApiError}