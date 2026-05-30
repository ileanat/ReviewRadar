import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useClerk, useAuth } from "@clerk/clerk-react";
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
  createdAt?: string;
  thumbsupCount?: number;
  thumbsdownCount?: number;
};

const pfpMap: Record<string, string> = {
  blue: bluePfp,
  green: greenPfp,
  pink: pinkPfp,
  red: redPfp,
};

const AVATAR_COLORS = ["blue", "green", "pink", "red"] as const;

const colorSwatch: Record<string, string> = {
  blue: "#3b82f6",
  green: "#22c55e",
  pink: "#ec4899",
  red: "#ef4444",
};

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const { getToken, isLoaded } = useAuth();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [avatarColor, setAvatarColor] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const syncUsernameToReviews = useCallback(
    async (username: string) => {
      const token = await getToken();
      const res = await fetch(apiUrl("/api/reviews/sync-username"), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username }),
      });
      if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
    },
    [getToken]
  );

  const handleColorChange = async (color: string) => {
    try {
      const token = await getToken();
      await fetch(apiUrl("/api/users/update-avatar-color"), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ clerkUserId: user?.id, avatarColor: color }),
      });
      setAvatarColor(color);
      setShowColorPicker(false);
    } catch (err) {
      console.error("Failed to update:", err);
    }
  };

  const fetchMine = useCallback(async () => {
    if (!isLoaded) return;
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      const res = await fetch(apiUrl("/api/reviews/mine"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
      const data = await res.json();
      if (data.reviews && Array.isArray(data.reviews)) {
        setReviews(data.reviews);
      } else if (Array.isArray(data)) {
        setReviews(data);
      }
      if (data.avatarColor) {
        setAvatarColor(data.avatarColor);
      }
    } catch (err: any) {
      const msg = err?.message ?? "Failed to load your reviews";
      setError(
        msg.toLowerCase().includes("load failed") || msg === "Failed to fetch"
          ? "Could not reach the server. Make sure the backend is running."
          : msg
      );
    } finally {
      setLoading(false);
    }
  }, [getToken, isLoaded]);

  useEffect(() => {
    fetchMine();
  }, [fetchMine]);

  useEffect(() => {
    if (!user?.username) return;
    syncUsernameToReviews(user.username).catch(() => {});
  }, [user?.username, syncUsernameToReviews]);

  useEffect(() => {
    const onFocus = () => fetchMine();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchMine]);

  const totalUp = reviews.reduce((sum, r) => sum + (r.thumbsupCount ?? 0), 0);
  const totalDown = reviews.reduce((sum, r) => sum + (r.thumbsdownCount ?? 0), 0);
  const totalInteractions = totalUp + totalDown;

  const displayName =
    user?.username ?? user?.firstName ?? user?.primaryEmailAddress?.emailAddress ?? "User";

  const fullName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.firstName ?? null;

  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : null;

  const usesDefaultAvatar =
    !user?.imageUrl || user.imageUrl.includes("eyJ0eXBlIjoiZGVmYXVsdC");

  const avatarSrc =
    avatarColor && pfpMap[avatarColor] ? pfpMap[avatarColor] : pfpMap.blue;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-blue-50">
      <header className="sticky top-0 z-40 border-b border-purple-100/60 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
          <div
            className="flex min-w-0 flex-1 cursor-pointer items-center gap-1.5 overflow-hidden sm:gap-3"
            onClick={() => navigate("/")}
          >
            <img src={logo} alt="ReviewRadar logo" className="h-auto w-9 shrink-0 sm:w-12" />
            <span className="truncate text-sm font-extrabold text-purple-500 sm:text-xl">
              ReviewRadar
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <button
              onClick={() => navigate(-1)}
              className="rounded-full bg-gray-100 px-2.5 py-1.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-200 sm:px-4 sm:py-2 sm:text-sm"
            >
              ← Back
            </button>
            <button
              onClick={() => navigate("/write-review")}
              className="inline-flex items-center rounded-full bg-violet-500 px-2.5 py-1.5 text-xs font-semibold text-white shadow transition hover:bg-violet-600 sm:px-4 sm:py-2 sm:text-sm"
            >
              <span className="sm:hidden">✍️</span>
              <span className="hidden sm:inline">✍️ Write</span>
            </button>
            <button
              className="rounded-full bg-red-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-600 sm:px-4 sm:py-2 sm:text-sm"
              onClick={() => signOut(() => navigate("/"))}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
        {/* Profile card */}
        <div className="mb-6 rounded-2xl border border-purple-100 bg-white p-5 shadow-md sm:mb-8 sm:rounded-3xl sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
            {/* Media section — avatar & color picker */}
            <section className="flex w-full flex-col items-center sm:w-auto sm:items-start">
              {loading ? (
                <div className="h-24 w-24 shrink-0 animate-pulse rounded-full bg-gray-100 ring-4 ring-purple-200 sm:h-28 sm:w-28" />
              ) : (
                <div className="flex w-full max-w-xs flex-col items-center sm:max-w-none sm:items-start">
                  {usesDefaultAvatar ? (
                    <button
                      type="button"
                      onClick={() => setShowColorPicker((v) => !v)}
                      className="rounded-full outline-none transition-transform hover:scale-105 active:scale-95"
                      aria-label="Choose avatar color"
                    >
                      <img
                        src={avatarSrc}
                        alt="Your avatar"
                        className="h-24 w-24 rounded-full object-cover ring-4 ring-purple-200 sm:h-28 sm:w-28"
                      />
                    </button>
                  ) : (
                    <img
                      src={user.imageUrl}
                      alt="Your avatar"
                      className="h-24 w-24 rounded-full object-cover ring-4 ring-purple-200 sm:h-28 sm:w-28"
                    />
                  )}

                  {usesDefaultAvatar && (
                    <p className="mt-2 text-center text-xs text-gray-400 sm:text-left">
                      Tap to change color
                    </p>
                  )}

                  {showColorPicker && usesDefaultAvatar && (
                    <div className="mt-4 flex w-full justify-center gap-3 rounded-xl border border-purple-100 bg-purple-50/50 p-3 sm:justify-start">
                      {AVATAR_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => handleColorChange(color)}
                          aria-label={`${color} avatar`}
                          className={`h-9 w-9 rounded-full border-2 transition sm:h-8 sm:w-8 ${
                            avatarColor === color
                              ? "border-purple-500 ring-2 ring-purple-200"
                              : "border-transparent hover:scale-110"
                          }`}
                          style={{ backgroundColor: colorSwatch[color] }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Profile info */}
            <section className="min-w-0 flex-1 text-center sm:text-left">
              <h1 className="text-xl font-extrabold text-gray-900 sm:text-2xl">
                {fullName ?? displayName}
              </h1>
              {user?.username && (
                <p className="mt-0.5 text-sm font-medium text-purple-500">@{user.username}</p>
              )}
              {user?.primaryEmailAddress?.emailAddress && (
                <p className="mt-0.5 break-all text-sm text-gray-500">
                  {user.primaryEmailAddress.emailAddress}
                </p>
              )}
              {joinedDate && (
                <p className="mt-1 text-xs text-gray-400">Member since {joinedDate}</p>
              )}
              {user?.passwordEnabled && (
                <button
                  onClick={() => openUserProfile()}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-purple-300 bg-white px-3 py-1.5 text-xs font-semibold text-purple-600 transition hover:bg-purple-50"
                >
                  ✏️ Update Account
                </button>
              )}
            </section>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-3 gap-2 sm:mb-8 sm:gap-4">
          <div className="flex min-w-0 flex-col items-center justify-center overflow-hidden rounded-xl border border-purple-100 bg-white px-2 py-3 text-center shadow-sm sm:rounded-2xl sm:p-5">
            <p className="text-xl font-extrabold leading-none text-purple-500 sm:text-3xl">{reviews.length}</p>
            <p className="mt-1.5 text-[9px] font-medium uppercase leading-tight tracking-wide text-gray-500 sm:mt-1 sm:text-xs">
              Reviews
            </p>
          </div>
          <div className="flex min-w-0 flex-col items-center justify-center overflow-hidden rounded-xl border border-purple-100 bg-white px-2 py-3 text-center shadow-sm sm:rounded-2xl sm:p-5">
            <p className="text-xl font-extrabold leading-none text-violet-500 sm:text-3xl">{totalInteractions}</p>
            <p className="mt-1.5 text-[9px] font-medium uppercase leading-tight tracking-wide text-gray-500 sm:mt-1 sm:text-xs">
              <span className="sm:hidden">Received</span>
              <span className="hidden sm:inline">Interactions Received</span>
            </p>
          </div>
          <div className="flex min-w-0 flex-col items-center justify-center overflow-hidden rounded-xl border border-purple-100 bg-white px-2 py-3 text-center shadow-sm sm:rounded-2xl sm:p-5">
            <div className="flex flex-col items-center gap-0.5 leading-none sm:flex-row sm:justify-center sm:gap-1">
              <span className="text-base font-extrabold text-green-500 sm:text-2xl">👍 {totalUp}</span>
              <span className="hidden text-gray-300 sm:inline">/</span>
              <span className="text-base font-extrabold text-red-400 sm:text-2xl">👎 {totalDown}</span>
            </div>
            <p className="mt-1.5 text-[9px] font-medium uppercase leading-tight tracking-wide text-gray-500 sm:mt-1 sm:text-xs">
              Votes
            </p>
          </div>
        </div>

        {/* Reviews */}
        <section>
          <h2 className="mb-3 text-lg font-bold text-gray-900 sm:mb-4 sm:text-xl">My Reviews</h2>

          <div className="rounded-2xl border border-purple-100 bg-white p-4 shadow-md sm:p-6">
            {loading && (
              <p className="text-sm text-gray-500">Loading your reviews...</p>
            )}
            {error && !loading && (
              <p className="text-sm text-red-500">Something went wrong: {error}</p>
            )}
            {!loading && !error && reviews.length === 0 && (
              <div className="py-6 text-center sm:py-8">
                <p className="mb-3 text-sm text-gray-400">You haven't written any reviews yet.</p>
                <button
                  onClick={() => navigate("/write-review")}
                  className="rounded-full bg-violet-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-violet-600"
                >
                  Write your first review
                </button>
              </div>
            )}
            {!loading && !error && reviews.length > 0 && (
              <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2">
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
                    userVote={null}
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

export default ProfilePage;
