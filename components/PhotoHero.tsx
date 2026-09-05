import Image from 'next/image';
import { Placeholder } from './Placeholder';

/**
 * The rounded photo hero used by articles, areas and places.
 *
 * Extracted rather than repeated three times: the scrim depth, the corner
 * radius and the fallback behaviour are the same decision everywhere, and the
 * three pages were previously drifting apart on all of them.
 *
 * Falls back to the designed placeholder when there is no honest photograph,
 * which keeps the provenance rule intact without leaving a blank frame.
 */
export function PhotoHero({
  image,
  name,
  label,
  priority = false,
  size = 'md',
  children,
}: {
  image: string | null;
  /** Used for the placeholder when there is no image. */
  name: string;
  /** Small caption on the placeholder, e.g. the place type. */
  label?: string;
  priority?: boolean;
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}) {
  const heights = {
    sm: 'min-h-[240px] md:min-h-[300px]',
    md: 'min-h-[300px] md:min-h-[420px]',
    lg: 'min-h-[340px] md:min-h-[480px]',
  } as const;

  return (
    <header
      className={`relative isolate overflow-hidden rounded-card flex items-end shadow-card ${heights[size]}`}
    >
      {image ? (
        <Image
          src={image}
          alt=""
          fill
          priority={priority}
          sizes="(max-width: 1024px) 100vw, 1200px"
          className="object-cover"
        />
      ) : (
        <Placeholder name={name} label={label} />
      )}
      <div className="absolute inset-0 photo-scrim" />
      <div className="relative p-5 md:p-8 w-full">{children}</div>
    </header>
  );
}
