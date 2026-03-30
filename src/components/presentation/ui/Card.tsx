"use client";

import React from "react";

export const cx = (...xs: (string | false | null | undefined)[]): string =>
  xs.filter(Boolean).join(" ");

export function Card({
  children,
  selected = false,
  onClick,
  hoverColor = "hover:bg-[#F27887]/10",
  className,
}: {
  children: React.ReactNode;
  selected?: boolean;
  onClick?: () => void;
  hoverColor?: string;
  className?: string;
}) {
  return (
    <div className={cx("h-full", className)}>
      <button
        onClick={onClick}
        className={cx(
          "text-left w-full h-full border bg-white transition appearance-none focus:outline-none hover:cursor-pointer rounded-lg",
          selected
            ? "bg-[#1F3A32] text-white border-[#1F3A32]"
            : "border-[#E5E5E0]",
          !selected && hoverColor
        )}
      >
        {children}
      </button>
    </div>
  );
}
