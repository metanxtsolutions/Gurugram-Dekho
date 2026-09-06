/**
 * Weekend picker: a small editorial table of outings, each tagged with how
 * long it takes, roughly what it costs, and whether you need a car.
 *
 * Kept here rather than as columns on Article because it is a judgement about
 * an outing, not a fact about a page, and because some outings point at an
 * area or a tool rather than a guide. Article-backed ideas are only shown when
 * that guide is published; the caller passes the published slugs in.
 */

export type Hours = 2 | 4 | 8;
export type Budget = 1 | 2 | 3;

export type Idea = {
  id: string;
  title: string;
  line: string;
  hours: Hours;
  budget: Budget;
  needsCar: boolean;
  /** Where to send them. An article slug resolves to /article/<slug>. */
  href: string;
  articleSlug?: string;
  /** What you will actually be doing, in one phrase. */
  doing: string;
};

export const HOURS_LABEL: Record<Hours, string> = { 2: 'A couple of hours', 4: 'Half a day', 8: 'The whole day' };
export const BUDGET_LABEL: Record<Budget, string> = { 1: 'Under ₹500', 2: '₹500 to ₹1,500', 3: 'Money is not the point' };

export const IDEAS: Idea[] = [
  {
    id: 'run',
    title: 'Run the Leisure Valley loop',
    line: 'Or walk the Aravalli Biodiversity Park. Free, and done before the heat.',
    hours: 2, budget: 1, needsCar: false,
    href: '/article/fitness-guide-gurugram', articleSlug: 'fitness-guide-gurugram',
    doing: 'A morning outside',
  },
  {
    id: 'metro-loop',
    title: 'Ride the Rapid Metro loop end to end',
    line: 'The cheapest way to learn where everything is. Get off at Sector 42-43 for coffee.',
    hours: 2, budget: 1, needsCar: false,
    href: '/article/rapid-metro-gurugram-explained', articleSlug: 'rapid-metro-gurugram-explained',
    doing: 'Learning the city',
  },
  {
    id: 'sadar',
    title: 'Sadar Bazaar on foot',
    line: 'Old Gurgaon, chaat, and a city that predates the towers. Go hungry.',
    hours: 4, budget: 1, needsCar: false,
    href: '/article/budget-eats-under-300-old-gurgaon', articleSlug: 'budget-eats-under-300-old-gurgaon',
    doing: 'Street food and a wander',
  },
  {
    id: 'sector-29',
    title: 'Dinner on the Sector 29 strip',
    line: 'Loud, and worth it once. The guide says which rooftops actually have a view.',
    hours: 4, budget: 2, needsCar: false,
    href: '/article/sector-29-food-guide-gurugram', articleSlug: 'sector-29-food-guide-gurugram',
    doing: 'An evening out',
  },
  {
    id: 'cyber-hub',
    title: 'An evening at Cyber Hub',
    line: 'Better food than it gets credit for, and the one place that is easy to reach from everywhere.',
    hours: 4, budget: 2, needsCar: false,
    href: '/article/cyber-hub-vs-cyber-city-2026', articleSlug: 'cyber-hub-vs-cyber-city-2026',
    doing: 'Dinner and drinks',
  },
  {
    id: 'shopping',
    title: 'A Saturday at the markets',
    line: 'Where Gurugram actually shops, mall to market, by metro.',
    hours: 4, budget: 2, needsCar: false,
    href: '/article/gurugram-saturday-shopping-guide', articleSlug: 'gurugram-saturday-shopping-guide',
    doing: 'Shopping',
  },
  {
    id: 'gcr',
    title: 'Golf Course Road rooftops',
    line: 'Quieter money. Hotels, rooftops and the good spas, all on the Rapid Metro.',
    hours: 4, budget: 3, needsCar: false,
    href: '/area/golf-course-road',
    doing: 'A long, expensive lunch',
  },
  {
    id: 'escape',
    title: 'Out of the city for the day',
    line: 'Damdama, Sultanpur, the Aravalli trails. A car makes it a day rather than an expedition.',
    hours: 8, budget: 2, needsCar: true,
    href: '/article/weekend-escapes-near-gurugram', articleSlug: 'weekend-escapes-near-gurugram',
    doing: 'A day trip',
  },
  {
    id: 'escape-stay',
    title: 'A night away within 90 minutes',
    line: 'The same escapes, with a stay. Book the Friday before, not the Saturday morning.',
    hours: 8, budget: 3, needsCar: true,
    href: '/article/weekend-escapes-near-gurugram', articleSlug: 'weekend-escapes-near-gurugram',
    doing: 'An overnight',
  },
];

export type Pick = Idea & {
  /** How it fits: exact, or which constraint was loosened. */
  fit: 'exact' | 'shorter' | 'cheaper';
};

/**
 * Up to three ideas for the inputs. Exact fits first, then ideas that take
 * less time or cost less than allowed (never more), never one that needs a
 * car when there is none.
 */
export function pick(hours: Hours, budget: Budget, hasCar: boolean, published: Set<string>): Pick[] {
  const usable = IDEAS.filter((i) => !i.articleSlug || published.has(i.articleSlug)).filter((i) => !i.needsCar || hasCar);

  const exact = usable.filter((i) => i.hours === hours && i.budget === budget).map((i) => ({ ...i, fit: 'exact' as const }));
  const shorter = usable
    .filter((i) => i.hours < hours && i.budget === budget)
    .sort((a, b) => b.hours - a.hours)
    .map((i) => ({ ...i, fit: 'shorter' as const }));
  const cheaper = usable
    .filter((i) => i.hours <= hours && i.budget < budget)
    .sort((a, b) => b.hours - a.hours || b.budget - a.budget)
    .map((i) => ({ ...i, fit: 'cheaper' as const }));

  const seen = new Set<string>();
  const out: Pick[] = [];
  for (const p of [...exact, ...shorter, ...cheaper]) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    out.push(p);
    if (out.length === 3) break;
  }
  return out;
}
