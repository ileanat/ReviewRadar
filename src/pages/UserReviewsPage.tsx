//@ts-nocheck

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useClerk, useAuth } from "@clerk/clerk-react";
import ReviewCard from "../components/ReviewCard";
import logo from "../assets/logo.png";

const environment = import.meta.env.VITE_CLIENT_ENV;


type Review = {
  _id?: string;
  product: string;
  category: string;
  rating: number;
  review: string;
};

const UserReviewsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { signOut } = useClerk();
  const { getToken } = useAuth();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMine = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = await getToken();
        const res = await fetch(`${environment}/api/reviews/mine`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
        setReviews(await res.json());
      } catch (err: any) {
        setError(err.message || "Failed to load your reviews");
      } finally {
        setLoading(false);
      }
    };
    fetchMine();
  }, [getToken]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-blue-50">
      {/* Header — matches ReviewsPage */}
      <header className="flex items-center justify-between px-6 py-4 shadow-sm bg-white backdrop-blur sticky top-0 z-40">
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img src={logo} alt="ReviewRadar logo" className="w-16 h-auto" />
          <span className="text-2xl font-extrabold text-purple-500">
            ReviewRadar
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              user ? navigate("/write-review") : navigate("/login")
            }
            className="hidden sm:inline-flex items-center rounded-full bg-violet-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-violet-600 transition"
          >
            ✍️ Write a Review
          </button>

          {!user ? (
            <>
              <button
                className="px-4 py-2 text-sm font-semibold rounded-full bg-sky-500 text-white hover:bg-sky-600 transition"
                onClick={() => navigate("/login")}
              >
                Login
              </button>
              <button
                className="px-4 py-2 text-sm font-semibold rounded-full border-2 border-purple-500 text-purple-500 bg-white hover:bg-purple-500 hover:text-white transition"
                onClick={() => navigate("/signup")}
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              <span className="hidden sm:inline text-sm font-semibold text-purple-600">
                Hello, {user.username ?? user.firstName ?? user.primaryEmailAddress?.emailAddress} 👋
              </span>
              <button
                className="px-4 py-2 text-sm font-semibold rounded-full bg-red-500 text-white hover:bg-red-600 transition"
                onClick={() => signOut()}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main content — placeholder for user reviews */}
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Reviews</h1>
          <p className="text-sm text-gray-600">
            Reviews you've written will appear here.
          </p>
        </div>

        <section className="rounded-2xl bg-white p-6 shadow-md border border-purple-100">
          {loading && <p className="text-sm text-gray-500">Loading your reviews...</p>}
          {error && !loading && (
            <p className="text-sm text-red-500">Something went wrong: {error}</p>
          )}
          {!loading && !error && reviews.length === 0 && (
            <p className="text-sm text-gray-400">No reviews yet.</p>
          )}
          {!loading && !error && reviews.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 items-stretch">
              {reviews.map((r, i) => (
                <ReviewCard
                  key={r._id ?? i}
                  reviewId={String(r._id ?? i)}
                  product={r.product}
                  category={r.category}
                  rating={r.rating}
                  review={r.review}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default UserReviewsPage;
