import { getAuth } from '@clerk/express';

function requireAuth(req, res, next) {
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ message: 'Not authorized.' });
  }

  req.user = { clerkUserId: userId };
  next();
}

export default requireAuth;
