"use client";

import { useState } from "react";
import { useSession } from "@/lib/supabase/hooks";
import { submitProductReview, type ReviewItem, type ReviewStats } from "@/server/reviews";
import { Button } from "@/components/ui/button";

interface ProductReviewsProps {
  productId: string;
  productSlug?: string;
  initialStats: ReviewStats;
}

export function ProductReviews({ productId, productSlug, initialStats }: ProductReviewsProps) {
  const { data: session } = useSession();

  const [reviews, setReviews] = useState<ReviewItem[]>(initialStats.reviews || []);
  const [stats, setStats] = useState<ReviewStats>(initialStats);
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [name, setName] = useState(session?.user?.name || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const activeRating = hoverRating !== null ? hoverRating : rating;

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (comment.trim().length < 5) {
      setError("Please write at least a few words about the product.");
      return;
    }

    setSubmitting(true);

    const res = await submitProductReview({
      productId,
      productSlug,
      rating,
      title: title.trim() || undefined,
      comment: comment.trim(),
      userName: name.trim() || session?.user?.name || "Verified Customer",
      userEmail: session?.user?.email,
    });

    setSubmitting(false);

    if (res.ok && res.review) {
      setSuccess(true);
      const newReviews = [res.review, ...reviews];
      setReviews(newReviews);

      // Recalculate stats
      const total = newReviews.length;
      const sum = newReviews.reduce((acc, r) => acc + r.rating, 0);
      const avg = Number((sum / total).toFixed(1));

      const distribution: { [star: number]: number } = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      newReviews.forEach((r) => {
        const star = Math.max(1, Math.min(5, Math.round(r.rating)));
        distribution[star] = (distribution[star] || 0) + 1;
      });

      setStats({
        averageRating: avg,
        totalReviews: total,
        ratingDistribution: distribution,
        reviews: newReviews,
      });

      // Clear form
      setTitle("");
      setComment("");
      setTimeout(() => {
        setShowForm(false);
        setSuccess(false);
      }, 2500);
    } else {
      setError(res.error || "Failed to submit review. Please try again.");
    }
  }

  return (
    <section className="mt-16 pt-10 border-t border-line">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-display font-bold text-ink">Customer Reviews & Ratings</h2>
          <p className="text-xs text-navy-600 mt-1">Verified buyer feedback and authentic ratings</p>
        </div>
        <Button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="bg-navy-900 text-white hover:bg-navy-800 text-xs font-semibold py-2.5 px-5 rounded-card shadow-sm self-start md:self-auto"
        >
          {showForm ? "✕ Cancel Review" : "★ Write a Review"}
        </Button>
      </div>

      {/* Review Submission Form */}
      {showForm && (
        <div className="mb-10 p-6 rounded-2xl border border-navy-200 bg-navy-50/50 shadow-sm animate-in fade-in duration-200">
          <h3 className="text-base font-bold text-ink mb-1">Share Your Experience</h3>
          <p className="text-xs text-navy-600 mb-5">Your review helps other verified shoppers make confident decisions.</p>

          <form onSubmit={handleSubmitReview} className="space-y-4">
            {/* Star Picker */}
            <div>
              <label className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1.5">
                Overall Rating *
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="p-1 text-2xl transition-transform hover:scale-110 focus:outline-none cursor-pointer"
                  >
                    <span className={star <= activeRating ? "text-amber-500" : "text-navy-200"}>
                      ★
                    </span>
                  </button>
                ))}
                <span className="ml-3 text-xs font-bold text-navy-700">
                  {activeRating === 5 && "5 / 5 - Excellent!"}
                  {activeRating === 4 && "4 / 5 - Very Good"}
                  {activeRating === 3 && "3 / 5 - Average"}
                  {activeRating === 2 && "2 / 5 - Below Average"}
                  {activeRating === 1 && "1 / 5 - Poor"}
                </span>
              </div>
            </div>

            {/* Your Name */}
            <div>
              <label className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1">
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={session?.user?.name || "e.g. Ankit Verma"}
                className="w-full max-w-md rounded-card border border-line bg-white px-3.5 py-2 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-navy-900/20"
              />
            </div>

            {/* Review Headline */}
            <div>
              <label className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1">
                Headline / Summary
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Exceeded expectations! Genuine product"
                className="w-full max-w-xl rounded-card border border-line bg-white px-3.5 py-2 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-navy-900/20"
              />
            </div>

            {/* Detailed Comment */}
            <div>
              <label className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1">
                Written Review *
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What did you like or dislike about the product? How was the delivery and packaging?"
                className="w-full rounded-card border border-line bg-white px-3.5 py-2.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-navy-900/20"
                required
              />
            </div>

            {error && (
              <div className="rounded-card bg-danger/10 border border-danger/20 p-3 text-xs font-medium text-danger">
                ⚠️ {error}
              </div>
            )}

            {success && (
              <div className="rounded-card bg-success/10 border border-success/20 p-3 text-xs font-medium text-success">
                ✓ Thank you! Your review has been successfully submitted.
              </div>
            )}

            <div className="pt-2">
              <Button
                type="submit"
                loading={submitting}
                className="bg-navy-900 text-white hover:bg-navy-800 text-xs font-semibold py-2.5 px-6 rounded-card"
              >
                Submit Review
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Ratings Overview Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12 p-6 rounded-2xl border border-line bg-white shadow-sm">
        {/* Big Rating Summary */}
        <div className="md:col-span-4 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-line pb-6 md:pb-0 md:pr-6">
          <div className="text-5xl font-display font-extrabold text-ink mb-1">
            {stats.averageRating}
          </div>
          <div className="flex items-center gap-1 text-amber-500 text-xl mb-1.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <span key={s}>{s <= Math.round(stats.averageRating) ? "★" : "☆"}</span>
            ))}
          </div>
          <p className="text-xs text-navy-600 font-medium">
            Based on <span className="font-bold text-ink">{stats.totalReviews}</span> verified ratings
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-[11px] font-medium text-success bg-success/10 px-2.5 py-1 rounded-full">
            <span>✓ 100% Genuine Reviews</span>
          </div>
        </div>

        {/* Rating Breakdown Bars */}
        <div className="md:col-span-8 flex flex-col justify-center space-y-2.5">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = stats.ratingDistribution[star] || 0;
            const pct = stats.totalReviews > 0 ? Math.round((count / stats.totalReviews) * 100) : 0;
            return (
              <div key={star} className="flex items-center gap-3 text-xs">
                <span className="w-12 text-navy-600 font-medium shrink-0 flex items-center gap-1">
                  {star} <span className="text-amber-500">★</span>
                </span>
                <div className="flex-1 h-2.5 rounded-full bg-navy-100 overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-10 text-right text-navy-400 font-mono text-[11px]">
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-line rounded-2xl bg-navy-50/30">
            <p className="text-sm font-semibold text-navy-700">No reviews yet</p>
            <p className="text-xs text-navy-500 mt-1">Be the first to review this product!</p>
          </div>
        ) : (
          reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-5 rounded-2xl border border-line bg-white shadow-sm space-y-2 transition-all hover:border-navy-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-navy-800 to-navy-950 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {rev.userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-ink">{rev.userName}</span>
                      {rev.verifiedPurchase && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-success bg-success/10 px-2 py-0.5 rounded-full">
                          ✓ Verified Buyer
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-navy-400">
                      {new Date(rev.createdAt).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {/* Stars */}
                <div className="flex items-center gap-0.5 text-amber-500 text-sm">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s}>{s <= rev.rating ? "★" : "☆"}</span>
                  ))}
                </div>
              </div>

              {rev.title && (
                <h4 className="text-xs font-bold text-ink pt-1">{rev.title}</h4>
              )}

              <p className="text-xs text-navy-600 leading-relaxed pt-0.5">
                {rev.comment}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
