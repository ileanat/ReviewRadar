import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./index.css";
import "./App.css";
import logo from "./assets/logo.png";

function App() {
  const [count, setCount] = useState(0);
  const [reviews, setReviews] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [reviewText, setReviewText] = useState("");
  const [submittedReview, setSubmittedReview] = useState<string | null>(null);
  const [formCategory, setFormCategory] = useState("");
  const [rating, setRating] = useState(0); // ⭐ new state for star rating
  const navigate = useNavigate();

  useEffect(() => {
    // Connect to backend to fetch reviews- including star ratings
    //{id, product, review, category, rating}
    fetch("/reviews")
      .then((res) => res.json())
      .then((data) => setReviews(data))
      .catch((err) => console.error("Error fetching reviews:", err));
  }, []);

  const handleSubmit = () => {
    if (reviewText.trim() === "") return;

    // For now, just log review data
    const reviewData = {
      product: reviewText,
      category: formCategory,
      rating,
    };
    console.log("Submitted review:", reviewData);

    setSubmittedReview(reviewText);
    setReviewText("");
    setRating(0);
  };

  return (
    <>
      {/* Top-right login/signup buttons fixed */}
      <div className="fixed top-4 right-4 flex space-x-2 z-50">
        <button
          className="px-4 py-2 bg-sky-500 text-white rounded hover:bg-blue-600"
          onClick={() => navigate("/login")}
        >
          Login
        </button>
        <button
          className="px-4 py-2 border-2 border-purple-500 bg-white text-purple-500 rounded hover:bg-purple-500 hover:text-white"
          onClick={() => navigate("/signup")}
        >
          Signup
        </button>
      </div>

      {/* Logo and title */}
      <img src={logo} alt="Logo..." className="w-36 h-auto mx-auto mt-4" />
      <h1 className="text-center text-purple-500 text-2xl font-semibold mt-2">
        ReviewRadar
      </h1>

      {/* Count button and category title */}
      <div className="card text-center mt-4">
        <button
          onClick={() => setCount((count) => count + 1)}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          count is {count}
        </button>
        <div className="text-left ml-0 pl-0 mb-1 mt-2">Choose a Category:</div>
      </div>

      {/* Category Buttons */}
      <div className="flex justify-center mt-3">
        <button
          className="mx-2 px-4 py-2 bg-sky-500 text-white rounded hover:bg-blue-600"
          onClick={() => setSelectedCategory("Cosmetics")}
        >
          Cosmetics
        </button>
        <button
          className="mx-2 px-4 py-2 bg-violet-500 text-white rounded hover:bg-purple-600"
          onClick={() => setSelectedCategory("Skincare")}
        >
          Skincare
        </button>
        <button
          className="mx-2 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          onClick={() => setSelectedCategory("Clothes")}
        >
          Clothes
        </button>
        <button
          className="mx-2 px-4 py-2 bg-violet-500 text-white rounded hover:bg-violet-600"
          onClick={() => setSelectedCategory("Tech")}
        >
          Tech
        </button>
      </div>

      {/* Centered Review Input Box */}
      <div className="flex flex-col items-center justify-center mt-10 w-full max-w-3xl mx-auto">
        <h2 className="w-full text-xl font-semibold mb-4 text-gray-700">
          Write a Review
        </h2>

        {/* Product Name Input */}
<input
  type="text"
  className="w-4/5 md:w-3/4 lg:w-2/3 p-3 mb-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
  placeholder="Product Name"
  value={reviewText}
  onChange={(e) => setReviewText(e.target.value)}
/>

{/* Category Dropdown */}
<select
  className="w-4/5 md:w-3/4 lg:w-2/3 p-3 mb-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
  value={formCategory}
  onChange={(e) => setFormCategory(e.target.value)}
>
  <option value="" disabled>
    Select Category
  </option>
  <option value="Skincare">Skincare</option>
  <option value="Cosmetics">Cosmetics</option>
  <option value="Tech">Tech</option>
  <option value="Clothes">Clothes</option>
</select>

{/* Review Textarea */}
<textarea
  className="w-4/5 md:w-3/4 lg:w-2/3 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
  rows={4}
  placeholder="Write your thoughts about any product..."
  value={reviewText}
  onChange={(e) => setReviewText(e.target.value)}
></textarea>


        {/* ⭐ Star Rating (added here, above the submit button) */}
        <div className="flex items-center space-x-1 mb-4 mt-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`text-3xl focus:outline-none transition-colors ${
                star <= rating ? "text-yellow-400" : "text-gray-300"
              }`}
            >
              ★
            </button>
          ))}
        </div>
        <p className="text-gray-600 mb-4">
          {rating > 0 ? `You rated: ${rating}/5` : "Click to rate"}
        </p>

        {/* Submit Button */}
        <button
          className="mt-2 px-6 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600"
          onClick={handleSubmit}
        >
          Submit Review
        </button>

        {/* Display submitted review (for testing) */}
        {submittedReview && (
          <div className="mt-6 w-3/4 md:w-1/2 p-4 bg-violet-50 border border-violet-200 rounded-lg text-gray-700">
            <p className="font-medium">Your review:</p>
            <p>{submittedReview}</p>
            <p className="text-sm text-yellow-500 mt-1">⭐ {rating}/5</p>
          </div>
        )}
      </div>

      <p className="read-the-docs mt-6 text-center">
        Lots on our to-do list! Stay tuned.
      </p>

      {/* Reviews Section */}
      <div className="mt-6 text-left px-6">
        {selectedCategory ? (
          reviews
            .filter((r) => r.category === selectedCategory)
            .map((r) => (
              <div key={r.id} className="p-4 border-b border-gray-300">
                <h3 className="font-semibold text-purple-400">{r.product}</h3>
                <p>{r.review}</p>
                <p className="text-sm text-gray-400">⭐ {r.rating}/5</p>
              </div>
            ))
        ) : (
          <p>Select a category to view reviews.</p>
        )}
      </div>
    </>
  );
}

export default App;
