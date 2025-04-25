// eslint-disable-next-line no-use-before-define
import React from 'react';
// import { Container, Section, Img, Text, Column, Row } from '@react-email/components';

type Props = {
  propertyName: string;
  address: string;
  priceRange: string;
  bedrooms: number;
  imageUrl: string;
};

const styles = {
  card: {
    border: '0.406px solid #E8E8E8',
    padding: '7px',
    borderRadius: '5.5px',
  },
  h2: {
    fontFamily: 'Work-Sans',
    color: '#000',
    fontSize: '8px',
    fontWeight: '600',
  },
  p: {
    color: '#5D5D5D',
    fontFamily: 'Work-Sans',
    fontSize: '8px',
  },
  img: {
    borderRadius: '5.5px',
    width: '152px',
    height: '122px',
    overflow: 'hidden',
  },
};

const PropertyCard: React.FC<Props> = ({
  propertyName,
  address,
  priceRange,
  bedrooms,
  imageUrl,
}: Props) => (
  <div style={styles.card}>
    <img src={imageUrl} alt="nasdjn" />
    <h2 style={styles.h2}>{propertyName}</h2>
    <p style={styles.p}>{address}</p>
    <div style={{ display: 'flex', justifyItems: 'space-between' }}>
      <div style={{ display: 'flex' }}>
        <img src="backend/scripts/email/assets/moneyicon.svg" alt="asdkjhk" />
        <h2>{priceRange}</h2>
      </div>
      <div style={{ display: 'flex' }}>
        <img src="backend/scripts/email/assets/bed-icon.svg" alt="asdjkahsd" />
        <h2>{bedrooms}</h2>
      </div>
    </div>
  </div>
);

export default PropertyCard;
