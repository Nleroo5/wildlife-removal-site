import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin, Phone, Shield, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import { slugToStateName, slugToStateAbbr } from '@/data/states';
import { slugToCountyName, SERVICES, SERVICE_NAME_TO_SLUG } from '@/data/services';
import { COUNTIES_BY_STATE } from '@/data/us-counties';
import { createServerClient } from '@/lib/supabase-server';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ state: string; county: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state: stateSlug, county: countySlug } = await params;
  const stateName = slugToStateName(stateSlug);
  const countyName = slugToCountyName(countySlug);
  if (!stateName) return {};

  return {
    title: `Wildlife Removal in ${countyName}, ${stateName}`,
    description: `Licensed wildlife removal in ${countyName}, ${stateName}. Raccoon, squirrel, bat, snake removal and more. Call now for fast, professional service.`,
  };
}

export default async function CountyPage({ params }: Props) {
  const { state: stateSlug, county: countySlug } = await params;
  const stateName = slugToStateName(stateSlug);
  const stateAbbr = slugToStateAbbr(stateSlug);

  if (!stateName || !stateAbbr) notFound();

  const counties = COUNTIES_BY_STATE[stateName] ?? [];
  const matchedCounty = counties.find(
    (c) => c.toLowerCase().replace(/\s+/g, '-') === countySlug.toLowerCase()
  );
  if (!matchedCounty) notFound();

  const supabase = await createServerClient();

  const { data: territory } = await supabase
    .from('territories')
    .select('*')
    .eq('state', stateAbbr)
    .ilike('county', matchedCounty)
    .eq('is_active', true)
    .limit(1)
    .single();

  let contractor: { business_name: string; phone: string; logo_url: string | null } | null = null;
  let trackingPhone: string | null = null;
  let contractorServices: string[] = [];

  if (territory?.contractor_id) {
    const [
      { data: contractorData },
      { data: phoneData },
      { data: serviceData },
    ] = await Promise.all([
      supabase.from('contractors').select('business_name, phone, logo_url').eq('id', territory.contractor_id).eq('status', 'active').single(),
      supabase.from('phone_numbers').select('phone_number').eq('territory_id', territory.id).eq('is_active', true).limit(1).single(),
      supabase.from('contractor_services').select('service').eq('contractor_id', territory.contractor_id),
    ]);

    contractor = contractorData;
    trackingPhone = phoneData?.phone_number ?? null;
    contractorServices = (serviceData ?? []).map((s: { service: string }) => s.service);
  }

  const displayPhone = trackingPhone ?? contractor?.phone ?? null;

  const jsonLd = contractor
    ? {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: contractor.business_name,
        description: `Professional wildlife removal services in ${matchedCounty}, ${stateAbbr}`,
        areaServed: { '@type': 'AdministrativeArea', name: `${matchedCounty}, ${stateName}` },
        ...(contractor.logo_url ? { image: contractor.logo_url } : {}),
        ...(displayPhone ? { telephone: displayPhone } : {}),
        address: { '@type': 'PostalAddress', addressRegion: stateAbbr, addressLocality: matchedCounty },
      }
    : null;

  return (
    <div className="min-h-screen bg-white">
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}

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
          <Link href={`/${stateSlug}`} className="hover:text-gray-900 transition-colors">{stateName}</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{matchedCounty}</span>
        </nav>

        {/* Hero */}
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          Wildlife Removal in {matchedCounty}, {stateAbbr}
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-gray-500 max-w-2xl">
          Professional, licensed wildlife removal services in {matchedCounty} County. Fast response times, humane solutions, fully insured.
        </p>

        <div className="mt-14 grid grid-cols-1 gap-12 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Contractor card */}
            {contractor ? (
              <div className="rounded-2xl bg-white p-8 shadow-lg shadow-gray-200/50 ring-1 ring-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    {contractor.logo_url ? (
                      <img
                        src={contractor.logo_url}
                        alt={`${contractor.business_name} logo`}
                        className="size-16 rounded-xl object-contain bg-gray-50 p-1"
                      />
                    ) : (
                      <div className="flex size-16 items-center justify-center rounded-xl bg-green-50 text-xl font-bold text-green-700">
                        {contractor.business_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{contractor.business_name}</h2>
                      <p className="mt-1 text-sm text-gray-500">
                        Serving {matchedCounty}, {stateAbbr}
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 ring-1 ring-green-200">
                    <span className="size-1.5 rounded-full bg-green-500" />
                    Verified
                  </span>
                </div>

                {/* Phone CTA */}
                {displayPhone && (
                  <a
                    href={`tel:${displayPhone}`}
                    className="mt-8 flex items-center justify-center gap-3 rounded-xl bg-green-600 px-6 py-5 text-xl font-bold text-white shadow-lg shadow-green-600/25 transition-all hover:bg-green-700 hover:shadow-xl hover:shadow-green-600/30"
                  >
                    <Phone className="size-6" />
                    Call Now: {displayPhone}
                  </a>
                )}
                <p className="mt-3 text-center text-sm text-gray-400">Free Estimate — No Obligation</p>

                {/* Trust strip */}
                <div className="mt-8 rounded-xl bg-gray-50 p-5">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Shield className="size-4 text-blue-600" />
                      Licensed &amp; Insured
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Clock className="size-4 text-blue-600" />
                      Fast Response
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <CheckCircle className="size-4 text-blue-600" />
                      Humane Methods
                    </div>
                  </div>
                </div>

                {/* Services */}
                {contractorServices.length > 0 && (
                  <div className="mt-8 border-t border-gray-100 pt-8">
                    <h3 className="mb-4 text-sm font-semibold text-gray-900 uppercase tracking-wider">Services Offered</h3>
                    <div className="flex flex-wrap gap-2">
                      {contractorServices.map((service) => {
                        const serviceSlug = SERVICE_NAME_TO_SLUG[service];
                        return serviceSlug ? (
                          <Link
                            key={service}
                            href={`/${stateSlug}/${countySlug}/${serviceSlug}`}
                            className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm text-gray-700 transition-all hover:bg-blue-50 hover:text-blue-700"
                          >
                            {service}
                          </Link>
                        ) : (
                          <span key={service} className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm text-gray-700">
                            {service}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl bg-gray-50 p-12 text-center ring-1 ring-gray-100">
                <MapPin className="mx-auto size-12 text-gray-300" />
                <h2 className="mt-6 text-2xl font-bold text-gray-900">
                  We&apos;re expanding to {matchedCounty}
                </h2>
                <p className="mt-3 text-base text-gray-500">
                  We don&apos;t have a contractor in {matchedCounty} County yet, but we&apos;re growing fast.
                </p>
                <p className="mt-6 text-sm text-gray-500">
                  Are you a wildlife removal professional?{' '}
                  <Link href="/apply" className="text-blue-600 font-semibold hover:underline">
                    Apply to serve this area
                  </Link>
                </p>
              </div>
            )}

            {/* All services */}
            <div>
              <h2 className="mb-6 text-2xl font-bold text-gray-900">
                Wildlife Services in {matchedCounty}
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {SERVICES.map((service) => (
                  <Link
                    key={service.slug}
                    href={`/${stateSlug}/${countySlug}/${service.slug}`}
                    className="group rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                  >
                    <h3 className="font-semibold text-gray-900">{service.name}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-500">{service.shortDescription}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      Learn more <ArrowRight className="size-3.5" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* FAQ */}
            <div>
              <h2 className="mb-6 text-2xl font-bold text-gray-900">
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {[
                  { q: `How quickly can a wildlife removal professional respond in ${matchedCounty}?`, a: 'Most contractors in our network respond within 24 hours, with many offering same-day service for emergencies.' },
                  { q: 'Are the contractors licensed and insured?', a: 'Yes. Every contractor in our network is vetted, licensed, and carries liability insurance.' },
                  { q: 'What does wildlife removal typically cost?', a: 'Costs vary based on the animal, location, and extent of the problem. Most contractors offer free phone consultations and estimates.' },
                  { q: 'Do you use humane removal methods?', a: 'All contractors in our network use humane trapping and exclusion methods that comply with state and local wildlife regulations.' },
                ].map((faq) => (
                  <div key={faq.q} className="rounded-2xl bg-gray-50 p-6 ring-1 ring-gray-100">
                    <h3 className="font-semibold text-gray-900">{faq.q}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-gray-500">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {contractor && displayPhone && (
              <div className="sticky top-24 rounded-2xl bg-white p-8 shadow-lg shadow-gray-200/50 ring-1 ring-gray-100">
                <h3 className="text-lg font-bold text-gray-900">Need help now?</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  Call our local {matchedCounty} wildlife removal experts for immediate assistance.
                </p>
                <a
                  href={`tel:${displayPhone}`}
                  className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-4 text-base font-bold text-white shadow-lg shadow-green-600/25 transition-all hover:bg-green-700 hover:shadow-xl"
                >
                  <Phone className="size-5" />
                  {displayPhone}
                </a>
                <p className="mt-2 text-center text-xs text-gray-400">Free Estimate</p>
              </div>
            )}

            <div className="rounded-2xl bg-white p-6 ring-1 ring-gray-100">
              <h3 className="font-semibold text-gray-900">Service Area</h3>
              <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                <MapPin className="size-4 text-gray-400" />
                {matchedCounty}, {stateAbbr}
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 ring-1 ring-gray-100">
              <h3 className="font-semibold text-gray-900">Other Counties in {stateName}</h3>
              <p className="mt-2 text-sm text-gray-500">Looking for service in a different area?</p>
              <Link href={`/${stateSlug}`} className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline">
                View all counties <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky mobile CTA */}
      {contractor && displayPhone && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-green-600 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.15)] lg:hidden">
          <a
            href={`tel:${displayPhone}`}
            className="flex items-center justify-center gap-2 text-lg font-bold text-white"
          >
            <Phone className="size-5 animate-pulse" />
            Call Now — Free Estimate
          </a>
        </div>
      )}

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
