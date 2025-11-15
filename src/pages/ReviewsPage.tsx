import React, { useEffect, useState } from "react";
import ReviewCard from "../components/ReviewCard"; // adjust path as needed

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
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

  const filteredReviews =
    selectedCategory === "All"
      ? reviews
      : reviews.filter((review) => review.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-5xl">
        {/* Page header */}
        <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Product Reviews</h1>
            <p className="text-sm text-gray-600">
              Browse reviews and filter by category.
            </p>
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full border px-3 py-1 text-sm transition
                  ${
                    selectedCategory === category
                      ? "border-blue-500 bg-blue-500 text-white"
                      : "border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:text-blue-600"
                  }`}
              >
                {category}
              </button>
            ))}
          </div>
        </header>

        {/* Loading / error states */}
        {loading && (
          <p className="mt-4 text-sm text-gray-500">Loading reviews...</p>
        )}

        {error && !loading && (
          <p className="mt-4 text-sm text-red-500">
            Something went wrong: {error}
          </p>
        )}

        {/* Review cards */}
        {!loading && !error && (
          <>
            {filteredReviews.length === 0 ? (
              <p className="mt-6 text-sm text-gray-500">
                No reviews found for this category.
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
      </div>
    </div>
  );
};

export default ReviewsPage;
