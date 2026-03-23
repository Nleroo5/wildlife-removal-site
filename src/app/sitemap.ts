import type { MetadataRoute } from 'next';
import { COUNTIES_BY_STATE } from '@/data/us-counties';
import { stateToSlug, STATE_NAME_TO_ABBR } from '@/data/states';
import { countyToSlug, SERVICES } from '@/data/services';

const BASE_URL = 'https://local-lead-portal.vercel.app';

// States we include (skip non-US territories)
const SKIP_STATES = new Set([
  'Federated States of Micronesia',
  'Marshall Islands',
  'Palau',
  'American Samoa',
  'Guam',
  'Northern Mariana Islands',
  'U.S. Virgin Islands',
]);

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  // Home page
  entries.push({
    url: BASE_URL,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 1,
  });

  // Static pages
  entries.push({
    url: `${BASE_URL}/apply`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.5,
  });

  entries.push({
    url: `${BASE_URL}/login`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.3,
  });

  // State pages
  for (const stateName of Object.keys(COUNTIES_BY_STATE)) {
    if (SKIP_STATES.has(stateName)) continue;
    if (!STATE_NAME_TO_ABBR[stateName]) continue;

    const stateSlug = stateToSlug(stateName);

    entries.push({
      url: `${BASE_URL}/${stateSlug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    });

    // County pages
    const counties = COUNTIES_BY_STATE[stateName] ?? [];
    for (const county of counties) {
      const cSlug = countyToSlug(county);

      entries.push({
        url: `${BASE_URL}/${stateSlug}/${cSlug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      });

      // Service pages per county
      for (const service of SERVICES) {
        entries.push({
          url: `${BASE_URL}/${stateSlug}/${cSlug}/${service.slug}`,
          lastModified: new Date(),
          changeFrequency: 'monthly',
          priority: 0.6,
        });
      }
    }
  }

  return entries;
}
