"use client";
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader, PolygonF, MarkerF } from '@react-google-maps/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useValuationRates } from '../../hooks/useValuationRates';
import wardBoundaries from '../../data/delhiWardBoundaries.json';

const GOOGLE_MAPS_API_KEY = (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) ? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY : '';
const defaultCenter = { lat: 22.0, lng: 78.0 };
const MOBILE_MAX = 860;

// Quantile buckets rather than a linear scale: the real data spans ~₹2,500 to
// ~₹7.7 lakh per sq m, so a linear ramp would paint nearly everything one shade.
const BUCKET_COLORS = ['#ccfbf1', '#5eead4', '#14b8a6', '#0f766e', '#134e4a'];

const wardByName = new Map(wardBoundaries.map((w) => [w.ward, w]));

function sortedHistory(area) {
  return [...(area.history || [])].sort((a, b) => a.year - b.year);
}
function latestRate(area) {
  const h = sortedHistory(area);
  return h[h.length - 1];
}
function rateDelta(area) {
  const h = sortedHistory(area);
  if (h.length < 2 || !h[0].rate) return null;
  return { pct: ((h[h.length - 1].rate - h[0].rate) / h[0].rate) * 100, fromYear: h[0].year };
}
function compactINR(n) {
  const v = Number(n) || 0;
  if (v >= 1e7) return `₹${(v / 1e7).toFixed(2).replace(/\.?0+$/, '')} Cr`;
  if (v >= 1e5) return `₹${(v / 1e5).toFixed(2).replace(/\.?0+$/, '')} L`;
  return `₹${Math.round(v).toLocaleString('en-IN')}`;
}
function unitLabel(unit) {
  return unit === 'per_sq_ft' ? '/sq ft' : '/sq m';
}
function deltaClass(pct) {
  if (pct > 0.5) return 'pt-up';
  if (pct < -0.5) return 'pt-down';
  return 'pt-flat';
}
function formatPct(pct) {
  return `${pct > 0 ? '+' : ''}${pct.toFixed(Math.abs(pct) >= 100 ? 0 : 1)}%`;
}
function buildBreaks(values) {
  const s = [...values].sort((a, b) => a - b);
  return BUCKET_COLORS.slice(1).map((_, i) => s[Math.floor((s.length - 1) * ((i + 1) / BUCKET_COLORS.length))]);
}

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
);

export default function PriceTrendsIsland() {
  const { isLoaded } = useJsApiLoader({ id: 'google-map-script', googleMapsApiKey: GOOGLE_MAPS_API_KEY });
  const { rates, loading } = useValuationRates();
  const [query, setQuery] = useState('');
  const [stateFilter, setStateFilter] = useState('All');
  const [sortBy, setSortBy] = useState('rate-desc');
  const [selected, setSelected] = useState(null); // { areas, label }
  const [selectedAreaId, setSelectedAreaId] = useState(null);
  const [map, setMap] = useState(null);
  const panelRef = useRef(null);
  // On phones the list sits below the map in page flow, so rendering every
  // area makes an endless page. Desktop scrolls the panel internally instead.
  const isNarrow = useMemo(() => typeof window !== 'undefined' && window.innerWidth <= MOBILE_MAX, []);
  const MOBILE_PAGE = 20;
  const [visibleCount, setVisibleCount] = useState(MOBILE_PAGE);
  useEffect(() => { setVisibleCount(MOBILE_PAGE); }, [query, stateFilter, sortBy]);

  // On phones the map sits in normal page flow, so 'greedy' would trap
  // one-finger scrolling; 'cooperative' lets the page scroll past it.
  const mapOptions = useMemo(() => ({
    mapTypeId: 'roadmap',
    streetViewControl: false,
    fullscreenControl: true,
    clickableIcons: false,
    gestureHandling: typeof window !== 'undefined' && window.innerWidth <= MOBILE_MAX ? 'cooperative' : 'greedy',
  }), []);

  const withCoords = useMemo(() => rates.filter((r) => typeof r.lat === 'number' && typeof r.lng === 'number' && r.history?.length), [rates]);

  const stateCounts = useMemo(() => {
    const m = new Map();
    withCoords.forEach((a) => m.set(a.state, (m.get(a.state) || 0) + 1));
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [withCoords]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return withCoords.filter((a) => (stateFilter === 'All' || a.state === stateFilter)
      && (!q || `${a.area} ${a.city} ${a.state}`.toLowerCase().includes(q)));
  }, [withCoords, stateFilter, query]);

  const sorted = useMemo(() => {
    const out = [...filtered];
    if (sortBy === 'rate-desc') out.sort((a, b) => latestRate(b).rate - latestRate(a).rate);
    else if (sortBy === 'rate-asc') out.sort((a, b) => latestRate(a).rate - latestRate(b).rate);
    else if (sortBy === 'growth-desc') out.sort((a, b) => (rateDelta(b)?.pct ?? -Infinity) - (rateDelta(a)?.pct ?? -Infinity));
    else out.sort((a, b) => String(a.area).localeCompare(String(b.area)));
    return out;
  }, [filtered, sortBy]);

  // Areas inside a real MCD ward polygon are drawn as that ward's shape;
  // everything else is a dot — no state publishes valuation-zone boundaries.
  const { wardGroups, markers } = useMemo(() => {
    const byWard = new Map();
    const markerAreas = [];
    for (const area of filtered) {
      if (area.ward && wardByName.has(area.ward)) {
        if (!byWard.has(area.ward)) byWard.set(area.ward, []);
        byWard.get(area.ward).push(area);
      } else {
        markerAreas.push(area);
      }
    }
    return { wardGroups: [...byWard.entries()], markers: markerAreas };
  }, [filtered]);

  const breaks = useMemo(() => (withCoords.length ? buildBreaks(withCoords.map((a) => latestRate(a).rate)) : []), [withCoords]);
  const colorFor = (v) => {
    const idx = breaks.findIndex((b) => v <= b);
    return BUCKET_COLORS[idx === -1 ? BUCKET_COLORS.length - 1 : idx];
  };
  const legendBreaks = useMemo(() => {
    if (!withCoords.length) return [];
    const min = Math.min(...withCoords.map((a) => latestRate(a).rate));
    const edges = [min, ...breaks];
    return BUCKET_COLORS.map((color, i) => ({ color, from: edges[i], to: edges[i + 1] }));
  }, [withCoords, breaks]);

  // Fit to whatever region is in view on first load and on state change —
  // not on every search keystroke, which would make the map jump around.
  useEffect(() => {
    if (!map || !window.google) return;
    const pts = withCoords.filter((a) => stateFilter === 'All' || a.state === stateFilter);
    if (!pts.length) return;
    const bounds = new window.google.maps.LatLngBounds();
    pts.forEach((a) => bounds.extend({ lat: a.lat, lng: a.lng }));
    map.fitBounds(bounds, 48);
  }, [map, stateFilter, withCoords.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const revealPanel = () => {
    if (typeof window !== 'undefined' && window.innerWidth <= MOBILE_MAX) {
      setTimeout(() => panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
    }
  };
  const openGroup = (areas, label) => {
    setSelected({ areas, label });
    setSelectedAreaId(areas[0].id);
    revealPanel();
  };
  const focusArea = (area) => {
    setSelected({ areas: [area], label: area.area });
    setSelectedAreaId(area.id);
    if (map) {
      map.panTo({ lat: area.lat, lng: area.lng });
      if ((map.getZoom() || 0) < 13) map.setZoom(13);
    }
    revealPanel();
  };
  const clearSelection = () => { setSelected(null); setSelectedAreaId(null); };
  const changeState = (s) => { setStateFilter(s); clearSelection(); };

  if (!isLoaded || loading) {
    return (
      <div className="pt-shell pt-shell-center">
        <div className="pt-spinner" />
        <p>Loading map…</p>
      </div>
    );
  }

  if (withCoords.length === 0) {
    return (
      <div className="pt-shell pt-shell-center">
        <p>No price trend data loaded yet. It loads the first time an admin signs in and opens the admin panel — if you're the admin, visit /admin once, then refresh this page.</p>
      </div>
    );
  }

  const selectedArea = selected?.areas.find((a) => a.id === selectedAreaId) || null;
  const selectedHistory = selectedArea ? sortedHistory(selectedArea) : [];
  const selectedLatest = selectedHistory[selectedHistory.length - 1];
  const selectedDelta = selectedArea ? rateDelta(selectedArea) : null;
  const selectedSources = selectedArea ? [...new Set(selectedHistory.map((h) => h.source).filter(Boolean))] : [];
  const chartData = selectedHistory.map((h) => ({ year: String(h.year), rate: h.rate }));

  return (
    <div className="pt-shell">
      <div className="pt-toolbar">
        <label className="pt-search">
          <SearchIcon />
          <input type="search" placeholder="Search area, colony or city" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search areas" />
        </label>
        <div className="pt-chips" role="tablist" aria-label="Filter by state">
          <button type="button" className={`pt-chip ${stateFilter === 'All' ? 'active' : ''}`} onClick={() => changeState('All')}>
            All<span>{withCoords.length}</span>
          </button>
          {stateCounts.map(([s, c]) => (
            <button key={s} type="button" className={`pt-chip ${stateFilter === s ? 'active' : ''}`} onClick={() => changeState(s)}>
              {s}<span>{c}</span>
            </button>
          ))}
        </div>
        <div className="pt-summary">{filtered.length} areas · {stateCounts.length} {stateCounts.length === 1 ? 'state' : 'states'}</div>
      </div>

      <div className="pt-body">
        <div className="pt-map">
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={defaultCenter}
            zoom={5}
            onLoad={setMap}
            onUnmount={() => setMap(null)}
            options={mapOptions}
          >
            {wardGroups.map(([wardName, areas]) => {
              const avg = areas.reduce((sum, a) => sum + latestRate(a).rate, 0) / areas.length;
              const isActive = selectedArea?.ward === wardName;
              return (
                <PolygonF
                  key={wardName}
                  paths={wardByName.get(wardName).boundary}
                  options={{
                    fillColor: colorFor(avg),
                    fillOpacity: isActive ? 0.85 : 0.6,
                    strokeColor: isActive ? '#f59e0b' : '#134e4a',
                    strokeOpacity: 0.9,
                    strokeWeight: isActive ? 3 : 1,
                    zIndex: isActive ? 2 : 1,
                  }}
                  onClick={() => openGroup(areas, wardName)}
                />
              );
            })}
            {markers.map((area) => {
              const isActive = area.id === selectedAreaId;
              return (
                <MarkerF
                  key={area.id}
                  position={{ lat: area.lat, lng: area.lng }}
                  title={`${area.area} — ${compactINR(latestRate(area).rate)}${unitLabel(area.unit)}`}
                  zIndex={isActive ? 10 : 1}
                  icon={{
                    path: window.google.maps.SymbolPath.CIRCLE,
                    fillColor: colorFor(latestRate(area).rate),
                    fillOpacity: 0.95,
                    strokeColor: isActive ? '#f59e0b' : '#134e4a',
                    strokeWeight: isActive ? 3 : 1.5,
                    scale: isActive ? 11 : 7,
                  }}
                  onClick={() => openGroup([area], area.area)}
                />
              );
            })}
          </GoogleMap>

          <div className="pt-legend">
            <div className="pt-legend-title">Latest rate (₹/sq m)</div>
            {legendBreaks.map((b, i) => (
              <div key={b.color} className="pt-legend-row">
                <span className="pt-swatch" style={{ background: b.color }} />
                <span>{compactINR(b.from)}{i < legendBreaks.length - 1 ? ` – ${compactINR(b.to)}` : '+'}</span>
              </div>
            ))}
            <div className="pt-legend-kinds">
              <span><i className="pt-kind-zone" /> Ward boundary</span>
              <span><i className="pt-swatch" style={{ background: BUCKET_COLORS[2] }} /> Area</span>
            </div>
          </div>

          {/* Phones: the full legend would cover a third of the map, so show
              the same scale as one slim bar instead. */}
          {legendBreaks.length > 0 && (
            <div className="pt-legend-compact" aria-label="Rate colour scale">
              <span>{compactINR(legendBreaks[0].from)}</span>
              <span className="pt-legend-bar">
                {legendBreaks.map((b) => <i key={b.color} style={{ background: b.color }} />)}
              </span>
              <span>{compactINR(legendBreaks[legendBreaks.length - 1].from)}+</span>
            </div>
          )}
        </div>

        <aside className="pt-panel" ref={panelRef}>
          <div className="pt-panel-scroll">
            {selectedArea ? (
              <div className="pt-detail">
                <button type="button" className="pt-back" onClick={clearSelection}>← All areas</button>

                {selected.areas.length > 1 && (
                  <div className="pt-ward">
                    <div className="pt-ward-label">Ward {selected.label} · {selected.areas.length} areas</div>
                    <div className="pt-ward-chips">
                      {selected.areas.map((a) => (
                        <button key={a.id} type="button" className={`pt-chip ${a.id === selectedAreaId ? 'active' : ''}`} onClick={() => setSelectedAreaId(a.id)}>
                          {a.area}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <h2>{selectedArea.area}</h2>
                <div className="pt-detail-loc">
                  {selectedArea.city}, {selectedArea.state}
                  {selectedArea.category ? ` · Category ${selectedArea.category}` : ''}
                  {selectedArea.ward ? ` · Ward ${selectedArea.ward}` : ''}
                </div>

                <div className="pt-kpis">
                  <div className="pt-kpi">
                    <label>Current rate ({selectedLatest.year})</label>
                    <strong>{compactINR(selectedLatest.rate)}</strong>
                    <small>{unitLabel(selectedArea.unit)} · {Number(selectedLatest.rate).toLocaleString('en-IN')}</small>
                  </div>
                  <div className="pt-kpi">
                    <label>Change</label>
                    {selectedDelta ? (
                      <>
                        <strong className={deltaClass(selectedDelta.pct)}>{formatPct(selectedDelta.pct)}</strong>
                        <small>since {selectedDelta.fromYear}</small>
                      </>
                    ) : (
                      <>
                        <strong className="pt-flat">—</strong>
                        <small>one revision on record</small>
                      </>
                    )}
                  </div>
                </div>

                {chartData.length > 1 ? (
                  <>
                    <div className="pt-chart">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="ptFill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.35} />
                              <stop offset="100%" stopColor="#14b8a6" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                          <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={60} tickFormatter={compactINR} />
                          <Tooltip formatter={(v) => [`${compactINR(v)}${unitLabel(selectedArea.unit)}`, 'Rate']} />
                          <Area type="stepAfter" dataKey="rate" stroke="#0f766e" strokeWidth={2} fill="url(#ptFill)" dot={{ r: 3, fill: '#0f766e' }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="pt-muted">Stepped line: government rates stay fixed between notifications and change at each revision — this is the real shape of the data, not a smoothed estimate.</p>
                  </>
                ) : (
                  <p className="pt-muted">Only one published rate is on record for this area so far. A trend line will appear once a later revision is added.</p>
                )}

                <div className="pt-section-title">Rate history</div>
                {[...selectedHistory].reverse().map((h) => (
                  <div key={h.year} className="pt-history-row">
                    <span>{h.year}</span>
                    <strong>₹{Number(h.rate).toLocaleString('en-IN')}{unitLabel(selectedArea.unit)}</strong>
                  </div>
                ))}

                {selectedArea.notes && (
                  <>
                    <div className="pt-section-title">Notes</div>
                    <p className="pt-note">{selectedArea.notes}</p>
                  </>
                )}

                {selectedSources.length > 0 && (
                  <div className="pt-sources">
                    <div className="pt-section-title">Source{selectedSources.length > 1 ? 's' : ''}</div>
                    {selectedSources.map((src) => (
                      <a key={src} href={src} target="_blank" rel="noopener noreferrer">{src} ↗</a>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="pt-list-head">
                  <strong>{sorted.length} {sorted.length === 1 ? 'area' : 'areas'}</strong>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="Sort areas">
                    <option value="rate-desc">Highest rate</option>
                    <option value="rate-asc">Lowest rate</option>
                    <option value="growth-desc">Biggest increase</option>
                    <option value="name">A–Z</option>
                  </select>
                </div>
                {sorted.length === 0 ? (
                  <p className="pt-empty">No areas match “{query}”.</p>
                ) : (isNarrow ? sorted.slice(0, visibleCount) : sorted).map((a) => {
                  const latest = latestRate(a);
                  const d = rateDelta(a);
                  return (
                    <button key={a.id} type="button" className="pt-row" onClick={() => focusArea(a)}>
                      <span className="pt-swatch" style={{ background: colorFor(latest.rate) }} />
                      <span className="pt-row-main">
                        <span className="pt-row-name" style={{ display: 'block' }}>{a.area}</span>
                        <span className="pt-row-sub" style={{ display: 'block' }}>
                          {a.city}, {a.state}{a.category ? ` · Cat ${a.category}` : ''}
                        </span>
                      </span>
                      <span className="pt-row-rate">
                        <strong>{compactINR(latest.rate)}<small>{unitLabel(a.unit)}</small></strong>
                        {d ? <span className={`pt-delta ${deltaClass(d.pct)}`}>{formatPct(d.pct)} since {d.fromYear}</span> : <small>{latest.year}</small>}
                      </span>
                    </button>
                  );
                })}
                {isNarrow && sorted.length > visibleCount && (
                  <button type="button" className="pt-more" onClick={() => setVisibleCount((c) => c + MOBILE_PAGE)}>
                    Show more ({sorted.length - visibleCount} remaining)
                  </button>
                )}
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
