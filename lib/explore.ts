/**
 * The four Explore cards on the homepage.
 *
 * Deliberately hard-coded rather than read from the Category table: these are
 * the site's four front doors, they are a design decision about what a new
 * arrival needs first, and they should not silently change when someone adds a
 * category in the admin panel.
 *
 * The photographs are illustrative stock, which is the same thing the reference
 * site does with its own Explore cards. They stand for a whole category, not
 * for any one venue, so they make no factual claim about a specific place. A
 * photo attached to an actual Place or Area still has to depict it, and that
 * rule is enforced separately in `lib/image-license.ts`.
 */

const u = (id: string, w: number) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export type ExploreCard = {
  name: string;
  slug: string;
  href: string;
  cta: string;
  image: string;
};

export const EXPLORE_CARDS: ExploreCard[] = [
  {
    name: 'Food',
    slug: 'food-dining',
    href: '/category/food-dining',
    cta: 'Eat Now',
    image: u('photo-1585937421612-70a008356fbe', 900),
  },
  {
    name: 'Stays',
    slug: 'stays-accommodation',
    href: '/category/stays-accommodation',
    cta: 'Visit Now',
    image: u('photo-1545324418-cc1a3fa10c00', 900),
  },
  {
    name: 'Sectors',
    slug: 'areas',
    href: '/category/travel-places',
    cta: 'Explore Now',
    image: u('photo-1596176530529-78163a4f7af2', 900),
  },
  {
    name: 'Work',
    slug: 'business-work',
    href: '/category/business-work',
    cta: 'Browse Now',
    image: u('photo-1497366811353-6870744d04b2', 900),
  },
];
