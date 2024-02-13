const express = require('express');
require('dotenv').config()
const cron = require('node-cron')
const cors = require('cors')
const usersRouter = require('./routes/usersRouter');
const { errorHandler } = require('./middlewares/errorMiddleware');
const cookieParser = require('cookie-parser');
const openAIRouter = require('./routes/openAIRouter');
const stripeRouter = require('./routes/stripeRouter');
const User = require('./models/User');
require('./utils/connectDB')()

const app = express();
const PORT = process.env.PORT || 8090;

//cron for the trial period

cron.schedule("0 0 * * * *", async () => {
    // console.log("This task runs every second");
    try {
      //get the current date
      const today = new Date();
      await User.updateMany(
        {
          trialActive: true,
          trialExpires: { $lt: today },
        },
        {
          trialActive: false,
          subscriptionPlan: "Free",
          monthlyRequestCount: 5,
        }
      );
    } catch (error) {
      console.log(error);
    }
  });

//cron for the free plan: run at the end of every month

cron.schedule("0 0 1 * * *", async () => {
    try {
      //get the current date
      const today = new Date();
      await User.updateMany(
        {
            subscriptionPlan: "Free",
            nextBillingDate: { $lt: today },
        },
        {
          monthlyRequestCount: 0,
        }
      );
    } catch (error) {
      console.log(error);
    }
  });

//cron for the Basic plan: run at the end of every month

cron.schedule("0 0 1 * * *", async () => {
    try {
      //get the current date
      const today = new Date();
      await User.updateMany(
        {
            subscriptionPlan: "Basic",
            nextBillingDate: { $lt: today },
        },
        {
          monthlyRequestCount: 0,
        }
      );
    } catch (error) {
      console.log(error);
    }
  });

//cron for the Premium plan: run at the end of every month

cron.schedule("0 0 1 * * *", async () => {
    try {
      //get the current date
      const today = new Date();
      await User.updateMany(
        {
            subscriptionPlan: "Premium",
            nextBillingDate: { $lt: today },
        },
        {
          monthlyRequestCount: 0,
        }
      );
    } catch (error) {
      console.log(error);
    }
  });

  


//--------Middlewares------------------------------
app.use(express.json()); //pass incoming json data
app.use(cookieParser())

const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
}
app.use(cors(corsOptions));

//--------Routes-----------------------------------
app.use('/api/v1/users',usersRouter)
app.use('/api/v1/openai',openAIRouter)
app.use('/api/v1/stripe',stripeRouter)

//error handler

app.use(errorHandler)

//start server
app.listen(PORT, console.log(`Server is running on port ${PORT}`));
