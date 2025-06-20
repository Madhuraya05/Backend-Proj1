// require('dotenv').config({path:'./env'})
import dotenv from 'dotenv'
import express from 'express'
import connectDB from "./db/index.js";
const app=express()

dotenv.config({
    path:'./env'
})

connectDB()
.then(()=>{
    app.on('error',(error)=>{
        console.log("Error in app",error)
    })
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`app is listening at port ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("Mongodb connection failed",err)
})














// for cleaning purpose;

// (async ()=>{
//     try {
//         mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         app.on('error',(error)=>{
//             console.log("Error",error)
//             throw error
//         })
//         app.listen(process.env.PORT,()=>{
//             console.log(`App is listing ${process.env.PORT}`)
//         })
//     } catch (error) {
//         console.error(error)
//         throw error
//     }
// })()

