import { Section, Img, Text, Heading } from '@react-email/components';
import { ApartmentWithId } from '@common/types/db-types';
import PropertyCard from './PropertyCard';
import { Activity } from '../templates/Types';

type Props = {
  imageUrl: string;
  name: string;
  description: string;
  recentProperties: ApartmentWithId[];
  activities: Activity[];
};

const AreaSpotlight: React.FC<Props> = ({
  imageUrl,
  name,
  description,
  recentProperties,
  activities,
}: Props) => {
  // Property list section
  const PropertyList = ({ properties }: { properties: ApartmentWithId[] }) => (
    <>
      {properties.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'row' }}>
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

  const ActivityList = ({ activities }: { activities: Activity[] }) => (
    <>
      {activities.length > 0 ? (
        <div style={{ display: 'flex' }}>
          {activities.map((activity) => (
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
              <img
                src={activity.imgUrl}
                alt=""
                style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
              />
              <p style={{ color: '#000', fontSize: '12px', fontWeight: '600' }}>{activity.name}</p>
              <p
                style={{
                  color: '#5D5D5D',
                  fontSize: '12px',
                }}
              >
                {activity.address}
              </p>
            </Section>
          ))}
        </div>
      ) : (
        <p style={{ color: '#5D5D5D', fontSize: '13px', fontStyle: 'italic' }}>
          No activities to display
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
        marginBottom: '20px',
        alignItems: 'center',
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
        Area Spotlight
      </Heading>
      <table cellPadding="0" cellSpacing="0" style={{ width: '100%' }}>
        <tbody>
          <tr>
            <td style={{ width: '50%', paddingRight: '2%', verticalAlign: 'top' }}>
              <Img
                src={imageUrl}
                alt={name}
                style={{
                  width: '100%',
                  overflow: 'hidden',
                  borderRadius: '6px',
                }}
              />
            </td>
            <td style={{ width: '120px', verticalAlign: 'top' }}>
              <Heading
                as="h2"
                style={{
                  color: '#000',

                  fontSize: '14.5px',
                  fontWeight: '600',
                  margin: '0 0 10px 0',
                }}
              >
                {name}
              </Heading>
              <Text
                style={{
                  color: '#5D5D5D',
                  fontSize: '14.5px',
                  lineHeight: '1.5',
                  margin: '0',
                }}
              >
                {description}
              </Text>
            </td>
          </tr>
        </tbody>
      </table>

      <Heading
        as="h2"
        style={{
          color: '#000',

          fontSize: '14.5px',
          fontWeight: '600',
          margin: '15px 0',
        }}
      >
        Recently Released/ Vacant
      </Heading>
      <PropertyList properties={recentProperties} />

      <Heading
        as="h2"
        style={{
          color: '#000',

          fontSize: '14.5px',
          fontWeight: '600',
          margin: '15px 0',
        }}
      >
        Things To Do Around This Area
      </Heading>

      <ActivityList activities={activities} />
    </Section>
  );
};

export default AreaSpotlight;
