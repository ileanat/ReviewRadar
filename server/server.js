import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import reviewRoutes from './routes/reviewRoutes.js';
import productRoutes from './routes/productRoutes.js';
//import cookieParser from 'cookie-parser';
import { clerkMiddleware } from '@clerk/express';

dotenv.config();
const environment = process.env.SERVER_ENV
const app = express();

app.use(
  cors({
     origin: environment,
    credentials: true,
  })
);

app.use(express.json());
app.use(clerkMiddleware());
app.use("/uploads", express.static("uploads"));
app.use('/api/products', productRoutes);
app.use('/api/reviews', reviewRoutes)


mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.error("Error connecting to MongoDB:", err);
});


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

