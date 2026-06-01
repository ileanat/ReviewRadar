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
  red: redPfp
};

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const { getToken, isLoaded } = useAuth();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showNameModal, setShowNameModal] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [nameSaving, setNameSaving] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
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
        method: 'PATCH',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ clerkUserId: user?.id, avatarColor: color })
        });
        setAvatarColor(color);

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
      }
      else if (Array.isArray(data)) {
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

  // Keep stored review usernames in sync when Clerk username differs (e.g. after a rename)
  useEffect(() => {
    if (!user?.username) return;
    syncUsernameToReviews(user.username).catch(() => {});
  }, [user?.username, syncUsernameToReviews]);

  // Refetch when user tabs back so vote counts stay fresh
  useEffect(() => {
    const onFocus = () => fetchMine();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchMine]);

  // Stats derived from fetched reviews
  const totalUp = reviews.reduce((sum, r) => sum + (r.thumbsupCount ?? 0), 0);
  const totalDown = reviews.reduce((sum, r) => sum + (r.thumbsdownCount ?? 0), 0);
  const totalInteractions = totalUp + totalDown;

  const displayName =
    user?.username ?? user?.firstName ?? user?.primaryEmailAddress?.emailAddress ?? "User";

  const fullName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.firstName ?? null;

  const saveDisplayName = async () => {
    if (!user || !nameInput.trim()) return;
    setNameSaving(true);
    setNameError(null);
    try {
      const newUsername = nameInput.trim();
      await user.update({ username: newUsername });
      await syncUsernameToReviews(newUsername);
      setShowNameModal(false);
    } catch (err: any) {
      setNameError(err.errors?.[0]?.message ?? err.message ?? "Failed to update name.");
    } finally {
      setNameSaving(false);
    }
  };

  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : null;

  

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-blue-50">
      {/* Header */}
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
              className="rounded-full bg-red-500 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-red-600 sm:px-4 sm:py-2 sm:text-sm"
              onClick={() => signOut(() => navigate("/"))}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10">
        {/* Profile card */}
        <div className="rounded-3xl bg-white border border-purple-100 shadow-md p-8 mb-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {loading ? (
            <div className="w-24 h-24 rounded-full bg-gray-100 animate-pulse ring-4 ring-purple-200 shrink-0" />
            ) : (
            <div className="relative group">
                {(!user?.imageUrl || user.imageUrl.includes("eyJ0eXBlIjoiZGVmYXVsdC")) ? (
                <button 
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className="transition-transform hover:scale-105 active:scale-95 outline-none"
                >
                    <img
                    src={avatarColor && pfpMap[avatarColor] ? pfpMap[avatarColor] : pfpMap.blue}
                    className="w-24 h-24 rounded-full object-cover ring-4 ring-purple-200 shrink-0"
                    />
                </button>
                ) : (
                <img
                    src={user.imageUrl}
                    className="w-24 h-24 rounded-full object-cover ring-4 ring-purple-200 shrink-0"
                />
                )}

                {showColorPicker && !user?.imageUrl?.includes("upload") && (
                <div className="absolute top-28 left-0 flex gap-2 bg-white p-2 rounded-xl shadow-lg border border-purple-100 z-10">
                    {["blue", "green", "pink", "red"].map((color) => (
                    <button
                        key={color}
                        onClick={() => handleColorChange(color)}
                        className={`w-8 h-8 rounded-full border-2 ${avatarColor === color ? 'border-purple-500 ring-2 ring-purple-200' : 'border-transparent'}`}
                        style={{
                        backgroundColor: color === 'blue' ? '#3b82f6' :
                                        color === 'green' ? '#22c55e' :
                                        color === 'pink' ? '#ec4899' : '#ef4444'
                        }}
                    />
                    ))}
                </div>
                )}
            </div>
            )}

          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-extrabold text-gray-900">
              {fullName ?? displayName}
            </h1>
            {user?.username && (
              <p className="text-sm text-purple-500 font-medium mt-0.5">@{user.username}</p>
            )}
            {user?.primaryEmailAddress?.emailAddress && (
              <p className="text-sm text-gray-500 mt-0.5">
                {user.primaryEmailAddress.emailAddress}
              </p>
            )}
            {joinedDate && (
              <p className="text-xs text-gray-400 mt-1">Member since {joinedDate}</p>
            )}
            {user?.passwordEnabled && (
            <button
                onClick={() => openUserProfile()}
                className="mt-3 ml-2 inline-flex items-center gap-1.5 rounded-full bg-white border border-purple-300 px-3 py-1 text-xs font-semibold text-purple-600 hover:bg-purple-50 transition"
            >
                Update Account
            </button>
            )}
        </div>
    </div>

        {/* Change display name modal */}
        {showNameModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl border border-purple-100">
              <h2 className="text-lg font-bold text-gray-900 mb-1">Change username</h2>
              <p className="text-xs text-gray-500 mb-4">This updates the username shown across ReviewRadar.</p>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveDisplayName()}
                placeholder="New display name"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 mb-3"
                autoFocus
              />
              {nameError && (
                <p className="text-xs text-red-500 mb-3">{nameError}</p>
              )}
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowNameModal(false)}
                  className="rounded-full px-4 py-1.5 text-sm font-semibold text-gray-500 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={saveDisplayName}
                  disabled={nameSaving || !nameInput.trim()}
                  className="rounded-full bg-purple-500 px-4 py-1.5 text-sm font-semibold text-white hover:bg-purple-600 transition disabled:opacity-50"
                >
                  {nameSaving ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats row */}
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

        {/* Reviews section */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">My Reviews</h2>

          <div className="rounded-2xl bg-white border border-purple-100 shadow-md p-6">
            {loading && (
              <p className="text-sm text-gray-500">Loading your reviews...</p>
            )}
            {error && !loading && (
              <p className="text-sm text-red-500">Something went wrong: {error}</p>
            )}
            {!loading && !error && reviews.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-400 text-sm mb-3">You haven't written any reviews yet.</p>
                <button
                  onClick={() => navigate("/write-review")}
                  className="rounded-full bg-violet-500 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-600 transition"
                >
                  Write your first review
                </button>
              </div>
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
