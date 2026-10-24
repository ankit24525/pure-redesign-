"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Star,
  CheckCircle2,
  Camera,
  X,
  Loader2,
  Sparkles,
  Plus,
} from "lucide-react";
import { uploadReviewImage } from "@/lib/upload";

export interface TaitvaReview {
  id: string | number;
  name: string;
  rating: number;
  date: string;
  comment: string;
  photo: string;
  product?: string;
  verified?: boolean;
}

export const TAITVA_DEFAULT_REVIEWS: TaitvaReview[] = [
  {
    id: "taitva-rev-1",
    name: "Harpreet Singh",
    rating: 5,
    date: "13/09/26",
    product: "Neem Karela Jamun / Madhunashi Sugar Care",
    comment:
      "I have tried several brands, but this neem karela jamun juice feels the most authentic. The bitter taste is natural, showing its purity, and it has really helped stabilize my daily energy and glucose levels without any insulin spikes. A staple in my morning routine now.",
    photo: "/reviews/review-customer-1.jpg",
    verified: true,
  },
  {
    id: "taitva-rev-2",
    name: "Sunita Deshmukh",
    rating: 5,
    date: "24/09/26",
    product: "Moringa Vitality Powder / Daily Nutrition",
    comment:
      "I have been adding this moringa powder to my green smoothies every morning. It mixes very easily and feels completely pure without any artificial grit. My digestion has noticeably improved and my skin feels much clearer within just a month.",
    photo: "/reviews/review-customer-2.jpg",
    verified: true,
  },
  {
    id: "taitva-rev-3",
    name: "Madhavan Iyer",
    rating: 5,
    date: "09/09/26",
    product: "Sea Buckthorn Elixir / Fat Burner Juice",
    comment:
      "This sea buckthorn juice has a wonderfully tart and refreshing taste. It has become a regular part of my morning routine, and I feel much more active through long workdays at my desk without afternoon fatigue or brain fog.",
    photo: "/reviews/review-customer-3.jpg",
    verified: true,
  },
];

const POPULAR_PRODUCTS = [
  "Madhunashi Sugar Care Powder",
  "Virja Powder for Men",
  "Virja Gold Majun Tonic",
  "Ayurvedic Fat Burner Juice",
  "Perfect 36 Herbal Cream",
  "Liver Cleanse & Detox Syrup",
];

export default function TestimonialsSection() {
  const [reviews, setReviews] = useState<TaitvaReview[]>(TAITVA_DEFAULT_REVIEWS);
  const [expandedReviewIds, setExpandedReviewIds] = useState<Record<string | number, boolean>>({});

  // Review submission modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    productName: POPULAR_PRODUCTS[0],
    rating: 5,
    customerName: "",
    location: "",
    comment: "",
    image: "",
  });

  // Toggle review truncation
  const toggleExpand = (id: string | number) => {
    setExpandedReviewIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Fetch approved customer reviews from /api/reviews and prepend them
  useEffect(() => {
    let isMounted = true;
    fetch("/api/reviews")
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data && data.success && Array.isArray(data.reviews) && data.reviews.length > 0) {
          const fetchedReviews: TaitvaReview[] = data.reviews.map((r: any, idx: number) => {
            const photo =
              r.image ||
              (Array.isArray(r.images) && r.images[0]) ||
              TAITVA_DEFAULT_REVIEWS[idx % TAITVA_DEFAULT_REVIEWS.length].photo;

            return {
              id: r.id || `live-${idx}`,
              name: r.customer || r.customerName || r.name || "Verified Customer",
              rating: Math.min(5, Math.max(1, Number(r.rating) || 5)),
              date: r.date || "Recent",
              product: r.product || r.productName || "Ayurvedic Formulation",
              comment: r.comment || r.content || "",
              photo: photo,
              verified: true,
            };
          });

          // Merge fetched approved reviews with the default 3 Taitva reviews
          setReviews([...fetchedReviews, ...TAITVA_DEFAULT_REVIEWS]);
        }
      })
      .catch((err) => console.warn("Could not load reviews feed:", err));

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.comment.trim()) {
      setErrorMsg("Please share a short review of your experience.");
      return;
    }
    if (!form.customerName.trim()) {
      setErrorMsg("Please enter your name.");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.customerName,
          rating: form.rating,
          comment: form.comment,
          product: form.productName,
          image: form.image || undefined,
          location: form.location || "India",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg("Thank you! Your review has been submitted for verification.");
        setTimeout(() => {
          setIsModalOpen(false);
          setSuccessMsg(null);
          setForm({
            productName: POPULAR_PRODUCTS[0],
            rating: 5,
            customerName: "",
            location: "",
            comment: "",
            image: "",
          });
        }, 2200);
      } else {
        setErrorMsg(data.error || "Failed to submit review. Please try again.");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please upload an image file (JPG, PNG, WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("Image size exceeds 5MB limit.");
      return;
    }

    setUploadingImg(true);
    setErrorMsg(null);

    try {
      const uploadedUrl = await uploadReviewImage(file);
      setForm((prev) => ({ ...prev, image: uploadedUrl }));
    } catch {
      setErrorMsg("Could not upload photo. Please try a different image.");
    } finally {
      setUploadingImg(false);
    }
  };

  // Display all reviews in slider (minimum default 3)
  const displayReviews = reviews.length > 0 ? reviews : TAITVA_DEFAULT_REVIEWS;

  const [activeIndex, setActiveIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isInteractingRef = useRef(false);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, clientWidth, scrollWidth } = scrollContainerRef.current;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll <= 0) return;

    // 1 comment at a time: calculate index
    const idx = Math.round(scrollLeft / clientWidth);
    setActiveIndex(Math.min(Math.max(0, idx), displayReviews.length - 1));
  };

  const scrollToIndex = (index: number) => {
    if (!scrollContainerRef.current) return;
    const { clientWidth } = scrollContainerRef.current;
    scrollContainerRef.current.scrollTo({
      left: index * clientWidth,
      behavior: "smooth",
    });
    setActiveIndex(index);
  };

  // Auto-slide every 4.5 seconds
  useEffect(() => {
    if (displayReviews.length <= 1) return;
    const interval = setInterval(() => {
      if (isInteractingRef.current || !scrollContainerRef.current) return;
      setActiveIndex((prev) => {
        const next = prev >= displayReviews.length - 1 ? 0 : prev + 1;
        scrollToIndex(next);
        return next;
      });
    }, 4500);
    return () => clearInterval(interval);
  }, [displayReviews.length]);

  return (
    <section id="reviews" className="w-full bg-[#fbfbf9]/60 py-12 sm:py-16 select-none">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        {/* Taitva Signature Serif Section Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-serif tracking-widest uppercase text-neutral-800 font-normal">
            CUSTOMER REVIEWS
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-2 font-normal">
            Authentic experiences from our verified wellness community
          </p>
        </div>

        {/* Comments Slider Container (Showing 1 comment at a time) */}
        <div className="relative max-w-4xl mx-auto">
          {/* Swipeable Scroll Container */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            onTouchStart={() => {
              isInteractingRef.current = true;
            }}
            onTouchEnd={() => {
              setTimeout(() => {
                isInteractingRef.current = false;
              }, 3000);
            }}
            onMouseEnter={() => {
              isInteractingRef.current = true;
            }}
            onMouseLeave={() => {
              isInteractingRef.current = false;
            }}
            className="flex w-full overflow-x-auto snap-x snap-mandatory scrollbar-none pb-2 pt-1 scroll-smooth"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {displayReviews.map((rev) => {
              const isExpanded = Boolean(expandedReviewIds[rev.id]);

              return (
                <div
                  key={rev.id}
                  className="w-full shrink-0 snap-center px-1 sm:px-3 flex justify-center"
                >
                  <div className="w-full max-w-xl md:max-w-3xl flex flex-col md:flex-row rounded-3xl overflow-hidden bg-white border border-neutral-200/80 shadow-xs hover:shadow-sm transition-all duration-300">
                    {/* Customer UGC Photo */}
                    <div className="relative w-full md:w-[320px] aspect-[4/3] md:aspect-auto min-h-[240px] md:min-h-[320px] bg-neutral-100 overflow-hidden shrink-0">
                      <img
                        src={rev.photo}
                        alt={`${rev.name} holding Pure Ayur Herbs formulation`}
                        className="size-full object-cover object-center"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80";
                        }}
                      />
                    </div>

                    {/* Card Content Block */}
                    <div className="p-5 sm:p-7 md:p-8 flex flex-col flex-1 justify-between bg-white">
                      <div>
                        {/* Customer Name */}
                        <h3 className="font-semibold text-neutral-900 text-lg sm:text-xl tracking-tight">
                          {rev.name}
                        </h3>

                        {/* Green Stars & Date */}
                        <div className="flex items-center gap-2 mt-1.5 mb-3">
                          <div className="flex items-center gap-0.5 text-[#023915]">
                            {[...Array(rev.rating)].map((_, i) => (
                              <Star
                                key={i}
                                className="size-4 fill-[#023915] text-[#023915]"
                              />
                            ))}
                          </div>
                          <span className="text-xs text-neutral-400 font-normal">
                            {rev.date}
                          </span>
                        </div>

                        {/* Review Comment Quote */}
                        <p
                          className={`text-sm sm:text-base text-neutral-600 leading-relaxed font-normal ${
                            isExpanded ? "" : "line-clamp-4"
                          }`}
                        >
                          &ldquo;{rev.comment}&rdquo;
                        </p>

                        {/* Read More / Read Less Toggle */}
                        {rev.comment.length > 140 && (
                          <button
                            type="button"
                            onClick={() => toggleExpand(rev.id)}
                            className="mt-2 text-xs font-semibold text-neutral-900 underline hover:text-[#023915] cursor-pointer inline-block text-left"
                          >
                            {isExpanded ? "Read less" : "Read more"}
                          </button>
                        )}
                      </div>

                      {/* Subtle Product Tag / Verified Badge */}
                      {rev.product && (
                        <div className="mt-5 pt-3.5 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                          <span className="truncate max-w-[200px] sm:max-w-xs font-medium text-neutral-700">
                            {rev.product}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[#023915] font-semibold shrink-0">
                            <CheckCircle2 className="size-3.5 text-[#023915]" /> Verified Buyer
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dynamic Pagination Dots for Comments */}
          {displayReviews.length > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              {displayReviews.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => scrollToIndex(i)}
                  aria-label={`Go to comment ${i + 1}`}
                  className={`rounded-full transition-all duration-300 cursor-pointer ${
                    i === activeIndex
                      ? "size-2.5 bg-[#023915] scale-110"
                      : "size-1.5 bg-neutral-300 hover:bg-neutral-400"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Share Experience Action Button */}
        <div className="mt-10 sm:mt-12 text-center">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-neutral-300 hover:border-[#023915] bg-white hover:bg-[#023915]/5 text-neutral-800 hover:text-[#023915] text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-2xs"
          >
            <Sparkles className="size-3.5 text-[#023915]" />
            <span>Write a Review</span>
          </button>
        </div>
      </div>

      {/* Review Submission Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-neutral-200 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <div>
                <h3 className="text-base font-bold uppercase tracking-wide text-neutral-900 flex items-center gap-2 font-serif">
                  <Sparkles className="size-4 text-[#023915]" />
                  <span>Share Your Experience</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">Your honest feedback helps fellow wellness seekers.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="size-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-600 transition cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Notifications */}
            {successMsg && (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}
            {errorMsg && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                {errorMsg}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmitReview} className="mt-5 space-y-4">
              {/* Product Select */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Product Purchased
                </label>
                <select
                  value={form.productName}
                  onChange={(e) => setForm({ ...form, productName: e.target.value })}
                  className="w-full text-xs rounded-xl border border-neutral-200 p-2.5 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#023915]/20 focus:border-[#023915]"
                >
                  {POPULAR_PRODUCTS.map((prod) => (
                    <option key={prod} value={prod}>
                      {prod}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rating Stars */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Your Rating
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setForm({ ...form, rating: star })}
                      className="p-1 focus:outline-none cursor-pointer"
                    >
                      <Star
                        className={`size-6 transition ${
                          (hoverRating || form.rating) >= star
                            ? "fill-[#023915] text-[#023915]"
                            : "text-neutral-300"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-semibold text-neutral-600 ml-2">
                    {form.rating} / 5 Stars
                  </span>
                </div>
              </div>

              {/* Name and Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Harpreet Singh"
                    value={form.customerName}
                    onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                    className="w-full text-xs rounded-xl border border-neutral-200 p-2.5 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#023915]/20 focus:border-[#023915]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Location (City / State)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Chandigarh, Punjab"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full text-xs rounded-xl border border-neutral-200 p-2.5 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#023915]/20 focus:border-[#023915]"
                  />
                </div>
              </div>

              {/* Review Comment */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Your Review / Experience *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Share details of your experience, results noticed, taste, purity..."
                  value={form.comment}
                  onChange={(e) => setForm({ ...form, comment: e.target.value })}
                  className="w-full text-xs rounded-xl border border-neutral-200 p-2.5 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#023915]/20 focus:border-[#023915]"
                />
              </div>

              {/* Customer Photo Upload */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Upload Photo with Remedy (Optional)
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-3 py-2 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-xs font-medium text-neutral-700 cursor-pointer transition">
                    <Camera className="size-4 text-neutral-500" />
                    <span>{uploadingImg ? "Uploading..." : "Select Photo"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImg}
                      className="hidden"
                    />
                  </label>
                  {form.image && (
                    <div className="relative size-10 rounded-lg overflow-hidden border border-neutral-200">
                      <Image
                        src={form.image}
                        alt="Uploaded preview"
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting || uploadingImg}
                  className="w-full py-3 rounded-full bg-[#023915] hover:bg-[#034d1d] text-white text-xs font-bold uppercase tracking-wider transition shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>Submitting Review...</span>
                    </>
                  ) : (
                    <span>Submit Review</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
