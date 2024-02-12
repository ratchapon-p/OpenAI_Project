const asyncHandler = require('express-async-handler')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
//------ Is Authenticated middleware
const isAuthenticated = asyncHandler(async(req, res, next)=>{
    if(req.cookies.token){
        //!verify token
        const decode = jwt.verify(req.cookies.token, process.env.JWT_SECRET)
        //add user to the req obj
        req.user = await User.findById(decode?.id).select('-password')
        next();

    }else{
        return res.status(401).json({
            message: "not authorized no token"
        })
    }

})

module.exports = isAuthenticated