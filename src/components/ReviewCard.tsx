import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';

type ReviewCardProps = {
  reviewId: string;
  product: string;
  productKey?: string;
  category: string;
  rating: number;
  review: string;
};

const COUNTS_KEY = "rr_vote_counts";
const USER_VOTES_KEY = "rr_user_votes";

function getVoteCounts(): Record<string, { up: number; down: number }> {
  try {
    return JSON.parse(localStorage.getItem(COUNTS_KEY) || "{}");
  } catch {
    return {};
  }
}

function getUserVotes(): Record<string, "up" | "down"> {
  try {
    return JSON.parse(localStorage.getItem(USER_VOTES_KEY) || "{}");
  } catch {
    return {};
  }
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  reviewId,
  product,
  category,
  rating,
  review,
}) => {
  const clampedRating = Math.max(0, Math.min(5, rating));

  const [upCount, setUpCount] = useState(0);
  const [downCount, setDownCount] = useState(0);
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    if (!reviewId) return;
    const counts = getVoteCounts();
    const votes = getUserVotes();
    setUpCount(counts[reviewId]?.up ?? 0);
    setDownCount(counts[reviewId]?.down ?? 0);
    setUserVote(votes[reviewId] ?? null);
  }, [reviewId]);

  const handleVote = (direction: "up" | "down") => {
    if (!reviewId) return;
    const counts = getVoteCounts();
    const votes = getUserVotes();

    const current = votes[reviewId] ?? null;
    const entry = counts[reviewId] ?? { up: 0, down: 0 };

    if (current === direction) {
      // undo vote
      entry[direction] = Math.max(0, entry[direction] - 1);
      delete votes[reviewId];
      setUserVote(null);
    } else {
      // remove old vote if any
      if (current) entry[current] = Math.max(0, entry[current] - 1);
      entry[direction] += 1;
      votes[reviewId] = direction;
      setUserVote(direction);
    }

    counts[reviewId] = entry;
    localStorage.setItem(COUNTS_KEY, JSON.stringify(counts));
    localStorage.setItem(USER_VOTES_KEY, JSON.stringify(votes));
    setUpCount(entry.up);
    setDownCount(entry.down);
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      {/* Header: product + category */}
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <Link
            to={`/products/${product.toLowerCase().replace(/\s+/g, '')}`}
            state={{ displayName: product }}
            className="text-lg font-semibold text-gray-900 hover:text-blue-600"
          >
            {product}
          </Link>
          <p className="text-sm text-gray-500">{category}</p>
        </div>

        {/* Rating as stars + number */}
        <div className="flex items-center gap-1">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, index) => (
              <span
                key={index}
                className={index < clampedRating ? "text-yellow-400" : "text-gray-300"}
              >
                ★
              </span>
            ))}
          </div>
          <span className="text-sm font-medium text-gray-700">
            {clampedRating.toFixed(1).replace(".0", "")}/5
          </span>
        </div>
      </div>

      {/* Review text */}
      <p className="mt-2 text-sm leading-relaxed text-gray-800">{review}</p>

      {/* Thumbs up / down */}
      <div className="mt-3 flex items-center gap-3 border-t border-gray-100 pt-3">
        <button
          onClick={() => handleVote("up")}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition
            ${userVote === "up"
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-500 hover:bg-green-50 hover:text-green-600"}`}
        >
          👍 {upCount > 0 && <span>{upCount}</span>}
        </button>
        <button
          onClick={() => handleVote("down")}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition
            ${userVote === "down"
              ? "bg-red-100 text-red-600"
              : "bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500"}`}
        >
          👎 {downCount > 0 && <span>{downCount}</span>}
        </button>
      </div>
    </div>
  );
};

export default ReviewCard;
