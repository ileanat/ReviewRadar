import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  key: { type: String, required: true, unique: true, index: true}, category: String
}, { timestamps: true });

export default mongoose.model("Products", productSchema);