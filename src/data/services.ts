/**
 * Service definitions for the consumer-facing directory.
 * Each service has a slug (URL-safe), display name, and SEO description.
 * These match the services in the contractor_services table.
 */

export interface ServiceInfo {
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
}

export const SERVICES: ServiceInfo[] = [
  {
    slug: 'raccoon-removal',
    name: 'Raccoon Removal',
    shortDescription: 'Professional raccoon trapping and removal services.',
    description:
      'Raccoons can cause significant damage to attics, roofs, and insulation. Our licensed contractors provide humane raccoon trapping, removal, and exclusion services to protect your home and family.',
  },
  {
    slug: 'squirrel-removal',
    name: 'Squirrel Removal',
    shortDescription: 'Expert squirrel removal and attic exclusion.',
    description:
      'Squirrels chew through wiring, insulation, and wood framing. Our contractors specialize in safe squirrel removal from attics, soffits, and crawlspaces with long-term exclusion solutions.',
  },
  {
    slug: 'bat-removal-exclusion',
    name: 'Bat Removal / Exclusion',
    shortDescription: 'Humane bat exclusion and colony removal.',
    description:
      'Bat infestations require specialized exclusion techniques to comply with wildlife protection laws. Our contractors perform legal, humane bat exclusion and guano cleanup services.',
  },
  {
    slug: 'snake-removal',
    name: 'Snake Removal',
    shortDescription: 'Safe snake identification, removal, and prevention.',
    description:
      'Whether venomous or non-venomous, snakes in or around your home need professional handling. Our contractors safely identify, remove, and seal entry points to prevent future encounters.',
  },
  {
    slug: 'rat-mouse-removal',
    name: 'Rat / Mouse Removal',
    shortDescription: 'Complete rodent control and exclusion services.',
    description:
      'Rats and mice contaminate food, spread disease, and damage structures. Our contractors provide thorough rodent trapping, removal, sanitation, and entry point sealing.',
  },
  {
    slug: 'opossum-removal',
    name: 'Opossum Removal',
    shortDescription: 'Professional opossum trapping and relocation.',
    description:
      'Opossums under decks, in crawlspaces, or in attics can create unsanitary conditions. Our contractors humanely trap and relocate opossums and seal entry points.',
  },
  {
    slug: 'skunk-removal',
    name: 'Skunk Removal',
    shortDescription: 'Skunk trapping, removal, and odor remediation.',
    description:
      'Skunks nesting under structures pose spray risks and can carry rabies. Our contractors safely trap and remove skunks and address lingering odor issues.',
  },
  {
    slug: 'dead-animal-removal',
    name: 'Dead Animal Removal',
    shortDescription: 'Dead animal removal and odor elimination.',
    description:
      'Dead animals in walls, attics, or crawlspaces cause severe odor and health hazards. Our contractors locate, remove, and deodorize affected areas.',
  },
  {
    slug: 'animal-trapping',
    name: 'Animal Trapping',
    shortDescription: 'Humane live trapping for all nuisance wildlife.',
    description:
      'For any nuisance wildlife situation, our contractors use humane live trapping methods that comply with local and state wildlife regulations.',
  },
  {
    slug: 'attic-wildlife-removal',
    name: 'Attic Wildlife Removal',
    shortDescription: 'Complete attic wildlife removal and cleanup.',
    description:
      'Animals in your attic damage insulation, wiring, and structural components. Our contractors remove wildlife, clean contaminated insulation, and seal all entry points.',
  },
  {
    slug: 'crawlspace-wildlife-removal',
    name: 'Crawlspace Wildlife Removal',
    shortDescription: 'Crawlspace animal removal and exclusion.',
    description:
      'Wildlife in crawlspaces damages vapor barriers, ductwork, and wiring. Our contractors remove animals, repair damage, and install exclusion barriers.',
  },
  {
    slug: 'wildlife-exclusion-repairs',
    name: 'Wildlife Exclusion / Repairs',
    shortDescription: 'Permanent wildlife exclusion and damage repair.',
    description:
      'Prevent future wildlife intrusions with professional exclusion work. Our contractors seal entry points, install barriers, and repair wildlife damage to your home.',
  },
  {
    slug: 'attic-restoration-insulation',
    name: 'Attic Restoration / Insulation',
    shortDescription: 'Attic cleanup, insulation replacement, and restoration.',
    description:
      'After wildlife removal, attics often need insulation replacement and sanitization. Our contractors remove contaminated insulation, disinfect, and install new insulation.',
  },
];

/** Map of service slug → ServiceInfo for quick lookup */
export const SERVICE_BY_SLUG: Record<string, ServiceInfo> = Object.fromEntries(
  SERVICES.map((s) => [s.slug, s])
);

/** Map of service display name → slug (for matching contractor_services table values) */
export const SERVICE_NAME_TO_SLUG: Record<string, string> = Object.fromEntries(
  SERVICES.map((s) => [s.name, s.slug])
);

/** Map of service slug → display name */
export const SERVICE_SLUG_TO_NAME: Record<string, string> = Object.fromEntries(
  SERVICES.map((s) => [s.slug, s.name])
);

/** Convert a county name to a URL slug: "Cobb County" → "cobb-county", "Cobb" → "cobb" */
export function countyToSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-');
}

/** Convert a county slug back to display name: "cobb-county" → "Cobb County" */
export function slugToCountyName(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
