// eslint-disable-next-line import/no-unresolved
import { ApartmentWithId } from '@common/types/db-types';
import { ReactElement } from 'react';
import { Section, Heading } from '@react-email/components';
import PropertyCard from './PropertyCard';

type Props = {
  topProperties: ApartmentWithId[];
  reviewedProperties: ApartmentWithId[];
  propertyReview: string;
};

/**
 * Top Loved Properties Component
 *
 * This component displays a newsletter section about top loved properties. It displays
 * 2-3 properties that are highest rated and most reviewed.
 *
 * @component
 * @param {Object} props - Component properties.
 * @param {ApartmentWithId[]} props.topProperties - Array of top loved properties.
 * @param {ApartmentWithId[]} props.reviewedProperties - Array of most reviewed properties.
 * @param {string} props.propertyReview - A brief review about a featured property.
 * @returns {ReactElement} LandlordHighlight component.
 */
const LovedPropertiesSpotlight: React.FC<Props> = ({
  topProperties,
  reviewedProperties,
  propertyReview,
}: Props): ReactElement => {
  // Property list section
  const PropertyList = ({ properties }: { properties: ApartmentWithId[] }) => (
    <>
      {properties.length > 0 ? (
        <div style={{ display: 'flex', marginBottom: '15px' }}>
          {properties.map((property) => (
            <Section
              style={{
                background: 'white',
                borderRadius: '6px',
                border: '0.406px solid #E8E8E8',
                width: '33%',
                padding: '7px',
                margin: '5px',
              }}
            >
              <PropertyCard key={property.id} property={property} />
            </Section>
          ))}
        </div>
      ) : (
        <p style={{ color: '#5D5D5D', fontSize: '13px', fontStyle: 'italic' }}>
          No properties to display
        </p>
      )}
    </>
  );

  return (
    <Section
      style={{
        backgroundColor: '#F6F6F6',
        borderRadius: '8px',
        padding: '22px 20px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: '20px',
      }}
    >
      <Heading
        style={{
          color: '#B94630',
          fontSize: '22.5px',
          fontWeight: '700',
          margin: '15px 0',
          marginLeft: '5px',
        }}
      >
        Top Loved Properties
      </Heading>
      <h2
        style={{
          color: '#000',
          fontSize: '14.5px',
          fontWeight: '600',
          margin: '0 0 10px 0',
          marginLeft: '5px',
        }}
      >
        Highest Rated
      </h2>
      <PropertyList properties={topProperties} />
      <h2
        style={{
          color: '#000',
          fontSize: '14.5px',
          fontWeight: '600',
          margin: '0 0 10px 0',
          marginLeft: '5px',
        }}
      >
        Most Reviewed
      </h2>
      <PropertyList properties={reviewedProperties} />
      <table style={{ width: '100%' }}>
        <tbody>
          <tr>
            <td style={{ verticalAlign: 'middle', justifyContent: 'center', textAlign: 'center' }}>
              <img
                src="https://i.postimg.cc/m21M8DVG/chatbubble-ellipses-outline.png"
                alt="chatbubble"
                style={{ width: '50%', height: 'auto' }}
              />
            </td>
            <td style={{ verticalAlign: 'top' }}>
              <h2
                style={{
                  color: '#000',
                  fontSize: '14.5px',
                  fontWeight: '600',
                  margin: '0 0 5px 0',
                }}
              >
                Property Review
              </h2>
              <p style={{ color: '#5D5D5D', fontSize: '14.976px' }}>{propertyReview}</p>
            </td>
          </tr>
        </tbody>
      </table>
    </Section>
  );
};

export default LovedPropertiesSpotlight;
