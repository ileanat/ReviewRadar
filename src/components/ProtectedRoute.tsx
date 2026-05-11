//@ts-nocheck
import { Navigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";

export function ProtectedRoute({ children }) {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) return <div>Loading...</div>;

  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
