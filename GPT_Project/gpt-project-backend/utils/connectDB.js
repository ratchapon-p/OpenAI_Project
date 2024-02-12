const mongoose = require('mongoose')

const connectDB = async () =>{
    try {
        const connect = await mongoose.connect(process.env.MONGO_URL)
        console.log(`Mongodb connected ${connect.connection.host}`);
    } catch (error) {
        console.log(`Error connection to mongoDB ${error.message}`);
        process.exit(1)
    }
}

module.exports = connectDB;