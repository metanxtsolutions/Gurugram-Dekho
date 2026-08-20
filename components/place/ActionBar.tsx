import { Icon } from '@/components/Icons';

/**
 * The three things someone actually wants from a listing: ring it, get there,
 * open the site. Sticky at the bottom on mobile because that is where a thumb
 * reaches; inline in the sidebar on desktop.
 */
export function ActionBar({
  name,
  phone,
  website,
  mapsUrl,
  variant,
}: {
  name: string;
  phone?: string | null;
  website?: string | null;
  mapsUrl: string;
  variant: 'sticky' | 'inline';
}) {
  const actions = [
    phone ? { label: 'Call', icon: 'phone', href: `tel:${phone}`, primary: false } : null,
    { label: 'Directions', icon: 'navigation', href: mapsUrl, primary: true, external: true },
    website ? { label: 'Website', icon: 'globe', href: website, primary: false, external: true } : null,
  ].filter(Boolean) as {
    label: string;
    icon: string;
    href: string;
    primary: boolean;
    external?: boolean;
  }[];

  const wrapper =
    variant === 'sticky'
      ? 'lg:hidden fixed inset-x-0 bottom-0 z-40 border-t border-ink-100 bg-white/95 backdrop-blur px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] grid gap-2'
      : 'hidden lg:grid gap-2';

  return (
    <div
      className={wrapper}
      style={{ gridTemplateColumns: `repeat(${actions.length}, minmax(0, 1fr))` }}
      aria-label={`Actions for ${name}`}
    >
      {actions.map((a) => (
        <a
          key={a.label}
          href={a.href}
          {...(a.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          className={`inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
            a.primary
              ? 'bg-brand-500 hover:bg-brand-600 text-white'
              : 'border border-ink-200 text-ink-800 hover:border-ink-300 hover:bg-ink-50'
          }`}
        >
          <Icon name={a.icon} className="w-[18px] h-[18px]" />
          {a.label}
        </a>
      ))}
    </div>
  );
}
