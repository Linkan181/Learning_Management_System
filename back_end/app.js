import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import dotenv from 'dotenv';
import errorMiddleware from './middleware/error.middleware.js';
dotenv.config();

// import routers ===========================
import userRoute from './routers/userRouter.js';

const app=express();

// Database connection=============================
import connectToDB from './config/db.js';
await connectToDB();


// Middlewares 
app.use(express.json());
app.use(cors({
    origin: [process.env.CLIENT_URL],
    credentials: true
}));
app.use(cookieParser());
app.use(morgan('dev'));


app.use('/ping',(req,res)=>{
    res.send('Pong');
});


// use routes of 3 module 
app.use('/api/v1/user/', userRoute);

app.use('*',(req,res)=>{
    res.status(404).send(`OPPS ! 404 Page not found.`)
})

app.use(errorMiddleware);

export default app;