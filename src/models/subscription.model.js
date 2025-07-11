import mongoose from "mongoose";

const subscriptionSchema=mongoose.Schema({
    subscriber:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    channel:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
},{timetamps:true})
export const Subscription= mongoose.model("Subscription",subscriptionSchema)