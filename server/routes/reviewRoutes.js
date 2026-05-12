import express from 'express';
import Review from '../models/Review.js';
import requireAuth from '../middleware/requireAuth.js';
import Products from '../models/Products.js';
import { findClosestCategory, getUniqueCategories } from '../utils/fuzzyMatch.js';

const router = express.Router();

// POST /api/reviews
router.post('/',requireAuth ,async (req, res) => {
    try {
        const username = req.body.username || 'Anon';
        // let { product, review, rating, category } = req.body;
        const { product: ogName, review, rating, category } = req.body;
        const sanitized_product = ogName.toLowerCase().replace(/\s+/g, '');

        const product_parent = await Products.findOneAndUpdate(
            { key: sanitized_product },
            { $setOnInsert: { name: ogName.trim(), key: sanitized_product } },
            { upsert: true, new: true, runValidators: true }
        );
        
        // Fuzzy match the category against existing categories in the database
        const allReviews = await Review.find();
        const existingCategories = getUniqueCategories(allReviews);
        
        // Find the closest matching category (or use original if no match)
        const normalizedCategory = findClosestCategory(category, existingCategories, 0.6);
        console.log(`Category input: "${category}" → matched to: "${normalizedCategory}"`);
        
        const newReview = new Review({ 
            product: ogName,
            username, 
            review, 
            rating, 
            category: normalizedCategory, 
            clerkUserId: req.user.clerkUserId 
        });
        const savedReview = await newReview.save();
        res.status(201).json(savedReview);
    } catch (error) {
        console.error("DEBUGGING ERROR:", error);
        res.status(500).json({ message: 'Error creating review', error });
    }
});

// GET /api/reviews
router.get('/', async (req, res) => {
    try {
        const reviews = await Review.find().sort({ _id: -1 });
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reviews', error });
    }
});

// GET /api/reviews/mine — reviews authored by the signed-in Clerk user
router.get('/mine', requireAuth, async (req, res) => {
    try {
        const reviews = await Review.find({ clerkUserId: req.user.clerkUserId }).sort({ _id: -1 });
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user reviews', error });
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

router.get('/product/:item', async (req, res) => {
    try {
        const { item } = req.params;
        const reviews = await Review.find({ 
            product: { $regex: new RegExp(`^${item}$`, 'i') } 
        }).sort({ createdAt: -1 });

        if (reviews.length === 0) {
            return res.status(404).json({ message: "No reviews found for this product" });
        }
        res.status(200).json(reviews);
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
});

export default router;