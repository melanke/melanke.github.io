"use client";

import { useEffect, useState } from "react";

const ROLES = [
  "Product Engineer",
  "TechLead",
  "Main Developer",
  "Product Owner",
  "Project Manager",
  "Blockchain Engineer",
  "Fullstack Developer",
  "AI Engineer",
];

const TYPE_SPEED = 70;
const DELETE_SPEED = 35;
const HOLD_DELAY = 1600;

/** Typewriter effect cycling through Gil's roles: types a word, holds, backspaces, next. */
export function TypingTitle({ className }: { className?: string }) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = ROLES[index];

    if (!deleting && text === current) {
      const t = setTimeout(() => setDeleting(true), HOLD_DELAY);
      return () => clearTimeout(t);
    }

    if (deleting && text === "") {
      setDeleting(false);
      setIndex((i) => (i + 1) % ROLES.length);
      return;
    }

    const t = setTimeout(
      () =>
        setText((prev) =>
          deleting
            ? current.slice(0, prev.length - 1)
            : current.slice(0, prev.length + 1)
        ),
      deleting ? DELETE_SPEED : TYPE_SPEED
    );
    return () => clearTimeout(t);
  }, [text, deleting, index]);

  return (
    <span className={className} aria-label="Principal Software Engineer">
      {text}
      <span className="inline-block w-px -mb-0.5 animate-pulse" aria-hidden>
        |
      </span>
    </span>
  );
}
