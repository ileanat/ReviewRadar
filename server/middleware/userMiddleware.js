const isAdmin = async (req, res, next) => {
    const user = await User.findOne({ clerkUserId: req.auth.userId });
    
    if (user && user.usertype === "Admin") {
        next(); 
    } else {
        res.status(403).json({ message: "Access denied. Admins only." });
    }
};