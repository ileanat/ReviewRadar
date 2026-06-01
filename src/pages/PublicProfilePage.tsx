import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReviewCard from "../components/ReviewCard";
import logo from "../assets/logo.png";
import bluePfp from "../assets/blue_pfp.png";
import greenPfp from "../assets/green_pfp.png";
import pinkPfp from "../assets/pink_pfp.png";
import redPfp from "../assets/red_pfp.png";
import { apiUrl } from "../lib/api";

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

const pfpMap: Record<string, string> = {
  blue: bluePfp,
  green: greenPfp,
  pink: pinkPfp,
  red: redPfp,
};

const PublicProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<{
    imageUrl: string;
    avatarColor?: string;
  } | null>(null);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!username) return;
    setLoading(true);
    setError(null);

    try {
      const [userRes, reviewsRes] = await Promise.all([
        fetch(apiUrl(`/api/users/by-username/${encodeURIComponent(username)}`)),
        fetch(apiUrl(`/api/reviews/user/${encodeURIComponent(username)}`)),
      ]);

      if (!userRes.ok) {
        throw new Error(
          userRes.status === 404 ? "User not found" : `User request failed (${userRes.status})`
        );
      }
      if (!reviewsRes.ok) {
        throw new Error(`Reviews request failed (${reviewsRes.status})`);
      }

      const userData = await userRes.json();
      const reviewsData = await reviewsRes.json();

      setProfileData(userData);
      setReviews(
        Array.isArray(reviewsData)
          ? reviewsData.map((r: Review) => ({
              ...r,
              thumbsupCount: r.thumbsupCount ?? 0,
              thumbsdownCount: r.thumbsdownCount ?? 0,
              userVote: r.userVote ?? null,
            }))
          : []
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load profile";
      setError(msg);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const totalUp = reviews.reduce((sum, r) => sum + (r.thumbsupCount ?? 0), 0);
  const totalDown = reviews.reduce((sum, r) => sum + (r.thumbsdownCount ?? 0), 0);
  const totalInteractions = totalUp + totalDown;

  const renderAvatar = () => {
    if (!profileData) {
      return <div className="h-full w-full animate-pulse bg-gray-200" />;
    }

    const url = profileData.imageUrl;
    const isManualUpload =
      url &&
      (url.includes("/uploaded/") ||
        url.includes(
          "eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvdXBsb2FkZWQv"
        ));

    if (isManualUpload) {
      return <img src={url} alt="" className="h-full w-full object-cover" />;
    }
    if (profileData.avatarColor && pfpMap[profileData.avatarColor]) {
      return (
        <img
          src={pfpMap[profileData.avatarColor]}
          alt=""
          className="h-full w-full object-cover"
        />
      );
    }
    return <img src={pfpMap.blue} alt="" className="h-full w-full object-cover" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-blue-50">
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 px-4 py-3 shadow-sm backdrop-blur sm:px-6 sm:py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-2">
          <div
            className="flex min-w-0 flex-1 cursor-pointer items-center gap-1.5 overflow-hidden sm:gap-3"
            onClick={() => navigate("/")}
          >
            <img src={logo} alt="ReviewRadar logo" className="h-auto w-9 shrink-0 sm:w-12" />
            <span className="truncate text-sm font-extrabold text-purple-500 sm:text-xl">
              ReviewRadar
            </span>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="shrink-0 rounded-full bg-gray-100 px-2.5 py-1.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-200 sm:px-4 sm:py-2 sm:text-sm"
          >
            ← Back
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 sm:py-10">
        <div className="mb-6 flex flex-col items-center gap-4 rounded-3xl border border-purple-100 bg-white p-6 shadow-md sm:mb-8 sm:flex-row sm:items-start sm:gap-6 sm:p-8">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-purple-100 ring-4 ring-purple-200 sm:h-24 sm:w-24">
            {loading && !profileData ? (
              <div className="h-full w-full animate-pulse bg-gray-200" />
            ) : (
              renderAvatar()
            )}
          </div>
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <h1 className="truncate text-xl font-extrabold text-gray-900 sm:text-2xl">
              @{username}
            </h1>
            <p className="mt-0.5 text-sm text-gray-400">Public profile</p>
          </div>
        </div>

        {error && !loading && (
          <p className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="mb-6 grid grid-cols-3 gap-2 sm:mb-8 sm:gap-4">
          <div className="flex min-w-0 flex-col items-center justify-center overflow-hidden rounded-xl border border-purple-100 bg-white px-2 py-3 text-center shadow-sm sm:rounded-2xl sm:p-5">
            <p className="text-xl font-extrabold leading-none text-purple-500 sm:text-3xl">
              {loading ? "—" : reviews.length}
            </p>
            <p className="mt-1.5 text-[9px] font-medium uppercase leading-tight tracking-wide text-gray-500 sm:mt-1 sm:text-xs">
              Reviews
            </p>
          </div>
          <div className="flex min-w-0 flex-col items-center justify-center overflow-hidden rounded-xl border border-purple-100 bg-white px-2 py-3 text-center shadow-sm sm:rounded-2xl sm:p-5">
            <p className="text-xl font-extrabold leading-none text-violet-500 sm:text-3xl">
              {loading ? "—" : totalInteractions}
            </p>
            <p className="mt-1.5 text-[9px] font-medium uppercase leading-tight tracking-wide text-gray-500 sm:mt-1 sm:text-xs">
              <span className="sm:hidden">Received</span>
              <span className="hidden sm:inline">Interactions Received</span>
            </p>
          </div>
          <div className="flex min-w-0 flex-col items-center justify-center overflow-hidden rounded-xl border border-purple-100 bg-white px-2 py-3 text-center shadow-sm sm:rounded-2xl sm:p-5">
            <div className="flex flex-col items-center gap-0.5 leading-none sm:flex-row sm:justify-center sm:gap-1">
              <span className="text-base font-extrabold text-green-500 sm:text-2xl">
                👍 {loading ? "—" : totalUp}
              </span>
              <span className="hidden text-gray-300 sm:inline">/</span>
              <span className="text-base font-extrabold text-red-400 sm:text-2xl">
                👎 {loading ? "—" : totalDown}
              </span>
            </div>
            <p className="mt-1.5 text-[9px] font-medium uppercase leading-tight tracking-wide text-gray-500 sm:mt-1 sm:text-xs">
              Votes
            </p>
          </div>
        </div>

        <section>
          <h2 className="mb-4 text-lg font-bold text-gray-900 sm:text-xl">
            Reviews by @{username}
          </h2>
          <div className="rounded-2xl border border-purple-100 bg-white p-4 shadow-md sm:p-6">
            {loading && <p className="text-sm text-gray-500">Loading reviews...</p>}
            {!loading && !error && reviews.length === 0 && (
              <p className="text-sm text-gray-400">
                This user hasn&apos;t written any reviews yet.
              </p>
            )}
            {!loading && !error && reviews.length > 0 && (
              <div className="grid items-stretch gap-4 md:grid-cols-2">
                {reviews.map((r, i) => (
                  <ReviewCard
                    key={r._id ?? i}
                    reviewId={String(r._id ?? i)}
                    product={r.product}
                    category={r.category}
                    rating={r.rating}
                    review={r.review}
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
