import React from 'react';

export type markerProp = {
  readonly src: string;
  readonly lat: number;
  readonly lng: number;
  readonly altText: string;
  readonly size: number;
};

/**
 * Marker - A component that renders a map marker image with specified position and size.
 *
 * @remarks
 * This component is used with Google Maps React to display custom markers on the map.
 * The marker image is positioned using CSS transforms and supports hover interactions.
 *
 * @param {string} props.src - The source URL for the marker image
 * @param {number} props.lat - The latitude coordinate for marker placement
 * @param {number} props.lng - The longitude coordinate for marker placement
 * @param {string} props.altText - Alt text description of the marker image
 * @param {number} props.size - Height in pixels for the marker image (width is calculated as 75% of height)
 *
 * @return {JSX.Element} - An img element styled as a map marker
 */

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
