import React, { useState, KeyboardEvent } from "react";

export interface CollapsibleCardProps {
  id: string;
  title: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  children?: React.ReactNode;
  keepMounted?: boolean;
}

/**
 * Minimal, accessible collapsible card (TSX). Replace styles with your design system as needed.
 */
export default function CollapsibleCard({
  id,
  title,
  defaultOpen = false,
  className = "",
  children,
  keepMounted = false,
}: CollapsibleCardProps): JSX.Element {
  const [open, setOpen] = useState<boolean>(defaultOpen);
  const toggle = () => setOpen((v) => !v);

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      toggle();
    }
  };

  return (
    <section className={`card ${className}`} aria-labelledby={`${id}-label`}>
      <header
        className="card-header"
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 12 }}
      >
        <h3 id={`${id}-label`} style={{ margin: 0 }}>
          {title}
        </h3>

        <button
          type="button"
          className="card-toggle"
          onClick={toggle}
          onKeyDown={onKeyDown}
          aria-expanded={open}
          aria-controls={`${id}-panel`}
        >
          <span style={{ position: "absolute", left: -9999 }}>{open ? "Collapse" : "Expand"}</span>
          <svg
            aria-hidden="true"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 160ms ease" }}
          >
            <path fill="currentColor" d="M12 15.6L5.7 9.3l1.4-1.4L12 12.8l4.9-4.9 1.4 1.4z" />
          </svg>
        </button>
      </header>

      <div
        id={`${id}-panel`}
        className={`card-panel ${open ? "open" : "closed"}`}
        role="region"
        aria-labelledby={`${id}-label`}
        aria-hidden={!open}
        style={{ padding: open ? 12 : 0, overflow: "hidden", transition: "max-height 220ms ease, opacity 180ms ease" }}
      >
        {open || keepMounted ? children : null}
      </div>
    </section>
  );
}
