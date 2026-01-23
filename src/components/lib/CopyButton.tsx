import { useEffect, useState, ReactNode } from "react";
import Check from "@/svg/Check";
import Copy from "@/svg/Copy";

// ────────────────────────────────────────────────
// Props interface
// ────────────────────────────────────────────────
interface CopyButtonProps {
  copyText: string;
  buttonText: string | ReactNode;
  className?: string;
  iconClassName?: string;
}

// ────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────
export default function CopyButton({
  copyText,
  buttonText,
  className = "flex items-center gap-2 text-sm text-muted-foreground",
  iconClassName = "text-accent",
}: CopyButtonProps) {
  const [isCopied, setIsCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!isCopied) return;

    const id = setTimeout(() => {
      setIsCopied(false);
    }, 1500);

    return () => clearTimeout(id);
  }, [isCopied]);

  // Fallback copy using document.execCommand (old browsers)
  const handleFallbackCopy = (text: string) => {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    // Make sure it's not visible & doesn't mess with scroll
    textarea.setAttribute("readonly", "");
    textarea.style.position = "absolute";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);

    textarea.focus();
    textarea.select();

    try {
      const successful = document.execCommand("copy");
      setIsCopied(successful);
    } catch (err) {
      console.error("Fallback: Oops, unable to copy", err);
    }

    document.body.removeChild(textarea);
  };

  const handleCopyClick = async () => {
    if (!copyText) return;

    try {
      // Modern Clipboard API (preferred)
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(copyText);
        setIsCopied(true);
      } else {
        // Fallback for older browsers
        handleFallbackCopy(copyText);
      }
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <button
      type="button"
      aria-label={isCopied ? "Copied!" : "Copy"}
      aria-live="assertive"
      title={isCopied ? "Copied!" : "Click to copy address"}
      onClick={(e) => {
        e.preventDefault();
        handleCopyClick();
      }}
      className={className}
    >
      <span className="break-all">{buttonText}</span>

      <span aria-hidden className={iconClassName}>
        {isCopied ? <Check /> : <Copy />}
      </span>
    </button>
  );
}