import { memo, useState, useEffect, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useDashboard } from '../../contexts/DashboardContext';
import { useAllEntities } from '../../hooks/useEntity';
import styles from './OdishaMap.module.css';

// ─── Constants ────────────────────────────────────────────────────────────────
const ODISHA_CENTER = [20.31, 84.14];
const ODISHA_BOUNDS = [
  [17.78, 81.30], // south-west
  [22.60, 87.55], // north-east
];

// Indigo family — districts get one of these tones, chosen stably by name hash
// so the map reads as a single coherent state with subtle colour variation.
const DISTRICT_TONES = [
  { fill: '#5E63A8', glow: 'rgba(94, 99, 168, 0.35)' },
  { fill: '#2F8F9D', glow: 'rgba(47, 143, 157, 0.35)' },
  { fill: '#3D3C80', glow: 'rgba(61, 60, 128, 0.35)' },
  { fill: '#7B7FC4', glow: 'rgba(123, 127, 196, 0.35)' },
];

function toneForName(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return DISTRICT_TONES[h % DISTRICT_TONES.length];
}

// ─── Soft bokeh glow icon ─────────────────────────────────────────────────────
function createGlowIcon(color, id, size = 140) {
  const gradId = `rg-${id}`;
  const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <defs>
      <radialGradient id="${gradId}" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${color}" stop-opacity="0.28"/>
        <stop offset="30%" stop-color="${color}" stop-opacity="0.14"/>
        <stop offset="70%" stop-color="${color}" stop-opacity="0.04"/>
        <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="url(#${gradId})" />
  </svg>`;
  return L.divIcon({
    html: svgStr,
    className: styles.glowIcon,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// ─── Tile opacity controller ─────────────────────────────────────────────────
function TileOpacityController({ level }) {
  const map = useMap();
  useEffect(() => {
    const opacity = level === 'country' ? 0.2 : 0.08;
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) layer.setOpacity(opacity);
    });
  }, [map, level]);
  return null;
}

// ─── Map controller ──────────────────────────────────────────────────────────
function MapController({ bounds, center, zoom, fitOptions }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      const opts = { padding: [40, 40], maxZoom: 10, duration: 0.8, ...fitOptions };
      map.fitBounds(bounds, opts);
    } else if (center && zoom) {
      map.flyTo(center, zoom, { duration: 0.8 });
    }
  }, [map, bounds, center, zoom, fitOptions]);
  return null;
}

// ─── Main component ──────────────────────────────────────────────────────────
function OdishaMap() {
  const { level, selectedIds, drillDown } = useDashboard();
  const [stateGeo, setStateGeo] = useState(null);
  const [districtsGeo, setDistrictsGeo] = useState(null);

  const { data: districtsArr = [] } = useAllEntities('district');
  const DISTRICTS_MAP = useMemo(() => Object.fromEntries(districtsArr.map((d) => [d.id, d])), [districtsArr]);
  const DISTRICT_NAME_TO_ID = useMemo(() => Object.fromEntries(districtsArr.map((d) => [d.name, d.id])), [districtsArr]);

  useEffect(() => {
    fetch('/odisha-state.geojson').then((r) => r.json()).then(setStateGeo).catch(console.error);
    fetch('/odisha-districts.geojson').then((r) => r.json()).then(setDistrictsGeo).catch(console.error);
  }, []);

  const selectedDistrictId = selectedIds.district;
  const selectedDistrict = selectedDistrictId ? DISTRICTS_MAP[selectedDistrictId] : null;

  const selectedDistrictGeo = useMemo(() => {
    if (!districtsGeo || !selectedDistrict) return null;
    const feat = districtsGeo.features.find((f) => f.properties.district === selectedDistrict.name);
    if (!feat) return null;
    return { type: 'FeatureCollection', features: [feat] };
  }, [districtsGeo, selectedDistrict]);

  const mapView = useMemo(() => {
    // At district/branch/agent level, fit the selected district's actual bounds
    // so zoom scales to each district's size (big districts don't overzoom).
    if ((level === 'district' || level === 'branch' || level === 'agent') && selectedDistrictGeo) {
      const layer = L.geoJSON(selectedDistrictGeo);
      return {
        bounds: layer.getBounds(),
        fitOptions: { paddingTopLeft: [360, 40], paddingBottomRight: [40, 80], maxZoom: 9 },
      };
    }
    if ((level === 'district' || level === 'branch' || level === 'agent') && selectedDistrict) {
      return { center: [selectedDistrict.center[1], selectedDistrict.center[0]], zoom: 8.5 };
    }
    return { bounds: ODISHA_BOUNDS, fitOptions: { paddingTopLeft: [340, 30], paddingBottomRight: [30, 60] } };
  }, [level, selectedDistrict, selectedDistrictGeo]);

  // ─── Style functions ───────────────────────────────────────────────────────
  const baseStateStyle = useMemo(() => ({
    fillColor: '#f2f3f7',
    fillOpacity: 1,
    color: '#d0d3de',
    weight: 0.8,
    opacity: 0.6,
  }), []);

  const stateOutlineStyle = useMemo(() => ({
    fillColor: '#5E63A8',
    fillOpacity: 0.05,
    color: '#5E63A8',
    weight: 1.2,
    opacity: 0.35,
  }), []);

  const districtStyle = useCallback((feature) => {
    const name = feature.properties.district;
    const tone = toneForName(name);
    const isSelected = selectedDistrict && selectedDistrict.name === name;
    return {
      fillColor: tone.fill,
      fillOpacity: isSelected ? 0.18 : 0.06,
      color: isSelected ? tone.fill : '#a0a5bc',
      weight: isSelected ? 1.5 : 0.6,
      opacity: isSelected ? 0.6 : 0.35,
    };
  }, [selectedDistrict]);

  const selectedDistrictStyle = useCallback(() => ({
    fillColor: '#5E63A8',
    fillOpacity: 0.14,
    color: '#292867',
    weight: 2,
    opacity: 0.7,
  }), []);

  const highlightDistrict = useCallback((e) => {
    const layer = e.target;
    const name = layer.feature.properties.district;
    const tone = toneForName(name);
    layer.setStyle({
      fillColor: tone.fill,
      fillOpacity: 0.25,
      color: tone.fill,
      weight: 1.4,
      opacity: 0.6,
    });
    const el = layer.getElement();
    if (el) el.style.filter = `drop-shadow(0 0 10px ${tone.glow})`;
    layer.bringToFront();
  }, []);

  const resetHighlight = useCallback((e, styleFunc) => {
    const layer = e.target;
    layer.setStyle(styleFunc(layer.feature));
    const el = layer.getElement();
    if (el) el.style.filter = '';
  }, []);

  const onDistrictClick = useCallback((e) => {
    const name = e.target.feature.properties.district;
    const districtId = DISTRICT_NAME_TO_ID[name];
    if (districtId) drillDown('district', districtId);
  }, [drillDown, DISTRICT_NAME_TO_ID]);

  const onEachDistrict = useCallback((feature, layer) => {
    layer.on({
      click: onDistrictClick,
      mouseover: highlightDistrict,
      mouseout: (e) => resetHighlight(e, districtStyle),
    });
    layer.bindTooltip(
      `<strong>${feature.properties.district}</strong><br/><span style="opacity:0.6">Odisha</span>`,
      { sticky: true, className: styles.mapTooltip, direction: 'top', offset: [0, -10] }
    );
  }, [onDistrictClick, highlightDistrict, resetHighlight, districtStyle]);

  const districtKey = useMemo(
    () => `districts-${level}-${selectedDistrictId || 'none'}`,
    [level, selectedDistrictId]
  );

  const districtCentroids = useMemo(() => {
    if (!districtsGeo) return [];
    return districtsArr.map((d) => ({ id: d.id, name: d.name, center: d.center, tone: toneForName(d.name) }));
  }, [districtsGeo, districtsArr]);

  return (
    <div className={styles.mapContainer} data-level={level}>
      <MapContainer
        center={ODISHA_CENTER}
        zoom={7}
        className={styles.map}
        zoomControl={false}
        attributionControl={false}
        minZoom={6}
        maxZoom={16}
        maxBounds={[[16.5, 79.5], [23.8, 89.5]]}
        maxBoundsViscosity={0.8}
        zoomDelta={0.5}
        zoomSnap={0.5}
        wheelPxPerZoomLevel={120}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
          opacity={0.2}
        />

        <TileOpacityController level={level} />

        <MapController
          bounds={mapView.bounds}
          center={mapView.center}
          zoom={mapView.zoom}
          fitOptions={mapView.fitOptions}
        />

        {stateGeo && (
          <GeoJSON key="state-base" data={stateGeo} style={() => baseStateStyle} interactive={false} />
        )}

        {stateGeo && (
          <GeoJSON key="state-outline" data={stateGeo} style={() => stateOutlineStyle} interactive={false} />
        )}

        {districtsGeo && (
          <GeoJSON
            key={districtKey}
            data={districtsGeo}
            style={districtStyle}
            {...(level === 'country' ? { onEachFeature: onEachDistrict } : {})}
          />
        )}

        {selectedDistrictGeo && (level === 'district' || level === 'branch' || level === 'agent') && (
          <GeoJSON
            key={`selected-${selectedDistrictId}`}
            data={selectedDistrictGeo}
            style={selectedDistrictStyle}
          />
        )}
      </MapContainer>
    </div>
  );
}

export default memo(OdishaMap);
