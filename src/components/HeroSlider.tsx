"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { heroSlides as defaultSlides } from "@/lib/store";

export default function HeroSlider({
  slides,
  marketingBanners,
}: {
  slides?: any[];
  marketingBanners?: any[];
}) {
  const [slideIndex, setSlideIndex] = useState(1); // Starts at 1 due to cloned slide buffer
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const taitvaLeadSlide = {
    fullWidthBanner: true,
    mobileImage: "/brand/hero-taitva-1200x800.jpg",
    id: "slide_taitva_1200x800",
    title: "Himalayan Ayurvedic Goodness & Vitality",
    subtitle: "AUTHENTIC BOTANICAL WELLNESS CRAFTED FROM HIMALAYAN HERBS",
    offer: "Special Launch Offer",
    ctaText: "SHOP NOW",
    href: "/products",
    badge: "100% Himalayan Herbs",
    image: "/brand/hero-taitva-1200x800.jpg",
    bgColor: "#023915",
  };

  const rawSlides = slides && slides.length > 0 ? slides : defaultSlides;
  const filteredOtherSlides = rawSlides.filter(
    (s: any) => s.image !== "/brand/hero-taitva-1200x800.jpg" && s.id !== "slide_taitva_1200x800"
  );

  // Convert any active marketing banners with placement "Top Hero Slider" into slides
  const heroMarketingSlides = (marketingBanners || [])
    .filter(
      (b: any) =>
        b.status === "Active" &&
        ((b.placement || "").toLowerCase().includes("hero") ||
          (b.placement || "").toLowerCase().includes("carousel") ||
          (b.placement || "").toLowerCase().includes("top"))
    )
    .map((b: any, idx: number) => ({
      id: b.id || `mkt_slide_${idx}`,
      badge: "Featured Promotion",
      title: b.title || b.name,
      subtitle: b.subtitle || "100% Certified Ayurvedic Formulations",
      image:
        b.image ||
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1920&q=80",
      link: b.link || "/products",
      fullWidthBanner: true,
    }));

  const activeSlides = [taitvaLeadSlide, ...heroMarketingSlides, ...filteredOtherSlides];
  const slideCount = activeSlides.length;

  // Cloned slides array for seamless infinite looping: [S_last, S_0, S_1, ..., S_last, S_0]
  const extendedSlides = useMemo(() => {
    if (slideCount <= 1) return activeSlides;
    return [
      activeSlides[slideCount - 1],
      ...activeSlides,
      activeSlides[0],
    ];
  }, [activeSlides, slideCount]);

  const nextSlide = useCallback(() => {
    if (slideCount <= 1) return;
    setSlideIndex((prev) => {
      // Guard against unbounded index overflow
      if (prev >= slideCount + 1) return 1;
      return prev + 1;
    });
    setIsTransitioning(true);
  }, [slideCount]);

  const prevSlide = useCallback(() => {
    if (slideCount <= 1) return;
    setSlideIndex((prev) => {
      // Guard against underflow
      if (prev <= 0) return slideCount;
      return prev - 1;
    });
    setIsTransitioning(true);
  }, [slideCount]);

  // Handle seamless infinite loop jump at cloned boundaries
  const handleTransitionEnd = (e?: React.TransitionEvent<HTMLDivElement>) => {
    if (e && e.target !== e.currentTarget) return;
    if (slideCount <= 1) return;
    if (slideIndex <= 0) {
      // Jumped to S_last clone on left -> instantly swap to real S_last (index slideCount)
      setIsTransitioning(false);
      setSlideIndex(slideCount);
    } else if (slideIndex >= slideCount + 1) {
      // Jumped to S_0 clone on right -> instantly swap to real S_0 (index 1)
      setIsTransitioning(false);
      setSlideIndex(1);
    }
  };

  // Safety Watchdog: If transitionend is dropped (e.g. user scrolled offscreen, background tab),
  // automatically snap back within 600ms so the carousel never slides into empty void
  useEffect(() => {
    if (slideCount <= 1) return;
    if (slideIndex >= slideCount + 1 || slideIndex <= 0) {
      const safetyTimer = setTimeout(() => {
        setIsTransitioning(false);
        setSlideIndex(slideIndex >= slideCount + 1 ? 1 : slideCount);
      }, 580);
      return () => clearTimeout(safetyTimer);
    }
  }, [slideIndex, slideCount]);

  // Boundary clamp when slides change or resize occurs
  useEffect(() => {
    if (slideIndex > slideCount + 1 || slideIndex < 0) {
      setIsTransitioning(false);
      setSlideIndex(1);
    }
  }, [slideCount, slideIndex]);

  // Pause autoplay when tab is inactive/hidden to avoid dropped frames and runaway intervals
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        setIsPaused(true);
      } else {
        setIsPaused(false);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // Autoplay (every 5.5s)
  useEffect(() => {
    if (slideCount <= 1 || isPaused) return;

    const timer = setInterval(() => {
      nextSlide();
    }, 5500);

    return () => clearInterval(timer);
  }, [slideCount, isPaused, nextSlide]);

  const handleInteraction = () => {
    setIsPaused(true);
    const resumeTimer = setTimeout(() => {
      setIsPaused(false);
    }, 7000);
    return () => clearTimeout(resumeTimer);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      handleInteraction();
      prevSlide();
    } else if (e.key === "ArrowRight") {
      handleInteraction();
      nextSlide();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    handleInteraction();
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diffX = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 35;
    if (diffX > minSwipeDistance) {
      nextSlide();
    } else if (diffX < -minSwipeDistance) {
      prevSlide();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Format image for exact 1200x800 container
  const getFormattedSlideImage = (url: string) => {
    if (!url || typeof url !== "string") return url;
    if (url.includes("c_pad,w_1920,h_600")) {
      return url.replace("c_pad,w_1920,h_600", "c_pad,w_1200,h_800");
    }
    return url;
  };

  // Compute 0-based active index for pagination dots
  const activeNormalizedIndex =
    slideCount <= 1
      ? 0
      : slideIndex === 0
      ? slideCount - 1
      : slideIndex === slideCount + 1
      ? 0
      : slideIndex - 1;

  return (
    <section
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label="Pure Ayur Herbs Storefront Hero Banner"
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="w-full bg-white pt-3 sm:pt-5 md:pt-6 pb-2 select-none outline-none"
    >
      {/* Taitva Centered Container with Side Gaps (Strict 1200x800 Canvas) */}
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        {/* Banner Frame (Exact 1200x800 Aspect Ratio Container) */}
        <div className="relative w-full max-w-[1200px] h-[400px] sm:h-[530px] md:h-[660px] lg:h-[760px] xl:h-[800px] aspect-[1200/800] overflow-hidden rounded-xl md:rounded-2xl bg-[#023915]/5 shadow-2xs">
          {/* Sliding Track */}
          <div
            onTransitionEnd={handleTransitionEnd}
            className="flex w-full h-full will-change-transform"
            style={{
              transform: `translateX(-${slideIndex * 100}%)`,
              transition: isTransitioning
                ? "transform 550ms cubic-bezier(0.25, 1, 0.5, 1)"
                : "none",
            }}
          >
            {extendedSlides.map((slide, idx) => {
              const isSlideActive = idx === slideIndex;
              const slideImage =
                slide.image && typeof slide.image === "string" && slide.image.trim()
                  ? getFormattedSlideImage(slide.image)
                  : "/brand/hero-taitva-1200x800.jpg";
              const mobileImage =
                slide.mobileImage && typeof slide.mobileImage === "string" && slide.mobileImage.trim()
                  ? getFormattedSlideImage(slide.mobileImage)
                  : slideImage;

              return (
                <div
                  key={slide.id ? `${slide.id}_${idx}` : idx}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`Slide ${idx + 1}`}
                  aria-hidden={!isSlideActive}
                  className="w-full h-full shrink-0 relative flex items-center justify-center bg-[#f8faf5]"
                >
                  <Link
                    href={slide.href || slide.link || "/products"}
                    tabIndex={isSlideActive ? 0 : -1}
                    className="block size-full focus:outline-none cursor-pointer relative flex items-center justify-center"
                  >
                    <picture className="size-full flex items-center justify-center">
                      <source media="(max-width: 639px)" srcSet={mobileImage} />
                      <img
                        src={slideImage}
                        alt={slide.title || "Pure Ayur Herbs Ayurvedic Formulation Banner"}
                        onError={(e) => {
                          if (typeof window !== "undefined" && !e.currentTarget.src.endsWith("/brand/hero-taitva-1200x800.jpg")) {
                            e.currentTarget.src = "/brand/hero-taitva-1200x800.jpg";
                          }
                        }}
                        className="size-full object-cover object-center"
                        loading={idx === 1 ? "eager" : "lazy"}
                      />
                    </picture>
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Arrow Navigation Controls (Inside the Banner Container on Left & Right) */}
          {slideCount > 1 && (
            <>
              <button
                type="button"
                onClick={() => {
                  handleInteraction();
                  prevSlide();
                }}
                className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 size-8 sm:size-9 rounded-full bg-white/95 hover:bg-white border border-neutral-300 shadow-sm flex items-center justify-center text-neutral-800 hover:text-black hover:scale-105 active:scale-95 transition cursor-pointer z-20"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="size-4 sm:size-5" />
              </button>

              <button
                type="button"
                onClick={() => {
                  handleInteraction();
                  nextSlide();
                }}
                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 size-8 sm:size-9 rounded-full bg-white/95 hover:bg-white border border-neutral-300 shadow-sm flex items-center justify-center text-neutral-800 hover:text-black hover:scale-105 active:scale-95 transition cursor-pointer z-20"
                aria-label="Next Slide"
              >
                <ChevronRight className="size-4 sm:size-5" />
              </button>
            </>
          )}
        </div>

        {/* Taitva Centered Pagination Dots (Directly Below Banner Frame) */}
        {slideCount > 1 && (
          <div className="flex items-center justify-center gap-2 mt-3 sm:mt-4 mb-2">
            {activeSlides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  handleInteraction();
                  setIsTransitioning(true);
                  setSlideIndex(i + 1);
                }}
                aria-label={`Go to slide ${i + 1}`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  i === activeNormalizedIndex
                    ? "size-2.5 bg-[#023915] scale-110"
                    : "size-2 bg-neutral-300 hover:bg-neutral-400"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
