import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import logo from '../assets/logo.png';
const environment = import.meta.env.VITE_CLIENT_ENV;

interface ProductData {
  product: {
    _id: string;
    name: string;
    key: string;
  };
  reviews: Array<{
    _id: string;
    username: string;
    review: string;
    rating: number;
    category: string;
  }>;
}
const ProductPage = () => {
  const { key } = useParams<{ key: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState<ProductData | null>(null);
  const passedName = location.state?.displayName;
  const [summary, setSummary] = useState<string>("");
  const [loadingSummary, setLoadingSummary] = useState(false);

  useEffect(() => {
    fetch(`${environment}/api/products/${key}`)
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        if (json.reviews?.length > 0 && !summary && !loadingSummary) {
            getAiSummary(json.reviews);
        }
      })
      .catch((err) => console.error("Error:", err));
  }, [key]);

  const getAiSummary = async (reviews: any[]) => {
  setLoadingSummary(true);
  try {
    const response = await fetch(import.meta.env.VITE_AI_WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviews })
    });
    const result = await response.json();
    if (result && result.summary) {
        setSummary(result.summary);
        } else {
            setSummary("Not enough review data to generate a summary.");
        }
  } catch (err) {
    console.error("AI Error:", err);
    setSummary("Summary temporarily unavailable.");
  } finally {
    setLoadingSummary(false);
  }
};

  if (!data) return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-blue-50">
      <header className="flex items-center justify-between px-6 py-4 shadow-sm bg-white/80 backdrop-blur sticky top-0 z-40">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
          <img src={logo} alt="ReviewRadar logo" className="w-16 h-auto" />
          <span className="text-2xl font-extrabold text-purple-500">ReviewRadar</span>
        </div>
        <button onClick={() => navigate("/")} className="px-5 py-2 rounded-full bg-purple-500 text-white font-semibold shadow hover:bg-purple-600 transition">
          ← Back to Home
        </button>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <p className="text-sm text-gray-500">Loading Reviews...</p>
      </main>
    </div>
  );

  if (!data.product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-blue-50">
        <header className="flex items-center justify-between px-6 py-4 shadow-sm bg-white/80 backdrop-blur sticky top-0 z-40">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <img src={logo} alt="ReviewRadar logo" className="w-16 h-auto" />
            <span className="text-2xl font-extrabold text-purple-500">ReviewRadar</span>
          </div>
          <button onClick={() => navigate("/")} className="px-5 py-2 rounded-full bg-purple-500 text-white font-semibold shadow hover:bg-purple-600 transition">
            ← Back to Home
          </button>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">
          <p className="text-sm text-gray-500">No reviews found</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-blue-50">
      <header className="flex items-center justify-between px-6 py-4 shadow-sm bg-white/80 backdrop-blur sticky top-0 z-40">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
          <img src={logo} alt="ReviewRadar logo" className="w-16 h-auto" />
          <span className="text-2xl font-extrabold text-purple-500">ReviewRadar</span>
        </div>
        <button onClick={() => navigate("/")} className="px-5 py-2 rounded-full bg-purple-500 text-white font-semibold shadow hover:bg-purple-600 transition">
          ← Back to Home
        </button>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{passedName || data.product?.name || key}</h1>
          <p className="text-sm text-gray-600 mt-2">Customer reviews and AI-powered insights</p>
        </div>

      <div className="mb-8 p-6 bg-slate-50 border border-slate-200 rounded-2xl shadow-sm">
        <h2 className="text-indigo-600 font-bold text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
          <span className="text-lg">✨</span> AI Review Summary
        </h2>
        {loadingSummary ? (
          <div className="flex items-center gap-3">
             <div className="animate-spin h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
             <p className="text-slate-500 italic text-sm">Analyzing customer feedback...</p>
          </div>
        ) : (
          <p className="text-slate-800 leading-relaxed font-medium">
            {summary ? `"${summary}"` : "Not enough review data to generate a summary."}
          </p>
        )}
      </div>

      {data.reviews.map((rev) => (
        <div key={rev._id} className="border border-black-200 p-4 rounded-lg my-2 shadow-sm bg-white">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-yellow-500">★ {rev.rating}</span>
            <span className="text-sm text-black-500">by {rev.username}</span>
          </div>
          <p className="text-black-800">{rev.review}</p>
        </div>
      ))}
      </main>
    </div>
  );
};
export default ProductPage;