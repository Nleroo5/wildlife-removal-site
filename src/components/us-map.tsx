'use client';

import { useState, useMemo } from 'react';
import { geoAlbersUsa, geoPath } from 'd3-geo';
import * as topojson from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import type { Feature, Geometry } from 'geojson';
import topoData from '@/data/us-states-topo.json';

interface StateProperties {
  name: string;
}

interface USMapProps {
  selectedState: string | null;
  onSelectState: (stateName: string | null) => void;
}

// Non-state territories to exclude
const EXCLUDED_IDS = new Set(['60', '66', '69', '72', '78']);

export default function USMap({ selectedState, onSelectState }: USMapProps) {
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  const { features, path } = useMemo(() => {
    const topology = topoData as unknown as Topology<{ states: GeometryCollection<StateProperties> }>;
    const geojson = topojson.feature(topology, topology.objects.states);
    const stateFeatures = (geojson as { type: string; features: Feature<Geometry, StateProperties>[] }).features.filter(
      (f) => !EXCLUDED_IDS.has(f.id as string)
    );

    const projection = geoAlbersUsa().fitSize([960, 600], {
      type: 'FeatureCollection',
      features: stateFeatures,
    });
    const pathGenerator = geoPath().projection(projection);

    return { features: stateFeatures, path: pathGenerator };
  }, []);

  return (
    <svg
      viewBox="0 0 960 600"
      className="w-full h-auto max-w-4xl"
      role="img"
      aria-label="Interactive map of the United States"
    >
      {features.map((feature) => {
        const stateName = feature.properties?.name ?? '';
        const isSelected = selectedState === stateName;
        const isHovered = hoveredState === stateName;
        const d = path(feature) ?? '';

        return (
          <path
            key={feature.id as string}
            d={d}
            fill={
              isSelected
                ? '#2563EB'
                : isHovered
                  ? '#93C5FD'
                  : '#E2E8F0'
            }
            stroke="#fff"
            strokeWidth={1}
            className="cursor-pointer transition-colors duration-150"
            onMouseEnter={() => setHoveredState(stateName)}
            onMouseLeave={() => setHoveredState(null)}
            onClick={() => onSelectState(isSelected ? null : stateName)}
          >
            <title>{stateName}</title>
          </path>
        );
      })}
    </svg>
  );
}
