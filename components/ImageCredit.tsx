import { creditLine } from '@/lib/image-license';

/**
 * Attribution line. CC BY, CC BY-SA and GODL all require a visible credit —
 * rendering it is a licence condition, not decoration.
 */
export function ImageCredit({
  image,
  className = '',
}: {
  image: {
    credit?: string | null;
    license: string;
    sourceUrl?: string | null;
  } | null;
  className?: string;
}) {
  if (!image) return null;

  const line = creditLine(image);
  if (!line) return null;

  return (
    <p className={`mt-2 text-xs text-ink-400 ${className}`}>
      {image.sourceUrl ? (
        <a
          href={image.sourceUrl}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="hover:text-ink-600 transition-colors"
        >
          {line}
        </a>
      ) : (
        line
      )}
    </p>
  );
}
