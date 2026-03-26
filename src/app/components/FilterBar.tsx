"use client";

import React from "react";
import {
  type Domain, type Scale, type Method, type InnovationLevel, type FilterState,
  DOMAIN_COLORS, DOMAIN_LABELS, SCALE_LABELS, METHOD_LABELS, INNOVATION_LABELS,
  NO_FILTERS, hasActiveFilters, PROJECTS, projectMatchesFilters,
} from "./projectNetworkData";

interface FilterBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

const groupLabelStyle: React.CSSProperties = {
  width: 80,
  flexShrink: 0,
  fontFamily: "var(--font-geist-mono)",
  fontSize: "0.6rem",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  color: "rgba(0,0,0,0.3)",
};

const rowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  marginBottom: 4,
};

function pillStyle(active: boolean, activeColor?: string): React.CSSProperties {
  if (active) {
    return {
      background: activeColor || "#212121",
      border: `1px solid ${activeColor || "#212121"}`,
      borderRadius: 16,
      padding: "5px 14px",
      fontFamily: "var(--font-geist-sans)",
      fontSize: "0.7rem",
      fontWeight: 500,
      color: activeColor ? "#212121" : "#F9F9ED",
      cursor: "pointer",
      transition: "all 0.2s ease",
      whiteSpace: "nowrap" as const,
    };
  }
  return {
    background: "rgba(0,0,0,0.04)",
    border: "1px solid rgba(0,0,0,0.1)",
    borderRadius: 16,
    padding: "5px 14px",
    fontFamily: "var(--font-geist-sans)",
    fontSize: "0.7rem",
    fontWeight: 450,
    color: "rgba(0,0,0,0.5)",
    cursor: "pointer",
    transition: "all 0.2s ease",
    whiteSpace: "nowrap" as const,
  };
}

export default function FilterBar({ filters, onChange }: FilterBarProps) {
  const matchCount = PROJECTS.filter((p) => projectMatchesFilters(p, filters)).length;

  return (
    <div
      id="projects-filter-bar"
      style={{
        position: "sticky",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: "rgba(249, 249, 237, 0.92)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderTop: "1px solid rgba(0,0,0,0.06)",
        padding: "12px 24px 16px 24px",
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* Domain row */}
        <div style={rowStyle}>
          <span style={groupLabelStyle}>Domain</span>
          {(Object.keys(DOMAIN_LABELS) as Domain[]).map((d) => {
            const active = filters.domain === d;
            return (
              <button
                key={d}
                onClick={() => onChange({ ...filters, domain: filters.domain === d ? null : d })}
                style={pillStyle(active, active ? DOMAIN_COLORS[d] : undefined)}
                onMouseEnter={(e) => { if (!active) { const t = e.currentTarget; t.style.background = "rgba(0,0,0,0.08)"; t.style.color = "rgba(0,0,0,0.7)"; } }}
                onMouseLeave={(e) => { if (!active) { const t = e.currentTarget; t.style.background = "rgba(0,0,0,0.04)"; t.style.color = "rgba(0,0,0,0.5)"; } }}
              >
                {DOMAIN_LABELS[d]}
              </button>
            );
          })}
        </div>

        {/* Scale row */}
        <div style={rowStyle}>
          <span style={groupLabelStyle}>Scale</span>
          {(Object.keys(SCALE_LABELS) as Scale[]).map((s) => {
            const active = filters.scale === s;
            return (
              <button
                key={s}
                onClick={() => onChange({ ...filters, scale: filters.scale === s ? null : s })}
                style={pillStyle(active)}
                onMouseEnter={(e) => { if (!active) { const t = e.currentTarget; t.style.background = "rgba(0,0,0,0.08)"; t.style.color = "rgba(0,0,0,0.7)"; } }}
                onMouseLeave={(e) => { if (!active) { const t = e.currentTarget; t.style.background = "rgba(0,0,0,0.04)"; t.style.color = "rgba(0,0,0,0.5)"; } }}
              >
                {SCALE_LABELS[s]}
              </button>
            );
          })}
        </div>

        {/* Method row */}
        <div style={rowStyle}>
          <span style={groupLabelStyle}>Method</span>
          {(Object.keys(METHOD_LABELS) as Method[]).map((m) => {
            const active = filters.method === m;
            return (
              <button
                key={m}
                onClick={() => onChange({ ...filters, method: filters.method === m ? null : m })}
                style={pillStyle(active)}
                onMouseEnter={(e) => { if (!active) { const t = e.currentTarget; t.style.background = "rgba(0,0,0,0.08)"; t.style.color = "rgba(0,0,0,0.7)"; } }}
                onMouseLeave={(e) => { if (!active) { const t = e.currentTarget; t.style.background = "rgba(0,0,0,0.04)"; t.style.color = "rgba(0,0,0,0.5)"; } }}
              >
                {METHOD_LABELS[m]}
              </button>
            );
          })}
        </div>

        {/* Innovation row */}
        <div style={{ ...rowStyle, marginBottom: 0 }}>
          <span style={groupLabelStyle}>Innovation</span>
          {(Object.keys(INNOVATION_LABELS) as InnovationLevel[]).map((il) => {
            const active = filters.innovationLevel === il;
            return (
              <button
                key={il}
                onClick={() => onChange({ ...filters, innovationLevel: filters.innovationLevel === il ? null : il })}
                style={pillStyle(active)}
                onMouseEnter={(e) => { if (!active) { const t = e.currentTarget; t.style.background = "rgba(0,0,0,0.08)"; t.style.color = "rgba(0,0,0,0.7)"; } }}
                onMouseLeave={(e) => { if (!active) { const t = e.currentTarget; t.style.background = "rgba(0,0,0,0.04)"; t.style.color = "rgba(0,0,0,0.5)"; } }}
              >
                {INNOVATION_LABELS[il]}
              </button>
            );
          })}
          <div style={{ flex: 1 }} />
          <button
            onClick={() => onChange(NO_FILTERS)}
            style={{
              background: "none",
              border: "none",
              fontFamily: "var(--font-geist-sans)",
              fontSize: "0.7rem",
              color: "rgba(0,0,0,0.4)",
              cursor: "pointer",
              padding: "5px 8px",
              opacity: hasActiveFilters(filters) ? 1 : 0,
              pointerEvents: hasActiveFilters(filters) ? "auto" : "none",
              transition: "opacity 0.2s ease, color 0.2s ease",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(0,0,0,0.7)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(0,0,0,0.4)"; }}
          >
            Clear{hasActiveFilters(filters) ? ` (${matchCount})` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}
