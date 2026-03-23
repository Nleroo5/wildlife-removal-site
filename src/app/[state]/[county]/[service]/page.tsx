import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin, Phone, Shield, Clock, CheckCircle } from 'lucide-react';
import { slugToStateName, slugToStateAbbr, stateToSlug } from '@/data/states';
import { slugToCountyName, SERVICE_BY_SLUG, SERVICES, SERVICE_NAME_TO_SLUG } from '@/data/services';
import { COUNTIES_BY_STATE } from '@/data/us-counties';
import { createServerClient } from '@/lib/supabase-server';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ state: string; county: string; service: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state: stateSlug, county: countySlug, service: serviceSlug } = await params;
  const stateName = slugToStateName(stateSlug);
  const countyName = slugToCountyName(countySlug);
  const service = SERVICE_BY_SLUG[serviceSlug];
  if (!stateName || !service) return {};

  return {
    title: `${service.name} in ${countyName}, ${stateName} | Local Lead Portal`,
    description: `Professional ${service.name.toLowerCase()} in ${countyName}, ${stateName}. ${service.shortDescription} Call now for fast, local service.`,
  };
}

export default async function ServicePage({ params }: Props) {
  const { state: stateSlug, county: countySlug, service: serviceSlug } = await params;
  const stateName = slugToStateName(stateSlug);
  const stateAbbr = slugToStateAbbr(stateSlug);
  const countyName = slugToCountyName(countySlug);
  const service = SERVICE_BY_SLUG[serviceSlug];

  if (!stateName || !stateAbbr || !service) notFound();

  // Validate county
  const counties = COUNTIES_BY_STATE[stateName] ?? [];
  const matchedCounty = counties.find(
    (c) => c.toLowerCase().replace(/\s+/g, '-') === countySlug.toLowerCase()
  );
  if (!matchedCounty) notFound();

  // Fetch territory + contractor + phone
  const supabase = await createServerClient();

  const { data: territory } = await supabase
    .from('territories')
    .select('*')
    .eq('state', stateAbbr)
    .ilike('county', matchedCounty)
    .eq('is_active', true)
    .limit(1)
    .single();

  let contractor: { business_name: string; phone: string } | null = null;
  let trackingPhone: string | null = null;
  let offersThisService = false;

  if (territory?.contractor_id) {
    const [
      { data: contractorData },
      { data: phoneData },
      { data: serviceData },
    ] = await Promise.all([
      supabase
        .from('contractors')
        .select('business_name, phone')
        .eq('id', territory.contractor_id)
        .eq('status', 'active')
        .single(),
      supabase
        .from('phone_numbers')
        .select('phone_number')
        .eq('territory_id', territory.id)
        .eq('is_active', true)
        .limit(1)
        .single(),
      supabase
        .from('contractor_services')
        .select('service')
        .eq('contractor_id', territory.contractor_id)
        .eq('service', service.name),
    ]);

    contractor = contractorData;
    trackingPhone = phoneData?.phone_number ?? null;
    offersThisService = (serviceData ?? []).length > 0;
  }

  const displayPhone = trackingPhone ?? contractor?.phone ?? null;

  // Other services for cross-linking
  const otherServices = SERVICES.filter((s) => s.slug !== serviceSlug).slice(0, 6);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <MapPin className="size-7 text-blue-600" />
            <span className="text-xl font-bold text-blue-600">Local Lead Portal</span>
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
          >
            Contractor Login
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-slate-600">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span className="mx-2">/</span>
          <Link href={`/${stateSlug}`} className="hover:text-blue-600">{stateName}</Link>
          <span className="mx-2">/</span>
          <Link href={`/${stateSlug}/${countySlug}`} className="hover:text-blue-600">{matchedCounty}</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900">{service.name}</span>
        </nav>

        {/* Hero */}
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {service.name} in {matchedCounty}, {stateAbbr}
        </h1>
        <p className="mt-3 text-lg text-slate-600 max-w-3xl">
          {service.description}
        </p>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Contractor card */}
            {contractor ? (
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{contractor.business_name}</h2>
                    <p className="mt-1 text-sm text-slate-600">
                      {service.name} in {matchedCounty}, {stateAbbr}
                    </p>
                    {offersThisService && (
                      <span className="mt-2 inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                        Offers {service.name}
                      </span>
                    )}
                  </div>
                  <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                    Verified
                  </span>
                </div>

                {displayPhone && (
                  <a
                    href={`tel:${displayPhone}`}
                    className="mt-6 flex items-center justify-center gap-3 rounded-lg bg-blue-600 px-6 py-4 text-lg font-bold text-white transition-colors hover:bg-blue-700"
                  >
                    <Phone className="size-6" />
                    Call Now: {displayPhone}
                  </a>
                )}

                <div className="mt-6 grid grid-cols-3 gap-4 border-t border-slate-100 pt-6">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Shield className="size-4 text-green-600" />
                    Licensed &amp; Insured
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Clock className="size-4 text-blue-600" />
                    Fast Response
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle className="size-4 text-green-600" />
                    Humane Methods
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-8 text-center">
                <MapPin className="mx-auto size-12 text-yellow-500" />
                <h2 className="mt-4 text-xl font-bold text-slate-900">
                  {service.name} Coming Soon to {matchedCounty}
                </h2>
                <p className="mt-2 text-slate-600">
                  We&apos;re currently looking for a licensed {service.name.toLowerCase()} professional to serve {matchedCounty} County.
                </p>
                <p className="mt-4 text-sm text-slate-600">
                  Are you a wildlife removal professional?{' '}
                  <Link href="/apply" className="text-blue-600 font-medium hover:underline">
                    Apply to serve this area
                  </Link>
                </p>
              </div>
            )}

            {/* Service detail */}
            <div className="rounded-xl border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-900">
                About {service.name}
              </h2>
              <p className="mt-3 text-slate-600 leading-relaxed">
                {service.description}
              </p>
              <p className="mt-4 text-slate-600 leading-relaxed">
                If you&apos;re experiencing wildlife issues in {matchedCounty}, {stateName}, don&apos;t wait. The longer wildlife stays in your home, the more damage they cause. Our local contractors respond quickly and use proven methods to resolve your wildlife problem permanently.
              </p>
            </div>

            {/* Other services */}
            <div>
              <h2 className="mb-4 text-xl font-semibold text-slate-900">
                Other Services in {matchedCounty}
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {otherServices.map((s) => (
                  <Link
                    key={s.slug}
                    href={`/${stateSlug}/${countySlug}/${s.slug}`}
                    className="rounded-lg border border-slate-200 p-4 transition-colors hover:border-blue-300 hover:bg-blue-50"
                  >
                    <h3 className="font-medium text-slate-900">{s.name}</h3>
                    <p className="mt-1 text-sm text-slate-600">{s.shortDescription}</p>
                  </Link>
                ))}
              </div>
              <Link
                href={`/${stateSlug}/${countySlug}`}
                className="mt-4 inline-block text-sm font-medium text-blue-600 hover:underline"
              >
                View all services in {matchedCounty} →
              </Link>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {contractor && displayPhone && (
              <div className="sticky top-6 rounded-xl border border-blue-200 bg-blue-50 p-6">
                <h3 className="text-lg font-bold text-slate-900">Need {service.name}?</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Call our local {matchedCounty} experts for immediate help.
                </p>
                <a
                  href={`tel:${displayPhone}`}
                  className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-base font-bold text-white transition-colors hover:bg-blue-700"
                >
                  <Phone className="size-5" />
                  {displayPhone}
                </a>
              </div>
            )}

            <div className="rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900">Service Area</h3>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 text-slate-400" />
                  {matchedCounty}, {stateAbbr}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900">Other Counties</h3>
              <Link
                href={`/${stateSlug}`}
                className="mt-3 inline-block text-sm font-medium text-blue-600 hover:underline"
              >
                View all {stateName} counties →
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky mobile CTA */}
      {contractor && displayPhone && (
        <div className="fixed bottom-0 left-0 right-0 border-t border-blue-200 bg-blue-600 p-3 lg:hidden">
          <a
            href={`tel:${displayPhone}`}
            className="flex items-center justify-center gap-2 text-lg font-bold text-white"
          >
            <Phone className="size-5" />
            Call Now: {displayPhone}
          </a>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200 bg-slate-50 pb-20 lg:pb-0">
        <div className="mx-auto max-w-6xl px-6 py-8 text-center text-sm text-slate-600">
          <p>&copy; {new Date().getFullYear()} Local Lead Portal. All rights reserved.</p>
          <p className="mt-1">
            Are you a wildlife removal contractor?{' '}
            <Link href="/apply" className="text-blue-600 hover:underline">
              Apply to join our network
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
