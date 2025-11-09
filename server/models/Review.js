import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    product: {type :String, required: true},
    username: {type :String},
    review: {type :String, required: true},
    category: {type :String, required: true},
    rating: {type :Number, required: true, min: 1, max: 5},
    //photo: {type :String}, TODO
}, {timestamps: true});

export default mongoose.model("Review", reviewSchema);