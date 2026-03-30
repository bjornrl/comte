"use client";

import { useState } from "react";
import Link from "next/link";
import { comteColors } from "@/lib/comte-colors";

const HOVER_COLORS = [
  { bg: comteColors.darkGreen, text: comteColors.cream },
  { bg: comteColors.deepRed, text: comteColors.cream },
  { bg: comteColors.coolBlue, text: comteColors.lightBase },
  { bg: comteColors.mutedGreen, text: comteColors.cream },
  { bg: comteColors.gold, text: comteColors.nearBlack },
  { bg: comteColors.coral, text: comteColors.nearBlack },
] as const;

type Article = {
  _id: string;
  title: string;
  year: number;
  forum?: string;
  imageUrl?: string;
  linkType: "internal" | "external";
  externalUrl?: string;
  slug?: string;
};

export default function ArticlesTable({ articles }: { articles: Article[] }) {
  const [hoveredInsight, setHoveredInsight] = useState<{
    index: number;
    x: number;
    y: number;
    imageUrl: string;
    bg: string;
    text: string;
  } | null>(null);

  const pickRandomHoverColor = () =>
    HOVER_COLORS[Math.floor(Math.random() * HOVER_COLORS.length)];

  return (
    <>
      <div className="w-full overflow-hidden rounded-xl border border-foreground/30">
        <div className="sticky top-0 z-10 grid grid-cols-3 gap-x-4 border-b border-foreground/30 px-4 py-3 text-left text-sm font-medium text-foreground/70">
          <span>Year</span>
          <span>Title</span>
          <span>Forum</span>
        </div>
        {articles.map((article, i) => {
          const href =
            article.linkType === "external" && article.externalUrl
              ? article.externalUrl
              : `/article/${article.slug}`;
          const isExternal = article.linkType === "external";

          return (
            <Link
              key={article._id}
              href={href}
              {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="grid grid-cols-3 gap-x-4 border-b border-foreground/20 px-4 py-4 text-left transition-colors duration-200"
              style={{
                backgroundColor: hoveredInsight?.index === i ? hoveredInsight.bg : undefined,
                color: hoveredInsight?.index === i ? hoveredInsight.text : undefined,
              }}
              onMouseEnter={(e) => {
                const hoverColor = pickRandomHoverColor();
                setHoveredInsight({
                  index: i,
                  x: e.clientX,
                  y: e.clientY,
                  imageUrl: article.imageUrl ?? "",
                  bg: hoverColor.bg,
                  text: hoverColor.text,
                });
              }}
              onMouseMove={(e) => {
                setHoveredInsight((prev) =>
                  prev && prev.index === i ? { ...prev, x: e.clientX, y: e.clientY } : prev
                );
              }}
              onMouseLeave={() => {
                setHoveredInsight((prev) => (prev && prev.index === i ? null : prev));
              }}
            >
              <p
                className={`text-lg transition-colors duration-200 ${
                  hoveredInsight?.index === i ? "font-bold" : "font-light"
                }`}
              >
                {article.year}
              </p>
              <p
                className={`text-lg transition-colors duration-200 ${
                  hoveredInsight?.index === i ? "font-bold" : "font-light"
                }`}
              >
                {article.title}
                {isExternal && " ↗"}
              </p>
              <p
                className={`text-lg transition-colors duration-200 ${
                  hoveredInsight?.index === i ? "font-bold" : "font-light"
                }`}
              >
                {article.forum}
              </p>
            </Link>
          );
        })}
      </div>

      {/* Floating hover image */}
      {hoveredInsight && hoveredInsight.imageUrl ? (
        <div
          className="pointer-events-none fixed z-50 overflow-hidden rounded-md border border-foreground/20 bg-background shadow-lg"
          style={{
            left: hoveredInsight.x,
            top: hoveredInsight.y,
            width: 160,
            height: 104,
            transform: "translate(-50%, calc(-100% - 16px))",
          }}
        >
          <img src={hoveredInsight.imageUrl} alt="" className="h-full w-full object-cover" />
        </div>
      ) : null}
    </>
  );
}
