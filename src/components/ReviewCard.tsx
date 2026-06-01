import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { apiUrl } from "../lib/api";
import { useAuth } from "@clerk/clerk-react";

type ReviewCardProps = {
  reviewId: string;
  product: string;
  productKey?: string;
  category: string;
  rating: number;
  review: string;
  username?: string;
  thumbsupCount: number; 
  thumbsdownCount: number;
  userVote: "up" | "down" | null;
  onVote: (id: string, type: "up" | "down") => void;
};

const ReviewCard: React.FC<ReviewCardProps> = ({
  reviewId,
  product,
  category,
  rating,
  review,
  username,
  thumbsupCount, 
  thumbsdownCount,
  userVote: initialUserVote,
}) => {
  const clampedRating = Math.max(0, Math.min(5, rating));

  const [upCount, setUpCount] = useState<number>(0);
  const [downCount, setDownCount] = useState<number>(0);
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null);
  const { getToken, userId } = useAuth();

  useEffect(() => {
  setUpCount(thumbsupCount ?? 0);
  setDownCount(thumbsdownCount ?? 0);
  setUserVote(initialUserVote);
}, [thumbsupCount, thumbsdownCount, initialUserVote]);
  

  const handleVote = async (direction: "up" | "down") => {
  if (!reviewId){return};
  if (!userId) {
    alert("Please sign in to thumbs up/down reviews!");
    return;
  }

  try {
    const token = await getToken(); 

    const response = await fetch(apiUrl("/api/reviews/vote"), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ reviewId, voteType: direction })
    });

    if (response.ok) {
      const data = await response.json();
      
      setUpCount(data.newUpCount ?? 0);
      setDownCount(data.newDownCount ?? 0);
      setUserVote(data.userAction);
    }
  } catch (error) {
    console.error("Failed to vote:", error);
  }
};

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-white p-4 shadow-sm flex flex-col h-full">
      {/* Header: product + category */}
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          {username && (
            <Link
              to={`/user/${encodeURIComponent(username)}`}
              className="text-sm font-semibold text-purple-400 hover:text-purple-600 hover:underline mb-0.5 block"
              onClick={(e) => e.stopPropagation()}
            >
              @{username}
            </Link>
          )}
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
        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
          <div className="flex text-sm leading-none sm:text-base">
            {Array.from({ length: 5 }).map((_, index) => (
              <span
                key={index}
                className={index < clampedRating ? "text-yellow-400" : "text-gray-300"}
              >
                ★
              </span>
            ))}
          </div>
          <span className="text-xs font-medium text-gray-700 sm:text-sm">
            {clampedRating.toFixed(1).replace(".0", "")}/5
          </span>
        </div>
      </div>

      {/* Review text — grows to fill remaining space, pushing footer down */}
      <p className="mt-2 text-sm leading-relaxed text-gray-800 flex-1">{review}</p>

      {/* Thumbs up / down — always at the bottom */}
      <div className="mt-2 flex items-center gap-2 border-t border-gray-100 pt-2">
        <button
          onClick={() => handleVote("up")}
          className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-sm font-medium transition
            ${userVote === "up"
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-500 hover:bg-green-50 hover:text-green-600"}`}
        >
          👍 <span>{upCount}</span>
        </button>
        <button
          onClick={() => handleVote("down")}
          className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-sm font-medium transition
            ${userVote === "down"
              ? "bg-red-100 text-red-600"
              : "bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500"}`}
        >
          👎 <span>{downCount}</span>
        </button>
      </div>
    </div>
  );
};

export default ReviewCard;
