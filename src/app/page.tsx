'use client';

import { useState, useMemo } from 'react';
import { Shield, MapPin, ChevronRight, Search, CheckCircle, Clock, Phone, ArrowRight } from 'lucide-react';
import dynamic from 'next/dynamic';
import { ScrollReveal } from '@/components/scroll-reveal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { COUNTIES_BY_STATE } from '@/data/us-counties';
import { stateToSlug } from '@/data/states';
import { countyToSlug, SERVICES } from '@/data/services';

const USMap = dynamic(() => import('@/components/us-map'), { ssr: false });

const ALL_LOCATIONS: { state: string; county: string }[] = [];
for (const [state, counties] of Object.entries(COUNTIES_BY_STATE)) {
  if (['Federated States of Micronesia', 'Marshall Islands', 'Palau', 'American Samoa', 'Guam', 'Northern Mariana Islands', 'U.S. Virgin Islands'].includes(state)) continue;
  for (const county of counties) {
    ALL_LOCATIONS.push({ state, county });
  }
}

export default function HomePage() {
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedCounty, setSelectedCounty] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const counties = selectedState ? COUNTIES_BY_STATE[selectedState] ?? [] : [];

  const handleStateSelect = (stateName: string | null) => {
    setSelectedState(stateName);
    setSelectedCounty(null);
  };

  const handleGetStarted = () => {
    if (selectedState && selectedCounty) {
      window.location.href = `/${stateToSlug(selectedState)}/${countyToSlug(selectedCounty)}`;
    }
  };

  const handleSearchSelect = (state: string, county: string) => {
    window.location.href = `/${stateToSlug(state)}/${countyToSlug(county)}`;
  };

  const searchResults = useMemo(() => {
    if (searchQuery.length < 2) return [];
    const q = searchQuery.toLowerCase();
    return ALL_LOCATIONS.filter(
      (loc) =>
        loc.county.toLowerCase().includes(q) ||
        loc.state.toLowerCase().includes(q) ||
        `${loc.county}, ${loc.state}`.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <Shield className="size-7 text-blue-600" />
            <span className="text-lg font-semibold tracking-tight text-gray-900">Wildlife Removal</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="/apply" className="hidden sm:inline text-sm text-gray-500 hover:text-gray-900 transition-colors">
              For Contractors
            </a>
            <a href="/login" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              Sign In
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Gradient mesh background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-blue-100/60 blur-[120px]" />
          <div className="absolute top-[10%] right-[-5%] h-[400px] w-[400px] rounded-full bg-indigo-100/40 blur-[100px]" />
          <div className="absolute bottom-[-10%] left-[30%] h-[300px] w-[300px] rounded-full bg-cyan-100/30 blur-[80px]" />
        </div>

        <div className="mx-auto max-w-6xl px-6 pt-24 pb-20 text-center">
          <h1 className="mx-auto max-w-3xl text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
            Wildlife removal,{' '}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              done right
            </span>
          </h1>
          <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-gray-500">
            Connect with licensed, local professionals who respond fast and use humane methods. Find your expert in seconds.
          </p>

          {/* Search bar */}
          <div className="relative mx-auto mt-12 max-w-lg">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by county..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                className="h-16 w-full rounded-2xl border-gray-200 bg-white pl-14 pr-6 text-lg text-gray-900 shadow-lg shadow-gray-200/50 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-shadow"
              />
            </div>

            {searchFocused && searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-2xl bg-white shadow-xl shadow-gray-200/50 ring-1 ring-gray-100 overflow-hidden">
                {searchResults.map((loc) => (
                  <button
                    key={`${loc.state}-${loc.county}`}
                    type="button"
                    className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                    onMouseDown={() => handleSearchSelect(loc.state, loc.county)}
                  >
                    <MapPin className="size-4 shrink-0 text-gray-400" />
                    <span className="text-sm">
                      <span className="font-medium text-gray-900">{loc.county}</span>
                      <span className="text-gray-500">, {loc.state}</span>
                    </span>
                    <ArrowRight className="ml-auto size-4 text-gray-300" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <p className="mt-5 text-sm text-gray-400">
            Or select your location on the map below
          </p>
        </div>
      </section>

      {/* Map + Selection */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="flex flex-col items-center gap-10">
          <div className="w-full max-w-4xl">
            <USMap selectedState={selectedState} onSelectState={handleStateSelect} />
          </div>

          <div className="w-full max-w-md space-y-5">
            {selectedState ? (
              <div className="flex items-center justify-center gap-2 text-lg">
                <MapPin className="size-5 text-blue-600" />
                <span className="font-semibold text-gray-900">{selectedState}</span>
                <button
                  onClick={() => handleStateSelect(null)}
                  className="ml-2 text-sm text-gray-400 hover:text-gray-700 transition-colors"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="text-center">
                <p className="mb-4 text-sm font-medium text-gray-500">
                  Click a state on the map or select below
                </p>
                <Select value={selectedState ?? ''} onValueChange={(val) => handleStateSelect(val || null)}>
                  <SelectTrigger className="w-full h-12 rounded-xl text-gray-900">
                    <SelectValue placeholder="Select a state..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(COUNTIES_BY_STATE).sort().map((state) => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedState && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 text-center">
                  Select your county
                </label>
                <Select value={selectedCounty ?? ''} onValueChange={(val) => setSelectedCounty(val || null)}>
                  <SelectTrigger className="w-full h-12 rounded-xl text-gray-900">
                    <SelectValue placeholder="Choose a county..." />
                  </SelectTrigger>
                  <SelectContent>
                    {counties.map((county) => (
                      <SelectItem key={county} value={county}>{county}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedState && selectedCounty && (
              <Button
                className="w-full h-14 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-base font-semibold shadow-lg shadow-blue-600/25 transition-all hover:shadow-xl hover:shadow-blue-600/30"
                onClick={handleGetStarted}
              >
                Find Wildlife Removal Services
                <ChevronRight className="ml-1 size-5" />
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* How It Works — Dark section, Apple style */}
      <section className="bg-gray-950 py-32 overflow-hidden">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-24">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">How it works</p>
            <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Three steps to a<br />wildlife-free home.
            </h2>
          </div>

          {/* Step 1 */}
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20 py-16 border-t border-gray-800/50">
            <div className="lg:w-1/2 space-y-5">
              <span className="text-6xl font-extrabold text-gray-800">01</span>
              <h3 className="text-3xl font-bold text-white">Select your location</h3>
              <p className="text-lg leading-relaxed text-gray-400 max-w-md">
                Use the interactive map or search by county. We&apos;ll instantly match you with the licensed contractor serving your area.
              </p>
            </div>
            <div className="lg:w-1/2 flex justify-center">
              <ScrollReveal className="w-full max-w-sm">
                <div className="glow bg-white/20" />
                <div className="card-content relative aspect-square rounded-3xl bg-gradient-to-br from-blue-600/20 to-indigo-600/10 flex items-center justify-center">
                  <MapPin className="size-20 text-blue-500/60" />
                  <div className="absolute inset-0 rounded-3xl ring-1 ring-white/5" />
                </div>
              </ScrollReveal>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-20 py-16 border-t border-gray-800/50">
            <div className="lg:w-1/2 space-y-5">
              <span className="text-6xl font-extrabold text-gray-800">02</span>
              <h3 className="text-3xl font-bold text-white">Call the expert</h3>
              <p className="text-lg leading-relaxed text-gray-400 max-w-md">
                Tap the number on the page. Your call goes directly to a licensed, insured professional — no middleman, no waiting.
              </p>
            </div>
            <div className="lg:w-1/2 flex justify-center">
              <ScrollReveal className="w-full max-w-sm">
                <div className="glow bg-white/20" />
                <div className="card-content relative aspect-square rounded-3xl bg-gradient-to-br from-green-600/20 to-emerald-600/10 flex items-center justify-center">
                  <Phone className="size-20 text-green-500/60" />
                  <div className="absolute inset-0 rounded-3xl ring-1 ring-white/5" />
                </div>
              </ScrollReveal>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20 py-16 border-t border-gray-800/50">
            <div className="lg:w-1/2 space-y-5">
              <span className="text-6xl font-extrabold text-gray-800">03</span>
              <h3 className="text-3xl font-bold text-white">Problem solved</h3>
              <p className="text-lg leading-relaxed text-gray-400 max-w-md">
                Your contractor responds fast with humane, professional wildlife removal. Most issues resolved in a single visit.
              </p>
            </div>
            <div className="lg:w-1/2 flex justify-center">
              <ScrollReveal className="w-full max-w-sm">
                <div className="glow bg-white/20" />
                <div className="card-content relative aspect-square rounded-3xl bg-gradient-to-br from-emerald-600/20 to-teal-600/10 flex items-center justify-center">
                  <CheckCircle className="size-20 text-emerald-500/60" />
                  <div className="absolute inset-0 rounded-3xl ring-1 ring-white/5" />
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* Services We Cover */}
      <section className="bg-gray-50 py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Services we cover
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-gray-500">
              Our contractors handle every type of nuisance wildlife situation.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((service) => (
              <div
                key={service.slug}
                className="group rounded-2xl bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
              >
                <h3 className="text-base font-semibold text-gray-900">{service.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  {service.shortDescription}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust signals */}
      <section className="py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Why homeowners trust us
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Shield, color: 'text-blue-600', title: 'Licensed & Insured', desc: 'Every contractor is vetted and carries full liability insurance.' },
              { icon: MapPin, color: 'text-blue-600', title: 'Local Experts', desc: 'Contractors serve specific counties so you get someone who knows your area.' },
              { icon: Clock, color: 'text-blue-600', title: 'Fast Response', desc: 'Most contractors respond within 24 hours with same-day availability.' },
              { icon: CheckCircle, color: 'text-blue-600', title: 'Humane Methods', desc: 'All removal follows state regulations with humane trapping and exclusion.' },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <item.icon className={`mx-auto size-8 ${item.color}`} />
                <h3 className="mt-5 text-base font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-500">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner — Full bleed */}
      <section className="bg-blue-600 py-24">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Wildlife problem? Get help now.
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-lg leading-relaxed text-blue-100">
            Find your local wildlife removal expert in seconds. Licensed professionals ready to help.
          </p>
          <Button
            className="mt-10 h-14 rounded-xl bg-white text-blue-600 hover:bg-blue-50 text-base font-bold px-10 shadow-lg shadow-blue-700/25 transition-all"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            Find Your Local Expert
            <ArrowRight className="ml-2 size-5" />
          </Button>
        </div>
      </section>

      {/* Contractor CTA */}
      <section className="py-32">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
            Are you a wildlife removal professional?
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-lg leading-relaxed text-gray-500">
            Join our network and receive exclusive leads in your service area. No upfront costs — pay only for qualified calls.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <a
              href="/apply"
              className="inline-flex h-12 items-center rounded-xl bg-gray-900 px-8 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
            >
              Apply Now
            </a>
            <a
              href="/login"
              className="inline-flex h-12 items-center rounded-xl border border-gray-200 bg-white px-8 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Contractor Login
            </a>
          </div>
        </div>
      </section>

      {/* Footer — Multi-column */}
      <footer className="bg-gray-950 pt-20 pb-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {/* Brand */}
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2">
                <Shield className="size-5 text-blue-500" />
                <span className="font-semibold text-white">Wildlife Removal</span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-gray-500">
                Connecting homeowners with licensed, local wildlife removal professionals.
              </p>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Services</h4>
              <ul className="mt-4 space-y-3">
                {SERVICES.slice(0, 6).map((s) => (
                  <li key={s.slug}>
                    <span className="text-sm text-gray-500 hover:text-gray-300 transition-colors cursor-default">
                      {s.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Locations */}
            <div>
              <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Popular States</h4>
              <ul className="mt-4 space-y-3">
                {['Georgia', 'Florida', 'Texas', 'California', 'New York', 'Ohio'].map((s) => (
                  <li key={s}>
                    <a href={`/${stateToSlug(s)}`} className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                      {s}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Company</h4>
              <ul className="mt-4 space-y-3">
                <li><a href="/apply" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">Become a Contractor</a></li>
                <li><a href="/login" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">Contractor Login</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-16 border-t border-gray-800 pt-8 text-center text-sm text-gray-600">
            &copy; {new Date().getFullYear()} Wildlife Removal Services. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
