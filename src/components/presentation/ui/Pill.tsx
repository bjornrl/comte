"use client";

export default function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full border border-[#E5E5E0] text-sm text-[#676160]">
      {children}
    </span>
  );
}
