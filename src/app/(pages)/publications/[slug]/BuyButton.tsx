"use client";

import { useState } from "react";

type Props = {
  slug: string;
  priceLabel: string;
};

export default function BuyButton({ slug, priceLabel }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const data = await res.json();
      if (!res.ok || !data?.url) {
        throw new Error(data?.error ?? "Could not start checkout.");
      }
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-2 items-stretch sm:w-auto sm:items-start">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="inline-flex w-full sm:w-auto items-center justify-center px-8 py-4 font-[family-name:var(--font-manrope)] text-base font-bold tracking-wide transition-opacity duration-200"
        style={{
          background: "#FF5252",
          color: "#FFF8F2",
          minHeight: 48,
          opacity: loading ? 0.6 : 1,
          cursor: loading ? "wait" : "pointer",
          border: "none",
        }}
      >
        {loading ? "Redirecting…" : `Buy now — ${priceLabel}`}
      </button>
      {error && (
        <p
          className="font-[family-name:var(--font-manrope)] text-sm font-medium"
          style={{ color: "#7A1F1F" }}
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
