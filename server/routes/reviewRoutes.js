import express from 'express';
import Review from '../models/Review.js';
import requireAuth from '../middleware/requireAuth.js';
import { findClosestCategory, getUniqueCategories } from '../utils/fuzzyMatch.js';

const router = express.Router();

// POST /api/reviews
router.post('/',requireAuth ,async (req, res) => {
    console.log("Received review data:", req.body);
    try {
        const username = req.body.username || 'Anon';
        let { product, review, rating, category } = req.body;
        
        // Fuzzy match the category against existing categories in the database
        const allReviews = await Review.find();
        const existingCategories = getUniqueCategories(allReviews);
        
        // Find the closest matching category (or use original if no match)
        const normalizedCategory = findClosestCategory(category, existingCategories, 0.6);
        console.log(`Category input: "${category}" → matched to: "${normalizedCategory}"`);
        
        const newReview = new Review({ product, username, review, rating, category: normalizedCategory });
        const savedReview = await newReview.save();
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

// GET /api/reviews/category-suggestion?input=technlgy
// Returns the matched category for a given user input (for frontend preview)
router.get('/category-suggestion', async (req, res) => {
    try {
        const { input } = req.query;
        
        if (!input) {
            return res.status(400).json({ message: 'Missing input parameter' });
        }

        const allReviews = await Review.find();
        const existingCategories = getUniqueCategories(allReviews);
        
        const matchedCategory = findClosestCategory(input, existingCategories, 0.6);
        
        res.status(200).json({
            input,
            suggestion: matchedCategory,
            changed: input.toLowerCase() !== matchedCategory.toLowerCase(),
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching category suggestion', error });
    }
});

export default router;