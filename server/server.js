import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import reviewRoutes from './routes/reviewRoutes.js';
import authRoutes from './routes/authRoutes.js';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5101", // React app
    credentials: true,
  })
);

app.use(cookieParser());
  
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use("/api/auth", authRoutes);


mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.error("Error connecting to MongoDB:", err);
});


app.use('/api/reviews', reviewRoutes)
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});