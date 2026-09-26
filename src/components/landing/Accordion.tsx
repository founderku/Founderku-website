"use client";

import { useState } from "react";

export function Accordion({
  items,
}: {
  items: { q: string; a: string }[];
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="divide-y divide-border">
      {items.map((item, i) => {
        const open = openIndex === i;
        return (
          <div key={item.q}>
            <button
              onClick={() => setOpenIndex(open ? null : i)}
              className="w-full flex items-center justify-between gap-4 py-5 text-left"
              aria-expanded={open}
            >
              <span className="font-manrope font-bold text-base sm:text-lg">
                {item.q}
              </span>
              <span
                className={`flex-shrink-0 w-8 h-8 rounded-full border border-border flex items-center justify-center text-lg font-manrope font-bold transition-transform duration-300 ${
                  open ? "rotate-45" : ""
                }`}
              >
                +
              </span>
            </button>
            <div className={`accordion-body ${open ? "open" : ""}`}>
              <div>
                <p className="text-sm text-text-soft leading-relaxed pb-5 pr-12">
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
