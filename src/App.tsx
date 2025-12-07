//@ts-nocheck

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./index.css";
import "./App.css";
import logo from "./assets/logo.png";
import { useAuth } from "./context/AuthContext";
import makereview1 from "./assets/makereview1.png";

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
  const [searchTerm, setSearchTerm] = useState("");
  const {user, logout} = useAuth();
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

    // sample reviews data
    const sampleReviews = [
      {
        id: 1,
        product: "Cosmic Lipstick",
        text: "This is a great product! Highly recommend.",
        rating: 4,
        category: "Cosmetics",
      },
      {
        id: 2,
        product: "Hydrating Face Cream",
        text: "I wasn’t satisfied, but customer service was helpful.",
        rating: 3,
        category: "Skincare",
      },
      {
        id: 3,
        product: "Stylish Hoodie",
        text: "Amazing quality and fast shipping!",
        rating: 5,
        category: "Clothes",
      },
      {
        id: 4,
        product: "Smartphone Gadget",
        text: "Works as expected. Love it!",
        rating: 4,
        category: "Tech",
      },
    ];
  
    const term = searchTerm.toLowerCase();
  
    // filter sample reviews based on search
    const filteredSampleReviews = sampleReviews.filter((r) => {
      if (!term) return true;
      return (
        r.product.toLowerCase().includes(term) ||
        r.text.toLowerCase().includes(term)
      );
    });
  
    //filter real reviews too
    const filteredReviews = reviews
    .filter((r) => !selectedCategory || r.category === selectedCategory)
    .filter((r) => {
      if (!term) return true;
      return (
        r.product.toLowerCase().includes(term) ||
        r.review.toLowerCase().includes(term)
      );
    });

  return (
  <>

    {/* Top-left logo + title */}
<div className="fixed top-4 left-4 flex items-center space-x-4 z-50">
  <img src={logo} alt="Logo" className="w-24 h-auto" /> {/* increased from w-16 to w-24 */}
  <h1 className="text-purple-500 text-4xl font-bold"> {/* increased from text-2xl to text-4xl */}
    ReviewRadar
  </h1>
</div>

    {/* Top-right login/signup + reviewart */}
<div className="fixed top-4 right-4 flex flex-col items-center space-y-3 z-50">

  {/* Login + Signup buttons */}
{/* Top-right login/signup OR greeting */}
<div className="flex space-x-3 w-full text-right">

  {!user ? (
    <>
      {/* LOGIN BUTTON */}
      <button
        className="px-6 py-4 text-lg bg-sky-500 text-white rounded hover:bg-blue-600 font-bold"
        onClick={() => navigate("/login")}
      >
        Login
      </button>

      {/* SIGNUP BUTTON */}
      <button
        className="px-6 py-4 text-lg border-2 border-purple-500 bg-white text-purple-500 rounded hover:bg-purple-500 hover:text-white font-bold"
        onClick={() => navigate("/signup")}
      >
        Signup
      </button>
    </>
  ) : (
    <>
      {/* GREETING */}
      <div className="text-purple-600 text-xl font-bold">
        Hello, {user.username} 👋
      </div>

      {/* LOGOUT BUTTON */}
      <button
        className="px-6 py-3 ml-4 bg-red-500 text-white rounded hover:bg-red-600 font-bold"
        onClick={logout}
      >
        Logout
      </button>
    </>
  )}

</div>




{/* Left-side Make Review Art button */}
<div className="fixed top-32 left-4 z-50 ml-24"> 
  <button
    onClick={() => navigate("/write-review")}
    className="bg-transparent border-none p-0 cursor-pointer"
  >
    <img
      src={makereview1}
      alt="Write a Review"
      className="w-96 h-auto hover:scale-105 transition-transform duration-200 rounded-xl"
    />
  </button>
</div>

</div>

{/* Search Bar */}
<div className="fixed top-28 left-1/2 transform -translate-x-1/2 z-50">
  <input
    type="text"
    placeholder="Search reviews..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="w-96 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
  />
</div>

{/* Category section */}
<div className="fixed top-48 left-1/2 transform -translate-x-1/2 text-center z-40">
  <div className="text-2xl font-semibold mb-4">Choose a Category:</div>

  {/* Move buttons lower by increasing mt value */}
  <div className="flex justify-center mt-10">
    <button
      className="mx-3 px-6 py-4 text-lg font-bold bg-sky-500 text-white rounded hover:bg-blue-600"
      onClick={() => setSelectedCategory("Cosmetics")}
    >
      Cosmetics
    </button>

    <button
      className="mx-3 px-6 py-4 text-lg font-bold bg-violet-500 text-white rounded hover:bg-purple-600"
      onClick={() => setSelectedCategory("Skincare")}
    >
      Skincare
    </button>

    <button
      className="mx-3 px-6 py-4 text-lg font-bold bg-purple-500 text-white rounded hover:bg-purple-600"
      onClick={() => setSelectedCategory("Clothes")}
    >
      Clothes
    </button>

    <button
      className="mx-3 px-6 py-4 text-lg font-bold bg-violet-500 text-white rounded hover:bg-violet-600"
      onClick={() => setSelectedCategory("Tech")}
    >
      Tech
    </button>

    <button
      className="mx-3 px-6 py-4 text-lg font-bold bg-blue-500 text-white rounded hover:bg-blue-600"
      onClick={() => setSelectedCategory("Other")}
    >
      Other
    </button>
  </div>

  {/* Sample Reviews Section */}
<div className="mt-64 px-6"> {/* mt-64 pushes it below the fixed category section */}
  <h2 className="text-xl font-semibold mb-4">Sample Reviews</h2>

  <div className="flex space-x-4 overflow-x-auto pb-4">
  {filteredSampleReviews.map((r) => (
    <div
      key={r.id}
      className="min-w-[250px] p-4 border border-gray-300 rounded-md bg-white shadow-sm"
    >
      <h3 className="font-semibold text-purple-400">{r.product}</h3>
      <p>{r.text}</p>
      <p className="text-sm text-gray-400">⭐ {r.rating}/5</p>
    </div>
  ))}
  
  {filteredSampleReviews.length === 0 && (
    <p className="text-sm text-gray-400">
      No sample reviews match your search.
    </p>
  )}

</div>
</div>
</div>

    {/* Reviews Section */}
<div className="mt-6 text-left px-6">
  {selectedCategory ? (
    filteredReviews.map((r) => (
      <div key={r.id} className="p-4 border-b border-gray-300">
        <h3 className="font-semibold text-purple-400">{r.product}</h3>
        <p>{r.review}</p>
        <p className="text-sm text-gray-400">⭐ {r.rating}/5</p>
      </div>
      ))
  ) : null}
</div>


  </>
);

}

export default App;
