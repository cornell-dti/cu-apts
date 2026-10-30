import React, { ReactElement, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import GoogleMapReact from 'google-map-react';
import { ListingSummary } from '../../../../common/types/ai-search-types';
import AiSearchMapMarker from './AiSearchMapMarker';

// Same default Ithaca center as the search results map.
const DEFAULT_CENTER = { lat: 42.447, lng: -76.485 };
const DEFAULT_ZOOM = 14;
const SINGLE_PIN_ZOOM = 16;
// Keeps a tight cluster of pins from zooming in past street level.
const MAX_FIT_ZOOM = 17;
const FIT_PADDING_PX = 48;

const hasValidCoordinates = (listing: ListingSummary): boolean =>
  Number.isFinite(listing.latitude) &&
  Number.isFinite(listing.longitude) &&
  Math.abs(listing.latitude) <= 90 &&
  Math.abs(listing.longitude) <= 180;

/** Listings that can be pinned; any with missing or invalid coordinates are skipped with a warning. */
const getMappableListings = (
  listings: Readonly<Record<string, ListingSummary>>
): ListingSummary[] =>
  Object.values(listings).filter((listing) => {
    if (!hasValidCoordinates(listing)) {
      console.warn(`AI search: listing ${listing.id} has invalid coordinates; not mapping it`);
      return false;
    }
    return true;
  });

type Props = {
  readonly listings: Readonly<Record<string, ListingSummary>>;
};

/**
 * AiSearchMap – a Google map with one pin per listing in the AI search response. It fits its
 * bounds to the pins, and shows the default Ithaca view when there are none. It fills its parent,
 * which must have an explicit size.
 */
const AiSearchMap = ({ listings }: Props): ReactElement => {
  const points = useMemo(() => getMappableListings(listings), [listings]);
  const pointsRef = useRef(points);
  pointsRef.current = points;
  const mapRef = useRef<{ map: google.maps.Map; maps: typeof google.maps } | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [pinnedId, setPinnedId] = useState<string | null>(null);

  const fitToPoints = useCallback(() => {
    if (!mapRef.current) {
      return;
    }
    const { map, maps } = mapRef.current;
    const current = pointsRef.current;
    if (current.length === 0) {
      map.setCenter(DEFAULT_CENTER);
      map.setZoom(DEFAULT_ZOOM);
    } else if (current.length === 1) {
      map.setCenter({ lat: current[0].latitude, lng: current[0].longitude });
      map.setZoom(SINGLE_PIN_ZOOM);
    } else {
      const bounds = new maps.LatLngBounds();
      current.forEach((p) => bounds.extend({ lat: p.latitude, lng: p.longitude }));
      map.fitBounds(bounds, FIT_PADDING_PX);
      maps.event.addListenerOnce(map, 'idle', () => {
        const zoom = map.getZoom();
        if (zoom !== undefined && zoom > MAX_FIT_ZOOM) {
          map.setZoom(MAX_FIT_ZOOM);
        }
      });
    }
  }, []);

  // Refit when the response changes (and clear any open tooltip for a pin that is gone).
  useEffect(() => {
    fitToPoints();
    setPinnedId(null);
    setHoveredId(null);
  }, [points, fitToPoints]);

  const handleApiLoaded = ({ map, maps }: { map: google.maps.Map; maps: typeof google.maps }) => {
    mapRef.current = { map, maps };
    fitToPoints();
  };

  return (
    <GoogleMapReact
      onGoogleApiLoaded={handleApiLoaded}
      yesIWantToUseGoogleMapApiInternals
      bootstrapURLKeys={{ key: process.env.REACT_APP_MAPS_API_KEY || 'can not find api' }}
      defaultCenter={DEFAULT_CENTER}
      defaultZoom={DEFAULT_ZOOM}
      onClick={() => setPinnedId(null)}
      options={{
        disableDefaultUI: true,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'on' }],
          },
        ],
      }}
    >
      {points.map((listing) => (
        <AiSearchMapMarker
          key={listing.id}
          lat={listing.latitude}
          lng={listing.longitude}
          id={listing.id}
          name={listing.name}
          open={hoveredId === listing.id || pinnedId === listing.id}
          onHoverChange={(hovered) =>
            setHoveredId((current) =>
              hovered ? listing.id : current === listing.id ? null : current
            )
          }
          onClick={() => setPinnedId((current) => (current === listing.id ? null : listing.id))}
        />
      ))}
    </GoogleMapReact>
  );
};

export default AiSearchMap;
