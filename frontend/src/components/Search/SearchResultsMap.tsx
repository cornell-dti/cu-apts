import React, { ReactElement, useRef, useEffect, useState } from 'react';
import { Box, Grid, IconButton, Typography, makeStyles } from '@material-ui/core';
import GoogleMapReact from 'google-map-react';
import aptIcon from '../../assets/location-pin.svg';
import mapPinIcon from '../../assets/map-pin.svg';
import { config } from 'dotenv';
import { Marker } from '../Apartment/Marker';
import { LocationTravelTimes } from '../../../../common/types/db-types';
import { CardData } from '../../App';
import NewApartmentCard from '../ApartmentCard/NewApartmentCard';
import { MapMarkerWithCard } from '../Apartment/MarkerWithAptCard';

config();

export type BaseProps = {
  readonly address: string | null;
  readonly latitude?: number;
  readonly longitude?: number;
  readonly travelTimes?: LocationTravelTimes;
  isMobile: boolean;
};

type MapInfoProps = BaseProps & {
  handleClick: () => void;
  mapToggle: boolean;
};

const useStyles = makeStyles((theme) => ({
  outerMapDiv: {
    height: '100%',
    width: '100%',
    borderRadius: '10px',
    overflow: 'hidden',
    outline: 'none',
    position: 'relative',
  },
  innerMapDiv: {
    height: '110%',
    width: '110%',
    borderRadius: '10px',
    overflow: 'hidden',
    outline: 'none',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%,-50%)',
  },
  markerContainer: {
    border: '1px solid red',
  },
}));

/**
 * `SearchResultsMap` Component - Displays a map with markers for multiple apartments.
 *
 * @remarks
 * This component renders a Google Map showing the locations of all apartments in the search results.
 * It includes interactive markers that show apartment details on hover and handles map zoom/pan.
 * The map automatically centers on the mean location of all apartments shown.
 *
 * @param Props - Contains:
 *   - `apartments`: Array of apartment data (CardData) to display on the map
 *   - `isMobile`: Boolean indicating if viewing on mobile device
 *   - `user`: Current Firebase user object or null if not logged in
 *   - `setUser`: React setState function to update the user state
 *
 * @returns A Google Map React component with apartment markers and hover interactions
 */
function SearchResultsMap({
  apartments,
  isMobile,
  user,
  setUser,
}: {
  apartments: CardData[];
  isMobile: boolean;
  user: firebase.User | null;
  setUser: React.Dispatch<React.SetStateAction<firebase.User | null>>;
}): ReactElement {
  const { outerMapDiv, innerMapDiv, markerContainer } = useStyles();
  const mapRef = useRef<google.maps.Map | null>(null);

  const defaultZoom = isMobile ? 15 : 16;
  const defaultMarkerSize = isMobile ? 24 : 32;
  const [markerSize, setMarkerSize] = useState(defaultMarkerSize);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [cardHovered, setCardHovered] = useState(false);

  const handleApiLoaded = ({ map, maps }: { map: google.maps.Map; maps: typeof google.maps }) => {
    mapRef.current = map;
  };

  const findMeanCenter = () => {
    const latSum = apartments.reduce((sum, apt) => sum + apt.buildingData.latitude, 0);
    const lngSum = apartments.reduce((sum, apt) => sum + apt.buildingData.longitude, 0);
    const meanLat = latSum / apartments.length;
    const meanLng = lngSum / apartments.length;
    return { lat: meanLat, lng: meanLng };
  };

  const defaultCenter = apartments.length > 0 ? findMeanCenter() : { lat: 42.447, lng: -76.485 };

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setCenter(defaultCenter);
      mapRef.current.setZoom(defaultZoom);
      setMarkerSize(defaultMarkerSize);
    }
  }, [apartments]);

  const handleZoom = (zoomChange: number) => {
    if (mapRef.current) {
      const currentZoom = mapRef.current.getZoom() || 16;
      const newZoom = currentZoom + zoomChange;
      if (newZoom > 11 && newZoom < 20) {
        mapRef.current.setZoom(newZoom);
        setMarkerSize(markerSize + zoomChange * 2);
      }
    }
  };

  // Sort apartments by latitude in descending order,
  // so that the highest latitude apartments (north of Cornell) come first
  const sortApartmentsByLatitude = (apartments: CardData[]) => {
    return apartments.sort((a, b) => a.buildingData.latitude - b.buildingData.latitude).reverse();
  };

  return (
    <div className={outerMapDiv}>
      <div className={innerMapDiv}>
        <GoogleMapReact
          onGoogleApiLoaded={handleApiLoaded}
          yesIWantToUseGoogleMapApiInternals
          bootstrapURLKeys={{ key: process.env.REACT_APP_MAPS_API_KEY || 'can not find api' }}
          defaultCenter={defaultCenter}
          defaultZoom={defaultZoom}
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
          {sortApartmentsByLatitude(apartments).map((apt, idx) => (
            <MapMarkerWithCard
              lat={apt.buildingData.latitude}
              lng={apt.buildingData.longitude}
              apt={apt}
              idx={idx}
              hoveredIdx={hoveredIdx}
              setHoveredIdx={setHoveredIdx}
              cardHovered={cardHovered}
              setCardHovered={setCardHovered}
              markerSize={markerSize}
              user={user}
              setUser={setUser}
            />
          ))}
        </GoogleMapReact>
      </div>
    </div>
  );
}

export default SearchResultsMap;
