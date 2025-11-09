import express from 'express';
import Review from '../models/Review.js';

const router = express.Router();

// POST /api/reviews
router.post('/', async (req, res) => {
    console.log("Received review data:", req.body);
    try {
        const username = req.body.username || 'Anon';
        const { product, review, rating, category } = req.body;
        
        const newReview = new Review({ product, username, review, rating, category });
        const savedReview = await newReview.save();
        console.log("Saved Review:", savedReview);
        res.status(201).json(savedReview);
    } catch (error) {
        res.status(500).json({ message: 'Error creating review', error });
    }
});

// GET /api/reviews
router.get('/', async (req, res) => {
    try {
        const reviews = await Review.find();
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reviews', error });
    }
});

export default router;