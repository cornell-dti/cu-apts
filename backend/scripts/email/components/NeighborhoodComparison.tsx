import { Section } from '@react-email/components';

type Props = {
  name1: string;
  name2: string;
  description1: string;
  description2: string;
  image1: string;
  image2: string;
};

const NeighborhoodComparison: React.FC<Props> = ({
  name1,
  name2,
  description1,
  description2,
  image1,
  image2,
}: Props) => (
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
    <h1
      style={{
        color: '#B94630',
        fontSize: '22.5px',
        fontWeight: '700',
      }}
    >
      Neighborhood Comparison
    </h1>
    <table>
      <tr>
        <td style={{ width: '44%' }}>
          <img
            src={image1}
            alt=""
            style={{
              borderRadius: '8px',
              width: '100%',
              height: 'auto',
              overflow: 'hidden',
              marginRight: '20px',
            }}
          />
          <p
            style={{
              color: '#5D5D5D',
              fontSize: '16px',
              lineHeight: '1.5',
              margin: '0',
            }}
          >
            {name1}
          </p>
          <p
            style={{
              color: '#5D5D5D',
              fontSize: '14.5px',
              lineHeight: '1.5',
              margin: '0',
            }}
          >
            {description1}
          </p>
        </td>
        <td style={{ width: '44%' }}>
          <img
            src={image2}
            alt=""
            style={{ borderRadius: '8px', width: '100%', height: 'auto', overflow: 'hidden' }}
          />
          <p
            style={{
              color: '#5D5D5D',
              fontSize: '16px',
              lineHeight: '1.5',
              margin: '0',
            }}
          >
            {name2}
          </p>
          <p
            style={{
              color: '#5D5D5D',
              fontSize: '14.5px',
              lineHeight: '1.5',
              margin: '0',
            }}
          >
            {description2}
          </p>
        </td>
      </tr>
    </table>
  </Section>
);

export default NeighborhoodComparison;
