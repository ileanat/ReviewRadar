import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    product: {type :String, required: true, index: true},
    productId: {type: mongoose.Schema.Types.ObjectId, ref: 'Products', required: true },
    clerkUserId: {type :String, required: true},
    username: {type :String},
    review: {type :String, required: true},
    thumbsupCount: { type: Number, default: 0 },
    thumbsdownCount: { type: Number, default: 0 },
    category: {type :String, required: true},
    rating: {type :Number, required: true, min: 1, max: 5},
    //photo: {type :String}, TODO
}, {timestamps: true});

reviewSchema.index({ clerkUserId: 1, productId: 1 }, { unique: true });

export default mongoose.model("Review", reviewSchema);