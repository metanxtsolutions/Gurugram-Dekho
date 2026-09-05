'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Icon } from '@/components/Icons';
import { matchNotes, parseSectorQuery, SECTOR_MAX, SECTOR_NOTES, type SectorNote } from '@/lib/sectors';

/*
  Sector decoder.

  The page loads with every area, its guides and its places already in hand
  (ten areas, a few dozen rows), so matching happens as you type with no
  request. The query is mirrored to ?q= so an answer can be sent as a link.
*/

export type DecoderArea = {
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  placeCount: number;
  guides: { title: string; slug: string }[];
  places: { name: string; slug: string; placeType: string }[];
};

const SUGGESTIONS = ['29', 'Cyber City', '56', 'Sohna Road', '14', 'Golf Course Road'];

export function SectorDecoder({ areas }: { areas: DecoderArea[] }) {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');

  useEffect(() => {
    const q = query.trim();
    window.history.replaceState(null, '', q ? `?q=${encodeURIComponent(q)}` : window.location.pathname);
  }, [query]);

  const byId = useMemo(() => new Map(areas.map((a) => [a.slug, a])), [areas]);
  const names = useMemo(() => Object.fromEntries(areas.map((a) => [a.slug, a.name])), [areas]);

  const { number, matches } = useMemo(() => matchNotes(query, names), [query, names]);
  const typed = query.trim().length > 0;
  const { number: parsedNumber } = parseSectorQuery(query);

  // A sector number that is real but not written about yet is a different
  // state from a typo, and deserves a different answer.
  const validButUncovered = typed && parsedNumber !== null && matches.length === 0;
  const notASector =
    typed &&
    parsedNumber === null &&
    matches.length === 0 &&
    /^\s*(sector|sec|s)?\s*-?\s*\d+/.test(query.toLowerCase());

  return (
    <div className="grid gap-6">
      <div className="rounded-card border border-line bg-card p-5 sm:p-6">
        <label htmlFor="sector-q" className="block font-medium text-fg">
          Type a sector number or a name
        </label>
        <div className="relative mt-2.5">
          <Icon name="search" className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-fg-subtle" />
          <input
            id="sector-q"
            type="search"
            inputMode="text"
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="29, Cyber City, Sohna Road…"
            className="w-full h-14 pl-12 pr-4 rounded-pill border border-line bg-card text-fg text-[17px] focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-[13px] text-fg-subtle">Try:</span>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setQuery(s)}
              className="px-3 py-1.5 rounded-pill border border-line bg-card-2 text-[13px] font-medium text-fg-muted hover:border-brand-500 hover:text-fg transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {!typed && (
        <p className="text-[15px] text-fg-muted max-w-2xl">
          Gurugram has {SECTOR_MAX} numbered sectors and the numbers tell you almost nothing on
          their own. This finds the area a sector belongs to, the nearest metro, and what we
          have written about it.
        </p>
      )}

      {matches.length > 0 && (
        <div className="grid gap-4">
          {number !== null && matches.length > 1 && (
            <p className="text-[14px] text-fg-muted">
              Sector {number} sits where two areas meet, so both are shown.
            </p>
          )}
          {matches.map((note) => (
            <Result key={note.slug} note={note} area={byId.get(note.slug)} />
          ))}
        </div>
      )}

      {validButUncovered && (
        <Empty
          title={`We have not written about Sector ${parsedNumber} yet`}
          body="It is a real sector, we just have nothing verified to say about it. The nearest areas we do cover are below, and if you live there, tell us what a newcomer should know."
          areas={areas}
        />
      )}

      {notASector && (
        <Empty
          title="That does not look like a Gurugram sector"
          body={`Sector numbers run from 1 to ${SECTOR_MAX}. Try one of those, or a name like Cyber City or Sohna Road.`}
          areas={areas}
        />
      )}

      {typed && parsedNumber === null && !notASector && matches.length === 0 && (
        <Empty
          title={`Nothing matched "${query.trim()}"`}
          body="Try a sector number, or one of the areas below."
          areas={areas}
        />
      )}
    </div>
  );
}

/* ───────────────────────── pieces ───────────────────────── */

function Result({ note, area }: { note: SectorNote; area?: DecoderArea }) {
  const name = area?.name ?? note.name;
  return (
    <article className="rounded-card border border-line bg-card overflow-hidden">
      <div className="p-5 sm:p-6">
        <p className="eyebrow text-brand-600">
          {note.sectors.length === 1 ? `Sector ${note.sectors[0]}` : `Sectors ${note.sectors.join(', ')}`}
        </p>
        <h2 className="display mt-1.5 text-fg text-[1.7rem] sm:text-[2.1rem]">
          <Link href={`/area/${note.slug}`} className="hover:text-brand-600 transition-colors">
            {name}
          </Link>
        </h2>
        <p className="mt-2 text-[17px] text-fg leading-snug">{note.character}</p>
        {area?.description && (
          <p className="mt-2.5 text-[15px] text-fg-muted leading-relaxed">{area.description}</p>
        )}
      </div>

      <div className="border-t border-line bg-card-2 px-5 sm:px-6 py-4 flex items-start gap-3">
        <span className="grid place-items-center w-9 h-9 shrink-0 rounded-full bg-brand-500 text-ink-950">
          <Icon name="navigation" className="w-4 h-4" />
        </span>
        <div className="min-w-0">
          <p className="font-medium text-fg">
            {note.metro.station}
            <span className="ml-2 px-2 py-0.5 rounded-pill bg-card border border-line text-[11px] font-medium text-fg-muted">
              {note.metro.line}
            </span>
          </p>
          <p className="text-[14px] text-fg-muted mt-0.5">{note.metro.reach}</p>
        </div>
      </div>

      {(area?.guides.length || area?.places.length) ? (
        <div className="grid sm:grid-cols-2 gap-5 p-5 sm:p-6 border-t border-line">
          {area.guides.length > 0 && (
            <div>
              <p className="eyebrow text-fg-subtle">Guides</p>
              <ul className="mt-2 space-y-2">
                {area.guides.slice(0, 4).map((g) => (
                  <li key={g.slug}>
                    <Link href={`/article/${g.slug}`} className="text-[15px] font-medium text-fg hover:text-brand-600 transition-colors">
                      {g.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {area.places.length > 0 && (
            <div>
              <p className="eyebrow text-fg-subtle">Places</p>
              <ul className="mt-2 space-y-2">
                {area.places.slice(0, 4).map((p) => (
                  <li key={p.slug} className="flex items-baseline justify-between gap-3">
                    <Link href={`/place/${p.slug}`} className="text-[15px] font-medium text-fg hover:text-brand-600 transition-colors">
                      {p.name}
                    </Link>
                    <span className="text-[12px] text-fg-subtle capitalize shrink-0">{p.placeType}</span>
                  </li>
                ))}
              </ul>
              {area.placeCount > 4 && (
                <Link href={`/area/${note.slug}`} className="inline-block mt-2 text-[13px] text-brand-600 hover:text-brand-700">
                  All {area.placeCount} places
                </Link>
              )}
            </div>
          )}
        </div>
      ) : null}

      <p className="px-5 sm:px-6 py-3 border-t border-line text-[12px] text-fg-subtle">
        Metro and character last verified {note.verified}.
      </p>
    </article>
  );
}

function Empty({ title, body, areas }: { title: string; body: string; areas: DecoderArea[] }) {
  // With no Area rows yet, the chips come from the editorial notes instead.
  const chips = areas.length > 0 ? areas : SECTOR_NOTES.map((n) => ({ slug: n.slug, name: n.name }));
  return (
    <div className="rounded-card border border-dashed border-line bg-card-2 p-5 sm:p-6">
      <h2 className="display-sm text-fg text-xl">{title}</h2>
      <p className="mt-1.5 text-[15px] text-fg-muted max-w-xl">{body}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {chips.map((a) => (
          <Link
            key={a.slug}
            href={`/area/${a.slug}`}
            className="px-3.5 py-2 rounded-pill bg-card border border-line text-[14px] font-medium text-fg hover:border-brand-500 transition-colors"
          >
            {a.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
