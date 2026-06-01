import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import logo from '../assets/logo.png';
import { apiUrl, aiWorkerUrl } from "../lib/api";

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

const ProductPageHeader = ({ onBack }: { onBack: () => void }) => (
  <header className="sticky top-0 z-40 border-b border-purple-100/60 bg-white/95 backdrop-blur-sm">
    <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:px-6 sm:py-4">
      <div
        className="flex min-w-0 flex-1 cursor-pointer items-center gap-1.5 overflow-hidden sm:gap-3"
        onClick={onBack}
      >
        <img src={logo} alt="ReviewRadar logo" className="h-auto w-9 shrink-0 sm:w-14" />
        <span className="truncate text-sm font-extrabold text-purple-500 sm:text-2xl">
          ReviewRadar
        </span>
      </div>
      <button
        onClick={onBack}
        className="shrink-0 rounded-full bg-purple-500 px-2.5 py-1.5 text-xs font-semibold text-white shadow transition hover:bg-purple-600 sm:px-4 sm:py-2 sm:text-sm"
      >
        <span className="sm:hidden">←</span>
        <span className="hidden sm:inline">← Back to Home</span>
      </button>
    </div>
  </header>
);

const ProductPage = () => {
  const { key } = useParams<{ key: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState<ProductData | null>(null);
  const passedName = location.state?.displayName;
  const [summary, setSummary] = useState<string>("");
  const [loadingSummary, setLoadingSummary] = useState(false);

  useEffect(() => {
    fetch(apiUrl(`/api/products/${key}`))
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
    const workerUrl = aiWorkerUrl();
    if (!workerUrl) {
      setSummary("Not enough review data to generate a summary.");
      return;
    }
    const response = await fetch(workerUrl, {
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
      <ProductPageHeader onBack={() => navigate("/")} />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <p className="text-sm text-gray-500">Loading Reviews...</p>
      </main>
    </div>
  );

  if (!data.product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-blue-50">
        <ProductPageHeader onBack={() => navigate("/")} />
        <main className="mx-auto max-w-6xl px-4 py-8">
          <p className="text-sm text-gray-500">No reviews found</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-blue-50">
      <ProductPageHeader onBack={() => navigate("/")} />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{passedName || data.product?.name || key}</h1>
          <p className="text-sm text-gray-600 mt-2">Customer reviews and AI-powered insights</p>
        </div>

      <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:mb-8 sm:p-6">
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
