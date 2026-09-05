'use client';

/*
  Light and dark toggle, matching the moon control on KolkataDekho.

  Deliberately holds no React state. The theme already lives in one place, the
  `data-theme` attribute the inline script in the root layout sets before first
  paint, so mirroring it into state only created a second source of truth, a
  server/client mismatch on first render, and a setState inside an effect.

  Both icons are rendered and CSS picks one off `data-theme`, which means the
  correct icon is right in the very first painted frame with no JavaScript
  involved at all.
*/
export function ThemeToggle({ className = '' }: { className?: string }) {
  const toggle = () => {
    const root = document.documentElement;
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try {
      localStorage.setItem('gd-theme', next);
    } catch {
      // Private mode can block writes. The theme still applies for this visit.
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Switch between light and dark theme"
      className={`grid place-items-center w-10 h-10 rounded-full text-fg-muted hover:text-fg hover:bg-card-2 transition-colors ${className}`}
    >
      {/* Moon, shown in light mode: the control offers the other theme */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-[19px] h-[19px] theme-icon-light"
        aria-hidden="true"
      >
        <path d="M20.5 14.2A8.5 8.5 0 1 1 9.8 3.5a6.9 6.9 0 0 0 10.7 10.7Z" />
      </svg>

      {/* Sun, shown in dark mode */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-[19px] h-[19px] theme-icon-dark"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4.2" />
        <path d="M12 2.6v2.2M12 19.2v2.2M4.4 4.4l1.6 1.6M18 18l1.6 1.6M2.6 12h2.2M19.2 12h2.2M4.4 19.6L6 18M18 6l1.6-1.6" />
      </svg>
    </button>
  );
}
