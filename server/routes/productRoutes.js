import express from 'express';
import Products from '../models/Products.js';
import Review from '../models/Review.js';
const router = express.Router();

router.get('/:key', async (req, res) => {
    try {
        const { key } = req.params;
        const product = await Products.findOne({ key });
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const reviews = await Review.find({ productId: product._id }).sort({ createdAt: -1 }).select(['-clerkUserId']);
        res.status(200).json({ product, reviews});
    } catch (error) {
        res.status(500).json({ message: "Error fetching product page", error: error.message });
    }
});
export default router;
