import express from 'express'
import dotenv from 'dotenv'
dotenv.config(
    {
        path: './env',
    }
)
import connectToDb from './db/db.js';
const app=express();

app.listen(process.env.PORT,()=>{
    connectToDb();
    console.log("server is running successfully" );
})
