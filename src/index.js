import app from './app.js';
import dotenv from 'dotenv'
dotenv.config(
    {
        path: './.env',
    }
)
import connectToDb from './db/db.js';

app.listen(process.env.PORT,()=>{
    connectToDb();
    console.log("server is running successfully" );
})
