// eslint-disable-next-line import/no-unresolved
import { Landlord } from '@common/types/db-types';
import { ReactElement } from 'react';
import { Section, Heading } from '@react-email/components';

type Props = {
  landlordData: Landlord;
  landlordReview: string;
  landlordMessage: string;
};

const LandlordHighlight: React.FC<Props> = ({
  landlordData,
  landlordReview,
  landlordMessage,
}: Props): ReactElement => {
  const { name } = landlordData;
  // const {properties} = landlordData;

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

      <table style={{ width: '100%' }}>
        <tbody>
          <tr>
            <td style={{ width: '25%', verticalAlign: 'middle', justifyContent: 'center' }}>
              <img
                src="https://i.postimg.cc/m21M8DVG/chatbubble-ellipses-outline.png"
                alt="chatbubble"
                style={{ width: '30%', height: 'auto' }}
              />
            </td>
            <td style={{ width: '74%', verticalAlign: 'top' }}>
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
