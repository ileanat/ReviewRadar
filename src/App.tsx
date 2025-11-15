import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./index.css";
import "./App.css";
import logo from "./assets/logo.png";
import reviewart from "./assets/reviewart.png";


function App() {
  //const [count, setCount] = useState(0);
  const [reviews, setReviews] = useState<any[]>([]);
  const [product, setProduct] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [reviewText, setReviewText] = useState("");
  const [submittedReview, setSubmittedReview] = useState<string | null>(null);
  const [submittedRating, setSubmittedRating] = useState<number | null>(null);
  const [formCategory, setFormCategory] = useState("");
  const [rating, setRating] = useState(0); // ⭐ new state for star rating
  const navigate = useNavigate();

  useEffect(() => {
    // Connect to backend to fetch reviews- including star ratings
    //{id, product, review, category, rating}

    //api endpoint: http://localhost:8000/api/reviews
    
  }, []);

  const handleSubmit = () => {
    if (reviewText.trim() === "") return;

    // For now, just log review data

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product: product, category: formCategory, rating, review: reviewText })
    };
    fetch('http://localhost:8000/api/reviews', requestOptions)
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
      })
      .catch((error) => {
        console.error('Error:', error);
      });

    setSubmittedReview(reviewText);
    setSubmittedRating(rating);
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


      <div className="card">
        {/* <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button> */}
        
          <button
  onClick={() => navigate("/write-review")}
  className="mt-4 bg-transparent border-none p-0 cursor-pointer"
>
  <img
    src={reviewart}
    alt="Write a Review"
    className="w-48 h-auto mx-auto hover:scale-105 transition-transform duration-200 rounded-xl"
  />
</button>

        <div className="text-left ml-0 pl-0">Choose a Category:</div>
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
        <button
          className="mx-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => setSelectedCategory("Other")}
        >
          Other
        </button>
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
