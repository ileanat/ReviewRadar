// @ts-nocheck
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Fuse from "fuse.js";
import logo from "./assets/logo.png";
import dictionary from "./assets/shopping_dictionary.json";

const environment = import.meta.env.VITE_CLIENT_ENV;
const fuse = new Fuse(dictionary, {
  threshold: 0.35,
  minMatchCharLength: 2,
});

export default function WriteReview() {
  const [product, setProduct] = useState("");
  const [categoryInput, setCategoryInput] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);

  const navigate = useNavigate();

  const suggestions = useMemo(() => {
    if (!categoryInput.trim() || formCategory) return [];
    return fuse.search(categoryInput, { limit: 5 }).map((r) => r.item);
  }, [categoryInput, formCategory]);

  const selectCategory = (word: string) => {
    setFormCategory(word);
    setCategoryInput("");
  };

  const clearCategory = () => {
    setFormCategory("");
    setCategoryInput("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reviewText.trim() || !formCategory) return;

    const res = await fetch(`${environment}/api/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        product,
        category: formCategory,
        review: reviewText,
        rating,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      console.error("Failed to submit review:", data);
      alert(data.message || "Failed to submit review");
      return;
    }
    setProduct("");
    setFormCategory("");
    setCategoryInput("");
    setReviewText("");
    setRating(0);
    navigate("/browse");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white">
      {/* Top bar */}
      <header className="w-full border-b bg-white/70 backdrop-blur">
        <div className="mx-auto max-w-5xl flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="ReviewRadar logo"
              className="h-10 w-10 cursor-pointer"
              onClick={() => navigate("/")}
            />
            <span className="text-xl font-bold text-purple-600"
              onClick={() => navigate("/")}
            >
              ReviewRadar
            </span>
          </div>

          <button
            onClick={() => navigate("/")}
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold px-5 py-2.5
    rounded-full shadow-md hover:from-purple-600 hover:to-purple-700 transition-all"
          >
            ← Back to Home
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-10 md:py-16">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-10 md:p-12">
          <h1 className="text-3xl font-bold mb-2 text-purple-600 text-center">
            Write a Review
          </h1>
          <p className="mb-6 text-sm text-gray-500 text-center">
            Share your thoughts about a product!
          </p>

          {/* Product Name */}
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Name
          </label>
          <input
            type="text"
            className="w-full p-3 mb-4 border border-gray-300 rounded-lg shadow-sm
                       bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-purple-400"
            placeholder="e.g., Hydrating Face Cream"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
          />

          {/* Category — fuzzy search, must select from suggestions */}
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>

          {formCategory ? (
            <div className="flex items-center gap-2 mb-4">
              <span className="flex items-center gap-2 px-4 py-2 bg-white border border-purple-300 rounded-lg text-purple-800 font-semibold text-sm">
                {formCategory}
                <button
                  type="button"
                  onClick={clearCategory}
                  className="text-purple-400 hover:text-purple-700 font-bold text-base leading-none"
                  aria-label="Clear category"
                >
                  ×
                </button>
              </span>
            </div>
          ) : (
            <div className="relative mb-4">
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm
                           bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-purple-400"
                placeholder="Type to search a category…"
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value)}
                autoComplete="off"
              />
              {suggestions.length > 0 && (
                <ul className="absolute z-10 w-full mt-1 bg-white border border-purple-200 rounded-lg shadow-lg overflow-hidden">
                  {suggestions.map((word) => (
                    <li key={word}>
                      <button
                        type="button"
                        className="w-full text-left px-4 py-2.5 text-sm !bg-white text-gray-800 hover:!bg-gray-50 transition-colors"
                        onClick={() => selectCategory(word)}
                      >
                        {word}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {categoryInput.trim() && suggestions.length === 0 && (
                <p className="mt-1 text-xs text-gray-400">No matches found. Try a different word.</p>
              )}
            </div>
          )}

          {/* Review Text */}
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your Review
          </label>
          <textarea
            className="w-full p-3 mb-4 border border-gray-300 rounded-lg shadow-sm
                       bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-purple-400 resize-none"
            rows={4}
            placeholder="Write your experience here..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
          ></textarea>

          {/* Star Rating */}
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rating
          </label>
          <div className="flex space-x-3 mb-6">
            {[1, 2, 3, 4, 5].map((star) => {
              const active = star <= rating;
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`w-24 h-15 rounded-xl border shadow-sm flex items-center justify-center
                              transition-transform ${
                                active
                                  ? "bg-yellow-50 border-yellow-300 scale-110"
                                  : "bg-white border-gray-200 hover:scale-110"
                              }`}
                >
                  <span
                    className={`text-4xl ${
                      active ? "text-yellow-400" : "text-gray-300"
                    }`}
                  >
                    ★
                  </span>
                </button>
              );
            })}
          </div>

          {/* Submit Button */}
          <button
            className="w-full px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600
                       shadow-md font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSubmit}
            disabled={!formCategory || !reviewText.trim()}
          >
            Submit Review
          </button>
        </div>
      </main>
    </div>
  );
}
