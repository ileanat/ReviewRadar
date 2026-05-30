import express from 'express';
import { clerkClient, requireAuth } from '@clerk/express';
import User from '../models/Users.js';

const router = express.Router();

router.get("/by-username/:username", async (req, res) => {
    // NOTE: fetching with username and NOT ID, noticed that public profile only provides the username and not id, will this give issues later? who knows
  try {
    const { username } = req.params;
    const response = await clerkClient.users.getUserList({ username: [username] });
    const users = response.data; 
    
    if (!users || users.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = users[0];
    const mongoUser = await User.findOne({ clerkUserId: user.id });

    res.json({
      imageUrl: user.imageUrl,
      username: user.username,
      avatarColor: mongoUser?.avatarColor || null,
    });
  } catch (err) {
    console.error("Clerk API Error:", err); 
    res.status(500).json({ error: "Server error" });
  }
});

router.patch("/update-avatar-color", async (req, res) => {
  try {
    const { clerkUserId, avatarColor } = req.body;
    const updatedUser = await User.findOneAndUpdate(
      { clerkUserId: clerkUserId },
      { avatarColor: avatarColor },
      { new: true, upsert: true }
    );
    
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: "Failed to update preference" });
  }
});

router.get('/my-color', requireAuth, async (req, res) => {
    try {
        const userDoc = await User.findOne({ clerkUserId: req.user.clerkUserId });
        res.status(200).json({ avatarColor: userDoc?.avatarColor || null });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching color' });
    }
});

export default router;