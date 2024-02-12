const asyncHandler = require("express-async-handler");
const { calculateNextBillingDate } = require("../utils/calculateNextBillingDate");
const { shouldRenewSubscriptionPlan } = require("../utils/shouldRenewsubscriptionPlan");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const Payment = require("../models/Payment");
const User = require("../models/User");


//-------------------- Stripe Payment --------------------//

const handleStripePayment = asyncHandler(async(req, res) =>{
    const {amount, subscriptionPlan} = req.body;

    //get user
    const user = req?.user;
    try {
        //create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Number(amount) * 100,
            currency: 'usd',
            //add some data to meta object
            metadata:{
                userId: user?._id?.toString(),
                userEmail: user?.email,
                subscriptionPlan
            }

        })

        //send response
        res.json({
            clientSecret : paymentIntent?.client_secret,
            paymentId: paymentIntent?.id,
            paymentdata: paymentIntent?.metadata

        })
    } catch (error) {
        console.log(error);
        res.status(500).json({error: error})
    }

})

//-------------------- Verify payment --------------------//
const verifyPayment = asyncHandler(async(req,res) =>{
    const { paymentId } = req.params
    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentId)
        console.log(paymentIntent);
        if (paymentIntent.status !== 'succeeded') {
            //get info metadata
            const metadata = paymentIntent.metadata
            const subscriptionPlan = metadata.subscriptionPlan
            const userEmail = metadata.user
            const userId = metadata.userId

            const userFound = await User.findById(userId)
            if(!userFound){
                return res.status(404).json({
                    status: "false",
                    message: "User not found"
                })
            }

            const amount = paymentIntent?.amount /100
            const currency = paymentIntent?.currency
            const paymentId = paymentIntent?.id

            //create payment history
            const newPayment = await Payment.create({
                user: userId,
                email: userEmail,
                subscriptionPlan,
                amount,
                currency,
                status: "success",
                reference: paymentId
            })

            //check for the subscription plan

            if(subscriptionPlan === 'Basic'){
                const updateUser = await User.findByIdAndUpdate(userId, {
                    subscriptionPlan,
                    trialPeriod: 0,
                    nextBillingDate: calculateNextBillingDate(),
                    apiRequestCount: 0,
                    monthlyRequestCount: 50,
                    subscriptionPlan: "Basic",
                    $addToSet: {payments: newPayment?._id}

                })

                res.json({
                    status: true,
                    message: "Payment verify updated",
                    updateUser
                })
            }
            
            if(subscriptionPlan === 'Premium'){
                const updateUser = await User.findByIdAndUpdate(userId, {
                    subscriptionPlan,
                    trialPeriod: 0,
                    nextBillingDate: calculateNextBillingDate(),
                    apiRequestCount: 0,
                    monthlyRequestCount: 100,
                    subscriptionPlan: "Premium",
                    $addToSet: {payments: newPayment?._id}

                })

                res.json({
                    status: true,
                    message: "Payment verify updated",
                    updateUser
                })
            }
            
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ error })
    }

})


//-------------------- Handle free subscription --------------------//

const handleFreeSubscription = asyncHandler(async(req, res) =>{
    //get login user
    const user = req?.user;
    console.log("free plan",user);
    //check if user account should be new or not
    try {
      if (shouldRenewSubscriptionPlan(user)) {
        //Update user account
        user.subscriptionPlan = "Free";
        user.monthlyRequestCount = 5;
        user.apiRequestCount = 0;
        user.nextBillingDate = calculateNextBillingDate();
        //create new payment and save it into DB
        const newPayment = await Payment.create({
          user: user?._id,
          subscriptionPlan: "Free",
          amount: 0,
          status: "success",
          reference: Math.random().toString(36).substring(7),
          monthlyRequestCount: 5,
          currency: 'usd'
        });
        user.payments.push(newPayment?._id)
        //save user
        await user.save();

        //send response
        return res.json({
          status: "success",
          message: "Subscription Plan update successfully",
          user,
        });
      } else {
        return res
          .status(403)
          .json({ error: "error subscription renewal not due yet" });
      }
    } catch (error) {
        console.log(error);
        res.status(500).json({error})
    }


})

module.exports = {handleStripePayment, handleFreeSubscription, verifyPayment};