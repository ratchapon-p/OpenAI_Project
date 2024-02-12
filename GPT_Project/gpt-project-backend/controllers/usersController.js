const User = require("../models/User")
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const asyncHandler = require('express-async-handler')


//-----Registration-----
const register = asyncHandler(async(req, res) =>{
        const {username, email, password} = req.body;
        //validate
        if(!username || !email || !password){
            res.status(400)
            throw new Error('Please all fields are requried');
        }
        //Check if email is taker
        const userExists = await User.findOne({email})
        if(userExists){
            res.status(400)
            throw new Error('User already exists');
        }

        //Hash user password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        //create user
        const newUser = new User({
            username,
            password: hashedPassword,
            email
        });

        //Add Date that trial end
        newUser.trialExpires= new Date(
            new Date().getTime() + newUser.trialPeriod * 24 * 60 * 60 * 1000
        );
        //save
        await newUser.save()

        res.json({
            status: true,
            message: "Register successfully",
            user:{
                username,
                email,
            }
        })


})
//-----Login-----

const login = asyncHandler(async(req, res) =>{
    const {email, password} = req.body;
    //check user email
    const user = await User.findOne({email})
    if(!user){
        res.status(400)
        throw new Error('Invalid Email or Password')
    }
    //check if password valid
    const isMatch = await bcrypt.compare(password, user?.password)
    if(!isMatch){
        res.status(400)
        throw new Error('Invalid Email or Password')
    }

    //generate token with jwt
    const token = jwt.sign({id: user?._id}, process.env.JWT_SECRET,{
        expiresIn: '3d'
    })

    //set token into cookie(http only)
    res.cookie('token', token,{
        httpOnly: true,
        secure:process.env.NODE_ENV === 'production',
        sameSite:"strict",
        maxAge: 24 * 60 * 60 * 10000,
    })

    //send response
    res.json({
        status: 'success',
        _id: user?._id,
        message: 'login success',
        username: user?.username,
        email: user?.email
    })

})
//-----Logout-----
const logout = asyncHandler(async(req, res) =>{
    res.cookie("token", "", {maxAge: 1});
    res.status(200).json({message: "Logged out successfully"})
})
//-----Profile-----
const userProfile = asyncHandler(async(req, res) =>{
    const id = req.user?.id
    const user = await User.findById(id).select("-password").populate('payments').populate('history')
    if(user){
        res.status(200).json({
            status: "success",
            user,
        })
    }else{
        res.status(404)
        throw new Error("User not found")
    }
})
//-----Check user Auth Status-----
const checkAuth = asyncHandler(async(req, res) =>{
    const decoded = jwt.verify(req.cookies.token,process.env.JWT_SECRET)
    if(decoded){
        res.json({
            isAuthenticated: true
        })
    }else{
        res.json({
            isAuthenticated: false
        })
    }

})


module.exports = {
    register,
    login,
    logout,
    userProfile,
    checkAuth
}