import React from 'react';
import { CardData } from '../../App';
import aptIcon from '../../assets/location-pin.svg';
import mapPinIcon from '../../assets/map-pin.svg';
import NewApartmentCard from '../ApartmentCard/NewApartmentCard';

type markerWithCardProp = {
  readonly lat: number;
  readonly lng: number;
  readonly apt: CardData;
  readonly idx: number;
  readonly hoveredIdx: number | null;
  readonly setHoveredIdx: React.Dispatch<React.SetStateAction<number | null>>;
  readonly cardHovered: boolean;
  readonly setCardHovered: React.Dispatch<React.SetStateAction<boolean>>;
  readonly markerSize: number;
  readonly user: firebase.User | null;
  readonly setUser: React.Dispatch<React.SetStateAction<firebase.User | null>>;
};

export const MapMarkerWithCard = ({
  apt,
  idx,
  hoveredIdx,
  setHoveredIdx,
  cardHovered,
  setCardHovered,
  markerSize,
  user,
  setUser,
}: markerWithCardProp) => {
  return (
    <div
      style={{ position: 'relative', zIndex: hoveredIdx === idx ? 1000 : 1 }}
      onMouseEnter={() => setHoveredIdx(idx)}
      onMouseLeave={() =>
        setTimeout(() => {
          if (!cardHovered) setHoveredIdx(null);
        }, 100)
      }
    >
      <img
        src={hoveredIdx === idx ? aptIcon : mapPinIcon}
        alt={apt.buildingData.name}
        style={{
          height: `${markerSize}px`,
          width: `${markerSize * 0.75}px`,
          transform: `translate(-50%, -50%) scale(${hoveredIdx === idx ? 1.6 : 1})`,
          transition: 'transform 0.3s',
          cursor: 'pointer',
        }}
      />
      {hoveredIdx === idx && (
        <div
          style={{
            position: 'absolute',
            left: 10,
            top: 10,
            zIndex: 2000,
          }}
          onMouseEnter={() => setCardHovered(true)}
          onMouseLeave={() => {
            setCardHovered(false);
            setHoveredIdx(null);
          }}
        >
          <NewApartmentCard
            buildingData={apt.buildingData}
            numReviews={apt.numReviews}
            avgRating={apt.avgRating || 0}
            company={apt.company}
            user={user}
            setUser={setUser}
          />
        </div>
      )}
    </div>
  );
};
