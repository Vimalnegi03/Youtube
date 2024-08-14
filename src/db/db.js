import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import dotenv from 'dotenv'
dotenv.config()
const connectToDb=async()=>{
    try {
        await mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`)
        console.log("database successfully connected");
    } catch (error) {
        console.log(error.message);
    }
}
export default connectToDb