"use client";

import { useEffect, useState } from "react";
import { Header, HeaderProps } from "./Header";

export function StickyHeader(props: HeaderProps) {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setCompact(window.scrollY > 100);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div
        className={`sticky top-0 z-50 print:static bg-[#8063FF] dark:bg-[#6721D5] print:bg-transparent transition-[padding] duration-300 ease-out print:p-0 ${
          compact
            ? "py-3 pl-5 pr-8 max-md:pr-5"
            : "pt-6 pb-32 pl-5 pr-8 max-md:pr-5 max-md:pb-12"
        }`}
      >
        <div
          className={`print:m-0 transition-[margin] duration-300 ease-out ${
            compact ? "" : "lg:m-12 xl:mx-0"
          }`}
        >
          <Header {...props} compact={compact} />
        </div>
      </div>
      {/* Compensation spacer: grows as the sticky header shrinks so the doc total
          height stays constant and the content below doesn't slide up under the bar. */}
      <div
        aria-hidden
        className={`print:hidden transition-[height] duration-300 ease-out ${
          compact ? "h-[200px] md:h-[300px] lg:h-[400px]" : "h-0"
        }`}
      />
    </>
  );
}
