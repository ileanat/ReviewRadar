import express from 'express';
import Review from '../models/Review.js';
import requireAuth from '../middleware/requireAuth.js';
import Products from '../models/Products.js';
import User from '../models/Users.js'
import { getAuth } from '@clerk/express';
import { checkUser } from '../middleware/checkUser.js';
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
        const allReviews = await Review.find().select(['-clerkUserId','-username']);
        const existingCategories = await Review.distinct('category');
        
        // Find the closest matching category (or use original if no match)
        const normalizedCategory = findClosestCategory(category, existingCategories, 0.6);
        
        const newReview = new Review({ 
            product: ogName,
            productId: product_parent._id,
            username, 
            review, 
            rating, 
            category: normalizedCategory, 
            clerkUserId: req.user.clerkUserId
        });

        const savedReview = await newReview.save();
        const reviewResponse = savedReview.toObject();
        delete reviewResponse.clerkUserId;
        delete reviewResponse.__v;


        res.status(201).json(reviewResponse);
    } catch (error) {
        console.error("DEBUGGING ERROR:", error);
        if (error.code === 11000) {
        return res.status(400).json({ message: "You have already reviewed this product!" });
    }
        res.status(500).json({ message: 'Error creating review', error });
    }
});

router.post('/vote', requireAuth, async (req, res) => {
    const { reviewId, voteType } = req.body;
    const clerkId = req.user.clerkUserId;
    try {
        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        if (review.clerkUserId === clerkId) {
            return res.status(403).json({ 
                message: "You can't vote on your own reviews." 
            });
        }

        let user = await User.findOne({ clerkUserId: clerkId });
        if (!user) {
            user = new User({
                clerkUserId: clerkId,
                likedReviews: [],
                dislikedReviews: []
            });
            await user.save();
        }
        
        let userAction = voteType;

        if (voteType === 'up') {
            if (user.likedReviews.includes(reviewId)) {
                user.likedReviews.pull(reviewId);
                review.thumbsupCount = Math.max(0, review.thumbsupCount - 1); // if the current user already gave the review a thumbs up and clicks the button again
                                                                                // decreament its value by 1, using max to avoid the value from going to the negatives
                userAction = null; // do nothing 
            } else {
                user.likedReviews.push(reviewId);
                review.thumbsupCount += 1; // otherwise increment the value by 1
            
                if (user.dislikedReviews.includes(reviewId)) {
                    user.dislikedReviews.pull(reviewId);
                    review.thumbsdownCount = Math.max(0, review.thumbsdownCount - 1);
                }
            }
        } else if (voteType === 'down') {
            if (user.dislikedReviews.includes(reviewId)) {
                user.dislikedReviews.pull(reviewId);
                review.thumbsdownCount = Math.max(0, review.thumbsdownCount - 1); // same explanation as above
                userAction = null;
            } else {
                user.dislikedReviews.push(reviewId);
                review.thumbsdownCount += 1;

                if (user.likedReviews.includes(reviewId)) {
                    user.likedReviews.pull(reviewId);
                    review.thumbsupCount = Math.max(0, review.thumbsupCount - 1);
                }
            }
        }

        await Promise.all([user.save(), review.save()]);

        res.status(200).json({
            newUpCount: review.thumbsupCount,
            newDownCount: review.thumbsdownCount,
            userAction: userAction
        });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// GET /api/reviews
router.get('/', async (req, res) => {
  try {

    const reviews = await Review.find().sort({ _id: -1 }).select('-clerkUserId'); // clerkUserId must stay hidden

    const filteredReviews = reviews.map(r => { // may need to add more fields if we require more model mapping info
      const review = r.toObject();
      review.thumbsupCount = r.thumbsupCount ?? 0;
      review.thumbsdownCount = r.thumbsdownCount ?? 0;
      review.userVote = null; 
      
      return review;
    });

    return res.status(200).json(filteredReviews);
  } catch (error) {
    return res.status(500).json({ message: 'Error', error });
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

        const allReviews = await Review.find().select(['-clerkUserId','-username']);
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

// GET /api/reviews/user/:username — public reviews for a given username
router.get('/user/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const reviews = await Review.find({ username })
            .sort({ _id: -1 })
            .select('-clerkUserId');
        res.status(200).json(reviews);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

router.get('/product/:item', async (req, res) => {
    try {
        const { item } = req.params;
        const reviews = await Review.find({ 
            product: { $regex: new RegExp(`^${item}$`, 'i') } 
        }).sort({ createdAt: -1 }).select(['-clerkUserId','-username']); // do not remove .select otherwise this info would be exposed.

        if (reviews.length === 0) {
            return res.status(404).json({ message: "No reviews found for this product" });
        }

        res.status(200).json(reviews);
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
});

export default router;