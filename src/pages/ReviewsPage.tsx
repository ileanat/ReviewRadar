//@ts-nocheck

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReviewCard from "../components/ReviewCard"; // adjust path if needed
import { useAuth } from "../context/AuthContext";  // adjust path if needed
import logo from "../assets/logo.png";             // adjust path if needed

type Review = {
  id?: string | number;   // might come as id or _id
  _id?: string;
  product: string;
  category: string;
  rating: number;
  review: string;
};

const ReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");  // 🔍 search term
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { user, logout } = useAuth();
  

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("http://localhost:8000/api/reviews");
        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }

        const data: Review[] = await res.json();
        setReviews(data);
      } catch (err: any) {
        console.error("Error fetching reviews:", err);
        setError(err.message || "Failed to load reviews");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const categories = [
    "All",
    ...Array.from(new Set(reviews.map((r) => r.category))),
  ];

  // Normalize search term once
  const term = searchTerm.toLowerCase().trim();

  // Filter by category first, then by search term
  const filteredReviews = reviews
    .filter((review) =>
      selectedCategory === "All"
        ? true
        : review.category === selectedCategory
    )
    .filter((review) => {
      if (!term) return true;
      return (
        review.product.toLowerCase().includes(term) ||
        review.review.toLowerCase().includes(term) ||
        review.category.toLowerCase().includes(term)
      );
    });

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-blue-50">
      {/* Top bar: logo + title + auth / nav */}
      <header className="flex items-center justify-between px-6 py-4 shadow-sm bg-white/80 backdrop-blur sticky top-0 z-40">
        {/* Left: logo + name */}
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img src={logo} alt="ReviewRadar logo" className="w-16 h-auto" />
          <span className="text-2xl font-extrabold text-purple-500">
            ReviewRadar
          </span>
        </div>

        {/* Right: auth + quick nav */}
        <div className="flex items-center gap-3">
          {/* “Write a Review” button */}
          <button
            onClick={() =>
              user ? navigate("/write-review") : navigate("/login")
            }
            className="hidden sm:inline-flex items-center rounded-full bg-violet-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-violet-600 transition"
          >
            ✍️ Write a Review
          </button>

          {/* Auth area */}
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
                Hello, {user.username} 👋
              </span>
              <button
                className="px-4 py-2 text-sm font-semibold rounded-full bg-red-500 text-white hover:bg-red-600 transition"
                onClick={logout}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Heading + search row */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Browse Product Reviews
            </h1>
            <p className="text-sm text-gray-600">
              Explore what others are saying across different categories.
            </p>
            <div className="mt-1 text-xs sm:text-sm text-gray-400">
              {filteredReviews.length} review
              {filteredReviews.length === 1 ? "" : "s"} matching your filters
            </div>
          </div>

          {/* Search bar */}
          <div className="w-full md:w-80">
            <label className="mb-1 block text-xs font-semibold text-gray-600">
              Search reviews
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by product, text, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-full border border-gray-300 text-black bg-white px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                🔍
              </span>
            </div>
          </div>
        </div>

        {/* Layout: left filters, right reviews */}
        <div className="grid gap-6 lg:grid-cols-[260px,1fr]">
          {/* Category filter panel */}
          <aside className="rounded-2xl bg-white/80 p-4 shadow-md border border-purple-100">
            <h2 className="mb-3 text-sm font-semibold text-gray-800">
              Categories
            </h2>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full px-3 py-1 text-xs sm:text-sm font-medium transition
                    ${
                      selectedCategory === category
                        ? "bg-purple-500 text-white shadow"
                        : "bg-white text-gray-700 border border-gray-200 hover:border-purple-400 hover:text-purple-600"
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="mt-4 text-xs text-gray-400">
              Tip: Combine category + search for more specific results.
            </div>
          </aside>

          {/* Reviews panel */}
          <section className="rounded-2xl bg-white/80 p-4 sm:p-6 shadow-md border border-purple-100">
            {/* Loading / error states */}
            {loading && (
              <p className="text-sm text-gray-500">Loading reviews...</p>
            )}

            {error && !loading && (
              <p className="text-sm text-red-500">
                Something went wrong: {error}
              </p>
            )}

            {!loading && !error && (
              <>
                {filteredReviews.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No reviews match your current search and filters.
                  </p>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {filteredReviews.map((review, index) => (
                      <ReviewCard
                        key={review.id ?? review._id ?? index}
                        product={review.product}
                        category={review.category}
                        rating={review.rating}
                        review={review.review}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default ReviewsPage;
