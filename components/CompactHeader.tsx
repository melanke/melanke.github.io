"use client";

import { Header } from "./Header";
import type { HeaderProps } from "./Header";

export function CompactHeader(props: HeaderProps) {
  return (
    <div className="sticky top-0 z-50 bg-[#f9b800] py-3 pl-5 pr-8">
      <Header {...props} compact={true} />
    </div>
  );
}
