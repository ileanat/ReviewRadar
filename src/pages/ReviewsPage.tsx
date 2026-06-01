//@ts-nocheck

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReviewCard from "../components/ReviewCard"; 
import { useUser, useClerk } from "@clerk/clerk-react";
import logo from "../assets/logo.png";             
import open_logo from "../assets/open_logo.png";   
import close_logo from "../assets/close_logo.png";
import { apiUrl } from "../lib/api";

type Review = {
  id?: string | number;
  _id?: string;
  product: string;
  category: string;
  rating: number;
  review: string;
  username?: string;
  thumbsupCount?: number;
  thumbsdownCount?: number;
  userVote?: "up" | "down" | null;
  createdAt?: string;
};

const ReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortBy, setSortBy] = useState<"newest" | "highest" | "lowest">("newest");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLogo, setCurrentLogo] = useState(open_logo);

  const navigate = useNavigate();
  const { user } = useUser();
  const { signOut } = useClerk();


  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(apiUrl("/api/reviews"));
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

  useEffect(() => {
  const interval = setInterval(() => {
    setCurrentLogo(close_logo);

    setTimeout(() => {
      setCurrentLogo(open_logo);
    }, 250); // blink duration
  }, 4000); // every 4 sec- adjust if we'd like it more or less frequent

  return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
        }, [searchTerm, selectedCategory, sortBy]);


  // functions for pagination, couldn't find where frontend functions are kept so I added them here.
  function goToPage(page: number) {
    setCurrentPage(page);
  }

  function nextPage() {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  }

  function previousPage() {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  }

  const categories = [
    "All",
    ...Array.from(new Set(reviews.map((r) => r.category))),
  ];

  // Normalize search term — strip leading @ so searching "@john" matches "john"
  const term = searchTerm.toLowerCase().trim().replace(/^@/, "");

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
        review.category.toLowerCase().includes(term) ||
        (review.username ?? "").toLowerCase().includes(term)
      );
    });

  // Sort a copy of filteredReviews — don't mutate the original
  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortBy === "highest") return b.rating - a.rating;
    if (sortBy === "lowest") return a.rating - b.rating;
    // "newest" — sort by createdAt descending; missing dates sort last
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bTime - aTime;
  });

  // pagination
  const RESULTS_PER_PAGE = 6 // change this to whatever value. leaving at 5 for now
  const totalPages = Math.ceil(filteredReviews.length / RESULTS_PER_PAGE);
  const startIndex = (currentPage - 1) * RESULTS_PER_PAGE;
  const paginatedResults = sortedReviews.slice(startIndex, startIndex + RESULTS_PER_PAGE);
  // reused logic from prev project, most changes are under return

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-blue-50">
      {/* Top bar: logo + title + auth / nav */}
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 px-4 py-3 shadow-sm backdrop-blur sm:px-6 sm:py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2">
        {/* Left: logo + name */}
        <div
          className="flex min-w-0 flex-1 items-center gap-1.5 cursor-pointer overflow-hidden sm:gap-3"
          onClick={() => navigate("/")}
        >
          <img
            src={currentLogo}
            alt="ReviewRadar logo"
            className="h-auto w-9 shrink-0 transition-all duration-200 sm:w-14"
          />
          <span className="truncate text-sm font-extrabold text-purple-500 sm:text-2xl">
            ReviewRadar
          </span>
        </div>

        {/* Right: auth + quick nav */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <button
            onClick={() =>
              user ? navigate("/write-review") : navigate("/login")
            }
            className="inline-flex items-center rounded-full bg-violet-500 px-2.5 py-1.5 text-xs font-semibold text-white shadow transition hover:bg-violet-600 sm:px-4 sm:py-2 sm:text-sm"
          >
            <span className="sm:hidden">✍️</span>
            <span className="hidden sm:inline">✍️ Write a Review</span>
          </button>
          {!user ? (
            <>
              <button
                className="rounded-full bg-sky-500 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-sky-600 sm:px-4 sm:py-2 sm:text-sm"
                onClick={() => navigate("/login")}
              >
                Login
              </button>
              <button
                className="rounded-full border-2 border-purple-500 bg-white px-2.5 py-1.5 text-xs font-semibold text-purple-500 transition hover:bg-purple-500 hover:text-white sm:px-4 sm:py-2 sm:text-sm"
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
                className="rounded-full bg-purple-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-purple-600 sm:px-4 sm:py-2 sm:text-sm"
                onClick={() => navigate("/profile")}
              >
                Profile
              </button>
              <button
                className="rounded-full bg-red-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-600 sm:px-4 sm:py-2 sm:text-sm"
                onClick={() => signOut()}
              >
                Logout
              </button>
            </>
          )}
        </div>
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

          {/* Search bar + sort */}
          <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
            <div className="w-full md:w-80">
              <label className="mb-1 block text-xs font-semibold text-gray-600">
                Search reviews or users
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

            <div className="w-full sm:w-48">
              <label className="mb-1 block text-xs font-semibold text-gray-600">
                Sort by
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "newest" | "highest" | "lowest")}
                className="w-full rounded-full border border-gray-300 text-black bg-white px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
              >
                <option value="newest">Newest first</option>
                <option value="highest">Highest rated</option>
                <option value="lowest">Lowest rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Layout: left filters, right reviews */}
        <div className="grid gap-6 lg:grid-cols-[260px,1fr]">
          {/* Category filter panel */}
          <aside className="rounded-2xl bg-white p-4 shadow-md border border-purple-100">
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
          <section className="rounded-2xl bg-white p-4 sm:p-6 shadow-md border border-purple-100">
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
                  <> {/* <-- using this to wrap review and pagination elements, if more things are added in the future add them under this */}
                <div className="grid gap-4 md:grid-cols-2 items-stretch">
                    {paginatedResults.map((review, index) => (
                    <ReviewCard
                        key={review.id ?? review._id ?? index}
                        reviewId={String(review._id ?? review.id ?? index)}
                        product={review.product}
                        category={review.category}
                        rating={review.rating}
                        review={review.review}
                        username={review.username}
                        thumbsupCount={review.thumbsupCount ?? 0}
                        thumbsdownCount={review.thumbsdownCount ?? 0}
                        userVote={review.userVote ?? null}
                        onVote={() => {}}
                    />
                    ))}
                </div>

                {/* Pagination */}
                {/* Tried to keep the styling the same as the categories buttons can change if needed */}
                {totalPages > 1 && (
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-gray-100 pt-6">
                    <button
                        onClick={previousPage}
                        disabled={currentPage === 1}
                        className="rounded-full px-4 py-2 text-xs font-medium tansition     bg-white text-gray-700 border border-gray-200 hover:border-purple-400 hover:text-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition">
                        Previous
                    </button>

                    <div className="flex items-center gap-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                            key={page}
                            onClick={() => goToPage(page)}
                            className={`rounded-full px-3 py-1 text-xs sm:text-sm font-medium transition
                             ${
                            currentPage === page
                                ? "bg-purple-500 text-white shadow"
                                : "bg-white text-gray-700 border border-gray-200 hover:border-purple-400 hover:text-purple-600"
                            }`}
                        >
                            {page}
                        </button>
                        ))}
                    </div>

                    <button
                        onClick={nextPage}
                        disabled={currentPage === totalPages}
                        className="rounded-full px-4 py-2 text-xs font-medium tansition bg-white text-gray-700 border border-gray-200 hover:border-purple-400 hover:text-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition">
                        Next
                    </button>
                    </div>
                )}
                </>
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
