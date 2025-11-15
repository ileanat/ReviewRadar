import { useState } from "react";

export default function WriteReview() {
  const [product, setProduct] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);

  const handleSubmit = () => {
    if (!reviewText.trim()) return;

    fetch("http://localhost:8000/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product,
        category: formCategory,
        review: reviewText,
        rating,
      }),
    });

    setProduct("");
    setFormCategory("");
    setReviewText("");
    setRating(0);
  };

  return (
    <div className="flex flex-col items-center mt-10">
      <h2 className="text-xl font-semibold mb-4">Write a Review</h2>

      <input
        type="text"
        className="w-3/4 p-3 mb-4 border rounded"
        placeholder="Product Name"
        value={product}
        onChange={(e) => setProduct(e.target.value)}
      />

      <select
        className="w-3/4 p-3 mb-4 border rounded"
        value={formCategory}
        onChange={(e) => setFormCategory(e.target.value)}
      >
        <option value="" disabled>Select category</option>
        <option value="Skincare">Skincare</option>
        <option value="Cosmetics">Cosmetics</option>
        <option value="Tech">Tech</option>
        <option value="Clothes">Clothes</option>
        <option value="Other">Other</option>
      </select>

      <textarea
        className="w-3/4 p-3 mb-4 border rounded"
        rows={4}
        placeholder="Write your review…"
        value={reviewText}
        onChange={(e) => setReviewText(e.target.value)}
      ></textarea>

      <div className="flex space-x-1 mb-4">
        {[1,2,3,4,5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            className={`text-3xl ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}
          >
            ★
          </button>
        ))}
      </div>

      <button
        className="px-6 py-2 bg-violet-500 text-white rounded hover:bg-violet-600"
        onClick={handleSubmit}
      >
        Submit Review
      </button>
    </div>
  );
}
