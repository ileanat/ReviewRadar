import { useParams, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
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
                <div className="p-8 bg-white min-h-screen text-black">
                <h1 className="text-3xl font-bold mb-6 !bg-none ![-webkit-text-fill-color:black] text-">Loading Reviews...</h1>
                </div>
  );

  if (!data.product) {
  return (
    <div className="p-8 bg-white min-h-screen text-black">
      <h1 className="text-3xl font-bold mb-6 !bg-none ![-webkit-text-fill-color:black] text-">No reviews found</h1>
    </div>
  );
}

  return (
    <div className="p-8 bg-white min-h-screen text-black">
      <h1 className="text-3xl font-bold mb-6 !bg-none ![-webkit-text-fill-color:black] text-black">{passedName || data.product?.name || key}</h1>

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
    </div>
  );
};
export default ProductPage;