import React from 'react';

export type markerProp = {
  readonly src: string;
  readonly lat: number;
  readonly lng: number;
  readonly altText: string;
  readonly size: number;
};

export const Marker = ({ src, altText, size }: markerProp) => (
  <img
    src={src}
    alt={altText}
    style={{
      height: `${size}px`,
      width: `${size * 0.75}px`,
      transform: 'translate(-50%, -50%)',
      transition: 'transform 0.15s',
      cursor: 'pointer',
    }}
  />
);
