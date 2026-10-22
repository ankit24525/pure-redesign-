"use client";

import { Award, Shield, Leaf, Beaker } from "lucide-react";

export default function TrustSection() {
  const pillars = [
    {
      icon: Award,
      title: "100% Authentic Sourcing",
      desc: "Wild herbs harvested from high-altitude Himalayas & organic Pratapgarh farms.",
    },
    {
      icon: Shield,
      title: "Manufactured at an AYUSH GMP-Licensed Facility",
      desc: "Our formulations are made at a facility that follows Ministry of AYUSH GMP standards.",
    },
    {
      icon: Leaf,
      title: "0% Added Sugars",
      desc: "Clean botanical extractions free from artificial flavors, parabens & synthetic colors.",
    },
    {
      icon: Beaker,
      title: "Clinically Formulated",
      desc: "Back by modern clinical trials and ancient 5,000-year-old Charaka Samhita texts.",
    },
  ];

  return (
    <section id="trust" className="bg-[#f8f9fa] border-y border-neutral-200/80 py-12">
      <div className="mx-auto max-w-[1440px] px-4 md:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-xl font-bold uppercase tracking-wide text-neutral-900 sm:text-2xl">
            Why Pure Ayur Herbs?
          </h2>
          <p className="mt-2 text-xs font-medium text-neutral-600 md:text-sm">
            Bridging ancient Ayurvedic wisdom with modern clinical research for purity you can taste & feel.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div
                key={idx}
                className="flex flex-col items-center text-center p-6 rounded-xl bg-white border border-neutral-200/80 shadow-2xs transition hover:shadow-xs"
              >
                <div className="flex size-12 items-center justify-center rounded-full bg-[#c2d4c5]/40 text-[#023915] mb-4">
                  <IconComponent className="size-6" />
                </div>
                <h3 className="text-sm font-bold text-neutral-900">{item.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-neutral-600">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
