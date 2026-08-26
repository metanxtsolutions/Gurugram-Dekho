import Link from 'next/link';
import { Icon } from './Icons';

interface BreadcrumbItem {
  name: string;
  href: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

/*
  The `tone` prop is gone along with the dark hero bands it existed for. Every
  page now puts the trail on the page background, where the theme tokens are
  correct in both themes without a second colour set.

  The trail stays on one line and the current page truncates rather than
  wrapping: a long article title otherwise pushed its own separator onto a line
  of its own on a phone.
*/
export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-1.5 text-sm min-w-0">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.href}-${index}`} className="flex items-center gap-1.5 min-w-0">
              {index > 0 && (
                <Icon name="chevron" className="w-3.5 h-3.5 shrink-0 text-fg-subtle" />
              )}
              {isLast ? (
                <span className="font-medium truncate text-fg" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="text-fg-subtle hover:text-brand-600 transition-colors whitespace-nowrap"
                >
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
