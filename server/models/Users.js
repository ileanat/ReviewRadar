import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    clerkUserId: { type: String, required: true, unique: true},
    usertype: { type: String, default: "User", enum: ["User", "Admin", "Mod"]},
    thumbsup: {type: Number, default: 0 },
    thumbsdown: {type : Number, default: 0 },
    reviewCount: {type : Number, default: 0},
    likedReviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],  // prevent the users from spamming likes
    dislikedReviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }]
}, { timestamps: true });

export default mongoose.model("User", userSchema);