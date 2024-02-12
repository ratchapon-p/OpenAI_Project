const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const checkApiRequsetLimit = asyncHandler(async(req, res, next) =>{
    if(!req.user){
        return res.status(401).json({message: "Not authorized"})

    }
    //find user
    const user = await User.findById(req?.user?.id)
    if(!user){
        return res.status(404).json({message: "Not Found user"})
    }
    let requsetLimit = 0
    //check if user is on trial period
    if(user?.trialActive){
        requsetLimit = user?.monthlyRequestCount;
    }
    if(user?.apiRequestCount >= requsetLimit){
        throw new Error("Api request limit reached")
    }
    next();
})


module.exports = checkApiRequsetLimit;
