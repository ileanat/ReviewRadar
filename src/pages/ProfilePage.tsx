import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useClerk, useAuth } from "@clerk/clerk-react";
import ReviewCard from "../components/ReviewCard";
import logo from "../assets/logo.png";
import pink_pfp from "../assets/pink_pfp.png";

const environment = import.meta.env.VITE_CLIENT_ENV;

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

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { signOut } = useClerk();
  const { getToken } = useAuth();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showNameModal, setShowNameModal] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [nameSaving, setNameSaving] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  const syncUsernameToReviews = useCallback(
    async (username: string) => {
      const token = await getToken();
      const res = await fetch(`${environment}/api/reviews/sync-username`, {
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

  const fetchMine = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      const res = await fetch(`${environment}/api/reviews/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
      setReviews(await res.json());
    } catch (err: any) {
      setError(err.message || "Failed to load your reviews");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

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

  const openNameModal = () => {
    setNameInput(user?.username ?? user?.firstName ?? "");
    setNameError(null);
    setShowNameModal(true);
  };

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
      <header className="flex items-center justify-between px-6 py-4 shadow-sm bg-white sticky top-0 z-40">
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img src={logo} alt="ReviewRadar logo" className="w-16 h-auto" />
          <span className="text-2xl font-extrabold text-purple-500">ReviewRadar</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-200 transition"
          >
            ← Back
          </button>
          <button
            onClick={() => navigate("/write-review")}
            className="hidden sm:inline-flex items-center rounded-full bg-violet-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-violet-600 transition"
          >
            ✍️ Write a Review
          </button>
          <button
            className="px-4 py-2 text-sm font-semibold rounded-full bg-red-500 text-white hover:bg-red-600 transition"
            onClick={() => signOut(() => navigate("/"))}
          >
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10">
        {/* Profile card */}
        <div className="rounded-3xl bg-white border border-purple-100 shadow-md p-8 mb-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {user?.imageUrl ? (
            <img
              src={user?.imageUrl}   //profile picture
              alt="Profile avatar"
              className="w-24 h-24 rounded-full object-cover ring-4 ring-purple-200 shrink-0 scale-110
                hover:scale-125 transition-transform duration-300"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-purple-100 ring-4 ring-purple-200 flex items-center justify-center shrink-0">
              <span className="text-4xl font-bold text-purple-400">
                {displayName.charAt(0).toUpperCase()}
              </span>
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
            <button
              onClick={openNameModal}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white border border-purple-300 px-3 py-1 text-xs font-semibold text-purple-600 hover:bg-purple-50 transition"
            >
              ✏️ Change username
            </button>
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
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="rounded-2xl bg-white border border-purple-100 shadow-sm p-5 text-center">
            <p className="text-3xl font-extrabold text-purple-500">{reviews.length}</p>
            <p className="text-xs text-gray-500 mt-1 font-medium uppercase tracking-wide">Reviews</p>
          </div>
          <div className="rounded-2xl bg-white border border-purple-100 shadow-sm p-5 text-center">
            <p className="text-3xl font-extrabold text-violet-500">{totalInteractions}</p>
            <p className="text-xs text-gray-500 mt-1 font-medium uppercase tracking-wide">Interactions Received</p>
          </div>
          <div className="rounded-2xl bg-white border border-purple-100 shadow-sm p-5 text-center">
            <p className="text-2xl font-extrabold">
              <span className="text-green-500">👍 {totalUp}</span>
              <span className="text-gray-300 mx-1">/</span>
              <span className="text-red-400">👎 {totalDown}</span>
            </p>
            <p className="text-xs text-gray-500 mt-1 font-medium uppercase tracking-wide">Votes Received</p>
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
