"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  motion,
  AnimatePresence,
  PanInfo,
  useDragControls,
} from "framer-motion";
import { X } from "lucide-react";
import { useUi } from "./useUi";

const SHEET_HEIGHT_VH = 92;
const DRAG_DISMISS_PX = 140;
const DRAG_DISMISS_VELOCITY = 700;
const CLOSE_BOX_SIZE = 42;

type Props = {
  /** ARIA label for the sheet. */
  ariaLabel?: string;
  /** Title rendered in the sticky header. Stays visible while content
   *  scrolls underneath. */
  title?: string;
  children: React.ReactNode;
};

/**
 * Bottom-sheet overlay used by intercepting routes. Slides up from the
 * bottom of the viewport, leaves a peek of the page behind, and dismisses
 * via close button, backdrop, Escape, or drag-down past a threshold.
 *
 * Drag is gated to the header — the body scrolls freely without
 * triggering the dismiss gesture.
 */
export default function BottomSheet({ ariaLabel, title, children }: Props) {
  const router = useRouter();
  const ui = useUi();
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();

  const dismiss = () => router.back();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const onDragEnd = (
    _e: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    if (info.offset.y > DRAG_DISMISS_PX || info.velocity.y > DRAG_DISMISS_VELOCITY) {
      dismiss();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        role="presentation"
        onClick={dismiss}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15, 23, 28, 0.55)",
          zIndex: 1000,
        }}
      />
      <motion.div
        key="sheet"
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel ?? title}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 32, stiffness: 320, mass: 0.9 }}
        drag="y"
        dragListener={false}
        dragControls={dragControls}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.4 }}
        onDragEnd={onDragEnd}
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          height: `${SHEET_HEIGHT_VH}vh`,
          background: "var(--background, #F5F5E9)",
          color: "var(--foreground, #1F3A32)",
          zIndex: 1001,
          boxShadow: "0 -20px 60px rgba(0,0,0,0.25)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Sticky header — close button pinned top-right, title wraps in
            its own row below so long titles never get clipped.
            Pointer-down anywhere in the header (except the close button)
            initiates the drag-to-dismiss gesture. */}
        <div
          onPointerDown={(e) => dragControls.start(e)}
          style={{
            position: "relative",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            padding: "8px 8px 16px 20px",
            gap: 12,
            cursor: "grab",
            touchAction: "none",
            borderBottom: "1px solid rgba(31, 58, 50, 0.08)",
            background: "var(--background, #F5F5E9)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                dismiss();
              }}
              onPointerDown={(e) => e.stopPropagation()}
              aria-label={ui.sheet.close}
              style={{
                width: CLOSE_BOX_SIZE,
                height: CLOSE_BOX_SIZE,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#FF5252",
                color: "#F5F5E9",
                border: "none",
                cursor: "pointer",
              }}
            >
              <X size={20} strokeWidth={2} aria-hidden />
            </button>
          </div>
          {title && (
            <h2
              className="font-[family-name:var(--font-manrope)]"
              style={{
                margin: 0,
                paddingRight: 12,
                fontSize: "clamp(1.5rem, 6vw, 2rem)",
                fontWeight: 700,
                lineHeight: 1.15,
                color: "inherit",
                overflowWrap: "anywhere",
                wordBreak: "break-word",
              }}
            >
              {title}
            </h2>
          )}
        </div>

        {/* Scrollable content. */}
        <div
          ref={scrollRef}
          style={{
            flex: "1 1 auto",
            overflowY: "auto",
            overscrollBehavior: "contain",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {children}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
