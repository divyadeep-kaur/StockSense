"use client";

import { createPortal } from "react-dom";
import { useLayoutEffect, useState, type CSSProperties, type ReactNode, type RefObject } from "react";

const VIEWPORT_MARGIN = 12;

/**
 * Renders popover content into document.body, positioned under `anchorRef`.
 * Needed because the app shell's scroll containers use overflow-hidden, which
 * would otherwise clip an absolutely-positioned dropdown that's wider than
 * its own positioned ancestor (e.g. the topbar). Also clamps the panel to
 * stay fully inside the viewport on narrow screens.
 */
export function DropdownPortal({
  anchorRef,
  open,
  width,
  children,
  align = "right",
}: {
  anchorRef: RefObject<HTMLElement | null>;
  open: boolean;
  /** Intended panel width in px — clamped down on narrow viewports. */
  width: number;
  children: ReactNode;
  align?: "left" | "right";
}) {
  const [style, setStyle] = useState<CSSProperties | null>(null);

  useLayoutEffect(() => {
    if (!open || !anchorRef.current) {
      setStyle(null);
      return;
    }
    const rect = anchorRef.current.getBoundingClientRect();
    const effectiveWidth = Math.min(width, window.innerWidth - VIEWPORT_MARGIN * 2);
    const desiredLeft = align === "right" ? rect.right - effectiveWidth : rect.left;
    const maxLeft = window.innerWidth - effectiveWidth - VIEWPORT_MARGIN;
    const left = Math.min(Math.max(desiredLeft, VIEWPORT_MARGIN), Math.max(maxLeft, VIEWPORT_MARGIN));

    setStyle({
      position: "fixed",
      top: rect.bottom + 10,
      left,
      width: effectiveWidth,
      zIndex: 50,
    });
  }, [open, anchorRef, align, width]);

  if (!open || !style || typeof document === "undefined") return null;
  return createPortal(<div style={style}>{children}</div>, document.body);
}
