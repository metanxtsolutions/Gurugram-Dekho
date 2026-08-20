import Link from 'next/link';
import { Icon } from './Icons';

interface BreadcrumbItem {
  name: string;
  href: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  /** `light` for use on dark hero backgrounds */
  tone?: 'default' | 'light';
}

export function Breadcrumb({ items, tone = 'default' }: BreadcrumbProps) {
  const muted = tone === 'light' ? 'text-ink-300' : 'text-ink-400';
  const link = tone === 'light' ? 'text-ink-200 hover:text-white' : 'text-ink-500 hover:text-brand-600';
  const current = tone === 'light' ? 'text-white' : 'text-ink-900';

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.href}-${index}`} className="flex items-center gap-1.5">
              {index > 0 && (
                <Icon name="chevron" className={`w-3.5 h-3.5 shrink-0 ${muted}`} />
              )}
              {isLast ? (
                <span className={`font-medium ${current}`} aria-current="page">
                  {item.name}
                </span>
              ) : (
                <Link href={item.href} className={`${link} transition-colors`}>
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
