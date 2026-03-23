import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Shield } from 'lucide-react';
import { slugToStateName, slugToStateAbbr } from '@/data/states';
import { COUNTIES_BY_STATE } from '@/data/us-counties';
import { countyToSlug } from '@/data/services';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ state: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state: stateSlug } = await params;
  const stateName = slugToStateName(stateSlug);
  if (!stateName) return {};

  return {
    title: `Wildlife Removal in ${stateName}`,
    description: `Find licensed wildlife removal contractors in ${stateName}. Raccoon, squirrel, bat, snake removal and more. Call today for fast, local service.`,
  };
}

export default async function StatePage({ params }: Props) {
  const { state: stateSlug } = await params;
  const stateName = slugToStateName(stateSlug);
  const stateAbbr = slugToStateAbbr(stateSlug);

  if (!stateName || !stateAbbr) notFound();

  const counties = COUNTIES_BY_STATE[stateName] ?? [];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <Shield className="size-6 text-blue-600" />
            <span className="text-lg font-semibold tracking-tight text-gray-900">Wildlife Removal</span>
          </Link>
          <Link href="/login" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
            Sign In
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-16">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{stateName}</span>
        </nav>

        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          Wildlife Removal in {stateName}
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-gray-500 max-w-2xl">
          Find licensed, local wildlife removal contractors in {stateName}. Select your county below to connect with a professional near you.
        </p>

        {/* County grid */}
        <div className="mt-14">
          <h2 className="mb-8 text-xl font-bold text-gray-900">
            Select your county
          </h2>
          {counties.length === 0 ? (
            <p className="text-gray-500">No counties available for this state.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {counties.map((county) => (
                <Link
                  key={county}
                  href={`/${stateSlug}/${countyToSlug(county)}`}
                  className="rounded-xl bg-white px-4 py-3.5 text-sm font-medium text-gray-700 ring-1 ring-gray-100 transition-all duration-200 hover:shadow-md hover:ring-blue-200 hover:text-blue-700"
                >
                  {county}
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-950 pt-16 pb-10 mt-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-2">
              <Shield className="size-5 text-blue-500" />
              <span className="font-semibold text-white">Wildlife Removal</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <Link href="/apply" className="hover:text-gray-300 transition-colors">For Contractors</Link>
              <Link href="/login" className="hover:text-gray-300 transition-colors">Sign In</Link>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-800 pt-8 text-center text-sm text-gray-600">
            &copy; {new Date().getFullYear()} Wildlife Removal Services. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
