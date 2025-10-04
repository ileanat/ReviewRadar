import { useState } from 'react'
import loading from './assets/loading.gif'
//import reactLogo from './assets/react.svg'
//import viteLogo from '/vite.svg'
import './index.css'
import './App.css'
import { useEffect } from "react";

function App() {
  const [count, setCount] = useState(0)
  const [reviews, setReviews] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    //fetches reviews and from db.json
    fetch("/reviews")
      .then((res) => res.json())
      .then((data) => setReviews(data))
      .catch((err) => console.error("Error fetching reviews:", err));

  }, []);



  return (
    <>
      <div>
        <a href="https://cdn.dribbble.com/users/546766/screenshots/4790425/progress-circle.gif" target="_blank">
          <img src={loading} alt="Loading..." />
        </a>
      </div>
      <h1>ReviewRadar</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>

        {/* Tailwind test */}
        <div className="text-left ml-0 pl-0">
          Choose a Category:
        </div>
      </div>
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

    <p className="read-the-docs">
      Lots on our to-do list! Stay tuned.
    </p>
    

    
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
