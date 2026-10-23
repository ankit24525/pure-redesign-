"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ConcernFilterProps {
  selectedConcern: string | null;
  onSelectConcern: (concernName: string | null) => void;
  categories?: any[];
}

export const DEFAULT_HEALTH_GOALS = [
  {
    id: "energy",
    name: "Energy & Vitality",
    concernKey: "Energy and Vitality",
    image:
      "https://res.cloudinary.com/dwadcfj3b/image/upload/c_pad,w_1000,h_1000,b_white,f_auto,q_auto/v1791381368/pure_ayur_herbs/products/hmlzvpwldh0zgunukmxk.jpg",
  },
  {
    id: "sugar",
    name: "Sugar Care",
    concernKey: "Sugar Management",
    image:
      "https://res.cloudinary.com/dwadcfj3b/image/upload/c_pad,w_1000,h_1000,b_white,f_auto,q_auto/v1792547874/pure_ayur_herbs/products/cckewssua9abbelbyknf.webp",
  },
  {
    id: "fitness",
    name: "Gym & Fitness",
    concernKey: "Gym and Fitness",
    image:
      "https://res.cloudinary.com/dwadcfj3b/image/upload/c_pad,w_1000,h_1000,b_white,f_auto,q_auto/v1791381366/pure_ayur_herbs/products/xemjcovn6mbh6edriszp.jpg",
  },
  {
    id: "women",
    name: "Women's Health",
    concernKey: "Womens Health",
    image:
      "https://res.cloudinary.com/dwadcfj3b/image/upload/c_pad,w_1000,h_1000,b_white,f_auto,q_auto/v1791381367/pure_ayur_herbs/products/aux22j4iqo4xus6bbja4.jpg",
  },
  {
    id: "liver",
    name: "Liver Care",
    concernKey: "Liver Care",
    image: "/brand/karela-jamun.svg",
  },
  {
    id: "daily",
    name: "Daily Ayurveda",
    concernKey: "Daily Ayurveda",
    image: "/brand/triphala-gut.svg",
  },
  {
    id: "skin",
    name: "Skin & Hair",
    concernKey: "Skin and Hair",
    image: "/brand/amla-glow.svg",
  },
];

export default function ConcernFilter({
  selectedConcern,
  onSelectConcern,
  categories,
}: ConcernFilterProps) {
  // Merge categories from props if valid, otherwise use rich defaults
  const baseItems = useMemo(() => {
    if (Array.isArray(categories) && categories.length >= 3) {
      return categories.map((cat: any) => {
        const fallback =
          DEFAULT_HEALTH_GOALS.find(
            (d) =>
              d.id === cat.id ||
              d.name.toLowerCase() === (cat.name || "").toLowerCase() ||
              d.concernKey.toLowerCase() === (cat.name || "").toLowerCase()
          ) || DEFAULT_HEALTH_GOALS[0];

        return {
          id: cat.id || cat.name?.toLowerCase().replace(/\s+/g, "-"),
          name: cat.name || fallback.name,
          concernKey: cat.concernKey || cat.name || fallback.concernKey,
          image: cat.image && typeof cat.image === "string" && cat.image.trim() ? cat.image : fallback.image,
        };
      });
    }
    return DEFAULT_HEALTH_GOALS;
  }, [categories]);

  const itemCount = baseItems.length;

  // Tripled array for seamless infinite looping
  const extendedList = useMemo(() => {
    if (itemCount === 0) return [];
    return [...baseItems, ...baseItems, ...baseItems];
  }, [baseItems, itemCount]);

  // Start in the middle batch (index = itemCount)
  const [currentIndex, setCurrentIndex] = useState(itemCount);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Sync index when itemCount changes
  useEffect(() => {
    setCurrentIndex(itemCount);
  }, [itemCount]);

  const nextSlide = useCallback(() => {
    if (itemCount <= 1) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  }, [itemCount]);

  const prevSlide = useCallback(() => {
    if (itemCount <= 1) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
  }, [itemCount]);

  // Jump seamlessly at boundaries
  const handleTransitionEnd = (e?: React.TransitionEvent<HTMLDivElement>) => {
    if (e && e.target !== e.currentTarget) return;
    if (itemCount <= 1) return;

    if (currentIndex >= itemCount * 2) {
      // Reached end of 2nd batch -> snap back to 1st batch
      setIsTransitioning(false);
      setCurrentIndex(itemCount);
    } else if (currentIndex < itemCount) {
      // Slid before 1st batch -> snap forward to 2nd batch
      setIsTransitioning(false);
      setCurrentIndex(itemCount * 2 - 1);
    }
  };

  // Safety Watchdog: If transitionend is dropped by the browser, snap index safely
  useEffect(() => {
    if (itemCount <= 1) return;
    if (currentIndex >= itemCount * 2) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(itemCount);
      }, 620);
      return () => clearTimeout(timer);
    } else if (currentIndex < itemCount) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(itemCount * 2 - 1);
      }, 620);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, itemCount]);

  // Pause when tab is inactive
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

  // Autoplay (every 4.5s)
  useEffect(() => {
    if (itemCount <= 3 || isPaused) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 4500);

    return () => clearInterval(interval);
  }, [itemCount, isPaused, nextSlide]);

  const handleInteraction = () => {
    setIsPaused(true);
    const resumeTimer = setTimeout(() => {
      setIsPaused(false);
    }, 7000);
    return () => clearTimeout(resumeTimer);
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

  const handleSelect = (item: (typeof DEFAULT_HEALTH_GOALS)[0]) => {
    handleInteraction();
    if (
      selectedConcern &&
      (selectedConcern.toLowerCase() === item.concernKey.toLowerCase() ||
        selectedConcern.toLowerCase() === item.name.toLowerCase() ||
        selectedConcern.toLowerCase().replace(/&/g, "and") === item.name.toLowerCase().replace(/&/g, "and"))
    ) {
      // Toggle off -> show all
      onSelectConcern(null);
    } else {
      onSelectConcern(item.concernKey);
    }
  };

  const activeNormalizedIndex = itemCount > 0 ? (currentIndex % itemCount) : 0;

  const activeGoal = useMemo(() => {
    if (!selectedConcern) return null;
    return (
      baseItems.find(
        (c) =>
          c.name.toLowerCase() === selectedConcern.toLowerCase() ||
          c.concernKey.toLowerCase() === selectedConcern.toLowerCase() ||
          c.name.toLowerCase().replace(/&/g, "and") === selectedConcern.toLowerCase().replace(/&/g, "and")
      ) || null
    );
  }, [selectedConcern, baseItems]);

  return (
    <section id="concerns" className="mx-auto max-w-[1440px] px-4 pt-6 pb-4 sm:pt-10 sm:pb-6 text-center select-none">
      {/* Taitva Signature Serif Section Header */}
      <h2 className="text-xl sm:text-2xl md:text-3xl font-serif tracking-widest uppercase text-neutral-800 font-normal">
        SHOP BY HEALTH GOAL
      </h2>

      {/* 3-Item Auto-Rotating Carousel with Navigation */}
      <div
        className="relative mx-auto max-w-[840px] px-7 sm:px-12 mt-6 sm:mt-8"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Left Arrow */}
        {itemCount > 3 && (
          <button
            type="button"
            onClick={() => {
              handleInteraction();
              prevSlide();
            }}
            className="absolute left-0 sm:left-1 top-1/2 -translate-y-1/2 size-8 sm:size-9 rounded-full bg-white border border-neutral-200/90 shadow-sm flex items-center justify-center text-neutral-700 hover:text-[#023915] hover:border-[#023915] hover:scale-105 active:scale-95 transition cursor-pointer z-10"
            aria-label="Previous Health Goals"
          >
            <ChevronLeft className="size-4 sm:size-5" />
          </button>
        )}

        {/* Viewport Frame (Strictly displays 3 items at a time) */}
        <div className="w-full overflow-hidden py-2">
          <div
            onTransitionEnd={handleTransitionEnd}
            className="flex will-change-transform"
            style={{
              transform: `translateX(-${currentIndex * (100 / 3)}%)`,
              transition: isTransitioning
                ? "transform 600ms cubic-bezier(0.25, 1, 0.5, 1)"
                : "none",
            }}
          >
            {extendedList.map((cat, idx) => {
              const isSelected =
                selectedConcern !== null &&
                (selectedConcern.toLowerCase() === cat.concernKey.toLowerCase() ||
                  selectedConcern.toLowerCase() === cat.name.toLowerCase() ||
                  selectedConcern.toLowerCase().replace(/&/g, "and") === cat.name.toLowerCase().replace(/&/g, "and"));

              return (
                <div
                  key={`${cat.id}_${idx}`}
                  className="w-1/3 shrink-0 px-2 sm:px-4 flex justify-center"
                >
                  <button
                    onClick={() => handleSelect(cat)}
                    className="group flex flex-col items-center gap-2 cursor-pointer focus:outline-none"
                    type="button"
                  >
                    {/* Circular Packshot Frame */}
                    <div
                      className={`size-20 sm:size-24 md:size-28 rounded-full overflow-hidden border transition-all duration-300 p-2 sm:p-2.5 flex items-center justify-center bg-[#f8f9fa] shadow-2xs ${
                        isSelected
                          ? "border-2 border-[#023915] ring-2 ring-[#023915]/20 scale-105"
                          : "border-neutral-200/90 group-hover:border-neutral-400 group-hover:scale-105"
                      }`}
                    >
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="size-full object-contain"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = "/brand/top-botanical-banner.jpg";
                        }}
                      />
                    </div>

                    {/* Category Label Underneath */}
                    <span
                      className={`text-xs sm:text-sm tracking-tight text-center transition-colors line-clamp-1 max-w-[110px] sm:max-w-none ${
                        isSelected
                          ? "font-bold text-[#023915]"
                          : "font-normal text-neutral-700 group-hover:text-[#023915]"
                      }`}
                    >
                      {cat.name}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Arrow */}
        {itemCount > 3 && (
          <button
            type="button"
            onClick={() => {
              handleInteraction();
              nextSlide();
            }}
            className="absolute right-0 sm:right-1 top-1/2 -translate-y-1/2 size-8 sm:size-9 rounded-full bg-white border border-neutral-200/90 shadow-sm flex items-center justify-center text-neutral-700 hover:text-[#023915] hover:border-[#023915] hover:scale-105 active:scale-95 transition cursor-pointer z-10"
            aria-label="Next Health Goals"
          >
            <ChevronRight className="size-4 sm:size-5" />
          </button>
        )}

        {/* Minimal Progress Dots Below */}
        {itemCount > 3 && (
          <div className="flex items-center justify-center gap-1.5 mt-3 sm:mt-4">
            {baseItems.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  handleInteraction();
                  setIsTransitioning(true);
                  setCurrentIndex(itemCount + i);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  activeNormalizedIndex === i
                    ? "w-5 bg-[#023915]"
                    : "w-1.5 bg-neutral-300 hover:bg-neutral-400"
                }`}
                aria-label={`Go to goal ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Active Filter Clear Pill (if a health goal is selected) */}
      {selectedConcern && (
        <div className="mt-4 flex items-center justify-center gap-2 animate-in fade-in duration-200">
          <span className="text-xs text-neutral-500">
            Showing remedies for{" "}
            <strong className="text-neutral-800">
              {activeGoal ? activeGoal.name : selectedConcern}
            </strong>
          </span>
          <button
            onClick={() => onSelectConcern(null)}
            className="text-xs font-bold text-[#023915] hover:text-black underline cursor-pointer"
          >
            Show All
          </button>
        </div>
      )}
    </section>
  );
}
