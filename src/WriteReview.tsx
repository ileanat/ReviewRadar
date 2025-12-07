// @ts-nocheck
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "./assets/logo.png";

export default function WriteReview() {
  const [product, setProduct] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!reviewText.trim()) return;
  
    const res = await fetch("http://localhost:8000/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",                         // 🔑 send login cookie
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
            <img src={logo} alt="ReviewRadar logo" className="h-10 w-10" />
            <span className="text-xl font-bold text-purple-600">
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

          {/* Category (free text, saved to DB) */}
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <input
            type="text"
            className="w-full p-3 mb-4 border border-gray-300 rounded-lg shadow-sm 
                       bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-purple-400"
            placeholder="e.g., Cosmetics, Tech, Skincare…"
            value={formCategory}
            onChange={(e) => setFormCategory(e.target.value)}
          />

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
                       shadow-md font-semibold text-lg"
            onClick={handleSubmit}
          >
            Submit Review
          </button>
        </div>
      </main>
    </div>
  );
}
