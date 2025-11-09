import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
const loading = "https://cdn.dribbble.com/users/546766/screenshots/4790425/progress-circle.gif";
import "./index.css";
import "./App.css";

function App() {
  //const [count, setCount] = useState(0);
  const [reviews, setReviews] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [reviewText, setReviewText] = useState(""); // new
  const [submittedReview, setSubmittedReview] = useState<string | null>(null); // new
  const [formCategory, setFormCategory] = useState(""); // for the input form only
  const navigate = useNavigate();


  useEffect(() => {
    fetch("/reviews")
      .then((res) => res.json())
      .then((data) => setReviews(data))
      .catch((err) => console.error("Error fetching reviews:", err));
  }, []);

  const handleSubmit = () => {
    if (reviewText.trim() === "") return;
    setSubmittedReview(reviewText);
    setReviewText("");
  };

  return (
    <>
      <div>
        {/* Top-right login/signup buttons fixed */}
<div className="fixed top-4 right-4 flex space-x-2 z-50">
  <button
    className="px-4 py-2 bg-sky-500 text-white rounded hover:bg-blue-600"
    //onClick={() => alert("Login clicked")}
    onClick={() => navigate("/login")}
  >
    Login
  </button>
  <button
    className="px-4 py-2 border-2 border-purple-500 bg-white text-purple-500 rounded hover:bg-purple-500 hover:text-white"
    //onClick={() => alert("Signup clicked")}
    onClick={() => navigate("/signup")}
  >
    Signup
  </button>
</div>
        <a
          href="https://cdn.dribbble.com/users/546766/screenshots/4790425/progress-circle.gif"
          target="_blank"
        >
          <img src={loading} alt="Loading..." />
        </a>
      </div>

      <h1>ReviewRadar</h1>

      <div className="card">
        {/* <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button> */}
        

        <div className="text-left ml-0 pl-0">Choose a Category:</div>
      </div>

      {/* Category Buttons */}
      <div className="flex justify-between">
        <button
          className="flex-1 mx-2 px-4 py-2 bg-sky-500 text-white rounded hover:bg-blue-600"
          onClick={() => setSelectedCategory("Cosmetics")}
        >
          Cosmetics
        </button>
        <button
          className="flex-1 mx-2 px-4 py-2 bg-violet-500 text-white rounded hover:bg-purple-600"
          onClick={() => setSelectedCategory("Skincare")}
        >
          Skincare
        </button>
        <button
          className="flex-1 mx-2 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          onClick={() => setSelectedCategory("Clothes")}
        >
          Clothes
        </button>
        <button
          className="flex-1 mx-2 px-4 py-2 bg-violet-500 text-white rounded hover:bg-violet-600"
          onClick={() => setSelectedCategory("Tech")}
        >
          Tech
        </button>
      </div>

      {/* Centered Review Input Box */}
<div className="flex flex-col items-center justify-center mt-10">
  <h2 className="text-xl font-semibold mb-4 text-gray-700">
    Write a Review
  </h2>

  {/* Product Name Input */}
  <input
    type="text"
    className="w-3/4 md:w-1/2 p-3 mb-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
    placeholder="Product Name"
    value={reviewText} // change this to a new state variable for product
    onChange={(e) => setReviewText(e.target.value)} // update to product state
  />

  {/* Category Dropdown */}
  <select
  className="w-3/4 md:w-1/2 p-3 mb-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
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


  {/* Big Review Textarea */}
  <textarea
    className="w-3/4 md:w-1/2 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
    rows={4}
    placeholder="Write your thoughts about any product..."
    value={reviewText} // keep this for review text
    onChange={(e) => setReviewText(e.target.value)}
  ></textarea>

  <button
    className="mt-4 px-6 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600"
    onClick={handleSubmit}
  >
    Submit Review
  </button>

  {submittedReview && (
    <div className="mt-6 w-3/4 md:w-1/2 p-4 bg-violet-50 border border-violet-200 rounded-lg text-gray-700">
      <p className="font-medium">Your review:</p>
      <p>{submittedReview}</p>
    </div>
  )}
</div>


      <p className="read-the-docs mt-6">Lots on our to-do list! Stay tuned.</p>

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








