"use client";

import { useState } from "react";

export function CopyUsernameButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      className="secondary-button"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1400);
      }}
    >
      {copied ? "Copied" : "Copy Username"}
    </button>
  );
}
