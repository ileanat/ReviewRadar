import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./index.css";
import "./App.css";
import logo from "./assets/logo.png";
//import reviewart from "./assets/reviewart.png";
import makereviewart from "./assets/makereview.png";

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
  <div className="flex space-x-3 w-full">
    <button
      className="flex-1 px-6 py-4 text-lg bg-sky-500 text-white rounded hover:bg-blue-600 font-bold"
      onClick={() => navigate("/login")}
    >
      Login
    </button>

    <button
      className="flex-1 px-6 py-4 text-lg border-2 border-purple-500 bg-white text-purple-500 rounded hover:bg-purple-500 hover:text-white font-bold"
      onClick={() => navigate("/signup")}
    >
      Signup
    </button>
  </div>

{/* Left-side Make Review Art button */}
<div className="fixed top-32 left-4 z-50 ml-24"> 
  <button
    onClick={() => navigate("/write-review")}
    className="bg-transparent border-none p-0 cursor-pointer"
  >
    <img
      src={makereviewart}
      alt="Write a Review"
      className="w-[600px] h-auto hover:scale-105 transition-transform duration-200 rounded-xl"
    />
  </button>
</div>

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


{/* Placeholder Reviews Section */}
<div className="mt-64 px-6"> {/* mt-64 pushes it below the fixed category section */}
  <h2 className="text-xl font-semibold mb-4">Sample Reviews</h2>

  <div className="flex space-x-4 overflow-x-auto pb-4">
    {/* Sample review 1 */}
    <div className="min-w-[250px] p-4 border border-gray-300 rounded-md bg-white shadow-sm">
      <h3 className="font-semibold text-purple-400">Cosmic Lipstick</h3>
      <p>“This is a great product! Highly recommend.”</p>
      <p className="text-sm text-gray-400">⭐ 4/5</p>
    </div>

    {/* Sample review 2 */}
    <div className="min-w-[250px] p-4 border border-gray-300 rounded-md bg-white shadow-sm">
      <h3 className="font-semibold text-purple-400">Hydrating Face Cream</h3>
      <p>“I wasn’t satisfied, but customer service was helpful.”</p>
      <p className="text-sm text-gray-400">⭐ 3/5</p>
    </div>

    {/* Sample review 3 */}
    <div className="min-w-[250px] p-4 border border-gray-300 rounded-md bg-white shadow-sm">
      <h3 className="font-semibold text-purple-400">Stylish Hoodie</h3>
      <p>“Amazing quality and fast shipping!”</p>
      <p className="text-sm text-gray-400">⭐ 5/5</p>
    </div>

    {/* Sample review 4 */}
    <div className="min-w-[250px] p-4 border border-gray-300 rounded-md bg-white shadow-sm">
      <h3 className="font-semibold text-purple-400">Smartphone Gadget</h3>
      <p>“Works as expected. Love it!”</p>
      <p className="text-sm text-gray-400">⭐ 4/5</p>
    </div>
  </div>
</div>
</div>

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
  ) : null}
</div>


  </>
);

}

export default App;
