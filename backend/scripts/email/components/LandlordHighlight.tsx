// eslint-disable-next-line import/no-unresolved
import { Landlord, ApartmentWithId } from '@common/types/db-types';
import { ReactElement } from 'react';
import { Section, Heading } from '@react-email/components';
import PropertyCard from './PropertyCard';

type Props = {
  landlordData: Landlord;
  landlordReview: string;
  landlordMessage: string;
  recentProperties: ApartmentWithId[];
  popularProperties: ApartmentWithId[];
};

/**
 * LandlordHighlight Component
 *
 * This component displays a comprehensive section about a specific landlord in the newsletter,
 * including a message from the landlord, their recent or vacant properties, most popular properties,
 * and a featured review. The component organizes this information in a structured layout with
 * consistent styling and responsive property cards.
 *
 * @component
 * @param {Object} props - Component properties.
 * @param {Landlord} props.landlordData - Data object containing information about the landlord.
 * @param {string} props.landlordReview - A featured review about the landlord.
 * @param {string} props.landlordMessage - A message from the landlord to readers.
 * @param {ApartmentWithId[]} props.recentProperties - Array of recently listed or vacant properties.
 * @param {ApartmentWithId[]} props.popularProperties - Array of the landlord's most popular properties.
 * @returns {ReactElement} LandlordHighlight component.
 */
const LandlordHighlight: React.FC<Props> = ({
  landlordData,
  landlordReview,
  landlordMessage,
  recentProperties,
  popularProperties,
}: Props): ReactElement => {
  const { name } = landlordData;

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
        }}
      >
        Landlord Highlight
      </Heading>

      <h2
        style={{
          color: '#000',
          fontSize: '14.5px',
          fontWeight: '600',
          margin: '0 0 10px 0',
        }}
      >
        From Landlord {name}
      </h2>
      <p style={{ color: '#5D5D5D', fontSize: '14.976px' }}>{landlordMessage}</p>
      <h2
        style={{
          color: '#000',
          fontSize: '14.5px',
          fontWeight: '600',
          margin: '0 0 10px 0',
        }}
      >
        Recently Released / Vacant
      </h2>
      <PropertyList properties={recentProperties} />
      <h2
        style={{
          color: '#000',
          fontSize: '14.5px',
          fontWeight: '600',
          margin: '0 0 10px 0',
        }}
      >
        Top Loved Properties
      </h2>
      <PropertyList properties={popularProperties} />
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
                  margin: '0 0 10px 0',
                }}
              >
                Landlord Review
              </h2>
              <p style={{ color: '#5D5D5D', fontSize: '14.976px' }}>{landlordReview}</p>
            </td>
          </tr>
        </tbody>
      </table>
    </Section>
  );
};

export default LandlordHighlight;
