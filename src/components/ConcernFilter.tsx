"use client";

import { useMemo } from "react";
import Image from "next/image";

interface ConcernFilterProps {
  selectedConcern: string | null;
  onSelectConcern: (concernName: string | null) => void;
  categories?: any[];
}

export const TAITVA_FEATURED_COLLECTIONS = [
  {
    id: "superfoods",
    name: "Superfoods",
    concernKey: "Energy and Vitality",
    image:
      "https://res.cloudinary.com/dwadcfj3b/image/upload/c_pad,w_1000,h_1000,b_white,f_auto,q_auto/v1791381368/pure_ayur_herbs/products/hmlzvpwldh0zgunukmxk.jpg",
  },
  {
    id: "supplements",
    name: "Supplements",
    concernKey: "Sugar Management",
    image:
      "https://res.cloudinary.com/dwadcfj3b/image/upload/c_pad,w_1000,h_1000,b_white,f_auto,q_auto/v1792547874/pure_ayur_herbs/products/cckewssua9abbelbyknf.webp",
  },
  {
    id: "nutrition",
    name: "Nutrition",
    concernKey: "Gym and Fitness",
    image:
      "https://res.cloudinary.com/dwadcfj3b/image/upload/c_pad,w_1000,h_1000,b_white,f_auto,q_auto/v1791381366/pure_ayur_herbs/products/xemjcovn6mbh6edriszp.jpg",
  },
];

export default function ConcernFilter({
  selectedConcern,
  onSelectConcern,
  categories,
}: ConcernFilterProps) {
  const activeCollection = useMemo(() => {
    if (!selectedConcern) return null;
    return (
      TAITVA_FEATURED_COLLECTIONS.find(
        (c) =>
          c.name.toLowerCase() === selectedConcern.toLowerCase() ||
          c.concernKey.toLowerCase() === selectedConcern.toLowerCase()
      ) || null
    );
  }, [selectedConcern]);

  const handleSelect = (item: (typeof TAITVA_FEATURED_COLLECTIONS)[0]) => {
    if (
      selectedConcern &&
      (selectedConcern.toLowerCase() === item.concernKey.toLowerCase() ||
        selectedConcern.toLowerCase() === item.name.toLowerCase())
    ) {
      // Toggle off -> show all
      onSelectConcern(null);
    } else {
      onSelectConcern(item.concernKey);
    }
  };

  return (
    <section id="concerns" className="mx-auto max-w-[1440px] px-4 pt-6 pb-4 sm:pt-10 sm:pb-6 text-center select-none">
      {/* Taitva Signature Serif Section Header */}
      <h2 className="text-xl sm:text-2xl md:text-3xl font-serif tracking-widest uppercase text-neutral-800 font-normal">
        NOURISH &amp; THRIVE
      </h2>

      {/* 3 Taitva Circular Category Cards (Superfoods, Supplements, Nutrition) */}
      <div className="flex items-center justify-center gap-7 sm:gap-14 md:gap-20 mt-6 sm:mt-8">
        {TAITVA_FEATURED_COLLECTIONS.map((cat) => {
          const isSelected =
            selectedConcern !== null &&
            (selectedConcern.toLowerCase() === cat.concernKey.toLowerCase() ||
              selectedConcern.toLowerCase() === cat.name.toLowerCase());

          return (
            <button
              key={cat.id}
              onClick={() => handleSelect(cat)}
              className="group flex flex-col items-center gap-2 cursor-pointer focus:outline-none"
              type="button"
            >
              {/* Circular Packshot Frame */}
              <div
                className={`size-20 sm:size-24 md:size-28 rounded-full overflow-hidden border transition-all duration-300 p-2.5 flex items-center justify-center bg-[#f8f9fa] shadow-2xs ${
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
                />
              </div>

              {/* Category Label Underneath */}
              <span
                className={`text-xs sm:text-sm tracking-tight transition-colors ${
                  isSelected
                    ? "font-bold text-[#023915]"
                    : "font-normal text-neutral-700 group-hover:text-[#023915]"
                }`}
              >
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Filter Clear Pill (if a category is selected) */}
      {selectedConcern && (
        <div className="mt-4 flex items-center justify-center gap-2 animate-in fade-in duration-200">
          <span className="text-xs text-neutral-500">
            Showing remedies for{" "}
            <strong className="text-neutral-800">
              {activeCollection ? activeCollection.name : selectedConcern}
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
