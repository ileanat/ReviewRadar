import Review from "../models/Review";

router.get('/reviews/:id', async (req, res) => {
  try {
    const item = await Review.findById(req.params.id).select(['-clerkUserId','-username']);
    
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    
    res.status(200).json(item);
  } catch (err) {
    res.status(500).json({ message: "Invalid ID format or Server Error", error: err });
  }
});