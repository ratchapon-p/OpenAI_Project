const mongoose = require('mongoose')

const connectDB = async () =>{
    try {
        const connect = await mongoose.connect('mongodb+srv://kakkhing55:jvXYJYVH4vbyQgYq@mern-gpt.nv9ym9z.mongodb.net/mern-gpt?retryWrites=true&w=majority')
        console.log(`Mongodb connected ${connect.connection.host}`);
    } catch (error) {
        console.log(`Error connection to mongoDB ${error.message}`);
        process.exit(1)
    }
}

module.exports = connectDB;