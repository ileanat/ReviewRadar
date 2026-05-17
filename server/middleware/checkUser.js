import { getAuth } from '@clerk/express';
export const checkUser = (req, res, next) => {
  const { userId } = getAuth(req);
  if (userId) {
    req.user = { clerkUserId: userId };
  }
  next();
};