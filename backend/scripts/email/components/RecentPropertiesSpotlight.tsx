import { ApartmentWithId } from '@common/types/db-types';
import { ReactElement } from 'react';
import { Section, Heading } from '@react-email/components';
import PropertyCard from './PropertyCard';

type Props = {
  nearbyProperties: ApartmentWithId[];
  budgetProperties: ApartmentWithId[];
};

/**
 * Recently Released/Vacant Component
 *
 * This component displays a comprehensive section about recently released or vacant properties. It displays
 * 2-3 properties that are close to campus and 2-3 that are budget friendly.
 *
 * @component
 * @param {Object} props - Component properties.
 * @param {ApartmentWithId[]} props.nearbyProperties - Array of nearby properties.
 * @param {ApartmentWithId[]} props.budgetProperties - Array of budget-friendly properties.
 * @returns {ReactElement} LandlordHighlight component.
 */
const RecentPropertiesSpotlight: React.FC<Props> = ({
  nearbyProperties,
  budgetProperties,
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
        Recently Released / Vacant
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
        Close to Campus
      </h2>
      <PropertyList properties={nearbyProperties} />
      <h2
        style={{
          color: '#000',
          fontSize: '14.5px',
          fontWeight: '600',
          margin: '0 0 10px 0',
          marginLeft: '5px',
        }}
      >
        Budget-Friendly
      </h2>
      <PropertyList properties={budgetProperties} />
    </Section>
  );
};

export default RecentPropertiesSpotlight;
