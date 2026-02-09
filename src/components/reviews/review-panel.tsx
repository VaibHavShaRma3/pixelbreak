"use client";

import { useState, useEffect } from "react";
import { Star, MessageSquare, User } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { timeAgo } from "@/lib/utils";

interface ReviewData {
  id: string;
  rating: number;
  content: string;
  createdAt: string;
  username: string | null;
  avatarUrl: string | null;
}

interface ReviewPanelProps {
  gameSlug: string;
}

function ReviewSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="rounded-lg bg-surface-2 p-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="ml-auto h-4 w-16" />
          </div>
          <Skeleton className="mt-2 h-4 w-20" />
          <Skeleton className="mt-2 h-4 w-full" />
          <Skeleton className="mt-1 h-4 w-3/4" />
        </div>
      ))}
    </div>
  );
}

function StarRating({
  rating,
  interactive = false,
  onRate,
}: {
  rating: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          className={`text-lg transition-transform ${
            interactive
              ? "cursor-pointer hover:scale-110"
              : "cursor-default"
          }`}
          style={{
            color:
              star <= (interactive ? hovered || rating : rating)
                ? "#ffe14d"
                : "#555",
          }}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          onClick={() => interactive && onRate?.(star)}
        >
          {star <= (interactive ? hovered || rating : rating) ? "\u2605" : "\u2606"}
        </button>
      ))}
    </div>
  );
}

export function ReviewPanel({ gameSlug }: ReviewPanelProps) {
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formRating, setFormRating] = useState(0);
  const [formContent, setFormContent] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/reviews?gameSlug=${encodeURIComponent(gameSlug)}`)
      .then((res) => res.json())
      .then((data) => {
        setReviews(data.reviews || []);
        setLoading(false);
      })
      .catch(() => {
        setReviews([]);
        setLoading(false);
      });
  }, [gameSlug]);

  const handleSubmit = async () => {
    if (formRating === 0) {
      setError("Please select a rating.");
      return;
    }
    if (!formContent.trim()) {
      setError("Please write a review.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameSlug,
          rating: formRating,
          content: formContent.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit review");
      }

      // Refresh reviews
      const refreshRes = await fetch(
        `/api/reviews?gameSlug=${encodeURIComponent(gameSlug)}`
      );
      const refreshData = await refreshRes.json();
      setReviews(refreshData.reviews || []);

      // Reset form
      setFormRating(0);
      setFormContent("");
      setShowForm(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to submit review"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-neon-yellow" />
          Reviews
          {reviews.length > 0 && (
            <span className="ml-2 text-sm font-normal text-muted">
              ({reviews.length})
            </span>
          )}
        </CardTitle>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2">
            <StarRating rating={Math.round(averageRating)} />
            <span className="text-sm text-muted">
              {averageRating.toFixed(1)} avg
            </span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <ReviewSkeleton />
        ) : (
          <>
            {/* Write Review Button / Form */}
            {!showForm ? (
              <Button
                variant="outline"
                size="sm"
                className="mb-4 w-full"
                onClick={() => setShowForm(true)}
              >
                Write a Review
              </Button>
            ) : (
              <div className="mb-6 rounded-lg border border-border bg-surface-2 p-4">
                <h3 className="mb-3 text-sm font-semibold text-foreground">
                  Write a Review
                </h3>

                {/* Star Picker */}
                <div className="mb-3">
                  <label className="mb-1 block text-xs text-muted">
                    Your Rating
                  </label>
                  <StarRating
                    rating={formRating}
                    interactive
                    onRate={setFormRating}
                  />
                </div>

                {/* Content */}
                <textarea
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Share your thoughts about this game..."
                  rows={3}
                  className="mb-3 w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan"
                />

                {error && (
                  <p className="mb-2 text-xs text-red-400">{error}</p>
                )}

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSubmit}
                    disabled={submitting}
                  >
                    {submitting ? "Submitting..." : "Submit"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowForm(false);
                      setError("");
                      setFormRating(0);
                      setFormContent("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Reviews List */}
            {reviews.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8">
                <MessageSquare className="h-8 w-8 text-muted/30" />
                <p className="text-center text-sm text-muted">
                  No reviews yet. Be the first to review!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map((review, i) => (
                  <div
                    key={review.id}
                    className="rounded-lg bg-surface-2 p-4 transition-all hover:bg-surface-2/80"
                    style={{
                      animation: `fade-up 0.3s ease-out ${i * 50}ms both`,
                    }}
                  >
                    {/* Header: avatar, name, date */}
                    <div className="flex items-center gap-2">
                      {review.avatarUrl ? (
                        <img
                          src={review.avatarUrl}
                          alt={review.username || "User"}
                          className="h-6 w-6 rounded-full"
                        />
                      ) : (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-neon-purple/20">
                          <User className="h-3 w-3 text-neon-purple" />
                        </div>
                      )}
                      <span className="text-sm font-medium text-foreground">
                        {review.username || "Anonymous"}
                      </span>
                      <span className="ml-auto text-xs text-muted">
                        {timeAgo(new Date(review.createdAt))}
                      </span>
                    </div>

                    {/* Stars */}
                    <div className="mt-1">
                      <StarRating rating={review.rating} />
                    </div>

                    {/* Content */}
                    <p className="mt-2 text-sm leading-relaxed text-foreground/80">
                      {review.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
