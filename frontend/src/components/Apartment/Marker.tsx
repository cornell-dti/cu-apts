import React from 'react';

type markerProp = {
  readonly src: string;
  readonly lat: number;
  readonly lng: number;
  readonly altText: string;
};

export const Marker = ({ src, altText }: markerProp) => (
  <img
    src={src}
    alt={altText}
    style={{ height: '53.6px', width: '53.6px', transform: 'translate(-50%, -50%)' }}
  />
);
