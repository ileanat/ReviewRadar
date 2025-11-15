import React from "react";

type ReviewCardProps = {
  product: string;
  category: string;
  rating: number; // e.g. 1–5
  review: string;
};

const ReviewCard: React.FC<ReviewCardProps> = ({
  product,
  category,
  rating,
  review,
}) => {
  const clampedRating = Math.max(0, Math.min(5, rating));

  return (
    <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      {/* Header: product + category */}
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{product}</h2>
          <p className="text-sm text-gray-500">{category}</p>
        </div>

        {/* Rating as stars + number */}
        <div className="flex items-center gap-1">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, index) => (
              <span
                key={index}
                className={
                  index < clampedRating ? "text-yellow-400" : "text-gray-300"
                }
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
    </div>
  );
};

export default ReviewCard;
