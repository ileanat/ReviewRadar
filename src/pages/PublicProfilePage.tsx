import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReviewCard from "../components/ReviewCard";
import logo from "../assets/logo.png";
const environment = import.meta.env.VITE_CLIENT_ENV;

type Review = {
  _id?: string;
  product: string;
  category: string;
  rating: number;
  review: string;
  username?: string;
  thumbsupCount?: number;
  thumbsdownCount?: number;
  userVote?: "up" | "down" | null;
};

const PublicProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    setError(null);
    fetch(`${environment}/api/reviews/user/${encodeURIComponent(username)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
        return res.json();
      })
      .then((data) => setReviews(data))
      .catch((err) => setError(err.message || "Failed to load reviews"))
      .finally(() => setLoading(false));
  }, [username]);

  const totalUp = reviews.reduce((sum, r) => sum + (r.thumbsupCount ?? 0), 0);
  const totalDown = reviews.reduce((sum, r) => sum + (r.thumbsdownCount ?? 0), 0);
  const totalInteractions = totalUp + totalDown;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 shadow-sm bg-white sticky top-0 z-40">
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img src={logo} alt="ReviewRadar logo" className="w-16 h-auto" />
          <span className="text-2xl font-extrabold text-purple-500">ReviewRadar</span>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-200 transition"
        >
          ← Back
        </button>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10">
        {/* Profile card */}
        <div className="rounded-3xl bg-white border border-purple-100 shadow-md p-8 mb-8 flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-purple-100 ring-4 ring-purple-200 flex items-center justify-center shrink-0">
            <span className="text-3xl font-bold text-purple-400">
              {username?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">@{username}</h1>
            <p className="text-sm text-gray-400 mt-0.5">Public profile</p>
          </div>
        </div>

        {/* Stats row */}
        {!loading && !error && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="rounded-2xl bg-white border border-purple-100 shadow-sm p-5 text-center">
              <p className="text-3xl font-extrabold text-purple-500">{reviews.length}</p>
              <p className="text-xs text-gray-500 mt-1 font-medium uppercase tracking-wide">Reviews</p>
            </div>
            <div className="rounded-2xl bg-white border border-purple-100 shadow-sm p-5 text-center">
              <p className="text-3xl font-extrabold text-violet-500">{totalInteractions}</p>
              <p className="text-xs text-gray-500 mt-1 font-medium uppercase tracking-wide">Interactions</p>
            </div>
            <div className="rounded-2xl bg-white border border-purple-100 shadow-sm p-5 text-center">
              <p className="text-2xl font-extrabold">
                <span className="text-green-500">👍 {totalUp}</span>
                <span className="text-gray-300 mx-1">/</span>
                <span className="text-red-400">👎 {totalDown}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1 font-medium uppercase tracking-wide">Votes</p>
            </div>
          </div>
        )}

        {/* Reviews */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Reviews by @{username}</h2>
          <div className="rounded-2xl bg-white border border-purple-100 shadow-md p-6">
            {loading && <p className="text-sm text-gray-500">Loading reviews...</p>}
            {error && !loading && (
              <p className="text-sm text-red-500">Something went wrong: {error}</p>
            )}
            {!loading && !error && reviews.length === 0 && (
              <p className="text-sm text-gray-400">This user hasn't written any reviews yet.</p>
            )}
            {!loading && !error && reviews.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2 items-stretch">
                {reviews.map((r, i) => (
                  <ReviewCard
                    key={r._id ?? i}
                    reviewId={String(r._id ?? i)}
                    product={r.product}
                    category={r.category}
                    rating={r.rating}
                    review={r.review}
                    username={r.username}
                    thumbsupCount={r.thumbsupCount ?? 0}
                    thumbsdownCount={r.thumbsdownCount ?? 0}
                    userVote={r.userVote ?? null}
                    onVote={() => {}}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default PublicProfilePage;
